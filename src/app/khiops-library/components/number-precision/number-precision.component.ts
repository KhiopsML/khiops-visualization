/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'kl-number-precision',
  templateUrl: './number-precision.component.html',
  styleUrls: ['./number-precision.component.scss'],
  standalone: false,
})
export class NumberPrecisionComponent {
  @Input() numberPrecision: number = 0;
  @Output() numberPrecisionChange = new EventEmitter<number>();

  onChange(newValue: number) {
    this.numberPrecision = newValue;
    this.numberPrecisionChange.emit(newValue);
  }
}
