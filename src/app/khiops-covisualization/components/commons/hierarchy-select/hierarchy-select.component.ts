/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  SimpleChanges,
  OnChanges,
  Input,
  AfterViewInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { SelectedTreeClusterModel } from '@khiops-covisualization/model/selected-tree-cluster.model';
import { LS } from '@khiops-library/enum/ls';
import { LayoutService } from '@khiops-library/providers/layout.service';

@Component({
  selector: 'app-hierarchy-select',
  templateUrl: './hierarchy-select.component.html',
  styleUrls: ['./hierarchy-select.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate('150ms ease-in'),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({
            opacity: 0,
          }),
        ),
      ]),
    ]),
  ],
  standalone: false,
})
export class HierarchySelectComponent implements OnChanges, AfterViewInit {
  @Input() public selectedDimension: DimensionCovisualizationModel | undefined;
  @Input() public dimensions: DimensionCovisualizationModel[] | undefined;
  @Input() public selectedTreeCluster: SelectedTreeClusterModel | undefined;
  @Input() selectedNode: TreeNodeModel | undefined;
  @Input() private position: number = 0;
  @Output() private selectedTreeClusterChange = new EventEmitter<any>();

  public showStats = false;

  constructor(
    public dimensionsDatasService: DimensionsDatasService,
    private treenodesService: TreenodesService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private appService: AppService,
    private layoutService: LayoutService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedNode?.currentValue && this.selectedDimension) {
      this.selectedTreeCluster = new SelectedTreeClusterModel(
        this.selectedDimension,
      );
      this.selectedTreeCluster.intervals =
        this.dimensionsDatasService.getDimensionIntervals(
          this.selectedDimension.name,
        );
      const currentNode = this.treenodesService.getNodeFromDimensionTree(
        this.selectedDimension.name,
        changes.selectedNode?.currentValue.name,
      );
      if (this.selectedTreeCluster && currentNode) {
        this.selectedTreeCluster.setCurrentNodeInformations(currentNode);
        // Defer emission to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.selectedTreeClusterChange.emit(this.selectedTreeCluster);
        });
      }
    }
  }

  ngAfterViewInit() {
    this.showStats =
      AppService.Ls.get(LS.SHOW_DIMNSION_STATS + '_' + this.position) ===
      'true';
  }

  onClickOnShowStats() {
    this.showStats = !this.showStats;
    AppService.Ls.set(
      LS.SHOW_DIMNSION_STATS + '_' + this.position,
      this.showStats,
    );
  }

  /**
   * Changes the selected dimension and updates the position.
   * Displays a warning if the file is large.
   * Switches the layout split sizes based on the new position.
   * Updates selected nodes and dimension data.
   * Recomputes and constructs dimension trees and matrix data.
   *
   * @param dimension - The new dimension to be selected.
   * @param newPosition - The new position for the dimension.
   */
  changeSelectedDimension(
    dimension: DimensionCovisualizationModel,
    newPosition: number,
  ) {
    this.dimensionsDatasService.setIsLoading(true);
    setTimeout(() => {
      const isBigJsonFile = this.appService.isBigJsonFile();
      if (isBigJsonFile) {
        this.snackBar.open(
          this.translate.get('GLOBAL.BIG_FILES_LOADING_WARNING'),
          undefined,
          {
            duration: 2000,
            panelClass: 'success',
          },
        );
      }

      this.layoutService.switchSplitSizes(this.position, newPosition);
      // Reverse selected nodes on selection changed
      this.treenodesService.updateSelectedNodes(dimension, this.position);
      // Reverse dimensions datas on selection changed
      this.dimensionsDatasService.updateSelectedDimension(
        dimension,
        this.position,
      );
      // Recompute datas
      this.dimensionsDatasService.saveInitialDimension();
      this.dimensionsDatasService.constructDimensionsTrees();
      this.dimensionsDatasService.getMatrixDatas();
      this.dimensionsDatasService.computeMatrixDataFreqMap();
      this.dimensionsDatasService.setIsLoading(false);
    });
  }
}
