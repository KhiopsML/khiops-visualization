/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  OnDestroy,
  EventEmitter,
  Output,
  OnInit,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { CompositionModel } from '@khiops-covisualization/model/composition.model';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { ClustersService } from '@khiops-covisualization/providers/clusters.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { Subscription } from 'rxjs';
import _ from 'lodash';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { getCompositionDisplayedColumns } from './composition.config';

@Component({
  selector: 'app-composition',
  templateUrl: './composition.component.html',
  styleUrls: ['./composition.component.scss'],
  standalone: false,
})
export class CompositionComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public position: number = 0;
  @Input() public selectedDimension: DimensionCovisualizationModel | undefined;
  @Input() private selectedNode: TreeNodeModel | undefined;

  @Output() private selectedCompositionChanged: EventEmitter<any> =
    new EventEmitter();

  public title: string = '';
  public selectedComposition: CompositionModel | undefined;
  public compositionValues: CompositionModel[] | undefined;
  public id: string = '';
  public compositionDisplayedColumns: GridColumnsI[] = [];

  private treeSelectedNodeChangedSub: Subscription;
  private importedDatasChangedSub: Subscription;

  constructor(
    private translate: TranslateService,
    private importExtDatasService: ImportExtDatasService,
    private treenodesService: TreenodesService,
    private clustersService: ClustersService,
    private eventsService: EventsService,
  ) {
    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
        if (e.realNodeVO && e.hierarchyName === this.selectedDimension?.name) {
          this.updateTable(e.realNodeVO);
        }
      });

    this.importedDatasChangedSub =
      this.eventsService.importedDatasChanged.subscribe(() => {
        if (this.selectedNode && this.selectedDimension) {
          const externalDatas: ExtDatasModel =
            this.importExtDatasService.getImportedDatasFromDimension(
              this.selectedDimension,
            );

          this.compositionValues?.forEach((composition: CompositionModel) => {
            try {
              // @ts-ignore
              const currentExtData = externalDatas[composition.value];
              if (currentExtData) {
                composition.externalData = currentExtData;
              }
            } catch (e) {}
          });

          // Force selection change to update external dats component #113
          // @ts-ignore
          this.selectedComposition = { ...this.selectedComposition };
          this.selectedCompositionChanged.emit(this.selectedComposition);
        }
      });
  }

  ngOnInit() {
    this.id = 'cluster-composition-' + this.position;
    this.title = this.translate.get('GLOBAL.COMPOSITION');
  }

  ngAfterViewInit() {
    // #40 loss of display after resizing the coclustering
    // We need to update table at init if component was hidden
    // Also linked to #111
    this.updateTable(this.selectedNode);
  }

  ngOnChanges(changes: SimpleChanges) {
    // update when dimension change (with combo)
    if (
      changes.selectedDimension?.currentValue?.name !==
        changes.selectedDimension?.previousValue?.name &&
      changes.selectedNode
    ) {
      this.compositionDisplayedColumns = getCompositionDisplayedColumns(
        this.translate,
        this.selectedDimension?.isVarPart,
      );
      this.updateTable(this.selectedNode);
    }
  }

  ngOnDestroy() {
    this.treeSelectedNodeChangedSub?.unsubscribe();
    this.importedDatasChangedSub?.unsubscribe();
    this.selectedComposition = undefined;
    this.selectedCompositionChanged.emit(this.selectedComposition);
  }

  onDoubleClickListItem(item: TreeNodeModel) {
    this.treenodesService.setSelectedNode(
      this.selectedDimension?.name!,
      item.cluster,
    );
  }

  onSelectRowChanged(item: CompositionModel) {
    // find composition in local to get external datas
    this.selectedComposition = this.compositionValues?.find(
      (e) => e.value === item.value,
    );
    this.selectedCompositionChanged.emit(this.selectedComposition);
  }

  private updateTable(selectedNode: TreeNodeModel | undefined) {
    if (selectedNode) {
      this.compositionValues = Object.assign(
        [],
        this.clustersService.getCompositionClusters(
          selectedNode.hierarchy,
          _.cloneDeep(selectedNode),
        ),
      );
      // if composition values : categorical
      if (this.compositionValues!.length > 0) {
        // Select first by default
        this.selectedComposition = this.compositionValues?.[0];
        this.selectedCompositionChanged.emit(this.selectedComposition);
      }
    }
  }
}
