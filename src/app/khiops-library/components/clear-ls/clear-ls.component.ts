/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, inject, signal } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Ls } from '@khiops-library/providers/ls.service';
import { TranslateModule, TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-clear-ls',
  templateUrl: './clear-ls.component.html',
  styleUrls: ['./clear-ls.component.scss'],
  imports: [FlexLayoutModule, MatButtonModule, TranslateModule],
})
export class ClearLsComponent {
  private readonly translate = inject(TranslateService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly ls = inject(Ls);

  public onClickOnClearDatas(): void {
    this.ls.clear();
    this.snackBar.open(this.translate.get('SNACKS.DATAS_DELETED'), undefined, {
      duration: 2000,
      panelClass: 'success',
    });
  }
}
