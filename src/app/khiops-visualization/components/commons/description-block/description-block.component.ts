/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, inject, input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImportantBadgeComponent } from '@khiops-library/components/important-badge/important-badge.component';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { TranslateModule, TranslateService } from '@ngstack/translate';

@Component({
  selector: 'app-description-block',
  templateUrl: './description-block.component.html',
  styleUrls: ['./description-block.component.scss'],
  imports: [FlexLayoutModule, ImportantBadgeComponent, TranslateModule],
})
export class DescriptionBlockComponent extends SelectableComponent {
  private readonly translate = inject(TranslateService);
  readonly inputDatas = input<PreparationVariableModel>();
  componentType = COMPONENT_TYPES.DESCRIPTIONS; // needed to copy datas

  getDerivationRuleValue(): string {
    return (
      this.inputDatas()?.derivationRule ||
      this.translate.get('GLOBAL.NO_DERIVATION_RULE')
    );
  }
}
