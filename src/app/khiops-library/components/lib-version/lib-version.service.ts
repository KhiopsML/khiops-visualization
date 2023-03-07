import {
	Injectable
} from '@angular/core';
let pjson;
try {
	pjson = require('../../../../../../package.json');
} catch (e) {
	console.warn('Can not access pjson on browser', e);
}

@Injectable({
	providedIn: 'root'
})
export class LibVersionService {

	constructor() {}

	static getVersion() {
		return pjson && pjson.version || undefined;
	}

}
