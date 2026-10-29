/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import { SplitGutterInteractionEvent } from 'angular-split';
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';
import { map } from 'rxjs';
import type { VariableGraphDetailsComponent } from '../commons/variable-graph-details/variable-graph-details.component';

@Component({
  selector: 'app-tree-preparation-analysis',
  templateUrl: './tree-preparation-analysis.component.html',
  styleUrls: ['./tree-preparation-analysis.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TreePreparationAnalysisComponent {
  @ViewChild('variableGraphDetails')
  private variableGraphDetails?: VariableGraphDetailsComponent;

  readonly preparationSource = REPORT.TREE_PREPARATION_REPORT;
  readonly treePreparationDatas;
  readonly distributionDatas;
  readonly sizes;
  readonly variablesDatas;
  readonly selectedNode$;
  readonly selectedNodes$;
  readonly selectedGraphItemIndex$;
  private readonly splitViewKey = 'treePreparationAnalysis';

  constructor(
    private treePreparationDatasService: TreePreparationDatasService,
    private distributionDatasService: DistributionDatasService,
    private layoutService: LayoutService,
    private dialogService: DialogService,
    private preparationDatasService: PreparationDatasService,
    private modelingDatasService: ModelingDatasService,
    private store: TreePreparationStore,
  ) {
    this.selectedNode$ = this.store.selectedNode$;
    this.selectedNodes$ = this.store.selectedNodes$;
    this.selectedGraphItemIndex$ = this.store.selectedNode$.pipe(
      map((node) =>
        node?._id
          ? (this.treePreparationDatasService.getNodeGroupIndex(node._id) ?? 0)
          : 0,
      ),
    );
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.distributionDatas = this.distributionDatasService.getDatas();
    this.sizes = this.layoutService.getViewSplitSizes(this.splitViewKey);
    if (this.sizes.analysisColumns.length === 2) {
      const [trees, details] = this.sizes.analysisColumns;
      this.sizes.analysisColumns = [trees * 0.7, 30, details * 0.7];
      this.layoutService.setViewSplitSizes(this.splitViewKey, this.sizes);
    }
    if (this.sizes.analysisRightRows.length === 4) {
      const [details, infos, rules, selection] = this.sizes.analysisRightRows;
      this.sizes.analysisRightRows = [details, infos + selection, rules];
      this.layoutService.setViewSplitSizes(this.splitViewKey, this.sizes);
    }
    this.variablesDatas = (
      this.preparationDatasService.getVariablesDatas(
        REPORT.TREE_PREPARATION_REPORT,
      ) || []
    ).filter((variable) => !!variable.name);
  }

  get selectedTreeIndex(): number {
    return this.variablesDatas.findIndex(
      (variable) =>
        variable.name === this.treePreparationDatas?.selectedVariable?.name,
    );
  }

  navigateTree(direction: -1 | 1): void {
    const currentIndex = this.selectedTreeIndex;
    const variable = this.variablesDatas[currentIndex + direction];
    if (currentIndex < 0 || !variable?.name) {
      return;
    }
    const selectedVariable =
      this.treePreparationDatasService.setSelectedVariable(variable.name);
    if (selectedVariable) {
      this.modelingDatasService.setSelectedVariable(selectedVariable);
    }
  }

  onLineageNodeSelected(nodeId: string): void {
    if (nodeId) {
      this.store.selectNodesFromId({ id: nodeId });
    }
  }

  onSelectedGraphItemChanged(index: number): void {
    this.store.selectNodesFromIndex({ index });
  }

  isNonInformativeVariable(): boolean {
    return (
      this.treePreparationDatas?.selectedVariable?.level === 0 ||
      !this.treePreparationDatasService.hasDetailedStatistics()
    );
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      this.splitViewKey,
    );
    this.variableGraphDetails?.resize();
  }

  close() {
    this.dialogService.closeDialog();
  }
}
