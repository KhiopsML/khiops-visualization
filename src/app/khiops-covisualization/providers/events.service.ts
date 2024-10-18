import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  treeSelectedNodeChanged: EventEmitter<any> = new EventEmitter();
  importedDatasChanged: EventEmitter<any> = new EventEmitter();
  treeNodeNameChanged: EventEmitter<any> = new EventEmitter();
  conditionalOnContextChanged: EventEmitter<any> = new EventEmitter();

  emitTreeNodeNameChanged(event = {}) {
    this.treeNodeNameChanged.emit(event);
  }

  emitTreeSelectedNodeChanged(event = {}) {
    this.treeSelectedNodeChanged.emit(event);
  }

  emitImportedDatasChanged(event = {}) {
    this.importedDatasChanged.emit(event);
  }

  emitConditionalOnContextChanged(event = {}) {
    this.conditionalOnContextChanged.emit(event);
  }
}
