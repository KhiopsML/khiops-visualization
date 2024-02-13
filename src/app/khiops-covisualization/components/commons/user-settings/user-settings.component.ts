import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { AppConfig } from 'src/environments/environment';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppService } from '@khiops-covisualization/providers/app.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnChanges {
  @Output() toggleNavDrawerChanged: EventEmitter<any> = new EventEmitter();
  @Input() opened: boolean;

  allowCookies: boolean;
  contrastValue: number;
  initialAllowCookies: boolean;
  currentTheme: string =
    localStorage.getItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR',
    ) || 'light';

  constructor(
    private khiopsLibraryService: KhiopsLibraryService,
    private appService: AppService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.opened && changes.opened.currentValue) {
      this.onNavDrawerOpen();
    }
  }

  onNavDrawerOpen() {
    this.khiopsLibraryService.trackEvent('page_view', 'settings');

    // Matrix contrast
    this.contrastValue =
      parseInt(
        localStorage.getItem(
          AppConfig.covisualizationCommon.GLOBAL.LS_ID +
            'SETTING_MATRIX_CONTRAST',
        ),
        10,
      ) || AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST;
    localStorage.setItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST',
      this.contrastValue.toString(),
    );
    AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

    // Allow cookies
    this.allowCookies =
      localStorage.getItem(
        AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'COOKIE_CONSENT',
      ) === 'true' || false;
    this.initialAllowCookies = _.cloneDeep(this.allowCookies);
  }

  onClickOnCancel() {
    this.toggleNavDrawerChanged.emit();
  }

  onClickOnSave() {
    // Save all items
    localStorage.setItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST',
      this.contrastValue.toString(),
    );
    AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

    localStorage.setItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'COOKIE_CONSENT',
      this.allowCookies.toString(),
    );

    if (this.initialAllowCookies !== this.allowCookies) {
      if (this.allowCookies === true) {
        // init matomo
        this.khiopsLibraryService.initMatomo();
        this.khiopsLibraryService.enableMatomo();
      } else {
        this.khiopsLibraryService.disableMatomo();
      }
    }

    // theme
    localStorage.setItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR',
      this.currentTheme,
    );
    location.reload();

    // this.khiopsLibraryService.trackEvent('click', 'settings', 'significant_number', this.numberPrecision);
    // this.khiopsLibraryService.trackEvent('click', 'settings', 'matrix_contrast', this.contrastValue);
  }

  isThemeChecked(theme: string): boolean {
    return theme === this.currentTheme;
  }

  onThemeChange($event: MatButtonToggleChange) {
    this.currentTheme = $event.value;
  }
}
