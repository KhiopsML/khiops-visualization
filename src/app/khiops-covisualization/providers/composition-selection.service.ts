/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { CompositionModel } from '../model/composition.model';

/**
 * Service to manage the selection state of composition rows across dimensions.
 * This service tracks which composition row is selected for each dimension,
 * allowing the selection state to be persisted and restored when tabs are moved
 * to new windows or files are reopened.
 */
@Injectable({
  providedIn: 'root',
})
export class CompositionSelectionService {
  /**
   * Stores the selected composition for each dimension by its index.
   * Format: { dimensionIndex: compositionId }
   */
  private selectedCompositionsByDimension: { [dimensionIndex: number]: string } = {};

  constructor() {}

  /**
   * Sets the selected composition for a specific dimension.
   * @param dimensionIndex - The index of the dimension
   * @param composition - The selected composition model
   */
  setSelectedComposition(dimensionIndex: number, composition: CompositionModel | undefined): void {
    if (composition?._id) {
      this.selectedCompositionsByDimension[dimensionIndex] = composition._id;
    } else {
      delete this.selectedCompositionsByDimension[dimensionIndex];
    }
  }

  /**
   * Gets the selected composition ID for a specific dimension.
   * @param dimensionIndex - The index of the dimension
   * @returns The selected composition ID, or undefined if none is selected
   */
  getSelectedCompositionId(dimensionIndex: number): string | undefined {
    return this.selectedCompositionsByDimension[dimensionIndex];
  }

  /**
   * Gets all selected compositions as a map.
   * @returns A map of dimension index to composition ID
   */
  getAllSelectedCompositions(): { [dimensionIndex: number]: string } {
    return { ...this.selectedCompositionsByDimension };
  }

  /**
   * Restores all selected compositions from a saved state.
   * @param selectedCompositions - A map of dimension index to composition ID
   */
  restoreSelectedCompositions(selectedCompositions: { [dimensionIndex: number]: string } | undefined): void {
    if (selectedCompositions) {
      this.selectedCompositionsByDimension = { ...selectedCompositions };
    } else {
      this.selectedCompositionsByDimension = {};
    }
  }

  /**
   * Clears all selected compositions.
   */
  clearAllSelectedCompositions(): void {
    this.selectedCompositionsByDimension = {};
  }
}
