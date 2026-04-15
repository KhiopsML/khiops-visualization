/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit } from '@angular/core';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas.interface';

@Component({
  selector: 'app-preparation-target-stats-panel',
  template: `
    @if (targetVariableStatsDatas) {
      <app-target-variable-stats
        id="preparation-target-variable-stats"
        fxFlexFill
        [inputDatas]="targetVariableStatsDatas"
      ></app-target-variable-stats>
    }
    @if (!targetVariableStatsDatas && !targetVariableStatsInformations) {
      <kl-no-data
        fxFlexFill
        [message]="'NO_DATAS.NO_VARIABLE_DETAILS'"
      ></kl-no-data>
    }
    @if (targetVariableStatsInformations && !targetVariableStatsDatas) {
      <kl-informations-block
        id="variable-stats-block-summary"
        title="{{ 'GLOBAL.TARGET_VARIABLE_STATS' | translate }}"
        [inputDatas]="targetVariableStatsInformations"
      ></kl-informations-block>
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
export class PreparationTargetStatsPanelComponent implements OnInit {
  @Input() api: any;

  public targetVariableStatsDatas?: ChartDatasModel;
  public targetVariableStatsInformations?: InfosDatasI[];

  constructor(private preparationDatasService: PreparationDatasService) {}

  ngOnInit() {
    this.targetVariableStatsDatas =
      this.preparationDatasService.getTargetVariableStatsDatas();
    this.targetVariableStatsInformations =
      this.preparationDatasService.getTargetVariableStatsInformations();
  }
}
