/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'kl-matrix-contrast-setting',
  templateUrl: './matrix-contrast-setting.component.html',
  styleUrls: ['./matrix-contrast-setting.component.scss'],
  standalone: false,
})
export class MatrixContrastSettingComponent {
  private static readonly minContrast = 10;
  private static readonly maxContrast = 90;
  private static readonly contrastStep = 10;
  private _contrastValue = MatrixContrastSettingComponent.minContrast;

  @Input()
  set contrastValue(value: number) {
    this._contrastValue = this.clampContrast(value);
  }

  get contrastValue(): number {
    return this._contrastValue;
  }

  @Output() readonly contrastValueChange = new EventEmitter<number>();

  readonly minContrast = MatrixContrastSettingComponent.minContrast;
  readonly maxContrast = MatrixContrastSettingComponent.maxContrast;

  onChange(newValue: number | null): void {
    const nextValue = this.clampContrast(newValue);

    if (nextValue === this._contrastValue) {
      return;
    }

    this._contrastValue = nextValue;

    this.contrastValueChange.emit(nextValue);
  }

  private clampContrast(value: number | null | undefined): number {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return MatrixContrastSettingComponent.minContrast;
    }

    const steppedValue =
      Math.round(numericValue / MatrixContrastSettingComponent.contrastStep) *
      MatrixContrastSettingComponent.contrastStep;

    return Math.min(
      MatrixContrastSettingComponent.maxContrast,
      Math.max(MatrixContrastSettingComponent.minContrast, steppedValue),
    );
  }
}
