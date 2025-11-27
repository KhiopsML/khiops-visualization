/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit } from '@angular/core';
import { LS } from '@khiops-library/enum/ls';
import { HistogramType } from '../histogram/histogram.type';
import { AppService } from '@khiops-visualization/providers/app.service';
import { TYPES } from '@khiops-library/enum/types';
import { DialogService } from '@khiops-library/providers/dialog.service';

export interface ScaleSettings {
  xScale: TYPES.LINEAR | TYPES.LOGARITHMIC;
  yScale: TYPES.LINEAR | TYPES.LOGARITHMIC;
}

@Component({
  selector: 'app-change-scale-dialog',
  templateUrl: './change-scale-dialog.component.html',
  styleUrls: ['./change-scale-dialog.component.scss'],
  standalone: false,
})
export class ChangeScaleDialogComponent implements OnInit {
  xScale: TYPES.LINEAR | TYPES.LOGARITHMIC = TYPES.LINEAR;
  yScale: TYPES.LINEAR | TYPES.LOGARITHMIC = TYPES.LINEAR;

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    // Initialize with current scale settings from local storage
    const currentXScale = AppService.Ls.get(LS.DISTRIBUTION_GRAPH_OPTION_X);
    const currentYScale = AppService.Ls.get(LS.DISTRIBUTION_GRAPH_OPTION_Y);

    // Map histogram types to dialog values
    this.xScale =
      currentXScale === HistogramType.XLOG ? TYPES.LOGARITHMIC : TYPES.LINEAR;
    this.yScale =
      currentYScale === HistogramType.YLOG ? TYPES.LOGARITHMIC : TYPES.LINEAR;
  }

  onCancel(): void {
    this.dialogService.closeDialog();
  }

  onApply(): void {
    const scaleSettings: ScaleSettings = {
      xScale: this.xScale,
      yScale: this.yScale,
    };
    this.dialogService.closeDialog(scaleSettings);
  }
}
