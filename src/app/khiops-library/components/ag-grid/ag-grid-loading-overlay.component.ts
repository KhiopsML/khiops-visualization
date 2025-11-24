/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { ILoadingOverlayAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-ag-grid-loading-overlay',
  template: `<mat-spinner
    diameter="40"
    color="accent"
    mode="indeterminate"
  ></mat-spinner>`,
  standalone: false,
})
export class AgGridLoadingOverlayComponent
  implements ILoadingOverlayAngularComp
{
  agInit(): void {
    // Component initialized
  }
}
