import { Component } from '@angular/core';

import { AgRendererComponent } from '@ag-grid-community/angular';
import {
  IAfterGuiAttachedParams,
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

  afterGuiAttached(params?: IAfterGuiAttachedParams): void {}

  onClick(): void {
    this.params.action(this.params);
  }

  refresh(params: any): boolean {
    return false;
  }
}