/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { TrackerService } from '../../../../khiops-library/providers/tracker.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { LS } from '@khiops-library/enum/ls';
import { AppService } from '@khiops-visualization/providers/app.service';
import { AppConfig } from '../../../../../environments/environment';
import { visualizationCommonEnvironment } from '../../../../../environments/visualization-common';

// Capture default values before AppConfig mutations can overwrite them
const DEFAULT_NUMBER_PRECISION = visualizationCommonEnvironment.GLOBAL.TO_FIXED;
const DEFAULT_MATRIX_CONTRAST = visualizationCommonEnvironment.GLOBAL.MATRIX_CONTRAST;
const DEFAULT_AUTO_SCALE_FACTOR = visualizationCommonEnvironment.GLOBAL.AUTO_SCALE_THRESHOLD_DEFAULT;

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  standalone: false,
})
export class UserSettingsComponent implements OnChanges {
  @Output() private toggleNavDrawerChanged: EventEmitter<any> =
    new EventEmitter();

  @Input() opened?: boolean;

  public numberPrecision?: number;
  public contrastValue: number =
    AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;
  public autoScaleFactor: number =
    AppConfig.visualizationCommon.GLOBAL.AUTO_SCALE_THRESHOLD_DEFAULT;
  public autoScaleEnabled: boolean = false;
  public autoScaleThresholdMin: number =
    AppConfig.visualizationCommon.GLOBAL.AUTO_SCALE_THRESHOLD_MIN;
  public autoScaleThresholdMax: number =
    AppConfig.visualizationCommon.GLOBAL.AUTO_SCALE_THRESHOLD_MAX;

  constructor(
    private trackerService: TrackerService,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.opened?.currentValue) {
      this.onNavDrawerOpen();
    }
  }

  private onNavDrawerOpen() {
    this.trackerService.trackEvent('page_view', 'settings');

    // Global number precision
    this.numberPrecision = parseInt(
      AppService.Ls.get(LS.SETTING_NUMBER_PRECISION) ||
        DEFAULT_NUMBER_PRECISION.toString(),
      10,
    );

    AppService.Ls.set(LS.SETTING_NUMBER_PRECISION, this.numberPrecision);
    AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

    // Matrix contrast
    this.contrastValue =
      parseInt(AppService.Ls.get(LS.SETTING_MATRIX_CONTRAST), 10) ||
      DEFAULT_MATRIX_CONTRAST;
    AppService.Ls.set(LS.SETTING_MATRIX_CONTRAST, this.contrastValue);
    AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

    // Auto scale factor
    const storedFactor = parseFloat(
      AppService.Ls.get(LS.SETTING_AUTO_SCALE_FACTOR),
    );
    this.autoScaleFactor = !isNaN(storedFactor)
      ? storedFactor
      : DEFAULT_AUTO_SCALE_FACTOR;

    // Whether auto scale mode is currently active
    this.autoScaleEnabled =
      AppService.Ls.get(LS.SETTING_AUTO_SCALE)?.toString() === 'true';
  }

  onClickOnCancel() {
    this.toggleNavDrawerChanged.emit();
  }

  onClickOnSave() {
    // Save all items
    AppService.Ls.set(LS.SETTING_NUMBER_PRECISION, this.numberPrecision);
    if (this.numberPrecision !== undefined) {
      AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;
    }

    AppService.Ls.set(LS.SETTING_MATRIX_CONTRAST, this.contrastValue);
    AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

    AppService.Ls.set(LS.SETTING_AUTO_SCALE_FACTOR, this.autoScaleFactor);

    AppService.Ls.setAll();

    // Notify components to refresh without reloading the view
    this.khiopsLibraryService.settingsChanged$.next();

    // Request auto-save of the file with updated settings
    this.khiopsLibraryService.saveFileRequested$.next();

    // Close the nav drawer without reload
    this.toggleNavDrawerChanged.emit();
  }

  onClickOnResetDefaults() {
    this.numberPrecision = DEFAULT_NUMBER_PRECISION;
    this.contrastValue = DEFAULT_MATRIX_CONTRAST;
    this.autoScaleFactor = DEFAULT_AUTO_SCALE_FACTOR;
  }
}
