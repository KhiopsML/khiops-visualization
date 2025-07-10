/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { VariableGraphDetailsComponent } from '../variable-graph-details/variable-graph-details.component';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';

@Component({
  selector: 'app-var-details-preparation',
  templateUrl: './var-details-preparation.component.html',
  styleUrls: ['./var-details-preparation.component.scss'],
  standalone: false,
})
export class VarDetailsPreparationComponent implements OnInit, OnChanges {
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  private appVariableGraphDetails?: VariableGraphDetailsComponent;

  @Input() public preparationSource?: string;

  public isRegressionOrExplanatoryAnalysis?: boolean;
  public preparationDatas?: {
    selectedVariable: PreparationVariableModel;
    currentIntervalDatas: GridDatasI;
  };
  public sizes?: DynamicI;
  public matrixRegSelectedCell = 0;
  public distributionSelectedBarIndex = 0;
  public preparation2dDatas?: Preparation2dDatasModel;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private evaluationDatasService: EvaluationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
    private layoutService: LayoutService,
  ) {}

  ngOnInit() {
    this.sizes = this.layoutService.getViewSplitSizes('preparationView');
    this.isRegressionOrExplanatoryAnalysis =
      this.preparationDatasService.isExplanatoryAnalysis() ||
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
  }

  onSelectedGraphItemChanged(index: number) {
    // Keep in memory to keep bar charts index on type change
    this.distributionSelectedBarIndex = index;

    // Callback when user click on bar distribution to select matrix corresponding cell
    if (this.isRegressionOrExplanatoryAnalysis) {
      this.matrixRegSelectedCell = index;
    } else {
      // get interval data if no matrix
      this.preparationDatasService.getCurrentIntervalDatas(
        this.preparationSource || '',
        index,
      );
    }
  }
}
