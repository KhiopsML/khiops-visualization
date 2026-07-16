/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  ViewChild,
  Input,
  OnChanges,
  DoCheck,
  ChangeDetectionStrategy,
} from '@angular/core';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { VariableGraphDetailsComponent } from '../variable-graph-details/variable-graph-details.component';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas.interface';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals.interface';
import {
  GraphSelectionScope,
  GraphSelectionSessionService,
} from '@khiops-visualization/providers/graph-selection-session.service';

@Component({
  selector: 'app-var-details-preparation',
  templateUrl: './var-details-preparation.component.html',
  styleUrls: ['./var-details-preparation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class VarDetailsPreparationComponent
  implements OnInit, OnChanges, DoCheck
{
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  private appVariableGraphDetails?: VariableGraphDetailsComponent;

  @Input() public preparationSource?: string;
  @Input() public selectionScope: GraphSelectionScope = 'preparation';

  public isRegressionAnalysis?: boolean;
  public preparationDatas?: {
    selectedVariable: PreparationVariableModel;
    currentIntervalDatas: GridDatasI;
  };
  public sizes?: DynamicI;
  public matrixRegSelectedCell = 0;
  public distributionSelectedBarIndex = 0;
  public preparation2dDatas?: Preparation2dDatasModel;
  private previousSelectedVariableRank?: string;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private evaluationDatasService: EvaluationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
    private layoutService: LayoutService,
    private graphSelectionSessionService: GraphSelectionSessionService,
  ) {}

  ngOnInit() {
    this.distributionSelectedBarIndex =
      this.graphSelectionSessionService.getSelectedIndex(this.selectionScope);
    this.sizes = this.layoutService.getViewSplitSizes('preparationView');
    this.isRegressionAnalysis =
      this.evaluationDatasService.isRegressionAnalysis();
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
  }

  ngOnChanges() {
    if (this.preparationSource !== undefined) {
      this.preparationDatas = this.preparationDatasService.getDatas(
        this.preparationSource,
      );
    } else {
      this.preparationDatas = undefined;
    }
  }

  ngDoCheck() {
    const currentRank = this.preparationDatas?.selectedVariable?.rank;

    if (this.previousSelectedVariableRank === undefined) {
      this.previousSelectedVariableRank = currentRank;
      return;
    }

    if (
      currentRank !== undefined &&
      currentRank !== this.previousSelectedVariableRank
    ) {
      this.distributionSelectedBarIndex = 0;
      this.graphSelectionSessionService.setSelectedIndex(this.selectionScope, 0);
    }

    this.previousSelectedVariableRank = currentRank;
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'preparationView',
    );

    // Resize to update graphs dimensions
    if (this.appVariableGraphDetails) {
      this.appVariableGraphDetails.resize();
    }
  }

  onSelectedMatrixCellChanged(index: number) {
    this.matrixRegSelectedCell = index;

    // Callback when user click on matrix cell to select corresponding bar distribution
    this.distributionSelectedBarIndex =
      this.preparation2dDatasService.computeDistributionIndexFromMatrixCellIndex(
        index,
      );
    this.graphSelectionSessionService.setSelectedIndex(
      this.selectionScope,
      this.distributionSelectedBarIndex,
    );
  }

  onSelectedGraphItemChanged(index: number) {
    // Keep in memory to keep bar charts index on type change
    this.distributionSelectedBarIndex = index;
    this.graphSelectionSessionService.setSelectedIndex(this.selectionScope, index);

    // Callback when user click on bar distribution to select matrix corresponding cell
    if (this.isRegressionAnalysis) {
      this.matrixRegSelectedCell = index;
    } else {
      // get interval data if no matrix
      // Get current histogram information to ensure correct interval bounds
      const currentHistogramInfo = this.appVariableGraphDetails
        ?.distributionDatas
        ? {
            interpretableHistogramNumber:
              this.appVariableGraphDetails.distributionDatas
                .interpretableHistogramNumber,
            histogramDatas:
              this.appVariableGraphDetails.distributionDatas.histogramDatas,
          }
        : undefined;

      this.preparationDatasService.getCurrentIntervalDatas(
        this.preparationSource || '',
        index,
        currentHistogramInfo,
      );
    }
  }

  /**
   * Gets the appropriate no-data message for interval data
   * @returns the translation key for the no-data message
   */
  getNoDataMessage(): string | undefined {
    if (
      this.preparationDatas?.selectedVariable &&
      this.preparationDatas.selectedVariable.level === 0
    ) {
      return 'NO_DATAS.NON_INFORMATIVE_VARIABLE';
    }
    return undefined;
  }
}
