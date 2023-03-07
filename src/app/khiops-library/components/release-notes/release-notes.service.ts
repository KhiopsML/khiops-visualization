import {
	Injectable
} from '@angular/core';
import {
	HttpClient, HttpHeaders
} from '@angular/common/http';
import {
	NoteVO
} from './note-vo';
import _ from 'lodash';
import {
	KhiopsLibraryService
} from '../../providers/khiops-library.service';

@Injectable({
	providedIn: 'root'
})
export class ReleaseNotesService {

	constructor(private http: HttpClient, private khiopsLibraryService: KhiopsLibraryService) {

	}

	loadGithubReleaseNotes(): any {

		return new Promise((resolve, reject) => {
			let url;
			if (this.khiopsLibraryService.getAppConfig().common.GLOBAL.DEBUG_SOFTWARE_LABEL === 'KV') {
				url = 'https://api.github.com/repos/khiopsrelease/kv-release/releases';
			} else {
				url = 'https://api.github.com/repos/khiopsrelease/kc-release/releases';
			}

			this.http.get(url, {
				responseType: 'json',
				// Comment headers for local dev testing
				// CORS policy: Request header field timeout is not allowed by Access-Control-Allow-Headers in preflight response.
                headers: new HttpHeaders({
                    timeout: `${60000}`
                })
			}).subscribe((datas: any) => {
				if (datas) {
					const notes = [];
					for (let i = 0; i < datas.length; i++) {
						const noteVO = new NoteVO(datas[i]);
						notes.push(noteVO);
					}
					resolve(notes);
				} else {
					reject({
						'status': 500
					});
				}
			}, (error) => {
				reject({
					'status': 500
				});
			});

		});
	}

	loadReleaseNotes(): any {

		// let releaseNotes = [];

		// return new Promise((resolve, reject) => {
		// 	const url = './assets/releaseNotes.json';

		// 	this.http.get(url, {
		// 		responseType: 'json'
		// 	}).subscribe((datas: any) => {
		// 		if (datas) {
		// 			let notes = [];
		// 			for (let i = 0; i < datas.length; i++) {
		// 				const noteVO = new NoteVO(datas[i]);
		// 				if (noteVO.label) {
		// 					notes.push(noteVO);
		// 				}
		// 			}
		// 			notes = _.orderBy(notes, 'label', 'desc');
		// 			for (let i = 0; i < notes.length; i++) {
		// 				if (!releaseNotes[notes[i].label]) {
		// 					releaseNotes[notes[i].label] = [];
		// 				}
		// 				releaseNotes[notes[i].label].push(notes[i]);
		// 			}
		// 			resolve(releaseNotes);
		// 		} else {
		// 			reject({
		// 				'status': 500
		// 			});
		// 		}
		// 	}, (error) => {
		// 		reject({
		// 			'status': 500
		// 		});
		// 	});

		// });
	}

}
