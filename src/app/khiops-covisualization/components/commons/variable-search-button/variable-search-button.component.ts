/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input } from '@angular/core';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  VariableSearchDialogComponent,
  VariableSearchDialogData,
} from '../variable-search-dialog/variable-search-dialog.component';

@Component({
  selector: 'app-variable-search-button',
  templateUrl: './variable-search-button.component.html',
  styleUrls: ['./variable-search-button.component.scss'],
  standalone: false,
})
export class VariableSearchButtonComponent {
  @Input() public selectedDimension: DimensionCovisualizationModel | undefined;

  constructor(private dialog: MatDialog) {}

  /**
   * Open variable search dialog
   */
  openVariableSearchDialog() {
    if (!this.selectedDimension?.innerVariables?.dimensionSummaries) {
      return;
    }

    const config = new MatDialogConfig();
    config.width = '80vw';
    config.height = '80vh';
    config.maxWidth = '80vw';
    config.maxHeight = '80vh';
    config.data = {
      selectedDimension: this.selectedDimension,
    } as VariableSearchDialogData;

    this.dialog.open(VariableSearchDialogComponent, config);
  }

  /**
   * Check if search mode is available for this dimension
   */
  isSearchModeAvailable(): boolean {
    return !!this.selectedDimension?.innerVariables?.dimensionSummaries?.length;
  }
}
