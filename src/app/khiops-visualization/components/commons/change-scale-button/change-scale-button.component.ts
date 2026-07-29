/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, inject } from '@angular/core';
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
import { VariableScaleSettingsService } from '@khiops-visualization/providers/variable-scale-settings.service';
import { FlexModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngstack/translate';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-change-scale-button',
  templateUrl: './change-scale-button.component.html',
  styleUrls: ['./change-scale-button.component.scss'],
  imports: [
    FlexModule,
    TranslateModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class ChangeScaleButtonComponent {
  private readonly dialogService = inject(DialogService);
  private readonly distributionDatasService = inject(DistributionDatasService);
  private readonly scaleChangeEventsService = inject(ScaleChangeEventsService);
  private readonly variableScaleSettingsService = inject(
    VariableScaleSettingsService,
  );

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
    if (scaleSettings.mode === 'auto') {
      // Enable auto scale mode globally
      AppService.Ls.set(LS.SETTING_AUTO_SCALE, true);

      // Clear all per-variable scale overrides so auto-scale takes effect
      this.variableScaleSettingsService.clearAllVariableScaleSettings();

      // Clear global manual scale values so restoreVariableScaleSettings()
      // in distribution-graph doesn't override auto-scale computed values
      AppService.Ls.del(LS.DISTRIBUTION_GRAPH_OPTION_X);
      AppService.Ls.del(LS.DISTRIBUTION_GRAPH_OPTION_Y);

      // Reset graph options so auto-scale detection runs on next data fetch
      this.distributionDatasService.updateGraphOptions();

      // Notify all listening components to re-render
      this.scaleChangeEventsService.emitScaleChange({
        xScale: 'auto',
        yScale: 'auto',
      });
    } else {
      // Disable auto scale, apply manual X/Y settings
      AppService.Ls.set(LS.SETTING_AUTO_SCALE, false);

      // Clear all per-variable scale overrides so manual global settings apply uniformly
      this.variableScaleSettingsService.clearAllVariableScaleSettings();

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
}
