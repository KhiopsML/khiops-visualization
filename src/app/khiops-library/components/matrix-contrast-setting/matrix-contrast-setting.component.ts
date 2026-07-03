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

@Component({
  selector: 'kl-matrix-contrast-setting',
  templateUrl: './matrix-contrast-setting.component.html',
  styleUrls: ['./matrix-contrast-setting.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class MatrixContrastSettingComponent {
  @Input() contrastValue: number = 0;
  @Output() contrastValueChange = new EventEmitter<number>();

  onChange(newValue: number) {
    this.contrastValue = newValue;
    this.contrastValueChange.emit(newValue);
  }
}
