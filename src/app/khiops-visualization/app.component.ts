import { ConfigModel } from './../khiops-library/model/config.model';
import { EventsService } from '@khiops-library/providers/events.service';
import {
	Component,
	OnInit,
	OnDestroy,
	Input,
	Output,
	EventEmitter,
	ViewEncapsulation,
	ViewChild,
	ElementRef,
	AfterViewInit,
} from '@angular/core';
// import {
// 	ElectronService
// } from '@khiops-library/providers/electron.service';
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
// import {
// 	AppConfig
// } from 'src/environments/environment';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	AppService
} from './providers/app.service';
import { ConfigService } from '@khiops-library/providers/config.service';
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
	selector: 'app-root-visualization',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

	private _appdatas: any;

	@Input()
	public get appdatas(): any {
		return this._appdatas;
	}
	public set appdatas(value: any) {
		console.log(value);
		this._appdatas = value;
	}

	@Input()
	public get config(): ConfigModel {
		return this.configService.config;
	}
	public set config(value: ConfigModel) {
		this.configService.config = value;
	}

	@Output('onFileOpen') onFileOpen: EventEmitter<any> = new EventEmitter<any>();
	@Output('onCustomEvent') customEvent: EventEmitter<string> = new EventEmitter();

	@ViewChild('appElement', { static: false }) appElement: ElementRef<HTMLElement>;

	constructor(
		private dialogRef: MatDialog,
		private dialog: MatDialog,
		private appService: AppService,
		private khiopsLibraryService: KhiopsLibraryService,
		// private electronService: ElectronService,
		private translate: TranslateService,
		private configService: ConfigService,
		private eventsService: EventsService) {
		// console.log('AppConfig', AppConfig);
		this.appService.initialize();

		this.eventsService.clickOpenFile.subscribe(() => this.onFileOpen.emit());
		this.eventsService.customEvent.subscribe((eventName) => this.customEvent.emit(eventName));

		// TODO remove electron
		// if (this.electronService.isElectron()) {
		// 	storage.setDataPath(os.tmpdir() + '/\\' + AppConfig.visualizationCommon.GLOBAL.LS_ID);
		// 	console.log('user data path', storage.getDataPath());
		// 	// console.log('Mode electron');
		// 	// console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
		// 	// console.log('NodeJS childProcess', this.electronService.childProcess);
		// } else {
		// 	// console.log('Mode web');
		// }
	}

	ngAfterViewInit(): void {
		this.configService.setRootElement(this.appElement);
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
