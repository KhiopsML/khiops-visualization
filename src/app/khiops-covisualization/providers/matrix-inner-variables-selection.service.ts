/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';

/**
 * Service to manage the selection state of inner variables in the matrix filter.
 * This service tracks which inner variables are selected,
 * allowing the selection state to be persisted and restored when tabs are moved
 * to new windows or files are reopened.
 */
@Injectable({
  providedIn: 'root',
})
export class MatrixInnerVariablesSelectionService {
  /**
   * Stores the selected inner variables.
   */
  private selectedInnerVariables: string[] = [];

  constructor() {}

  /**
   * Sets the selected inner variables.
   * @param selectedInnerVariables - Array of selected inner variable names
   */
  setSelectedInnerVariables(selectedInnerVariables: string[]): void {
    this.selectedInnerVariables = [...selectedInnerVariables];
  }

  /**
   * Gets the selected inner variables.
   * @returns Array of selected inner variable names
   */
  getSelectedInnerVariables(): string[] {
    return [...this.selectedInnerVariables];
  }

  /**
   * Restores the selected inner variables from a saved state.
   * @param selectedInnerVariables - Array of inner variable names to restore
   */
  restoreSelectedInnerVariables(selectedInnerVariables: string[] | undefined): void {
    if (selectedInnerVariables && Array.isArray(selectedInnerVariables)) {
      this.selectedInnerVariables = [...selectedInnerVariables];
    } else {
      this.selectedInnerVariables = [];
    }
  }

  /**
   * Clears all selected inner variables.
   */
  clearSelectedInnerVariables(): void {
    this.selectedInnerVariables = [];
  }
}
