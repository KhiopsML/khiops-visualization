import {
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	EventEmitter,
	Output
} from '@angular/core';
import {
	AppConfig
} from 'src/environments/environment';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import {
	MatSnackBar
} from '@angular/material/snack-bar';
import {
	TranslateService
} from '@ngstack/translate';

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnChanges {
	@Output() toggleNavDrawerChanged: EventEmitter < any > = new EventEmitter();
	@Input() opened: boolean;

	numberPrecisionExample;
	numberPrecision;
	liftCurveSmooth: number;
	fontSize: any;
	contrastValue: number;
	allowCookies: boolean;
	allowDarkTheme: boolean;
	initialAllowCookies: boolean;

	constructor(private translate: TranslateService,
		private snackBar: MatSnackBar,
		private khiopsLibraryService: KhiopsLibraryService) {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.opened && changes.opened.currentValue) {
			this.onNavDrawerOpen();
		}
	}

	onNavDrawerOpen() {

		this.khiopsLibraryService.trackEvent('page_view', 'settings');

		// Global number precision
		this.numberPrecision = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_NUMBER_PRECISION') || AppConfig.visualizationCommon.GLOBAL.TO_FIXED;
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_NUMBER_PRECISION', this.numberPrecision);
		AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

		// Matrix contrast
		this.contrastValue = parseInt(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST'), 10) || AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST', this.contrastValue.toString());
		AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

		// Allow cookies
		this.allowCookies = (localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'COOKIE_CONSENT') === 'true') || false;
		this.initialAllowCookies = _.cloneDeep(this.allowCookies);

		// theme
		this.allowDarkTheme = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR') === 'dark' ? true : false;
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR', this.allowDarkTheme ? 'dark' : 'light');

	}

	onClickOnCancel() {
		this.toggleNavDrawerChanged.emit();
	}

	onClickOnSave() {
		// Save all items
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_NUMBER_PRECISION', this.numberPrecision);
		AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE', this.fontSize);
		AppConfig.visualizationCommon.GLOBAL.FONT_SIZE = this.fontSize;

		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST', this.contrastValue.toString());
		AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR', this.allowDarkTheme ? 'dark' : 'light');

		// Close the nav drawer
		this.toggleNavDrawerChanged.emit(true);

		// this.khiopsLibraryService.trackEvent('click', 'settings', 'significant_number', this.numberPrecision);
		// this.khiopsLibraryService.trackEvent('click', 'settings', 'matrix_contrast', this.contrastValue);

		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'COOKIE_CONSENT', this.allowCookies.toString());

		if (this.initialAllowCookies !== this.allowCookies) {
			if (this.allowCookies === true) {
				// init matomo
				this.khiopsLibraryService.initMatomo();
				this.khiopsLibraryService.enableMatomo();
			} else {
				this.khiopsLibraryService.disableMatomo();
			}
		}

		location.reload()

	}

	onClickOnClearDatas() {
		localStorage.clear();
		this.snackBar.open(this.translate.get('SNACKS.DATAS_DELETED'), null, {
			duration: 2000,
			panelClass: 'success'
		});
	}
}
