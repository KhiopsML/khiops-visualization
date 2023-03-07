export class PendingUpdateVO {

	hierarchy: string;
	nodeName: string;
	annotation: string;

	constructor(hierarchy, nodeName) {
		this.hierarchy = hierarchy;
		this.nodeName = nodeName;
	}

	updateAnnotation(text) {
		this.annotation = text;
	}

}
