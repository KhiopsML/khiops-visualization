/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit } from '@angular/core';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';

@Component({
  selector: 'app-preparation-var-details-panel',
  template: `
    @if (isNonInformativeVariable) {
      <kl-no-data
        class="kl-card"
        fxFlex
        [message]="'NO_DATAS.NON_INFORMATIVE_VARIABLE'"
      ></kl-no-data>
    }
    @if (!isNonInformativeVariable) {
      <app-var-details-preparation
        fxFlex
        [preparationSource]="preparationSource"
      ></app-var-details-preparation>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
        width: 100%;
      }
      app-var-details-preparation {
        flex: 1;
      }
    `,
  ],
  standalone: false,
})
export class PreparationVarDetailsPanelComponent implements OnInit {
  @Input() api: any;

  public preparationSource: string = REPORT.PREPARATION_REPORT;
  public isNonInformativeVariable: boolean = false;

  constructor(private preparationDatasService: PreparationDatasService) {}

  ngOnInit() {
    this.preparationSource =
      this.api?.params?.preparationSource ?? REPORT.PREPARATION_REPORT;

    const datas = this.preparationDatasService.getDatas(this.preparationSource);
    const hasLevel0 = datas?.selectedVariable?.level === 0;
    const hasDetailedStats = this.preparationDatasService.hasDetailedStatistics(
      this.preparationSource,
    );
    this.isNonInformativeVariable = hasLevel0 || !hasDetailedStats;
  }
}
