import {
	Injectable,
	EventEmitter
} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class EventsService {

	treeInit: EventEmitter < any > = new EventEmitter();
	treeSelectedNodeChanged: EventEmitter < any > = new EventEmitter();
	treeCollapseChanged: EventEmitter < any > = new EventEmitter();
	importedDatasChanged: EventEmitter < any > = new EventEmitter();
	dimensionsSelectionChanged: EventEmitter < any > = new EventEmitter();
	treeNodeNameChanged: EventEmitter < any > = new EventEmitter();

	constructor() {}

	emitTreeCollapseChanged(event = {}) {
		// setTimeout(() => {
			this.treeCollapseChanged.emit(event);
		// });
	}

	emitTreeNodeNameChanged(event = {}) {
		// setTimeout(() => {
			this.treeNodeNameChanged.emit(event);
		// });
	}

	emitTreeSelectedNodeChanged(event = {}) {
		// setTimeout(() => {
			this.treeSelectedNodeChanged.emit(event);
		// });
	}

	emitTreeInit(event = {}) {
		// setTimeout(() => {
			this.treeInit.emit(event);
		// });
	}

	emitDimensionsSelectionChanged(event = {}) {
		// setTimeout(() => {
			this.dimensionsSelectionChanged.emit(event);
		// });
	}

	emitImportedDatasChanged(event = {}) {
		// setTimeout(() => {
			this.importedDatasChanged.emit(event);
		// });
	}

}
