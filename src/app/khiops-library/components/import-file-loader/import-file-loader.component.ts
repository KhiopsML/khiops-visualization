import {
	Component,
	OnInit,
	Output,
	NgZone,
	EventEmitter
} from '@angular/core';
import {
	ImportFileLoaderService
} from './import-file-loader.service';
import {
	MatSnackBar
} from '@angular/material/snack-bar';
import {
	TranslateService
} from '@ngstack/translate';
import {
	FileVO
} from '../../model/file-vo';

// TODO remove electron
// import {
// 	ElectronService
// } from '../../providers/electron.service';

let dialog: any;

@Component({
	selector: 'kl-import-file-loader',
	templateUrl: './import-file-loader.component.html',
	styleUrls: ['./import-file-loader.component.scss']
})
export class ImportFileLoaderComponent implements OnInit {

	@Output() datasLoaded: EventEmitter<any> = new EventEmitter();
	filename: any;
	isLoadingDatas: boolean;

	constructor(private ngzone: NgZone,
		// private electronService: ElectronService,
		private importFileLoaderService: ImportFileLoaderService,
		private snackBar: MatSnackBar,
		public translate: TranslateService) {

		// TODO remove electron
		// if (this.electronService.isElectron()) {
		// 	dialog = require('@electron/remote').dialog;
		// }
	}

	ngOnInit() {
		this.isLoadingDatas = false;
	}

	openFileDialog() {
		dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [{
				name: 'TXT',
				extensions: ['txt']
			}]
		}).then(result => {
			if (result && !result.canceled && result.filePaths) {
				this.openFile(result.filePaths[0]);
				return;
			}
		}).catch(err => {
			console.log(err);
		});
	}

	openFile(filename) {

		if (filename) {
			this.isLoadingDatas = true;
			setTimeout(() => {
				this.ngzone.run(
					() => {
						this.importFileLoaderService.readFile(filename).then((fileDatas: FileVO) => {
							this.filename = fileDatas.filename;
							this.datasLoaded.emit(fileDatas);
							this.isLoadingDatas = false;
						}).catch(error => {
							console.warn(this.translate.get('SNACKS.OPEN_FILE_ERROR'), error);
							this.snackBar.open(this.translate.get('SNACKS.OPEN_FILE_ERROR'), null, {
								duration: 4000,
								panelClass: 'error'
							});
							this.isLoadingDatas = false;
							this.closeFile();
						});
					}
				);
			}); // do it async to dont freeze during loadin

		}

	}

	closeFile() {
		this.ngzone.run(
			() => { }
		);
	}

}
