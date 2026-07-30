/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, model } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngstack/translate';

@Component({
  selector: 'kl-scale-persistence-setting',
  templateUrl: './scale-persistence-setting.component.html',
  styleUrls: ['./scale-persistence-setting.component.scss'],
  imports: [FlexLayoutModule, MatSlideToggleModule, TranslateModule],
})
export class ScalePersistenceSettingComponent {
  persistScaleOptions = model<boolean>(false);

  onChange(newValue: MatSlideToggleChange) {
    this.persistScaleOptions.set(newValue.checked);
  }
}
