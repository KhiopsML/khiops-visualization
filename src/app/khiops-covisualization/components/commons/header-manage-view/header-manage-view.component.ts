import { Component, Output, EventEmitter } from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { AppConfig } from 'src/environments/environment';
import { UnfoldHierarchyComponent } from '../unfold-hierarchy/unfold-hierarchy.component';
import { ManageViewsComponent } from '../manage-views/manage-views.component';
import * as _ from 'lodash'; // Important to import lodash in karma
import { ImportExtDatasListComponent } from '../import-ext-datas-list/import-ext-datas-list.component';
import { DimensionsDatasVO } from '@khiops-covisualization/model/dimensions-data-vo';

@Component({
  selector: 'app-header-manage-view',
  templateUrl: './header-manage-view.component.html',
  styleUrls: ['./header-manage-view.component.scss'],
})
export class HeaderManageViewComponent {
  @Output() toggleContext: EventEmitter<any> = new EventEmitter();
  @Output() toggleUnfoldHierarchy: EventEmitter<any> = new EventEmitter();
  dimensionsDatas: DimensionsDatasVO;

  constructor(
    private dialog: MatDialog,
    private dimensionsService: DimensionsDatasService,
  ) {}

  clickUnfodHierarchy() {
    this.dimensionsDatas = this.dimensionsService.getDatas();
    const config = new MatDialogConfig();
    config.width = AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.WIDTH;
    config.height = AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.HEIGHT;
    const dialogRef: MatDialogRef<UnfoldHierarchyComponent> = this.dialog.open(
      UnfoldHierarchyComponent,
      config,
    );
    dialogRef
      .afterClosed()
      .toPromise()
      .then(() => {});
  }

  clickManageLayout() {
    this.dimensionsDatas = this.dimensionsService.getDatas();
    const config = new MatDialogConfig();
    config.width = AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH;
    config.maxWidth = AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH;
    const dialogRef: MatDialogRef<ManageViewsComponent> = this.dialog.open(
      ManageViewsComponent,
      config,
    );
    dialogRef
      .afterClosed()
      .toPromise()
      .then(() => {});
  }

  clickImportExternalData() {
    this.dimensionsDatas = this.dimensionsService.getDatas();
    const config = new MatDialogConfig();
    config.width = AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH;
    config.maxWidth = AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH;
    const dialogRef: MatDialogRef<ImportExtDatasListComponent> =
      this.dialog.open(ImportExtDatasListComponent, config);
    dialogRef.disableClose = true;
    dialogRef
      .afterClosed()
      .toPromise()
      .then(() => {});
  }
}
