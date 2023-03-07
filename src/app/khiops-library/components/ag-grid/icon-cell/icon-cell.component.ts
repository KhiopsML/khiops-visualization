import {
	Component
} from '@angular/core';
import {
	ICellRendererParams, IAfterGuiAttachedParams
} from '@ag-grid-community/all-modules';
import {
	AgRendererComponent
} from '@ag-grid-community/angular';

@Component({
	selector: 'kl-icon-cell',
	templateUrl: './icon-cell.component.html'
})
export class IconCellComponent implements AgRendererComponent {

	public params: any;

	constructor() {

	}

	agInit(params: ICellRendererParams): void {
		this.params = params;
	}

	afterGuiAttached(params ?: IAfterGuiAttachedParams): void {}

	onClick(): void {
		this.params.action(this.params);
	}

	refresh(params: any): boolean {
		return false;
	}
}
