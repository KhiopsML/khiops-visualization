/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit } from '@angular/core';
import { REPORT } from '@khiops-library/enum/report';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';

@Component({
  selector: 'app-preparation-interval-panel',
  template: `
    @if (
      preparationDatas?.currentIntervalDatas?.values &&
      !isRegressionOrExplanatoryAnalysis
    ) {
      <kl-ag-grid
        id="preparation-current-interval"
        class="variables-list"
        fxFlexFill
        [showSearch]="true"
        [displayCount]="false"
        [showLineSelection]="true"
        titleTooltip="{{ 'TOOLTIPS.PREPARATION.INTERVAL.TITLE' | translate }}"
        [title]="preparationDatas?.currentIntervalDatas?.title"
        [showColumnsSelection]="false"
        [inputDatas]="preparationDatas?.currentIntervalDatas?.values"
        [displayedColumns]="preparationDatas?.currentIntervalDatas?.displayedColumns"
      ></kl-ag-grid>
    }
    @if (!preparationDatas?.currentIntervalDatas?.values && !isRegressionOrExplanatoryAnalysis) {
      <kl-no-data
        class="kl-card"
        fxFlex
        [message]="getNoDataMessage()"
      ></kl-no-data>
    }
    @if (
      (!preparationDatas?.currentIntervalDatas?.values &&
        preparation2dDatas?.currentCellDatas) ||
      isRegressionOrExplanatoryAnalysis
    ) {
      <div style="display:flex;flex-direction:row;width:100%;height:100%;">
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
          <kl-ag-grid
            id="preparation-2d-current-cell-x"
            class="variables-list"
            [title]="''"
            [showSearch]="true"
            [displayCount]="false"
            [showLineSelection]="true"
            [showColumnsSelection]="false"
            [inputDatas]="preparation2dDatas?.currentCellDatas.values[0]"
            [displayedColumns]="preparation2dDatas?.currentCellDatas.displayedColumns[0]"
          ></kl-ag-grid>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
          <kl-ag-grid
            id="preparation-2d-current-cell-y"
            class="variables-list"
            [title]="''"
            [showSearch]="true"
            [displayCount]="false"
            [showLineSelection]="true"
            [showColumnsSelection]="false"
            [inputDatas]="preparation2dDatas?.currentCellDatas.values[1]"
            [displayedColumns]="preparation2dDatas?.currentCellDatas.displayedColumns[1]"
          ></kl-ag-grid>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
        width: 100%;
      }
    `,
  ],
  standalone: false,
})
export class PreparationIntervalPanelComponent implements OnInit {
  @Input() api: any;

  public preparationSource: string = REPORT.PREPARATION_REPORT;
  public isRegressionOrExplanatoryAnalysis = false;
  public preparationDatas: any;
  public preparation2dDatas?: Preparation2dDatasModel;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {}

  ngOnInit() {
    this.preparationSource =
      this.api?.params?.preparationSource ?? REPORT.PREPARATION_REPORT;
    this.isRegressionOrExplanatoryAnalysis =
      this.api?.params?.isRegressionOrExplanatoryAnalysis ?? false;

    this.preparationDatas = this.preparationDatasService.getDatas(
      this.preparationSource,
    );
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
  }

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
