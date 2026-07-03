/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'kl-scale-persistence-setting',
  templateUrl: './scale-persistence-setting.component.html',
  styleUrls: ['./scale-persistence-setting.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ScalePersistenceSettingComponent {
  @Input() persistScaleOptions: boolean = false;
  @Output() persistScaleOptionsChange = new EventEmitter<boolean>();

  onChange(newValue: MatSlideToggleChange) {
    this.persistScaleOptions = newValue.checked;
    this.persistScaleOptionsChange.emit(newValue.checked);
  }
}
