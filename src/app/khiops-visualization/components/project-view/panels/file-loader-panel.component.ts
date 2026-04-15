/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-file-loader-panel',
  template: `
    <h1 fxLayout="row" fxLayoutAlign="start start">
      <mat-icon>folder_open</mat-icon>
      {{ 'GLOBAL.LOAD_DATAS' | translate }}
    </h1>
    <kl-file-loader></kl-file-loader>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }
    `,
  ],
  standalone: false,
})
export class FileLoaderPanelComponent {}
