/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, computed, input, inject } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { TranslateModule, TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [FlexLayoutModule, MatButtonModule, TranslateModule],
})
export class ConfirmDialogComponent {
  public readonly title = input<string>('');
  public readonly message = input<string>('');
  public readonly displayRejectBtn = input<boolean>(false);
  public readonly displayCancelBtn = input<boolean>(true);
  public readonly displayYesToAllBtn = input<boolean>(false);
  public readonly displayNoToAllBtn = input<boolean>(false);
  public readonly confirmTranslation = input<string>('');

  private readonly dialogService = inject(DialogService);
  private readonly translate = inject(TranslateService);

  public readonly confirmButtonText = computed(
    () => this.confirmTranslation() || this.translate.get('GLOBAL.YES'),
  );

  confirm() {
    this.dialogService.closeDialog('confirm');
  }

  confirmAll() {
    this.dialogService.closeDialog('confirmAll');
  }

  reject() {
    this.dialogService.closeDialog('reject');
  }

  rejectAll() {
    this.dialogService.closeDialog('rejectAll');
  }

  cancel() {
    this.dialogService.closeDialog('cancel');
  }
}
