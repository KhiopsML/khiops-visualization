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
import { AppService } from '@khiops-covisualization/providers/app.service';

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
	defaultHierarchy: number;
	contrastValue: number;
	initialAllowCookies: boolean;
	allowDarkTheme: boolean;

	constructor(private khiopsLibraryService: KhiopsLibraryService, private appService: AppService) {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.opened && changes.opened.currentValue) {
			this.onNavDrawerOpen();
		}
	}

	onNavDrawerOpen() {

		this.khiopsLibraryService.trackEvent('page_view', 'settings');

		// defaultHierarchy
		this.defaultHierarchy = parseInt(localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'DEFAULT_LIMIT_HIERARCHY'), 10) || AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.TECHNICAL_LIMIT;
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'DEFAULT_LIMIT_HIERARCHY', this.defaultHierarchy.toString());
		AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.TECHNICAL_LIMIT = this.defaultHierarchy;

		// Font size
		this.fontSize = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE') || AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE;
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE', this.fontSize);
		AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE = this.fontSize;

		// Matrix contrast
		this.contrastValue = parseInt(localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST'), 10) || AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST;
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST', this.contrastValue.toString());
		AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

		// Allow cookies
		this.allowCookies = (localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'COOKIE_CONSENT') === 'true') || false;
		this.initialAllowCookies = _.cloneDeep(this.allowCookies);

		// theme
		this.allowDarkTheme = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR') === 'dark' ? true : false;
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR', this.allowDarkTheme ? 'dark' : 'light');

	}

	onClickOnCancel() {
		// reset font_size on cancel
		const previousFontSize = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE');
		this.onFontSizeChanged({
			value: previousFontSize
		});
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE', previousFontSize);
		AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE = parseInt(previousFontSize, 10);
		this.appService.setFontSize(AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE );

		this.toggleNavDrawerChanged.emit();
	}

	onClickOnSave() {
		// Save all items
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE', this.fontSize);
		AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE = this.fontSize;
		this.appService.setFontSize(this.fontSize);

		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST', this.contrastValue.toString());
		AppConfig.covisualizationCommon.GLOBAL.MATRIX_CONTRAST = this.contrastValue;

		// TODO remove electron
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'COOKIE_CONSENT', this.allowCookies.toString());

		if (this.initialAllowCookies !== this.allowCookies) {
			if (this.allowCookies === true) {
				// init matomo
				this.khiopsLibraryService.initMatomo();
				this.khiopsLibraryService.enableMatomo();
			} else {
				this.khiopsLibraryService.disableMatomo();
			}
		}

		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR', this.allowDarkTheme ? 'dark' : 'light');

		location.reload()

		// this.khiopsLibraryService.trackEvent('click', 'settings', 'significant_number', this.numberPrecision);
		// this.khiopsLibraryService.trackEvent('click', 'settings', 'matrix_contrast', this.contrastValue);
	}

	onFontSizeChanged(event) {
		// AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE = event.value;
		this.fontSize = event.value;
		this.appService.setFontSize(this.fontSize);
		// document.body.classList.remove('font-10', 'font-11', 'font-12', 'font-13', 'font-14', 'font-15', 'font-16', 'font-17', 'font-18');
		// document.body.classList.add('font-' + event.value);
	}

	onDefaultHierarchyChanged(event) {
		this.defaultHierarchy = event.value;
		localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'DEFAULT_LIMIT_HIERARCHY', this.defaultHierarchy.toString());
	}


}
