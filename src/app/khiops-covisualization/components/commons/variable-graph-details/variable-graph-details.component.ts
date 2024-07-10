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
import { DimensionVO } from '@khiops-library/model/dimension-vo';
import { TranslateService } from '@ngstack/translate';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { DistributionGraphCanvasComponent } from '@khiops-library/components/distribution-graph-canvas/distribution-graph-canvas.component';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { ClustersService } from '@khiops-covisualization/providers/clusters.service';
import { TreeNodeVO } from '@khiops-covisualization/model/tree-node-vo';
import { Subscription } from 'rxjs';
import { TYPES } from '@khiops-library/enum/types';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';
import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';
import * as _ from 'lodash';
import { ConfigService } from '@khiops-library/providers/config.service';

@Component({
  selector: 'app-variable-graph-details',
  templateUrl: './variable-graph-details.component.html',
  styleUrls: ['./variable-graph-details.component.scss'],
})
export class VariableGraphDetailsComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @ViewChild('distributionGraph', {
    static: false,
  })
  distributionGraph: DistributionGraphCanvasComponent;

  @Input() selectedNode: TreeNodeVO;
  @Output() selectedItemChanged: EventEmitter<any> = new EventEmitter();
  @Input() position: number;
  @Input() dimensionsTree: TreeNodeVO[];
  @Input() selectedDimension: DimensionVO;
  @Input() selectedDimensions: DimensionVO[];

  scrollPosition = 0;
  treeSelectedNodeChangedSub: Subscription;
  conditionalOnContextChangedSub: Subscription;

  isLoadingGraphDatas: boolean;
  scaleValue: number;
  graphDetails: ChartDatasVO;
  graphOptions: DistributionOptionsI = {
    types: [TYPES.COVERAGE, TYPES.FREQUENCY],
    selected: undefined,
  };
  activeEntries: number;
  title: string;
  legend: any;
  colorSet: ChartColorsSetI;
  isFullscreen: boolean = false;

  prevSelectedNode: TreeNodeVO;

  constructor(
    private translate: TranslateService,
    private dimensionsDatasService: DimensionsDatasService,
    private treenodesService: TreenodesService,
    private configService: ConfigService,
    private clustersService: ClustersService,
    private eventsService: EventsService,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[2];

    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
        setTimeout(() => {
          if (e.selectedNode) {
            // Only compute distribution of the other node
            this.getFilteredDistribution();
            this.prevSelectedNode = e.selectedNode;
          }
          this.setLegendTitle(this.position);
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
          (e) => e === this.selectedNode.shortDescription,
        );
        this.setLegendTitle(this.position);
      }
    }
  }

  ngAfterViewInit() {
    this.getFilteredDistribution();
  }

  updateGraphTitle() {
    const currentIndex = this.position;
    const otherIndex = this.position === 0 ? 1 : 0;

    this.title =
      this.translate.get('GLOBAL.DISTRIBUTION') +
      ' ' +
      this.translate.get('GLOBAL.OF') +
      ' ' +
      this.selectedDimensions[currentIndex].name +
      ' ' +
      this.translate.get('GLOBAL.GIVEN') +
      ' ' +
      this.selectedDimensions[otherIndex].name;
  }

  resize() {
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
      .getRootElementDom()
      .querySelector('#cluster-distribution-' + this.position)
      .dispatchEvent(trustedClickEvent);
  }

  ngOnDestroy() {
    this.treeSelectedNodeChangedSub.unsubscribe();
    this.conditionalOnContextChangedSub.unsubscribe();
  }

  getFilteredDistribution() {
    if (this.dimensionsTree && this.selectedNode) {
      this.graphDetails = this.clustersService.getDistributionDetailsFromNode(
        this.position,
      );
      if (this.graphDetails?.labels) {
        this.activeEntries = this.graphDetails.labels.findIndex(
          (e) => e === this.selectedNode.shortDescription,
        );
      }
      this.updateGraphTitle();
    }
  }

  setLegendTitle(position: number) {
    const otherIndex = this.position === 0 ? 1 : 0;
    this.graphDetails.datasets[0].label =
      this.dimensionsDatasService?.dimensionsDatas?.selectedNodes?.[
        otherIndex
      ]?.shortDescription;
    // force legend update
    this.graphDetails = _.cloneDeep(this.graphDetails);
  }

  onSelectBarChanged(index: number) {
    this.activeEntries = index;

    const [currentIndex, otherIndex] = this.invertDimensionsPositions();

    // Find node name from index
    const currentNodeName = this.graphDetails.labels[index];
    this.treenodesService.setSelectedNode(
      this.selectedDimensions[currentIndex].name,
      currentNodeName,
    );
  }

  onScaleValueChanged(value: number) {
    this.scaleValue = value;
  }

  onScrollPositionChanged(position: number) {
    this.scrollPosition = position;
  }

  invertDimensionsPositions() {
    const currentIndex = this.position;
    let otherIndex = 0;
    if (currentIndex === 0) {
      otherIndex = 1;
    }
    return [currentIndex, otherIndex];
  }
}
