/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { REPORT } from '@khiops-library/enum/report';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { VariableGraphDetailsComponent } from '../../commons/variable-graph-details/variable-graph-details.component';

@Component({
  selector: 'app-preparation-graph-panel',
  template: `
    @if (preparationDatas?.selectedVariable) {
      <app-variable-graph-details
        #appVariableGraphDetails
        [preparationSource]="preparationSource"
        [selectedVariable]="preparationDatas?.selectedVariable"
        [selectedGraphItemIndex]="distributionSelectedBarIndex"
        (selectedItemChanged)="onSelectedGraphItemChanged($event)"
        (interpretableHistogramChanged)="onSelectedGraphItemChanged($event)"
        fxFlex="1 1 100%"
        [showTargetDistributionGraph]="!isRegressionOrExplanatoryAnalysis"
      ></app-variable-graph-details>
    }
    @if (!preparationDatas?.selectedVariable) {
      <kl-no-data fxFlex></kl-no-data>
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
export class PreparationGraphPanelComponent implements OnInit, OnDestroy {
  @Input() api: any;

  @ViewChild('appVariableGraphDetails', { static: false })
  appVariableGraphDetails?: VariableGraphDetailsComponent;

  public preparationSource: string = REPORT.PREPARATION_REPORT;
  public isRegressionOrExplanatoryAnalysis = false;
  public preparationDatas: any;
  public distributionSelectedBarIndex = 0;

  private subscriptions: Subscription[] = [];

  constructor(private preparationDatasService: PreparationDatasService) {}

  ngOnInit() {
    this.preparationSource =
      this.api?.params?.preparationSource ?? REPORT.PREPARATION_REPORT;
    this.isRegressionOrExplanatoryAnalysis =
      this.api?.params?.isRegressionOrExplanatoryAnalysis ?? false;

    this.preparationDatas = this.preparationDatasService.getDatas(
      this.preparationSource,
    );

    const state = this.api?.params?.state;
    if (state) {
      this.subscriptions.push(
        state.distributionSelectedBarIndex$.subscribe((index: number) => {
          this.distributionSelectedBarIndex = index;
        }),
      );
    }

    if (this.api) {
      this.api.onDidLayoutChange(() => {
        this.appVariableGraphDetails?.resize();
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onSelectedGraphItemChanged(index: number) {
    const state = this.api?.params?.state;
    state?.distributionSelectedBarIndex$.next(index);

    if (this.isRegressionOrExplanatoryAnalysis) {
      state?.matrixRegSelectedCell$.next(index);
    } else {
      const currentHistogramInfo = this.appVariableGraphDetails?.distributionDatas
        ? {
            interpretableHistogramNumber:
              this.appVariableGraphDetails.distributionDatas
                .interpretableHistogramNumber,
            histogramDatas:
              this.appVariableGraphDetails.distributionDatas.histogramDatas,
          }
        : undefined;

      this.preparationDatasService.getCurrentIntervalDatas(
        this.preparationSource,
        index,
        currentHistogramInfo,
      );
    }
  }
}
