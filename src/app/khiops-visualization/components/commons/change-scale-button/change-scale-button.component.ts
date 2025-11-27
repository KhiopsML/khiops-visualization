/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import {
  ChangeScaleDialogComponent,
  ScaleSettings,
} from '../change-scale-dialog/change-scale-dialog.component';
import { LS } from '@khiops-library/enum/ls';
import { HistogramType } from '../histogram/histogram.type';
import { AppService } from '@khiops-visualization/providers/app.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { ScaleChangeEventsService } from '@khiops-visualization/providers/scale-change-events.service';
import { DialogService } from '@khiops-library/providers/dialog.service';

@Component({
  selector: 'app-change-scale-button',
  templateUrl: './change-scale-button.component.html',
  styleUrls: ['./change-scale-button.component.scss'],
  standalone: false,
})
export class ChangeScaleButtonComponent {
  constructor(
    private dialogService: DialogService,
    private distributionDatasService: DistributionDatasService,
    private scaleChangeEventsService: ScaleChangeEventsService,
  ) {}

  openChangeScaleDialog() {
    const dialogRef = this.dialogService.openDialog(
      ChangeScaleDialogComponent,
      {
        width: '400px',
        height: 'auto',
      },
    );

    dialogRef.afterClosed().subscribe((result: ScaleSettings | undefined) => {
      if (result) {
        // Apply the scale settings to all variable graphs
        this.applyScaleSettings(result);
      }
    });
  }

  private applyScaleSettings(scaleSettings: ScaleSettings) {
    // Map the scale settings to HistogramType values
    const xScaleType =
      scaleSettings.xScale === 'linear'
        ? HistogramType.XLIN
        : HistogramType.XLOG;
    const yScaleType =
      scaleSettings.yScale === 'linear'
        ? HistogramType.YLIN
        : HistogramType.YLOG;

    // Update global scale settings in Local Storage
    AppService.Ls.set(LS.DISTRIBUTION_GRAPH_OPTION_X, xScaleType);
    AppService.Ls.set(LS.DISTRIBUTION_GRAPH_OPTION_Y, yScaleType);

    // Update graph options to trigger ngOnChanges detection
    this.distributionDatasService.updateGraphOptions();

    // Emit scale change event to notify all listening components
    this.scaleChangeEventsService.emitScaleChange({
      xScale: xScaleType,
      yScale: yScaleType,
    });
  }
}
