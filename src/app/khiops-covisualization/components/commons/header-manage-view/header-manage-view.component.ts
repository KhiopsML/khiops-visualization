import {
	Component,
	Output,
	EventEmitter,
	OnInit
} from '@angular/core';
import {
	DimensionsDatasService
} from 'src/app/providers/dimensions-datas.service';
import {
	MatDialogRef,
	MatDialog,
	MatDialogConfig
} from '@angular/material/dialog';
import {
	AppConfig
} from 'src/environments/environment';
import {
	UnfoldHierarchyComponent
} from '../unfold-hierarchy/unfold-hierarchy.component';
import {
	ManageViewsComponent
} from '../manage-views/manage-views.component';
import * as _ from 'lodash'; // Important to import lodash in karma
import {
	ImportExtDatasListComponent
} from '../import-ext-datas-list/import-ext-datas-list.component';

@Component({
	selector: 'app-header-manage-view',
	templateUrl: './header-manage-view.component.html',
	styleUrls: ['./header-manage-view.component.scss']
})
export class HeaderManageViewComponent implements OnInit {

	@Output() toggleContext: EventEmitter < any > = new EventEmitter();
	@Output() toggleUnfoldHierarchy: EventEmitter < any > = new EventEmitter();
	dimensionsDatas: any;

	constructor(private dialog: MatDialog,
		private dimensionsService: DimensionsDatasService) {}

	ngOnInit() {}

	clickUnfodHierarchy() {
		this.dimensionsDatas = this.dimensionsService.getDatas();
		const config = new MatDialogConfig();
		config.width = AppConfig.common.UNFOLD_HIERARCHY.WIDTH;
		config.height = AppConfig.common.UNFOLD_HIERARCHY.HEIGHT;
		const dialogRef: MatDialogRef < UnfoldHierarchyComponent > = this.dialog.open(UnfoldHierarchyComponent, config);
		// dialogRef.componentInstance.hierarchyDatas = copy(this.dimensionsDatas.hierarchyDatas);
		// dialogRef.componentInstance.hierarchyDatas = _.cloneDeep(this.dimensionsDatas.hierarchyDatas);
		dialogRef.afterClosed().toPromise().then(() => {});
	}

	clickManageLayout() {
		this.dimensionsDatas = this.dimensionsService.getDatas();
		const config = new MatDialogConfig();
		config.width = AppConfig.common.MANAGE_VIEWS.WIDTH;
		config.maxWidth = AppConfig.common.MANAGE_VIEWS.MAX_WIDTH;
		// config.height = AppConfig.common.MANAGE_VIEWS.HEIGHT;
		const dialogRef: MatDialogRef < ManageViewsComponent > = this.dialog.open(ManageViewsComponent, config);
		// dialogRef.componentInstance.hierarchyDatas = copy(this.dimensionsDatas.hierarchyDatas);
		dialogRef.afterClosed().toPromise().then(() => {
			// this.eventsService.emitDimensionsDatasChanged();
		});
	}

	clickImportExternalData() {
		this.dimensionsDatas = this.dimensionsService.getDatas();
		const config = new MatDialogConfig();
		config.width = AppConfig.common.MANAGE_VIEWS.WIDTH;
		config.maxWidth = AppConfig.common.MANAGE_VIEWS.MAX_WIDTH;
		// const dialogRef: MatDialogRef < ImportExtDatasComponent > = this.dialog.open(ImportExtDatasComponent, config);
		const dialogRef: MatDialogRef < ImportExtDatasListComponent > = this.dialog.open(ImportExtDatasListComponent, config);
		dialogRef.disableClose = true;
		dialogRef.afterClosed().toPromise().then(() => {});
	}

}
