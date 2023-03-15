import {
	Injectable
} from '@angular/core';
import {
	FileVO
} from '../../model/file-vo';

// import _ from 'lodash';
// TODO remove electron
// import {
// 	ElectronService
// } from '../../providers/electron.service';

@Injectable({
	providedIn: 'root'
})
export class ImportFileLoaderService {

	// TODO remove electron
	// constructor(private electronService: ElectronService) {}

	readFile(file: File): any {

		return new Promise((resolve, reject) => {
			console.log(file);
			let reader = new FileReader()

			reader.addEventListener('loadend', async (e) => {
				const datas = e.target.result.toString();
				resolve(new FileVO(datas, file.name, file));
			});
			reader.addEventListener('error', () => {
				reader.abort();
				reject(new Error('failed to process file'))
			});
			reader.readAsText(file);
		})

		// TODO remove electron
		// return new Promise((resolve, reject) => {

		// 	this.electronService.fs.readFile(filename, 'utf-8', (err, datas: any) => {
		// 		if (err) {
		// 			reject();
		// 		} else {
		// 			resolve(
		// 				new FileVO(datas, filename)
		// 			);
		// 		}
		// 	});
		// });

	}

}
