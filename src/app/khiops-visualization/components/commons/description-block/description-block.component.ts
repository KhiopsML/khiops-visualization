/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

@Component({
  selector: 'app-description-block',
  templateUrl: './description-block.component.html',
  styleUrls: ['./description-block.component.scss'],
  imports: [FlexLayoutModule],
})
export class DescriptionBlockComponent extends SelectableComponent {
  readonly title = input<string>();
  readonly value = input<string>();
  componentType = COMPONENT_TYPES.DESCRIPTIONS; // needed to copy datas
}
