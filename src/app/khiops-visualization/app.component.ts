import {
	Component,
	ViewEncapsulation,
	ViewChild,
	ElementRef,
	AfterViewInit,
	NgZone,
} from '@angular/core';
import {
	TranslateService
} from '@ngstack/translate';
import {
	MatDialogRef,
	MatDialog,
	MatDialogConfig
} from '@angular/material/dialog';
import {
	ConfirmDialogComponent
} from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	AppService
} from './providers/app.service';
import {
	ConfigService
} from '@khiops-library/providers/config.service';
import {
	SaveService
} from './providers/save.service';
import {
	AppConfig
} from 'src/environments/environment';

@Component({
	selector: 'app-root-visualization',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements AfterViewInit {

	appdatas: any;

	@ViewChild('appElement', {
		static: false
	}) appElement: ElementRef < HTMLElement > ;

	isDarkTheme: boolean = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR') === 'dark' ? true : false;

	constructor(
		private dialogRef: MatDialog,
		private ngzone: NgZone,
		private dialog: MatDialog,
		private appService: AppService,
		private khiopsLibraryService: KhiopsLibraryService,
		private translate: TranslateService,
		private configService: ConfigService,
		private saveService: SaveService,
		private element: ElementRef) {

		this.appService.initialize();

	}

	ngAfterViewInit(): void {
		this.configService.setRootElement(this.appElement);
		this.element.nativeElement.getDatas = () => this.saveService.constructDatasToSave();
		this.element.nativeElement.setDatas = (datas) => {
			// Set data into ngzone to detect change into another context (electron for instance)
			this.ngzone.run(() => {
				this.appdatas = {
					...datas
				}
			});
		};
		this.element.nativeElement.setConfig = (config) => {
			this.configService.setConfig(config);
		};
		this.element.nativeElement.clean = () => this.appdatas = null;
		this.initCookieConsent();
		this.setTheme();
	}

	setTheme() {
		setTimeout(() => {
			let themeColor =
				localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + "THEME_COLOR") ||
				"light";
			document.documentElement.setAttribute(
				"data-color-scheme",
				themeColor
			);
			this.configService.getConfig().onThemeChanged && this.configService.getConfig().onThemeChanged(themeColor)
		});
	}

	initCookieConsent() {
		const localAcceptCookies = localStorage.getItem('COOKIE_CONSENT_VISU');
		if (localAcceptCookies !== null) {
			this.khiopsLibraryService.initMatomo();
			this.khiopsLibraryService.trackEvent('cookie_consent', localAcceptCookies.toString());
			this.khiopsLibraryService.enableMatomo();
			return;
		}

		console.log(localAcceptCookies);
		this.dialogRef.closeAll();
		const config = new MatDialogConfig();
		config.width = '400px';
		config.hasBackdrop = false;
		config.disableClose = false;

		const dialogRef: MatDialogRef < ConfirmDialogComponent > = this.dialog.open(ConfirmDialogComponent, config);
		dialogRef.updatePosition({
			bottom: '50px',
			right: '50px'
		});
		dialogRef.componentInstance.message = this.translate.get('COOKIE_CONSENT.MESSAGE');
		dialogRef.componentInstance.displayRejectBtn = true;
		dialogRef.componentInstance.displayCancelBtn = false;
		dialogRef.componentInstance.confirmTranslation = this.translate.get('COOKIE_CONSENT.ALLOW');

		dialogRef.afterClosed().toPromise().then((e) => {
			const acceptCookies = e === 'confirm' ? 'true' : 'false';

			localStorage.setItem('COOKIE_CONSENT_VISU', acceptCookies);

			this.khiopsLibraryService.initMatomo();
			this.khiopsLibraryService.trackEvent('cookie_consent', acceptCookies);
			if (acceptCookies === 'false') {
				this.khiopsLibraryService.disableMatomo();
			} else {
				this.khiopsLibraryService.enableMatomo();
			}
		});

	}
}
