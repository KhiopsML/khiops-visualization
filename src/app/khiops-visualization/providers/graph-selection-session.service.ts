/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';

export type GraphSelectionScope =
  | 'preparation'
  | 'textPreparation'
  | 'treePreparation'
  | 'preparation2d'
  | 'modeling';

@Injectable({
  providedIn: 'root',
})
export class GraphSelectionSessionService {
  private readonly DEFAULT_INDEX = 0;
  private readonly selectedIndexByScope = new Map<GraphSelectionScope, number>();
  private readonly selectedMatrixCellIndexByScope = new Map<
    GraphSelectionScope,
    number
  >();
  private readonly selectedTreeNodeIdByScope = new Map<
    GraphSelectionScope,
    string
  >();

  getSelectedIndex(scope: GraphSelectionScope): number {
    return this.selectedIndexByScope.get(scope) ?? this.DEFAULT_INDEX;
  }

  setSelectedIndex(scope: GraphSelectionScope, index: number): void {
    this.selectedIndexByScope.set(scope, index);
  }

  getSelectedMatrixCellIndex(scope: GraphSelectionScope): number | undefined {
    return this.selectedMatrixCellIndexByScope.get(scope);
  }

  setSelectedMatrixCellIndex(scope: GraphSelectionScope, index: number): void {
    this.selectedMatrixCellIndexByScope.set(scope, index);
  }

  getSelectedTreeNodeId(scope: GraphSelectionScope): string | undefined {
    return this.selectedTreeNodeIdByScope.get(scope);
  }

  setSelectedTreeNodeId(scope: GraphSelectionScope, nodeId: string): void {
    this.selectedTreeNodeIdByScope.set(scope, nodeId);
  }
}
