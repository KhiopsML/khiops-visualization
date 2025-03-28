/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Ls } from '@khiops-library/providers/ls.service';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-clear-ls',
  templateUrl: './clear-ls.component.html',
  styleUrls: ['./clear-ls.component.scss'],
  standalone: false,
})
export class ClearLsComponent {
  constructor(
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private ls: Ls,
  ) {}

  onClickOnClearDatas() {
    this.ls.clear();
    this.snackBar.open(this.translate.get('SNACKS.DATAS_DELETED'), undefined, {
      duration: 2000,
      panelClass: 'success',
    });
  }
}
