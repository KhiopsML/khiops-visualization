import { Injectable, EventEmitter } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class EventsService {
	treeSelectedNodeChanged: EventEmitter<any> = new EventEmitter();
	importedDatasChanged: EventEmitter<any> = new EventEmitter();
	treeNodeNameChanged: EventEmitter<any> = new EventEmitter();

	constructor() {}

	emitTreeNodeNameChanged(event = {}) {
		this.treeNodeNameChanged.emit(event);
	}

	emitTreeSelectedNodeChanged(event = {}) {
		this.treeSelectedNodeChanged.emit(event);
	}

	emitImportedDatasChanged(event = {}) {
		this.importedDatasChanged.emit(event);
	}
}
