/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit } from '@angular/core';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas.interface';

@Component({
  selector: 'app-preparation-summary-panel',
  template: `
    <kl-informations-block
      id="preparation-informations-block-summary"
      title="{{ 'GLOBAL.SUMMARY' | translate }}"
      [inputDatas]="summaryDatas"
    ></kl-informations-block>
  `,
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
        width: 100%;
      }
      kl-informations-block {
        flex: 1;
      }
    `,
  ],
  standalone: false,
})
export class PreparationSummaryPanelComponent implements OnInit {
  @Input() api: any;

  public summaryDatas?: InfosDatasI[];

  constructor(private preparationDatasService: PreparationDatasService) {}

  ngOnInit() {
    this.summaryDatas = this.preparationDatasService.getSummaryDatas();
  }
}
