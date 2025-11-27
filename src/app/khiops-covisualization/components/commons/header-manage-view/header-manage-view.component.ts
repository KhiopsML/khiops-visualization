/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { DialogService } from '@khiops-library/providers/dialog.service';
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
  constructor(private dialogService: DialogService) {}

  clickUnfodHierarchy() {
    this.dialogService.openDialog(UnfoldHierarchyComponent, {
      width: AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.WIDTH,
      height: AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.HEIGHT,
      panelClass: 'unfold-hierarchy-dialog-container',
    });
  }

  clickManageLayout() {
    this.dialogService.openDialog(ManageViewsComponent, {
      width: AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH,
      maxWidth: AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH,
    });
  }

  clickImportExternalData() {
    this.dialogService.openDialog(ImportExtDatasListComponent, {
      width: AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH,
      maxWidth: AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH,
      disableClose: true,
    });
  }
}
