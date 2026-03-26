/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit } from '@angular/core';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  standalone: false,
})
export class ConfirmDialogComponent implements OnInit {
  public title: string = '';
  public message: string = '';
  public displayRejectBtn: boolean = false;
  public displayCancelBtn: boolean = true;
  public confirmButtonText: string;
  public confirmTranslation: string = '';

  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
  ) {
    this.confirmButtonText = this.translate.get('GLOBAL.YES');
  }

  ngOnInit() {
    if (this.confirmTranslation) {
      this.confirmButtonText = this.confirmTranslation;
    }
  }

  confirm() {
    this.dialogService.closeDialog('confirm');
  }

  reject() {
    this.dialogService.closeDialog('reject');
  }

  cancel() {
    this.dialogService.closeDialog('cancel');
  }
}
