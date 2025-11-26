/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { ViewLayoutVO } from '@khiops-covisualization/model/view-layout.model';
import cloneDeep from 'lodash-es/cloneDeep';
import { ViewManagerService } from '@khiops-covisualization/providers/view-manager.service';
import { MAT_RIPPLE_COLOR } from '@khiops-covisualization/config/colors';
import { DimensionViewLayoutModel } from '@khiops-covisualization/model/dimension-view-layout.model';

@Component({
  selector: 'app-manage-views',
  templateUrl: './manage-views.component.html',
  styleUrls: ['./manage-views.component.scss'],
  standalone: false,
})
export class ManageViewsComponent {
  public viewsLayout: ViewLayoutVO | undefined;
  public isDimVisible: boolean[] = [];
  public isContextView = true;
  public matRippleColor = MAT_RIPPLE_COLOR;

  constructor(
    private appService: AppService,
    private viewManagerService: ViewManagerService,
    private dialogService: DialogService,
  ) {
    this.viewsLayout = cloneDeep(this.viewManagerService.getViewsLayout());
    this.isContextView = this.appService.getActiveTabIndex() === 1;
    this.computeIsDimensionVisible();
  }

  onClickOnSave() {
    this.viewManagerService.saveViewsLayout(this.viewsLayout);
    this.dialogService.closeDialog();
  }

  onClickOnCancel() {
    this.dialogService.closeDialog();
  }

  toggleDimension(dimensionLayout: DimensionViewLayoutModel) {
    dimensionLayout.isChecked = !dimensionLayout.isChecked;
  }

  changeDimensionChecked(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Computes the visibility of dimension views layouts based on the active tab index.
   * If the active tab index is 0, hides views layouts of contexts (i.e., dimensions with index >= 2).
   * If the active tab index is 1, hides views layouts of selected dimensions (i.e., dimensions with index < 2).
   */
  private computeIsDimensionVisible() {
    this.isDimVisible = new Array(
      this.viewsLayout?.dimensionsViewsLayoutsVO.length,
    ).fill(true);
    for (
      let i = 0;
      i < this.viewsLayout!.dimensionsViewsLayoutsVO.length;
      i++
    ) {
      if (this.appService.getActiveTabIndex() === 0 && i >= 2) {
        // Hide views layouts of contexts
        this.isDimVisible[i] = false;
      } else if (this.appService.getActiveTabIndex() === 1 && i < 2) {
        // Hide views layouts of selected dimensions
        this.isDimVisible[i] = false;
      }
    }
  }
}
