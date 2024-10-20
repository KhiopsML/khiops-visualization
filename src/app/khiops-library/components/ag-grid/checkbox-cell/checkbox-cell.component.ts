import { Component } from '@angular/core';

import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'kl-checkbox-cell',
  templateUrl: './checkbox-cell.component.html',
})
export class CheckboxCellComponent implements AgRendererComponent {
  public params: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    if (this.params.colDef?.field) {
      params.data[this.params.colDef.field] = params.value;
      this.params.context.componentParent.toggleGridCheckbox({
        data: this.params.node.data,
        field: this.params.colDef.field,
        state: params.value,
      });

      params.api.refreshCells(params);
    }

    return false;
  }
}
