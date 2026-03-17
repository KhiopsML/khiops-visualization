/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input } from '@angular/core';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import {
  VariableSearchDialogComponent,
  VariableSearchDialogData,
} from '../variable-search-dialog/variable-search-dialog.component';
import { DialogService } from '@khiops-library/providers/dialog.service';

@Component({
  selector: 'app-variable-search-button',
  templateUrl: './variable-search-button.component.html',
  styleUrls: ['./variable-search-button.component.scss'],
  standalone: false,
})
export class VariableSearchButtonComponent {
  @Input() public selectedDimension: DimensionCovisualizationModel | undefined;
  private lastSelectedInnerVariable: string | undefined;
  private lastSearchInput: string | undefined;

  constructor(private dialogService: DialogService) {}

  /**
   * Open variable search dialog
   */
  openVariableSearchDialog() {
    if (!this.selectedDimension?.innerVariables?.dimensionSummaries) {
      return;
    }

    const data: VariableSearchDialogData = {
      selectedDimension: this.selectedDimension,
      selectedInnerVariable: this.lastSelectedInnerVariable,
      searchInput: this.lastSearchInput,
    };

    const dialogRef = this.dialogService.openDialog(
      VariableSearchDialogComponent,
      {
        width: '50vw',
        height: '50vh',
        maxWidth: '50vw',
        maxHeight: '50vh',
      },
      data
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.selectedInnerVariable) {
        this.lastSelectedInnerVariable = result.selectedInnerVariable;
        this.lastSearchInput = result.searchInput;
      }
    });
  }

  /**
   * Check if search mode is available for this dimension
   */
  isSearchModeAvailable(): boolean {
    return !!this.selectedDimension?.innerVariables?.dimensionSummaries?.length;
  }
}
