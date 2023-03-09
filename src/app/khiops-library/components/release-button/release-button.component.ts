import {
	Component,
	Output,
	EventEmitter,
	NgZone,
	OnInit
} from '@angular/core';
import {
	TranslateService
} from '@ngstack/translate';
import {
	KhiopsLibraryService
} from '../../providers/khiops-library.service';

// TODO remove electron
// let ipcRenderer;
// try {
// 	ipcRenderer = require('electron').ipcRenderer;
// } catch (e) {
// 	console.warn('Can not access ipcRenderer', e);
// }

@Component({
	selector: 'kl-release-button',
	templateUrl: './release-button.component.html',
	styleUrls: ['./release-button.component.scss']
})
export class ReleaseButtonComponent implements OnInit {

	btnText: string;
	@Output() isUpdateAvailable: EventEmitter<any> = new EventEmitter();

	progressData = {
		animation: 'fill'
	};

	designData = {
		background: '#374779',
		color: '#FFFFFF',
		successBackground: '#136728',
		errorBackground: '#A81F1F',
		successIconColor: '#ffffff',
		errorIconColor: '#ffffff',
		progressBackground: '#ffffff',
		progressInnerBackground: 'rgba(255, 255, 255,0.3)',
		radius: 50
	};

	updateAvailable = false;
	versionAvailable: any;
	btn: any;

	constructor(public ngzone: NgZone,
		private khiopsLibraryService: KhiopsLibraryService,
		private translate: TranslateService,) { }

	ngOnInit() {

	}

	ngAfterViewInit() {
		// TODO remove electron
		// if (ipcRenderer) {

		// 	ipcRenderer.on('update-available', (event, arg) => {
		// 		console.info('update-available', event, arg);
		// 		this.ngzone.run(() => {
		// 			const version = arg && arg.version;
		// 			// this.btnText = this.translate.get('UPDATE.UPDATE_AVAILABLE') + ' : ' + version;
		// 			this.btnText = this.translate.get('UPDATE.UPDATE_AVAILABLE');
		// 			this.updateAvailable = true;
		// 			this.isUpdateAvailable.emit(this.updateAvailable);
		// 		});
		// 	});
		// 	ipcRenderer.on('update-not-available', (event, arg) => {
		// 		console.info('update-not-available', event, arg);
		// 		this.ngzone.run(() => {
		// 			this.updateAvailable = false;
		// 			this.isUpdateAvailable.emit(this.updateAvailable);
		// 		});
		// 	});
		// 	ipcRenderer.on('update-error', (event, arg) => {
		// 		console.info('update-error', event, arg);
		// 		this.updateAvailable = false;
		// 		this.isUpdateAvailable.emit(this.updateAvailable);
		// 	});
		// 	ipcRenderer.on('download-progress-info', (event, arg) => {
		// 		console.info('download-progress-info', arg && arg.percent);

		// 		if (this.btn) {

		// 			this.ngzone.run(() => {
		// 				this.btn.progressValue = parseInt(arg && arg.percent, 10);
		// 				if (arg.percent === 100) {
		// 					setInterval(() => {
		// 						this.btnText = this.translate.get('UPDATE.DOWNLOAD_COMPLETE');
		// 					}, 200);
		// 					// stop the progress with success status
		// 					const sub = this.btn.progressStop('success').subscribe({
		// 						complete() {
		// 							sub.unsubscribe();
		// 						}
		// 					});
		// 				} else {
		// 					this.btnText = this.translate.get('UPDATE.DOWNLOADING') + ' ... ' + this.btn.progressValue + '%';
		// 				}
		// 			});
		// 		}

		// 	});
		// }
	}

	launchUpdate = (instance) => {
		// this.khiopsLibraryService.trackEvent('click', 'update_software');

		this.btn = instance;
		this.btn.progressInit();
		this.btnText = this.translate.get('UPDATE.WAITING_FOR_DOWNLOAD') + ' ...';

		// TODO remove electron
		// (async () => {
		// 	await ipcRenderer.invoke('launch-update-available');
		// })();
	}

}
