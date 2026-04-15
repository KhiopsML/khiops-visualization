/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { REPORT } from '@khiops-library/enum/report';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';

@Component({
  selector: 'app-preparation-matrix-panel',
  template: `
    <app-regression-matrix
      fxFlex="1 1 100%"
      id="preparation-matrix-comp-container"
      [preparationSource]="preparationSource"
      (selectedCellChanged)="onSelectedMatrixCellChanged($event)"
      [selectedCell]="matrixRegSelectedCell"
      [selectedVariable]="preparationDatas?.selectedVariable"
    ></app-regression-matrix>
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
export class PreparationMatrixPanelComponent implements OnInit, OnDestroy {
  @Input() api: any;

  public preparationSource: string = REPORT.PREPARATION_REPORT;
  public preparationDatas: any;
  public matrixRegSelectedCell = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private preparationDatasService: PreparationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {}

  ngOnInit() {
    this.preparationSource =
      this.api?.params?.preparationSource ?? REPORT.PREPARATION_REPORT;

    this.preparationDatas = this.preparationDatasService.getDatas(
      this.preparationSource,
    );

    const state = this.api?.params?.state;
    if (state) {
      this.subscriptions.push(
        state.matrixRegSelectedCell$.subscribe((index: number) => {
          this.matrixRegSelectedCell = index;
        }),
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onSelectedMatrixCellChanged(index: number) {
    const state = this.api?.params?.state;
    state?.matrixRegSelectedCell$.next(index);
    const distributionIndex =
      this.preparation2dDatasService.computeDistributionIndexFromMatrixCellIndex(
        index,
      );
    state?.distributionSelectedBarIndex$.next(distributionIndex);
  }
}
