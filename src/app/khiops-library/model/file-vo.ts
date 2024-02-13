export class FileVO {
	file: File;
	filename: string;
	datas: any;

	constructor(datas, filename, file?) {
		this.filename = filename || "";
		this.datas = datas || undefined;
		this.file = file;
	}
}
