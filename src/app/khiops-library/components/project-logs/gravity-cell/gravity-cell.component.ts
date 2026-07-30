/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'kl-gravity-cell',
  templateUrl: './gravity-cell.component.html',
  styleUrls: ['./gravity-cell.component.scss'],
  imports: [NgClass],
})
export class GravityCellComponent implements AgRendererComponent {
  public params: ICellRendererParams | undefined;
  public gravityValue = signal('info');
  public gravityClass = computed(() => {
    const gravity = this.gravityValue().toLowerCase();

    if (gravity === 'error') {
      return 'gravity-error';
    }

    if (gravity === 'warning') {
      return 'gravity-warning';
    }

    return 'gravity-default';
  });

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.gravityValue.set(String(params.value || 'info'));
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    this.gravityValue.set(String(params.value || 'info'));
    return true;
  }
}
