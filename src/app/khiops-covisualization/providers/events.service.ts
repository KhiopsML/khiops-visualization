/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable, EventEmitter, signal } from '@angular/core';
import { TreeNodeChangedEventI } from '@khiops-covisualization/interfaces/events.interface';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  public treeSelectedNodeChanged: EventEmitter<any> = new EventEmitter();
  public importedDatasChanged: EventEmitter<any> = new EventEmitter();
  public conditionalOnContextChanged: EventEmitter<any> = new EventEmitter();
  public contextSelectionChanged: EventEmitter<any> = new EventEmitter();
  public unfoldHierarchyChanged: EventEmitter<any> = new EventEmitter();
  public treeNodeCompositionSelectionChanged = signal<{
    hierarchyName: string;
    selectedNodeName: string;
    selectedValue: string;
  } | null>(null);
  public treeNodeNameChanged = signal<{name: string; newName: string} | null>(null);

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

  /**
   * Emits an event when the context selection changes.
   * @param event - The event data to emit.
   */
  emitContextSelectionChanged() {
    this.contextSelectionChanged.emit();
  }

  /**
   * Emits an event when the hierarchy is unfolded.
   * @param event - The event data to emit.
   */
  emitUnfoldHierarchyChanged() {
    this.unfoldHierarchyChanged.emit();
  }

  /**
   * Emits a signal when composition selection must be updated from variable search.
   * @param event - The event data to emit.
   */
  emitTreeNodeCompositionSelectionChanged(event: {
    hierarchyName: string;
    selectedNodeName: string;
    selectedValue: string;
  }) {
    this.treeNodeCompositionSelectionChanged.set(event);
  }

  /**
   * Emits an event when a tree node name changes.
   * @param event - The event data to emit.
   */
  emitTreeNodeNameChanged(event: {name: string; newName: string}) {
    this.treeNodeNameChanged.set(event);
  }
}
