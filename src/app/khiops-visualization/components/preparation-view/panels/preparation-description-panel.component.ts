/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit } from '@angular/core';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { TranslateService } from '@ngstack/translate';
import { REPORT } from '@khiops-library/enum/report';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';

@Component({
  selector: 'app-preparation-description-panel',
  template: `
    <as-split direction="horizontal" disabled>
      <as-split-area fxFlex="50%">
        @if (selectedVariable) {
          <app-description-block
            id="preparation-description-block-variable"
            title="{{ 'GLOBAL.NAME' | translate }}"
            [value]="selectedVariable?.name"
          ></app-description-block>
        }
        @if (!selectedVariable) {
          <kl-no-data fxFlex></kl-no-data>
        }
      </as-split-area>
      <as-split-area fxFlex="50%">
        @if (selectedVariable) {
          <app-description-block
            id="preparation-description-block-derivation"
            title="{{ 'GLOBAL.DERIVATION_RULE' | translate }}"
            [value]="getDerivationRuleValue()"
          ></app-description-block>
        }
        @if (!selectedVariable) {
          <kl-no-data fxFlex></kl-no-data>
        }
      </as-split-area>
    </as-split>
  `,
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
        width: 100%;
      }
      as-split {
        flex: 1;
      }
    `,
  ],
  standalone: false,
})
export class PreparationDescriptionPanelComponent implements OnInit {
  @Input() api: any;

  public selectedVariable?: PreparationVariableModel;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    const preparationSource =
      this.api?.params?.preparationSource ?? REPORT.PREPARATION_REPORT;
    const datas = this.preparationDatasService.getDatas(preparationSource);
    this.selectedVariable = datas?.selectedVariable;
  }

  getDerivationRuleValue(): string {
    return (
      this.selectedVariable?.derivationRule ||
      this.translate.get('GLOBAL.NO_DERIVATION_RULE')
    );
  }
}
