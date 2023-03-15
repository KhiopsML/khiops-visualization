
export class ExtDatasVO {

	file?: File;
	filename: string;
	dimension: string;
	joinKey: string;
	separator: string;
	field: {
		name: string,
		type: string,
		import: boolean
	};

	constructor(filename, dimension, joinKey, separator, field, file?) {

		this.filename = filename;
		this.dimension = dimension;
		this.joinKey = joinKey;
		this.separator = separator;
		this.field = field;
		this.file = file;

	}

}
