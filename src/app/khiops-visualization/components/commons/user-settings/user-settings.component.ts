/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
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
import * as _ from 'lodash'; // Important to import lodash in karma
import { TrackerService } from '../../../../khiops-library/providers/tracker.service';
import { LS } from '@khiops-library/enum/ls';
import { AppService } from '@khiops-visualization/providers/app.service';
import { AppConfig } from '../../../../../environments/environment';

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
  public allowCookies?: boolean;
  public persistScaleOptions?: boolean;

  constructor(private trackerService: TrackerService) {}

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
        AppConfig.visualizationCommon.GLOBAL.TO_FIXED.toString(),
      10,
    );

    AppService.Ls.set(LS.SETTING_NUMBER_PRECISION, this.numberPrecision);
    AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

    // Matrix contrast
    this.contrastValue =
      parseInt(AppService.Ls.get(LS.SETTING_MATRIX_CONTRAST), 10) ||
      AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;
    AppService.Ls.set(LS.SETTING_MATRIX_CONTRAST, this.contrastValue);
    AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

    // Allow cookies
    this.allowCookies =
      AppService.Ls.get(LS.COOKIE_CONSENT).toString() === 'true' || false;

    // Persist scale options
    this.persistScaleOptions =
      AppService.Ls.get(LS.SETTING_PERSIST_SCALE_OPTIONS).toString() ===
        'true' || false;
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

    AppService.Ls.set(LS.COOKIE_CONSENT, this.allowCookies);

    AppService.Ls.set(
      LS.SETTING_PERSIST_SCALE_OPTIONS,
      this.persistScaleOptions,
    );

    AppService.Ls.setAll();

    // Close the nav drawer
    this.toggleNavDrawerChanged.emit(true);
  }
}
