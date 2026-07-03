/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
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
  private static readonly minPrecision = 1;
  private static readonly maxPrecision = 8;
  private _numberPrecision = NumberPrecisionComponent.minPrecision;

  @Input()
  set numberPrecision(value: number) {
    this._numberPrecision = this.clampPrecision(value);
  }

  get numberPrecision(): number {
    return this._numberPrecision;
  }

  @Output() readonly numberPrecisionChange = new EventEmitter<number>();

  readonly minPrecision = NumberPrecisionComponent.minPrecision;
  readonly maxPrecision = NumberPrecisionComponent.maxPrecision;

  onChange(newValue: number | null): void {
    const nextValue = this.clampPrecision(newValue);

    if (nextValue === this._numberPrecision) {
      return;
    }

    this._numberPrecision = nextValue;

    this.numberPrecisionChange.emit(nextValue);
  }

  private clampPrecision(value: number | null | undefined): number {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return NumberPrecisionComponent.minPrecision;
    }

    return Math.min(
      NumberPrecisionComponent.maxPrecision,
      Math.max(NumberPrecisionComponent.minPrecision, Math.round(numericValue)),
    );
  }
}
