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
	@Output() toggleNavDrawerChanged: EventEmitter < any > = new EventEmitter();
	@Input() opened: boolean;

	allowCookies: boolean;
	fontSize: any;
	contrastValue: number;
	initialAllowCookies: boolean;

	constructor(private khiopsLibraryService: KhiopsLibraryService) {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.opened && changes.opened.currentValue) {
			this.onNavDrawerOpen();
		}
	}

	onNavDrawerOpen() {

		this.khiopsLibraryService.trackEvent('page_view', 'settings');

		// Font size
		this.fontSize = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE') || AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE;
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE', this.fontSize);
		AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE = this.fontSize;

		// Matrix contrast
		this.contrastValue = parseInt(localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST'), 10) || AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST;
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST', this.contrastValue.toString());
		AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

		// Allow cookies
		// TODO remove electron
		// this.allowCookies = (storage.getSync('COOKIE_CONSENT') === 'true') || false;
		this.initialAllowCookies = _.cloneDeep(this.allowCookies);
	}

	onClickOnCancel() {
		// reset font_size on cancel
		const previousFontSize = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE');
		this.onFontSizeChanged({
			value: previousFontSize
		});
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE', previousFontSize);
		AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE = parseInt(previousFontSize, 10);

		this.toggleNavDrawerChanged.emit();
	}

	onClickOnSave() {
		// Save all items
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE', this.fontSize);
		AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE = this.fontSize;

		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST', this.contrastValue.toString());
		AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

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

		// Close the nav drawer
		this.toggleNavDrawerChanged.emit(true);

		// this.khiopsLibraryService.trackEvent('click', 'settings', 'significant_number', this.numberPrecision);
		// this.khiopsLibraryService.trackEvent('click', 'settings', 'matrix_contrast', this.contrastValue);
	}

	onFontSizeChanged(event) {
		this.fontSize = event.value;
		document.body.classList.remove('font-10', 'font-11', 'font-12', 'font-13', 'font-14', 'font-15', 'font-16', 'font-17', 'font-18');
		document.body.classList.add('font-' + event.value);
	}


}
