/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DialogContentI {
  type: 'levelDistribution' | 'none';
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogContentSubject = new BehaviorSubject<DialogContentI>({
    type: 'none',
  });

  public dialogContent$: Observable<DialogContentI> =
    this.dialogContentSubject.asObservable();

  constructor() {}

  /**
   * Show level distribution dialog
   * @param data the distribution data to display
   */
  showLevelDistributionDialog(data: any): void {
    this.dialogContentSubject.next({
      type: 'levelDistribution',
      data: data,
    });
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.dialogContentSubject.next({
      type: 'none',
    });
  }

  /**
   * Get current dialog content
   */
  getDialogContent(): DialogContentI {
    return this.dialogContentSubject.value;
  }
}
