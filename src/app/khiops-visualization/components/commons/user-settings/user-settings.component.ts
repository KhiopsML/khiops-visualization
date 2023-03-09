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

// TODO remove electron
// let storage;
// try {
// 	storage = require('electron-json-storage');
// } catch (e) {
// 	console.warn('Can not access storage', e);
// }

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnChanges {
	@Output() toggleNavDrawerChanged: EventEmitter<any> = new EventEmitter();
	@Input() opened: boolean;

	numberPrecisionExample;
	numberPrecision;
	liftCurveSmooth: number;
	// liftCurveSmoothExample: string;
	fontSize: any;
	contrastValue: number;
	allowCookies: boolean;
	initialAllowCookies: boolean;

	constructor(private translate: TranslateService,
		private snackBar: MatSnackBar,
		private khiopsLibraryService: KhiopsLibraryService) { }

	ngOnChanges(changes: SimpleChanges) {
		if (changes.opened && changes.opened.currentValue) {
			this.onNavDrawerOpen();
		}
	}

	onNavDrawerOpen() {

		this.khiopsLibraryService.trackEvent('page_view', 'settings');

		// Font size
		// this.fontSize = localStorage.getItem(AppConfig.common.GLOBAL.LS_ID + 'FONT_SIZE') || AppConfig.common.GLOBAL.FONT_SIZE;
		// localStorage.setItem(AppConfig.common.GLOBAL.LS_ID + 'FONT_SIZE', this.fontSize);
		// AppConfig.common.GLOBAL.FONT_SIZE = this.fontSize;

		// Global number precision
		this.numberPrecision = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_NUMBER_PRECISION') || AppConfig.visualizationCommon.GLOBAL.TO_FIXED;
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_NUMBER_PRECISION', this.numberPrecision);
		AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

		// Matrix contrast
		this.contrastValue = parseInt(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST'), 10) || AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST', this.contrastValue.toString());
		AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

		// Curve lift smooth datas
		// this.liftCurveSmooth = parseInt(localStorage.getItem(AppConfig.common.GLOBAL.LS_ID + 'LIFT_CURVE_SMOOTH'), 10) || AppConfig.common.LIFT_CURVE.LIFT_CURVE_SMOOTH;
		// localStorage.setItem(AppConfig.common.GLOBAL.LS_ID + 'LIFT_CURVE_SMOOTH', this.liftCurveSmooth.toString());
		// AppConfig.common.LIFT_CURVE.LIFT_CURVE_SMOOTH = this.liftCurveSmooth;
		// this.liftCurveSmoothExample = this.translate.get('SETTINGS.ONE_DATA_OUT_OF', {
		// 	count: this.liftCurveSmooth.toString()
		// });

		// Allow cookies
		// TODO remove electron
		// this.allowCookies = (storage.getSync('COOKIE_CONSENT') === 'true') || false;
		this.initialAllowCookies = _.cloneDeep(this.allowCookies);

	}

	onClickOnCancel() {
		// reset font_size on cancel
		// const previousFontSize = localStorage.getItem(AppConfig.common.GLOBAL.LS_ID + 'FONT_SIZE');
		// this.onFontSizeChanged({
		// 	value: previousFontSize
		// });
		// localStorage.setItem(AppConfig.common.GLOBAL.LS_ID + 'FONT_SIZE', previousFontSize);
		// AppConfig.common.GLOBAL.FONT_SIZE = parseInt(previousFontSize, 10);

		this.toggleNavDrawerChanged.emit();
	}

	onClickOnSave() {
		// Save all items
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_NUMBER_PRECISION', this.numberPrecision);
		AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

		// localStorage.setItem(AppConfig.common.GLOBAL.LS_ID + 'LIFT_CURVE_SMOOTH', this.liftCurveSmooth.toString());
		// AppConfig.common.LIFT_CURVE.LIFT_CURVE_SMOOTH = this.liftCurveSmooth;

		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE', this.fontSize);
		AppConfig.visualizationCommon.GLOBAL.FONT_SIZE = this.fontSize;

		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST', this.contrastValue.toString());
		AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

		// Close the nav drawer
		this.toggleNavDrawerChanged.emit(true);

		// this.khiopsLibraryService.trackEvent('click', 'settings', 'significant_number', this.numberPrecision);
		// this.khiopsLibraryService.trackEvent('click', 'settings', 'matrix_contrast', this.contrastValue);

		// TODO remove electron
		// storage.setSync('COOKIE_CONSENT', this.allowCookies.toString());

		if (this.initialAllowCookies !== this.allowCookies) {
			if (this.allowCookies === true) {
				// init matomo
				this.khiopsLibraryService.initMatomo();
				this.khiopsLibraryService.enableMatomo();
			} else {
				this.khiopsLibraryService.disableMatomo();
			}
		}

	}

	onFontSizeChanged(event) {
		// this.fontSize = event.value;
		// document.body.classList.remove('font-10', 'font-11', 'font-12', 'font-13', 'font-14', 'font-15', 'font-16', 'font-17', 'font-18');
		// document.body.classList.add('font-' + event.value);
	}

	onClickOnClearDatas() {
		localStorage.clear();
		this.snackBar.open(this.translate.get('SNACKS.DATAS_DELETED'), null, {
			duration: 2000,
			panelClass: 'success'
		});
	}

	// onLiftCurveSmoothChanged(event) {
	// 	this.liftCurveSmooth = event.value;
	// 	this.liftCurveSmoothExample = this.translate.get('SETTINGS.ONE_DATA_OUT_OF', {
	// 		count: this.liftCurveSmooth.toString()
	// 	});
	// }

}
