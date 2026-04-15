/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit } from '@angular/core';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas.interface';
import { REPORT } from '@khiops-library/enum/report';

@Component({
  selector: 'app-preparation-informations-panel',
  template: `
    <kl-informations-block
      fxFlexFill
      id="preparation-informations-block-informations"
      icon="subject"
      title="{{ 'GLOBAL.INFORMATIONS' | translate }}"
      [inputDatas]="informationsDatas"
      [showFilteredVariablesWarning]="showFilteredVariablesWarning"
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
export class PreparationInformationsPanelComponent implements OnInit {
  @Input() api: any;

  public informationsDatas?: InfosDatasI[];
  public showFilteredVariablesWarning: boolean = false;

  constructor(private preparationDatasService: PreparationDatasService) {}

  ngOnInit() {
    const preparationSource =
      this.api?.params?.preparationSource ?? REPORT.PREPARATION_REPORT;
    this.informationsDatas =
      this.preparationDatasService.getInformationsDatas(preparationSource);
    this.showFilteredVariablesWarning =
      this.preparationDatasService.isFilteredVariables(preparationSource);
  }
}
