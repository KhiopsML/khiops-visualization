/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import {
  VariableSearchDialogComponent,
  VariableSearchDialogData,
} from '../variable-search-dialog/variable-search-dialog.component';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { KhiopsLibraryModule } from '@khiops-library/khiops-library.module';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-variable-search-button',
  templateUrl: './variable-search-button.component.html',
  styleUrls: ['./variable-search-button.component.scss'],
  imports: [KhiopsLibraryModule],
})
export class VariableSearchButtonComponent {
  public selectedDimension = input<DimensionCovisualizationModel | undefined>();

  readonly isSearchModeAvailable = computed(
    () =>
      !!this.selectedDimension()?.innerVariables?.dimensionSummaries?.length,
  );

  private readonly lastSelectedInnerVariable = signal<string | undefined>(
    undefined,
  );
  private readonly lastSearchInput = signal<string | undefined>(undefined);

  constructor(private dialogService: DialogService) {}

  /**
   * Open variable search dialog
   */
  openVariableSearchDialog() {
    const selectedDimension = this.selectedDimension();

    if (!selectedDimension?.innerVariables?.dimensionSummaries) {
      return;
    }

    const data: VariableSearchDialogData = {
      selectedDimension,
      selectedInnerVariable: this.lastSelectedInnerVariable(),
      searchInput: this.lastSearchInput(),
    };

    const dialogRef = this.dialogService.openDialog(
      VariableSearchDialogComponent,
      {
        width: '50vw',
        height: '50vh',
        maxWidth: '50vw',
        maxHeight: '50vh',
      },
      { data },
    );

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
      if (result?.selectedInnerVariable) {
        this.lastSelectedInnerVariable.set(result.selectedInnerVariable);
        this.lastSearchInput.set(result.searchInput);
      }
      });
  }
}
