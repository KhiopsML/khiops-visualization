import { Component } from '@angular/core';
import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'kl-border-text-cell',
  styleUrls: ['./border-text-cell.component.scss'],
  templateUrl: './border-text-cell.component.html',
})
export class BorderTextCellComponent implements AgRendererComponent {
  public params: ICellRendererParams | undefined;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }
}
