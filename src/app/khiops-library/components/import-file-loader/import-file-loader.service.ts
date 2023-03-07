import {
	Injectable
} from '@angular/core';
import _ from 'lodash';
import {
	FileVO
} from '../../model/file-vo';
import {
	ElectronService
} from '../../providers/electron.service';

@Injectable({
	providedIn: 'root'
})
export class ImportFileLoaderService {

	constructor(private electronService: ElectronService) {}

	readFile(filename: string): any {

		return new Promise((resolve, reject) => {

			this.electronService.fs.readFile(filename, 'utf-8', (err, datas: any) => {
				if (err) {
					reject();
				} else {
					resolve(
						new FileVO(datas, filename)
					);
				}
			});
		});

	}

}
