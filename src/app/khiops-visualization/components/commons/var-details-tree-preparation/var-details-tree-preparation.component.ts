/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Input,
  DoCheck,
} from '@angular/core';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { VariableGraphDetailsComponent } from '../variable-graph-details/variable-graph-details.component';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals.interface';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { Observable } from 'rxjs';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas.interface';
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import {
  GraphSelectionScope,
  GraphSelectionSessionService,
} from '@khiops-visualization/providers/graph-selection-session.service';

@Component({
  selector: 'app-var-details-tree-preparation',
  templateUrl: './var-details-tree-preparation.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class VarDetailsTreePreparationComponent implements DoCheck {
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  private appVariableGraphDetails?: VariableGraphDetailsComponent;
  public treePreparationDatas?: TreePreparationDatasModel;
  public sizes: DynamicI;
  public selectedBarIndex = 0;
  public selectedNodes$: Observable<TreeNodeModel[]>;
  public currentIntervalDatas: GridDatasI | undefined;
  public REPORT = REPORT;
  @Input() public selectionScope: GraphSelectionScope = 'treePreparation';
  private previousSelectedVariableRank?: string;

  constructor(
    private treePreparationDatasService: TreePreparationDatasService,
    private preparationDatasService: PreparationDatasService,
    private layoutService: LayoutService,
    private store: TreePreparationStore,
    private graphSelectionSessionService: GraphSelectionSessionService,
  ) {
    this.selectedNodes$ = this.store.selectedNodes$;
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.sizes = this.layoutService.getViewSplitSizes('treePreparationView');
    this.selectedBarIndex = this.graphSelectionSessionService.getSelectedIndex(
      this.selectionScope,
    );

    // When entering from Modeling with a Tree_* variable, reuse modeling chart index.
    if (this.selectionScope === 'modeling') {
      const modelingIndex = this.graphSelectionSessionService.getSelectedIndex(
        'modeling',
      );
      this.selectedBarIndex = modelingIndex;
      this.graphSelectionSessionService.setSelectedIndex(
        'treePreparation',
        modelingIndex,
      );
    }

    this.onSelectedGraphItemChanged(this.selectedBarIndex);
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'treePreparationView',
    );

    // Resize to update graphs dimensions
    if (this.appVariableGraphDetails) {
      this.appVariableGraphDetails.resize();
    }
  }

  onSelectedGraphItemChanged(index: number) {
    // Keep in memory to keep bar charts index on type change
    this.selectedBarIndex = index;
    this.graphSelectionSessionService.setSelectedIndex(
      this.selectionScope,
      index,
    );
    // Keep treePreparation scope aligned with modeling for Tree_* variables.
    if (this.selectionScope === 'modeling') {
      this.graphSelectionSessionService.setSelectedIndex(
        'treePreparation',
        index,
      );
    }

    this.currentIntervalDatas =
      this.preparationDatasService.getCurrentIntervalDatas(
        REPORT.TREE_PREPARATION_REPORT,
        this.selectedBarIndex,
      );

    // Select decision-tree nodes corresponding to selected chart index/modalities.
    this.store.selectNodesFromIndex({
      index: this.selectedBarIndex,
    });
  }

  ngDoCheck() {
    const currentRank = this.treePreparationDatas?.selectedVariable?.rank;

    if (this.previousSelectedVariableRank === undefined) {
      this.previousSelectedVariableRank = currentRank;
      return;
    }

    if (
      currentRank !== undefined &&
      currentRank !== this.previousSelectedVariableRank
    ) {
      this.onSelectedGraphItemChanged(0);
    }

    this.previousSelectedVariableRank = currentRank;
  }
}
