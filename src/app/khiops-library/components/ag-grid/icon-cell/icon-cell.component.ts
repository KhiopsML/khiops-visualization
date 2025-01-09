/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';

import { AgRendererComponent } from '@ag-grid-community/angular';
import {
  ICellRendererParams,
} from '@ag-grid-community/core';

@Component({
  selector: 'kl-icon-cell',
  templateUrl: './icon-cell.component.html',
})
export class IconCellComponent implements AgRendererComponent {
  public params: any;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  afterGuiAttached(): void {}

  onClick(): void {
    this.params.action(this.params);
  }

  refresh(): boolean {
    return false;
  }
}
