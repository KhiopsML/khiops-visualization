/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { CopyService } from './copy.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CopyDatasService {
  constructor(
    private translate: TranslateService,
    private copyService: CopyService,
    private selectableService: SelectableService,
    private snackBar: MatSnackBar,
  ) {}

  /**
   * Copies the currently selected area as data to the clipboard.
   * The method retrieves the selected area, uses the CopyService to copy the data, and provides user feedback via a snackbar notification.
   * If no area is selected, it shows a warning message instead.
   */
  copyDatas() {
    const currentSelectedArea = this.selectableService.getSelectedArea();

    if (currentSelectedArea) {
      this.copyService.copyDatasToClipboard(currentSelectedArea);

      this.snackBar.open(this.translate.get('SNACKS.DATAS_COPIED'), undefined, {
        duration: 2000,
        panelClass: 'success',
      });
    } else {
      this.snackBar.open(
        this.translate.get('SNACKS.NO_AREA_SELECTED'),
        undefined,
        {
          duration: 2000,
          panelClass: 'warning',
        },
      );
    }
  }
}
