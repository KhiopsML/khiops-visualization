import {
	Component,
	ViewEncapsulation,
	ViewChild,
	ElementRef,
	AfterViewInit,
	NgZone,
} from '@angular/core';
import {
	ConfirmDialogComponent
} from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import {
	TranslateService
} from '@ngstack/translate';
import {
	MatDialogRef,
	MatDialog,
	MatDialogConfig
} from '@angular/material/dialog';
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
	selector: 'app-root-covisualization',
	styleUrls: ['./app.component.scss'],
	templateUrl: './app.component.html',
	encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements AfterViewInit {

	appdatas: any;
	isDarkTheme: boolean = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR') === 'dark' ? true : false;

	@ViewChild('appElement', {
		static: false
	}) appElement: ElementRef < HTMLElement > ;

	constructor(
		private ngzone: NgZone,
		private dialogRef: MatDialog,
		private appService: AppService,
		private dialog: MatDialog,
		private khiopsLibraryService: KhiopsLibraryService,
		private configService: ConfigService,
		private translate: TranslateService,
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
			this.configService.getConfig().onThemeChanged(themeColor)
		});
	}

	initCookieConsent() {
		const localAcceptCookies = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'COOKIE_CONSENT');
		if (localAcceptCookies !== null) {
			this.khiopsLibraryService.initMatomo();
			this.khiopsLibraryService.trackEvent('cookie_consent', localAcceptCookies.toString());
			this.khiopsLibraryService.enableMatomo();
			return;
		}
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

		this.ngzone.run(() => {
			dialogRef.afterClosed().toPromise().then((e) => {
				const acceptCookies = e === 'confirm' ? 'true' : 'false';

				localStorage.setItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'COOKIE_CONSENT', acceptCookies);

				this.khiopsLibraryService.initMatomo();
				this.khiopsLibraryService.trackEvent('cookie_consent', acceptCookies);
				if (acceptCookies === 'false') {
					this.khiopsLibraryService.disableMatomo();
				} else {
					this.khiopsLibraryService.enableMatomo();
				}
			});
		});

	}
}
