/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit } from '@angular/core';
import { DialogService, DialogContentI } from '@khiops-library/providers/dialog.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'kl-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  standalone: false,
})
export class DialogComponent implements OnInit {
  public dialogContent$: Observable<DialogContentI>;

  constructor(private dialogService: DialogService) {
    this.dialogContent$ = this.dialogService.dialogContent$;
  }

  ngOnInit(): void {
    // Dialog service is initialized in constructor
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.dialogService.closeDialog();
  }
}
