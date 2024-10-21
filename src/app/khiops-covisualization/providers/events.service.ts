import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  treeSelectedNodeChanged: EventEmitter<any> = new EventEmitter();
  importedDatasChanged: EventEmitter<any> = new EventEmitter();
  treeNodeNameChanged: EventEmitter<any> = new EventEmitter();
  conditionalOnContextChanged: EventEmitter<any> = new EventEmitter();

  /**
   * Emits an event when the name of a tree node changes.
   * @param event - The event data to emit.
   */
  emitTreeNodeNameChanged(event = {}) {
    this.treeNodeNameChanged.emit(event);
  }

  /**
   * Emits an event when the selected tree node changes.
   * @param event - The event data to emit.
   */
  emitTreeSelectedNodeChanged(event = {}) {
    this.treeSelectedNodeChanged.emit(event);
  }

  /**
   * Emits an event when the imported data changes.
   * @param event - The event data to emit.
   */
  emitImportedDatasChanged(event = {}) {
    this.importedDatasChanged.emit(event);
  }

  /**
   * Emits an event when the conditional context changes.
   * @param event - The event data to emit.
   */
  emitConditionalOnContextChanged(event = {}) {
    this.conditionalOnContextChanged.emit(event);
  }
}
