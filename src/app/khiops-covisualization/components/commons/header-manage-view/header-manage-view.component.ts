/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { AppConfig } from '../../../../../environments/environment';
import { UnfoldHierarchyComponent } from '../unfold-hierarchy/unfold-hierarchy.component';
import { ManageViewsComponent } from '../manage-views/manage-views.component';
import { ImportExtDatasListComponent } from '../import-ext-datas-list/import-ext-datas-list.component';

@Component({
  selector: 'app-header-manage-view',
  templateUrl: './header-manage-view.component.html',
  styleUrls: ['./header-manage-view.component.scss'],
  standalone: false,
})
export class HeaderManageViewComponent {
  constructor(private dialog: MatDialog) {}

  clickUnfodHierarchy() {
    const config = new MatDialogConfig();
    config.width = AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.WIDTH;
    config.height = AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.HEIGHT;
    config.maxWidth = 'unset';
    config.panelClass = 'unfold-hierarchy-dialog-container';
    this.dialog.open(UnfoldHierarchyComponent, config);
  }

  clickManageLayout() {
    const config = new MatDialogConfig();
    config.width = AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH;
    config.maxWidth = AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH;
    this.dialog.open(ManageViewsComponent, config);
  }

  clickImportExternalData() {
    const config = new MatDialogConfig();
    config.width = AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH;
    config.maxWidth = AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH;
    const dialogRef: MatDialogRef<ImportExtDatasListComponent> =
      this.dialog.open(ImportExtDatasListComponent, config);
    dialogRef.disableClose = true;
  }
}
