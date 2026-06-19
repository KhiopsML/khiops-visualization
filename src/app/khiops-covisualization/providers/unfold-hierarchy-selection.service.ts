/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';

/**
 * Service to manage the selection state of hierarchy fold checkboxes in the unfold-hierarchy table.
 * This service tracks which dimensions have their hierarchy folded/unfolded,
 * allowing the selection state to be persisted and restored when tabs are moved
 * to new windows or files are reopened.
 */
@Injectable({
  providedIn: 'root',
})
export class UnfoldHierarchySelectionService {
  /**
   * Stores the hierarchy fold state for each dimension.
   * Format: { dimensionName: hierarchyFold boolean }
   */
  private hierarchyFoldStates: { [dimensionName: string]: boolean } = {};

  constructor() {}

  /**
   * Sets the hierarchy fold state for a specific dimension.
   * @param dimensionName - The name of the dimension
   * @param hierarchyFold - Whether the hierarchy is folded for this dimension
   */
  setHierarchyFoldState(dimensionName: string, hierarchyFold: boolean): void {
    this.hierarchyFoldStates[dimensionName] = hierarchyFold;
  }

  /**
   * Gets the hierarchy fold state for a specific dimension.
   * @param dimensionName - The name of the dimension
   * @returns The hierarchy fold state, or undefined if not found
   */
  getHierarchyFoldState(dimensionName: string): boolean | undefined {
    return this.hierarchyFoldStates[dimensionName];
  }

  /**
   * Gets all hierarchy fold states as a map.
   * @returns A map of dimension name to hierarchy fold state
   */
  getAllHierarchyFoldStates(): { [dimensionName: string]: boolean } {
    return { ...this.hierarchyFoldStates };
  }

  /**
   * Restores all hierarchy fold states from a saved state.
   * @param hierarchyFoldStates - A map of dimension name to hierarchy fold state
   */
  restoreHierarchyFoldStates(hierarchyFoldStates: { [dimensionName: string]: boolean } | undefined): void {
    if (hierarchyFoldStates) {
      this.hierarchyFoldStates = { ...hierarchyFoldStates };
    } else {
      this.hierarchyFoldStates = {};
    }
  }

  /**
   * Clears all hierarchy fold states.
   */
  clearAllHierarchyFoldStates(): void {
    this.hierarchyFoldStates = {};
  }
}
