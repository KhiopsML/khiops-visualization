/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngstack/translate';
import { DialogService } from '@khiops-library/providers/dialog.service';

@Component({
  selector: 'kl-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [MatButtonModule, TranslateModule],
})
export class ConfirmDialogComponent {
  private readonly dialogService = inject(DialogService);
  private readonly translate = inject(TranslateService);

  readonly title = input('');
  readonly message = input('');
  readonly displayRejectBtn = input(false);
  readonly displayCancelBtn = input(true);
  readonly displayYesToAllBtn = input(false);
  readonly displayNoToAllBtn = input(false);
  readonly confirmTranslation = input('');

  readonly confirmButtonText = computed(
    () => this.confirmTranslation() || this.translate.get('GLOBAL.YES'),
  );

  confirm(): void {
    this.dialogService.closeDialog('confirm');
  }

  confirmAll(): void {
    this.dialogService.closeDialog('confirmAll');
  }

  reject(): void {
    this.dialogService.closeDialog('reject');
  }

  rejectAll(): void {
    this.dialogService.closeDialog('rejectAll');
  }

  cancel(): void {
    this.dialogService.closeDialog('cancel');
  }
}
