import { Injectable, EventEmitter } from '@angular/core';
import { TreeNodeChangedEventI } from '@khiops-covisualization/interfaces/events';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  public treeSelectedNodeChanged: EventEmitter<any> = new EventEmitter();
  public importedDatasChanged: EventEmitter<any> = new EventEmitter();
  public conditionalOnContextChanged: EventEmitter<any> = new EventEmitter();

  /**
   * Emits an event when the selected tree node changes.
   * @param event - The event data to emit.
   */
  emitTreeSelectedNodeChanged(event: TreeNodeChangedEventI) {
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
  emitConditionalOnContextChanged() {
    this.conditionalOnContextChanged.emit();
  }
}
