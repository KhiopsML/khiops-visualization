import {
	Component,
	OnInit,
	OnDestroy,
	ViewEncapsulation,
} from '@angular/core';
import {
	ConfirmDialogComponent
} from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
// import {
// 	ElectronService
// } from '@khiops-library/providers/electron.service';
import {
	TranslateService
} from '@ngstack/translate';
// import {
// 	AppConfig
// } from 'src/environments/environment';
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
// import {
// 	UtilsService
// } from '@khiops-library/providers/utils.service';

// TODO remove electron
// let storage;
// let os;
// try {
// 	storage = require('electron-json-storage');
// 	os = require('os');
// } catch (e) {
// 	console.warn('Can not access storage', e);
// }


@Component({
	selector: 'app-root-covisualization',
	styleUrls: ['./app.component.scss'],
	templateUrl: './app.component.html',
	encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements OnInit, OnDestroy {

	constructor(
		// private electronService: ElectronService,
		private dialogRef: MatDialog,
		private appService: AppService,
		private dialog: MatDialog,
		private khiopsLibraryService: KhiopsLibraryService,
		private translate: TranslateService) {

		// console.log('AppConfig', AppConfig);

		this.appService.initialize();

		// TODO remove electron
		// if (this.electronService.isElectron()) {
		// 	storage.setDataPath(os.tmpdir() + '/\\' + AppConfig.covisualizationCommon.GLOBAL.LS_ID);
		// 	console.log('user data path', storage.getDataPath());
		// 	// console.log('Mode electron');
		// 	// console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
		// 	// console.log('NodeJS childProcess', this.electronService.childProcess);
		// } else {
		// 	// console.log('Mode web');
		// }
	}

	ngOnInit() {
		// TODO remove electron
		// if (this.electronService.isElectron()) {
		// 	var consent = storage.getSync('COOKIE_CONSENT');
		// 	if (UtilsService.isEmpty(consent)) {
		// 		this.initCookieConsent();
		// 	} else if (consent === 'true') {

		// 		this.khiopsLibraryService.initMatomo();
		// 	}
		// }
	}

	initCookieConsent() {

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
			// TODO remove electron
			// storage.setSync('COOKIE_CONSENT', acceptCookies);

			this.khiopsLibraryService.initMatomo();
			this.khiopsLibraryService.trackEvent('cookie_consent', acceptCookies);
			if (acceptCookies === 'false') {
				this.khiopsLibraryService.disableMatomo();
			} else {
				this.khiopsLibraryService.enableMatomo();
			}
		});

	}

	ngOnDestroy() {}
}
