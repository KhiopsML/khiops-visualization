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
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { TrackerService } from '../../../../khiops-library/providers/tracker.service';
import { LS } from '@khiops-library/enum/ls';
import { AppService } from '@khiops-visualization/providers/app.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnChanges {
  @Output() toggleNavDrawerChanged: EventEmitter<any> = new EventEmitter();
  @Input() opened: boolean;

  numberPrecision: number;
  contrastValue: number;
  allowCookies: boolean;
  currentTheme: string;

  constructor(
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private trackerService: TrackerService,
  ) {
    this.currentTheme = AppService.Ls.get(LS.THEME_COLOR, 'light');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.opened?.currentValue) {
      this.onNavDrawerOpen();
    }
  }

  onNavDrawerOpen() {
    this.trackerService.trackEvent('page_view', 'settings');

    // Global number precision
    this.numberPrecision = parseInt(
      AppService.Ls.get(LS.SETTING_NUMBER_PRECISION) ||
        AppConfig.visualizationCommon.GLOBAL.TO_FIXED.toString(),
      10,
    );

    AppService.Ls.set(
      LS.SETTING_NUMBER_PRECISION,
      this.numberPrecision.toString(),
    );
    AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

    // Matrix contrast
    this.contrastValue =
      parseInt(AppService.Ls.get(LS.SETTING_MATRIX_CONTRAST), 10) ||
      AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;
    AppService.Ls.set(
      LS.SETTING_MATRIX_CONTRAST,
      this.contrastValue.toString(),
    );
    AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

    // Allow cookies
    this.allowCookies =
      AppService.Ls.get(LS.COOKIE_CONSENT) === 'true' || false;
  }

  onClickOnCancel() {
    this.toggleNavDrawerChanged.emit();
  }

  onClickOnSave() {
    // Save all items
    AppService.Ls.set(
      LS.SETTING_NUMBER_PRECISION,
      this.numberPrecision.toString(),
    );
    AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

    AppService.Ls.set(
      LS.SETTING_MATRIX_CONTRAST,
      this.contrastValue.toString(),
    );
    AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

    // theme
    AppService.Ls.set(LS.THEME_COLOR, this.currentTheme);

    // Close the nav drawer
    this.toggleNavDrawerChanged.emit(true);

    AppService.Ls.set(LS.COOKIE_CONSENT, this.allowCookies.toString());

    setTimeout(() => {
      // Wait for drawer close before reload
      location.reload();
    }, 200);
  }

  onClickOnClearDatas() {
    localStorage.clear();
    this.snackBar.open(this.translate.get('SNACKS.DATAS_DELETED'), undefined, {
      duration: 2000,
      panelClass: 'success',
    });
  }

  isThemeChecked(theme: string): boolean {
    return theme === this.currentTheme;
  }

  onThemeChange($event: MatButtonToggleChange) {
    this.currentTheme = $event.value;
  }
}
