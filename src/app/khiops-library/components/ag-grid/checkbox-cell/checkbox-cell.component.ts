import { Component } from '@angular/core';

import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { GridCheckboxEventI } from '@khiops-library/interfaces/events';

@Component({
  selector: 'kl-checkbox-cell',
  templateUrl: './checkbox-cell.component.html',
})
export class CheckboxCellComponent implements AgRendererComponent {
  public params: ICellRendererParams | undefined;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    if (this.params?.colDef?.field) {
      params.data[this.params.colDef.field] = params.value;
      const event: GridCheckboxEventI = {
        data: this.params.node.data,
        field: this.params.colDef.field,
        state: params.value,
      };
      this.params.context.componentParent.toggleGridCheckbox(event);

      params.api.refreshCells(params);
    }

    return false;
  }
}
