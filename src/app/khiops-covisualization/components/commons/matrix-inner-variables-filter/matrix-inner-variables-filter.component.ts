/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
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
  ChangeDetectionStrategy,
} from '@angular/core';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { MatrixInnerVariablesSelectionService } from '@khiops-covisualization/providers/matrix-inner-variables-selection.service';
import { TranslateService } from '@ngstack/translate';

export interface InnerVariablesSelectionEvent {
  selectedInnerVariables: string[];
  allSelected: boolean;
}

@Component({
  selector: 'app-matrix-inner-variables-filter',
  templateUrl: './matrix-inner-variables-filter.component.html',
  styleUrls: ['./matrix-inner-variables-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class MatrixInnerVariablesFilterComponent implements OnInit, OnChanges {
  @Input() selectedDimensions: DimensionCovisualizationModel[] | undefined;
  @Input() showComponent = false; // External control of visibility
  @Input() maxDisplayedInnerVariables = 200; // Cap rendered options to avoid freezing the UI with huge lists

  @Output() selectionChanged = new EventEmitter<InnerVariablesSelectionEvent>();

  public innerVariables: string[] = [];
  public selectedInnerVariables: string[] = [];
  public showInnerVariablesSelect = false;
  public selectAllCheckboxText?: string;
  public filterText = '';
  // Visually filtered/capped list of rendered options. Selection itself is
  // tracked independently in `selectedInnerVariables` and is never derived
  // from which options are currently rendered, so filtering never loses data.
  public displayedInnerVariables: string[] = [];
  public totalInnerVariablesCount = 0;
  public filteredInnerVariablesCount = 0;
  public isInnerVariablesTruncated = false;

  constructor(
    private translate: TranslateService,
    private matrixInnerVariablesSelectionService: MatrixInnerVariablesSelectionService,
  ) {}

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
          this.innerVariables = dimension.innerVariables.dimensionSummaries
            .map((dim) => dim.name)
            .sort((a, b) =>
              a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: 'base',
              }),
            );

          if (previousSelection.length > 0) {
            this.selectedInnerVariables = previousSelection.filter((variable) =>
              this.innerVariables.includes(variable),
            );
          }

          // Try to restore the previously saved selection for this dimension
          if (this.selectedInnerVariables.length === 0) {
            const savedSelection =
              this.matrixInnerVariablesSelectionService.getSelectedInnerVariables();
            if (savedSelection && savedSelection.length > 0) {
              this.selectedInnerVariables = savedSelection.filter((variable) =>
                this.innerVariables.includes(variable),
              );
            }
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

    this.filterText = '';
    this.totalInnerVariablesCount = this.innerVariables.length;
    this.applyInnerVariablesFilter();

    // Emit initial state
    this.emitSelectionChange();
  }

  /**
   * Filters the visible options list based on the search text (visual only).
   * `selectedInnerVariables` is never derived from this list, so hiding a
   * checked variable behind the filter never uncheckes/loses it.
   */
  private applyInnerVariablesFilter() {
    const search = this.filterText.trim().toLowerCase();
    const filtered = search
      ? this.innerVariables.filter((variable) =>
          variable.toLowerCase().includes(search),
        )
      : this.innerVariables;

    this.filteredInnerVariablesCount = filtered.length;
    this.isInnerVariablesTruncated =
      filtered.length > this.maxDisplayedInnerVariables;
    this.displayedInnerVariables = this.isInnerVariablesTruncated
      ? filtered.slice(0, this.maxDisplayedInnerVariables)
      : filtered;
  }

  /**
   * Called when the user types in the search input
   */
  onFilterTextChange(value: string) {
    this.filterText = value;
    this.applyInnerVariablesFilter();
  }

  /**
   * Clears the search text
   */
  clearFilterText() {
    this.filterText = '';
    this.applyInnerVariablesFilter();
  }

  /**
   * Resets the search when the select panel closes
   */
  onSelectOpenedChange(opened: boolean) {
    if (!opened && this.filterText) {
      this.filterText = '';
      this.applyInnerVariablesFilter();
    }
  }

  /**
   * Toggles a single inner variable's selection. Driven entirely by our own
   * click handler rather than mat-select's (selectionChange) output: that
   * event only reflects currently rendered options, so diffing against it
   * would drop the selection state of anything hidden by the search filter.
   */
  toggleInnerVariable(variable: string) {
    this.selectedInnerVariables = this.selectedInnerVariables.includes(
      variable,
    )
      ? this.selectedInnerVariables.filter((v) => v !== variable)
      : [...this.selectedInnerVariables, variable];
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
    if (this.allInnerVariablesSelected()) {
      this.selectedInnerVariables = [];
      this.selectAllCheckboxText = this.translate.get('GLOBAL.SELECT_ALL');
    } else {
      this.selectedInnerVariables = [...this.innerVariables];
      this.selectAllCheckboxText = this.translate.get('GLOBAL.UNSELECT_ALL');
    }
    this.emitSelectionChange();
  }

  /**
   * Emits the selection change event and updates select all text
   */
  private emitSelectionChange() {
    this.updateSelectAllText();
    // Persist the selected inner variables
    this.matrixInnerVariablesSelectionService.setSelectedInnerVariables(
      this.selectedInnerVariables,
    );
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

  /**
   * Label shown in the closed select: the first 20 selected variables, with
   * an ellipsis if there are more (avoids joining/rendering huge selections).
   */
  get triggerLabel(): string {
    const maxShown = 20;
    const shown = this.selectedInnerVariables.slice(0, maxShown).join(', ');
    return this.selectedInnerVariables.length > maxShown
      ? `${shown}, ...`
      : shown;
  }
}
