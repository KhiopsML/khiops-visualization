import {
	Injectable,
	NgZone
} from '@angular/core';
import {
	FileLoaderService
} from '../components/file-loader/file-loader.service';
import {
	UtilsService
} from './utils.service';
import {
	MatSnackBar
} from '@angular/material/snack-bar';
import {
	TranslateService
} from '@ngstack/translate';
import {
	KhiopsLibraryService
} from './khiops-library.service';
import {
	ElectronService
} from './electron.service';
let dialog: any;

@Injectable({
	providedIn: 'root'
})
export class FileSaverService {
	constructor(
		private electronService: ElectronService,
		private fileLoaderService: FileLoaderService,
		private ngzone: NgZone,
		private snackBar: MatSnackBar,
		private translate: TranslateService,
		private khiopsLibraryService: KhiopsLibraryService
	) {
		// TODO remove electron
		// if (this.electronService.isElectron()) {
		// 	dialog = require('@electron/remote').dialog;
		// }
	}

	save(appName, datas) {

		const lastFilePath = this.fileLoaderService.getFileHistory(appName).files[0];
		const filePath = this.fileLoaderService.getDatas().datas.filename;
		const filename = UtilsService.getFileNameFromPath(filePath);

		if (lastFilePath.includes(filename)) {
			this.saveFile(lastFilePath, datas);
		} else {
			this.ngzone.run(
				() => {
					this.snackBar.open(this.translate.get('SNACKS.SAVE_FILE_ERROR'), null, {
						duration: 4000,
						panelClass: 'error'
					});
				}
			);
		}

	}

	saveAs(datas) {
		const dialogOpts: any = {
			defaultPath: this.fileLoaderService.getDatas().datas.filename + this.khiopsLibraryService.getAppConfig().common.FILE_SAVE.EXT_NAME,
			filters: [{
				name: this.khiopsLibraryService.getAppConfig().common.FILE_SAVE.FORMAT,
				extensions: [this.khiopsLibraryService.getAppConfig().common.FILE_SAVE.FORMAT]
			}]
		};
		dialog.showSaveDialog(dialogOpts).then(
			(result) => {
				const filename = result.filePath;
				if (filename) {
					this.saveFile(filename, datas);
				}
			});
	}

	saveFile(filename, datas) {

		// TODO remove electron
		// this.electronService.fs.writeFileSync(
		// 	filename,
		// 	JSON.stringify(datas, null, 2), // spacing level = 2
		// 	this.khiopsLibraryService.getAppConfig().common.FILE_SAVE.ENCODING
		// );
		// this.ngzone.run(
		// 	() => {
		// 		this.snackBar.open(this.translate.get('SNACKS.SAVE_FILE_SUCCESS'), null, {
		// 			duration: 4000,
		// 			panelClass: 'success'
		// 		});
		// 	}
		// );
	}

}
