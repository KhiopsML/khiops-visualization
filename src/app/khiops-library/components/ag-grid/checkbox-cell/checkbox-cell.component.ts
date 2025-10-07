/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';

import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { GridCheckboxEventI } from '@khiops-library/interfaces/events';

@Component({
  selector: 'kl-checkbox-cell',
  templateUrl: './checkbox-cell.component.html',
  standalone: false,
})
export class CheckboxCellComponent implements AgRendererComponent {
  public params: ICellRendererParams | undefined;
  private currentValue: any;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.currentValue = params.value;
  }

  refresh(params: any): boolean {
    // Only refresh if the value has actually changed
    if (this.currentValue === params.value) {
      return false;
    }

    this.currentValue = params.value;

    if (this.params?.colDef?.field) {
      params.data[this.params.colDef.field] = params.value;
      const event: GridCheckboxEventI = {
        data: this.params.node.data,
        field: this.params.colDef.field,
        state: params.value,
      };
      this.params.context.componentParent.toggleGridCheckbox(event);
    }

    return true; // Return true to refresh the cell content
  }
}
