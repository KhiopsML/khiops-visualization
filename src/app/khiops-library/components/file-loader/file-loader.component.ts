import {
	Component,
	OnInit,
	NgZone,
	Input
} from '@angular/core';
import {
	FileLoaderService
} from './file-loader.service';
import {
	MatSnackBar
} from '@angular/material/snack-bar';
import {
	TranslateService
} from '@ngstack/translate';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';

@Component({
	selector: 'kl-file-loader',
	templateUrl: './file-loader.component.html',
	styleUrls: ['./file-loader.component.scss']
})

export class FileLoaderComponent implements OnInit {

	@Input() applicationName: string;
	@Input() onFileLoaderDataChanged: Function;
	fileLoaderDatas: any;
	isProdMode = false;

	constructor(private ngzone: NgZone,
		private fileLoaderService: FileLoaderService,
		private khiopsLibraryService: KhiopsLibraryService,
		private snackBar: MatSnackBar,
		public translate: TranslateService) {

		this.fileLoaderDatas = this.fileLoaderService.getDatas();
		this.isProdMode = this.khiopsLibraryService.getAppConfig().production;
	}

	ngOnInit() {

	}

	loadDebugFile() {

		this.onFileLoaderDataChanged(undefined);

		this.ngzone.run(
			() => {
				this.fileLoaderService.debugReadDatas().then(datas => {
					this.onFileLoaderDataChanged(datas);
				}).catch(error => {
					console.warn(this.translate.get('SNACKS.OPEN_FILE_ERROR'), error);
				});
			}
		);
	}

	loadWebFile(file?: string) {

		this.onFileLoaderDataChanged(undefined);

		this.ngzone.run(
			() => {
				this.fileLoaderService.readWebFile(file).then(datas => {
					this.onFileLoaderDataChanged(datas);
				}).catch(error => {
					console.warn(this.translate.get('SNACKS.OPEN_FILE_ERROR'), error);
				});
			}
		);
	}

	openFileDialog() {

		// this.khiopsLibraryService.trackEvent('click', 'open_file');

		// TODO remove electron
		// let dialog: any;
		// try {
		// 	dialog = require('@electron/remote').dialog;
		// } catch (e) {
		// 	console.warn('Can not access Electron on browser', e);
		// }
		// const associationFiles = ['json'];
		// if (this.applicationName === 'khiops-visualization') {
		// 	associationFiles.push('khj');
		// } else {
		// 	associationFiles.push('khcj');
		// }

		// dialog.showOpenDialog(null, {
		// 	properties: ['openFile'],
		// 	filters: [{
		// 		name: this.translate.get('GLOBAL.FILES'),
		// 		extensions: associationFiles
		// 	}]
		// }).then(result => {
		// 	if (result && !result.canceled && result.filePaths) {
		// 		this.openFile(result.filePaths[0]);
		// 		return;
		// 	}
		// }).catch(err => {
		// 	console.log(err);
		// });
	}

	openFile(filename) {

		this.onFileLoaderDataChanged(undefined);

		if (filename) {
			this.ngzone.run(
				() => {
					this.fileLoaderService.readFile(filename).then(datas => {
						this.fileLoaderService.setFileHistory(this.applicationName, filename);
						this.onFileLoaderDataChanged(datas);
					}).catch(error => {
						console.warn(this.translate.get('SNACKS.OPEN_FILE_ERROR'), error);
						this.snackBar.open(this.translate.get('SNACKS.OPEN_FILE_ERROR'), null, {
							duration: 4000,
							panelClass: 'error'
						});
						this.closeFile();
						this.fileLoaderDatas.isLoadingDatas = false;
					});
				}
			);
		}

	}

	closeFile() {
		this.ngzone.run(
			() => {
				this.onFileLoaderDataChanged(undefined);
			}
		);
	}

	getOpenedFiles() {
		return this.fileLoaderService.getFileHistory(this.applicationName);
	}

}
