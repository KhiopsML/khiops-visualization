export class FileVO {

	filename: string;
	datas: any;

	constructor(datas, filename) {
		this.filename = filename || '';
		this.datas = datas || undefined;
	}

}
