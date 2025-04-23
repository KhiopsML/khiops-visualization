/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnChanges,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { DistributionGraphComponent } from '@khiops-library/components/distribution-graph/distribution-graph.component';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { ClustersService } from '@khiops-covisualization/providers/clusters.service';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { Subscription } from 'rxjs';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import * as _ from 'lodash';
import { ConfigService } from '@khiops-library/providers/config.service';
import { HistogramType } from '@khiops-visualization/components/commons/histogram/histogram.type';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';

@Component({
  selector: 'app-variable-graph-details',
  templateUrl: './variable-graph-details.component.html',
  styleUrls: ['./variable-graph-details.component.scss'],
  standalone: false,
})
export class VariableGraphDetailsComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @ViewChild('distributionGraph', {
    static: false,
  })
  distributionGraph: DistributionGraphComponent | undefined;

  @Input() public selectedNode: TreeNodeModel | undefined;
  @Output() public selectedItemChanged: EventEmitter<any> = new EventEmitter();
  @Input() public position: number = 0;
  @Input() private dimensionsTree: TreeNodeModel[] | undefined;
  @Input() private selectedDimensions:
    | DimensionCovisualizationModel[]
    | undefined;

  public scrollPosition = 0;
  public scaleValue: number = 0;
  public graphDetails: ChartDatasModel | undefined;
  public graphOptions: DistributionOptionsI = {
    types: [HistogramType.YLIN, HistogramType.YLOG],
    selected: undefined,
  };
  public activeEntries: number = 0;
  public title: string = '';
  public isFullscreen: boolean = false;

  private treeSelectedNodeChangedSub: Subscription;
  private conditionalOnContextChangedSub: Subscription;

  constructor(
    private translate: TranslateService,
    private dimensionsDatasService: DimensionsDatasService,
    private treenodesService: TreenodesService,
    private configService: ConfigService,
    private clustersService: ClustersService,
    private eventsService: EventsService,
  ) {
    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
        setTimeout(() => {
          if (e.selectedNode) {
            // Only compute distribution of the other node
            this.getFilteredDistribution();
          }
          this.setLegendTitle();
        });
      });
    this.conditionalOnContextChangedSub =
      this.eventsService.conditionalOnContextChanged.subscribe(() => {
        this.getFilteredDistribution();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.selectedNode?.currentValue) {
      // get active entries index from name
      if (this.graphDetails) {
        this.activeEntries = this.graphDetails.labels.findIndex(
          (e) => e === this.selectedNode?.shortDescription,
        );
        this.setLegendTitle();
      }
    }
    if (
      changes?.selectedDimensions?.currentValue &&
      changes?.selectedDimensions?.previousValue
    ) {
      setTimeout(() => {
        this.getFilteredDistribution();
      });
    }
  }

  ngAfterViewInit() {
    this.getFilteredDistribution();
  }

  private updateGraphTitle() {
    const currentIndex = this.position;
    const otherIndex = this.position === 0 ? 1 : 0;

    this.title =
      this.translate.get('GLOBAL.DISTRIBUTION') +
      ' ' +
      this.translate.get('GLOBAL.OF') +
      ' ' +
      this.selectedDimensions?.[currentIndex]?.name +
      ' ' +
      this.translate.get('GLOBAL.GIVEN') +
      ' ' +
      this.selectedDimensions?.[otherIndex]?.name;
  }

  private resize() {
    if (this.distributionGraph) {
      this.distributionGraph.resizeGraph();
    }
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.resize();
    });

    // #187 Simulate trusted click on component to enable selection
    const trustedClickEvent = new CustomEvent('trustedClick', {
      bubbles: true, // Propagate
      cancelable: true,
    });
    this.configService
      ?.getRootElementDom()
      ?.querySelector('#cluster-distribution-' + this.position)
      ?.dispatchEvent(trustedClickEvent);
  }

  ngOnDestroy() {
    this.treeSelectedNodeChangedSub.unsubscribe();
    this.conditionalOnContextChangedSub.unsubscribe();
  }

  onSelectBarChanged(index: number) {
    this.activeEntries = index;

    const [currentIndex, _otherIndex] = this.invertDimensionsPositions();

    // Find node name from index
    const currentNodeName = this.graphDetails?.labels[index];
    if (currentIndex !== -1 && this.selectedDimensions) {
      const dimName = this.selectedDimensions[currentIndex]?.name;
      if (currentNodeName && dimName) {
        this.treenodesService.setSelectedNode(dimName, currentNodeName);
      }
    }
  }

  onScaleValueChanged(value: number) {
    this.scaleValue = value;
  }

  onScrollPositionChanged(position: number) {
    this.scrollPosition = position;
  }

  /**
   * Fetches and updates the filtered distribution details for the selected node.
   * It updates the graph details and active entries based on the selected node.
   * Also, updates the graph title accordingly.
   */
  private getFilteredDistribution() {
    if (this.dimensionsTree && this.selectedNode) {
      this.graphDetails = this.clustersService.getDistributionDetailsFromNode(
        this.position,
      );
      if (this.graphDetails?.labels) {
        this.activeEntries = this.graphDetails.labels.findIndex(
          (e) => e === this.selectedNode?.shortDescription,
        );
      }
      this.updateGraphTitle();
    }
  }

  /**
   * Sets the legend title for the graph.
   *
   * This method updates the label of the first dataset in the graph details
   * to the short description of the selected node from the other dimension.
   * It then forces an update of the legend by cloning the graph details object.
   */
  private setLegendTitle() {
    const otherIndex = this.position === 0 ? 1 : 0;
    this.graphDetails!.datasets[0]!.label =
      this.dimensionsDatasService?.dimensionsDatas?.selectedNodes?.[
        otherIndex
      ]?.shortDescription;
    // force legend update
    this.graphDetails = _.cloneDeep(this.graphDetails);
  }

  /**
   * Inverts the positions of dimensions.
   *
   * This method determines the current position and returns an array with the current position
   * and the other position. If the current position is 0, the other position is set to 1.
   *
   * @returns An array containing the current position and the other position.
   */
  private invertDimensionsPositions(): [number, number] {
    const currentIndex = this.position;
    let otherIndex = 0;
    if (currentIndex === 0) {
      otherIndex = 1;
    }
    return [currentIndex, otherIndex];
  }

  hideScaleElt() {
    return (
      this.graphDetails?.labels?.length !== undefined &&
      this.graphDetails.labels.length < 10
    );
  }
}
