import {
	Component,
	OnInit,
	OnDestroy,
	ViewEncapsulation,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	ElementRef,
	AfterViewInit,
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
import { ConfigModel } from '@khiops-library/model/config.model';
import { ConfigService } from '@khiops-library/providers/config.service';
import { EventsService } from '@khiops-library/providers/events.service';
import { SaveService } from './providers/save.service';
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
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

	@Input() appdatas: any;
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
		// private electronService: ElectronService,
		private dialogRef: MatDialog,
		private appService: AppService,
		private dialog: MatDialog,
		private khiopsLibraryService: KhiopsLibraryService,
		private configService: ConfigService,
		private translate: TranslateService,
		private eventsService: EventsService,
		private saveService: SaveService,
		private element: ElementRef) {

		// console.log('AppConfig', AppConfig);

		this.appService.initialize();

		this.eventsService.clickOpenFile.subscribe(() => this.onFileOpen.emit());
		this.eventsService.customEvent.subscribe((eventName) => this.customEvent.emit(eventName));

		this.element.nativeElement.save = () => this.saveService.constructDatasToSave();

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
