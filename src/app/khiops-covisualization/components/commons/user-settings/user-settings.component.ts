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
import { AppConfig } from 'src/environments/environment';
import * as _ from 'lodash'; // Important to import lodash in karma
import { TrackerService } from '../../../../khiops-library/providers/tracker.service';
import { LS } from '@khiops-library/enum/ls';
import { AppService } from '@khiops-covisualization/providers/app.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  standalone: false,
})
export class UserSettingsComponent implements OnChanges {
  @Output() private toggleNavDrawerChanged: EventEmitter<any> =
    new EventEmitter();
  @Input() opened: boolean = false;

  public allowCookies: boolean = false;
  public contrastValue: number =
    AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST;

  constructor(private trackerService: TrackerService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.opened?.currentValue) {
      this.onNavDrawerOpen();
    }
  }

  private onNavDrawerOpen() {
    this.trackerService.trackEvent('page_view', 'settings');

    // Matrix contrast
    this.contrastValue =
      parseInt(AppService.Ls.get(LS.SETTING_MATRIX_CONTRAST), 10) ||
      AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST;
    AppService.Ls.set(LS.SETTING_MATRIX_CONTRAST, this.contrastValue);
    AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

    // Allow cookies
    this.allowCookies =
      AppService.Ls.get(LS.COOKIE_CONSENT).toString() === 'true' || false;
  }

  onClickOnCancel() {
    this.toggleNavDrawerChanged.emit();
  }

  onClickOnSave() {
    // Save all items
    AppService.Ls.set(LS.SETTING_MATRIX_CONTRAST, this.contrastValue);
    AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

    AppService.Ls.set(LS.COOKIE_CONSENT, this.allowCookies);

    AppService.Ls.setAll();

    // this.trackerService.trackEvent('click', 'settings', 'significant_number', this.numberPrecision);
    // this.trackerService.trackEvent('click', 'settings', 'matrix_contrast', this.contrastValue);
  }
}
