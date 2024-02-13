import {
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	EventEmitter,
	Output,
} from "@angular/core";
import { AppConfig } from "src/environments/environment";
import { KhiopsLibraryService } from "@khiops-library/providers/khiops-library.service";
import * as _ from "lodash"; // Important to import lodash in karma
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngstack/translate";
import { MatButtonToggleChange } from "@angular/material/button-toggle";

@Component({
	selector: "app-user-settings",
	templateUrl: "./user-settings.component.html",
	styleUrls: ["./user-settings.component.scss"],
})
export class UserSettingsComponent implements OnChanges {
	@Output() toggleNavDrawerChanged: EventEmitter<any> = new EventEmitter();
	@Input() opened: boolean;

	numberPrecision;
	contrastValue: number;
	allowCookies: boolean;
	currentTheme: string =
		localStorage.getItem(
			AppConfig.visualizationCommon.GLOBAL.LS_ID + "THEME_COLOR",
		) || "light";
	initialAllowCookies: boolean;

	constructor(
		private translate: TranslateService,
		private snackBar: MatSnackBar,
		private khiopsLibraryService: KhiopsLibraryService,
	) {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.opened && changes.opened.currentValue) {
			this.onNavDrawerOpen();
		}
	}

	onNavDrawerOpen() {
		this.khiopsLibraryService.trackEvent("page_view", "settings");

		// Global number precision
		this.numberPrecision =
			localStorage.getItem(
				AppConfig.visualizationCommon.GLOBAL.LS_ID +
					"SETTING_NUMBER_PRECISION",
			) || AppConfig.visualizationCommon.GLOBAL.TO_FIXED;
		localStorage.setItem(
			AppConfig.visualizationCommon.GLOBAL.LS_ID +
				"SETTING_NUMBER_PRECISION",
			this.numberPrecision,
		);
		AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

		// Matrix contrast
		this.contrastValue =
			parseInt(
				localStorage.getItem(
					AppConfig.visualizationCommon.GLOBAL.LS_ID +
						"SETTING_MATRIX_CONTRAST",
				),
				10,
			) || AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;
		localStorage.setItem(
			AppConfig.visualizationCommon.GLOBAL.LS_ID +
				"SETTING_MATRIX_CONTRAST",
			this.contrastValue.toString(),
		);
		AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST =
			this.contrastValue;

		// Allow cookies
		this.allowCookies =
			localStorage.getItem(
				AppConfig.visualizationCommon.GLOBAL.LS_ID + "COOKIE_CONSENT",
			) === "true" || false;
		this.initialAllowCookies = _.cloneDeep(this.allowCookies);
	}

	onClickOnCancel() {
		this.toggleNavDrawerChanged.emit();
	}

	onClickOnSave() {
		// Save all items
		localStorage.setItem(
			AppConfig.visualizationCommon.GLOBAL.LS_ID +
				"SETTING_NUMBER_PRECISION",
			this.numberPrecision,
		);
		AppConfig.visualizationCommon.GLOBAL.TO_FIXED = this.numberPrecision;

		localStorage.setItem(
			AppConfig.visualizationCommon.GLOBAL.LS_ID +
				"SETTING_MATRIX_CONTRAST",
			this.contrastValue.toString(),
		);
		AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST =
			this.contrastValue;

		// theme
		localStorage.setItem(
			AppConfig.visualizationCommon.GLOBAL.LS_ID + "THEME_COLOR",
			this.currentTheme,
		);

		// Close the nav drawer
		this.toggleNavDrawerChanged.emit(true);

		localStorage.setItem(
			AppConfig.visualizationCommon.GLOBAL.LS_ID + "COOKIE_CONSENT",
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

		location.reload();
	}

	onClickOnClearDatas() {
		localStorage.clear();
		this.snackBar.open(this.translate.get("SNACKS.DATAS_DELETED"), null, {
			duration: 2000,
			panelClass: "success",
		});
	}

	isThemeChecked(theme: string): boolean {
		return theme === this.currentTheme;
	}

	onThemeChange($event: MatButtonToggleChange) {
		this.currentTheme = $event.value;
	}
}
