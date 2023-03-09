import {
	Injectable
} from '@angular/core';
import _ from 'lodash';

// TODO remove electron
// import {
// 	FileVO
// } from '../../model/file-vo';
// import {
// 	ElectronService
// } from '../../providers/electron.service';

@Injectable({
	providedIn: 'root'
})
export class ImportFileLoaderService {

	// TODO remove electron
	// constructor(private electronService: ElectronService) {}

	readFile(filename: string): any {

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
