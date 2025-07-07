/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-gravity-cell',
  templateUrl: './gravity-cell.component.html',
  styleUrls: ['./gravity-cell.component.scss'],
  standalone: false,
})
export class GravityCellComponent implements AgRendererComponent {
  public params: ICellRendererParams | undefined;
  public gravityValue: string = '';
  public gravityClass: string = '';

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.gravityValue = params.value || '';
    this.setGravityClass();
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    this.gravityValue = params.value || '';
    this.setGravityClass();
    return true;
  }

  private setGravityClass(): void {
    const gravity = this.gravityValue.toLowerCase();
    if (gravity === 'error') {
      this.gravityClass = 'gravity-error';
    } else if (gravity === 'warning') {
      this.gravityClass = 'gravity-warning';
    } else {
      this.gravityClass = 'gravity-default';
    }
  }
}
