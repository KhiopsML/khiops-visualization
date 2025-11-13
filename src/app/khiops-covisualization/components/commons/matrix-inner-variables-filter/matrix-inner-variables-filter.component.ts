/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { TranslateService } from '@ngstack/translate';

export interface InnerVariablesSelectionEvent {
  selectedInnerVariables: string[];
  allSelected: boolean;
}

@Component({
  selector: 'app-matrix-inner-variables-filter',
  templateUrl: './matrix-inner-variables-filter.component.html',
  styleUrls: ['./matrix-inner-variables-filter.component.scss'],
  standalone: false,
})
export class MatrixInnerVariablesFilterComponent implements OnInit, OnChanges {
  @Input() selectedDimensions: DimensionCovisualizationModel[] | undefined;
  @Input() showComponent = false; // External control of visibility

  @Output() selectionChanged = new EventEmitter<InnerVariablesSelectionEvent>();

  public innerVariables: string[] = [];
  public selectedInnerVariables: string[] = [];
  public showInnerVariablesSelect = false;
  public selectAllCheckboxText?: string;
  private isToggling = false;

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.selectAllCheckboxText = this.translate.get('GLOBAL.UNSELECT_ALL');
    this.initializeInnerVariables();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDimensions']) {
      this.initializeInnerVariables();
    }
  }

  /**
   * Initializes the inner variables from the selected dimensions
   */
  private initializeInnerVariables() {
    // Store previous selection to preserve it across dimension changes
    const previousSelection = [...this.selectedInnerVariables];

    this.innerVariables = [];
    this.selectedInnerVariables = [];
    this.showInnerVariablesSelect = false;

    if (this.selectedDimensions && this.selectedDimensions.length > 0) {
      // Get inner variables from the first dimension that has them
      for (const dimension of this.selectedDimensions) {
        if (dimension?.innerVariables?.dimensionSummaries) {
          this.innerVariables = dimension.innerVariables.dimensionSummaries.map(
            (dim) => dim.name,
          );

          if (previousSelection.length > 0) {
            this.selectedInnerVariables = previousSelection.filter((variable) =>
              this.innerVariables.includes(variable),
            );
          }

          // Fallback: If no valid selection, select all inner variables
          if (this.selectedInnerVariables.length === 0) {
            this.selectedInnerVariables = [...this.innerVariables];
          }

          this.showInnerVariablesSelect = this.innerVariables.length > 0;
          break; // Use the first dimension with inner variables
        }
      }
    }

    // Emit initial state
    this.emitSelectionChange();
  }

  /**
   * Called when the inner variables selection changes
   * This method filters out any non-variable selections (like from select all clicks)
   */
  onInnerVariablesSelected(event: any) {
    // Don't process if we're in the middle of a toggle operation
    if (this.isToggling) {
      return;
    }

    // Filter only valid inner variables, excluding any non-variable values
    const validSelections = event.value.filter((value: string) =>
      this.innerVariables.includes(value),
    );
    this.selectedInnerVariables = validSelections;
    this.emitSelectionChange();
  }

  /**
   * Helper methods for ALL checkbox functionality
   */
  allInnerVariablesSelected(): boolean {
    return this.selectedInnerVariables.length === this.innerVariables.length;
  }

  someInnerVariablesSelected(): boolean {
    return (
      this.selectedInnerVariables.length > 0 &&
      this.selectedInnerVariables.length < this.innerVariables.length
    );
  }

  toggleAllInnerVariables() {
    this.isToggling = true;

    if (this.allInnerVariablesSelected()) {
      this.selectedInnerVariables = [];
      this.selectAllCheckboxText = this.translate.get('GLOBAL.SELECT_ALL');
    } else {
      this.selectedInnerVariables = [...this.innerVariables];
      this.selectAllCheckboxText = this.translate.get('GLOBAL.UNSELECT_ALL');
    }
    this.emitSelectionChange();

    // Reset the flag after DOM update
    setTimeout(() => {
      this.isToggling = false;
    }, 0);
  }

  /**
   * Emits the selection change event and updates select all text
   */
  private emitSelectionChange() {
    this.updateSelectAllText();
    this.selectionChanged.emit({
      selectedInnerVariables: this.selectedInnerVariables,
      allSelected: this.allInnerVariablesSelected(),
    });
  }

  /**
   * Updates the select all checkbox text based on current selection state
   */
  private updateSelectAllText() {
    if (this.allInnerVariablesSelected()) {
      this.selectAllCheckboxText = this.translate.get('GLOBAL.UNSELECT_ALL');
    } else {
      this.selectAllCheckboxText = this.translate.get('GLOBAL.SELECT_ALL');
    }
  }

  /**
   * Public method to get the current selection state
   */
  getSelectedInnerVariables(): string[] {
    return [...this.selectedInnerVariables];
  }

  /**
   * Public method to check if component should be visible
   */
  get isVisible(): boolean {
    return this.showComponent && this.showInnerVariablesSelect;
  }
}
