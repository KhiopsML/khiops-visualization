/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, inject, signal } from '@angular/core';
import { LS } from '@khiops-library/enum/ls';
import { HistogramType } from '../histogram/histogram.type';
import { AppService } from '@khiops-visualization/providers/app.service';
import { TYPES } from '@khiops-library/enum/types';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngstack/translate';
import { KhiopsLibraryModule } from '@khiops-library/khiops-library.module';

export interface ScaleSettings {
  mode: 'auto' | 'manual';
  xScale: TYPES.LINEAR | TYPES.LOGARITHMIC;
  yScale: TYPES.LINEAR | TYPES.LOGARITHMIC;
}

@Component({
  selector: 'app-change-scale-dialog',
  templateUrl: './change-scale-dialog.component.html',
  styleUrls: ['./change-scale-dialog.component.scss'],
  imports: [
    MatDialogModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatButtonModule,
    TranslateModule,
    KhiopsLibraryModule,
  ],
})
export class ChangeScaleDialogComponent {
  readonly mode = signal<'auto' | 'manual'>('manual');
  readonly xScale = signal<TYPES.LINEAR | TYPES.LOGARITHMIC>(TYPES.LINEAR);
  readonly yScale = signal<TYPES.LINEAR | TYPES.LOGARITHMIC>(TYPES.LINEAR);

  private readonly dialogService = inject(DialogService);

  constructor() {
    // Initialize mode from auto-scale setting
    const autoScaleEnabled =
      AppService.Ls.get(LS.SETTING_AUTO_SCALE)?.toString() === 'true';
    this.mode.set(autoScaleEnabled ? 'auto' : 'manual');

    // Initialize with current scale settings from local storage
    const currentXScale = AppService.Ls.get(LS.DISTRIBUTION_GRAPH_OPTION_X);
    const currentYScale = AppService.Ls.get(LS.DISTRIBUTION_GRAPH_OPTION_Y);

    // Map histogram types to dialog values
    this.xScale.set(
      currentXScale === HistogramType.XLOG ? TYPES.LOGARITHMIC : TYPES.LINEAR,
    );
    this.yScale.set(
      currentYScale === HistogramType.YLOG ? TYPES.LOGARITHMIC : TYPES.LINEAR,
    );
  }

  onModeChange(mode: 'auto' | 'manual'): void {
    this.mode.set(mode);
  }

  onXScaleChange(xScale: TYPES.LINEAR | TYPES.LOGARITHMIC): void {
    this.xScale.set(xScale);
  }

  onYScaleChange(yScale: TYPES.LINEAR | TYPES.LOGARITHMIC): void {
    this.yScale.set(yScale);
  }

  onCancel(): void {
    this.dialogService.closeDialog();
  }

  onApply(): void {
    const scaleSettings: ScaleSettings = {
      mode: this.mode(),
      xScale: this.xScale(),
      yScale: this.yScale(),
    };
    this.dialogService.closeDialog(scaleSettings);
  }
}
