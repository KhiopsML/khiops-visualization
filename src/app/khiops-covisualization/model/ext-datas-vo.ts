
export class ExtDatasVO {

	filename: string;
	dimension: string;
	joinKey: string;
	separator: string;
	field: {
		name: string,
		type: string,
		import: boolean
	};

	constructor(filename, dimension, joinKey, separator, field) {

		this.filename = filename;
		this.dimension = dimension;
		this.joinKey = joinKey;
		this.separator = separator;
		this.field = field;

	}

}
