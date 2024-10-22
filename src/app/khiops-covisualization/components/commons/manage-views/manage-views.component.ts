import { Component } from '@angular/core';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ViewLayoutVO } from '@khiops-covisualization/model/view-layout.model';
import * as _ from 'lodash'; // Important to import lodash in karma
import { ViewManagerService } from '@khiops-covisualization/providers/view-manager.service';
import { MAT_RIPPLE_COLOR } from '@khiops-covisualization/config/colors';

@Component({
  selector: 'app-manage-views',
  templateUrl: './manage-views.component.html',
  styleUrls: ['./manage-views.component.scss'],
})
export class ManageViewsComponent {
  public viewsLayout: ViewLayoutVO;
  public isDimVisible: boolean[];
  public isContextView = true;
  public matRippleColor = MAT_RIPPLE_COLOR;

  constructor(
    private appService: AppService,
    private viewManagerService: ViewManagerService,
    private dialogRef: MatDialogRef<ManageViewsComponent>,
  ) {
    this.viewsLayout = _.cloneDeep(this.viewManagerService.getViewsLayout());
    this.isContextView = this.appService.getActiveTabIndex() === 1;
    this.computeIsDimensionVisible();
  }

  onClickOnSave() {
    this.viewManagerService.saveViewsLayout(this.viewsLayout);
    this.dialogRef.close();
  }

  onClickOnCancel() {
    this.dialogRef.close();
  }

  toggleDimension(dimensionLayout): boolean {
    dimensionLayout.isChecked = !dimensionLayout.isChecked;
    return false;
  }

  /**
   * Computes the visibility of dimension views layouts based on the active tab index.
   * If the active tab index is 0, hides views layouts of contexts (i.e., dimensions with index >= 2).
   * If the active tab index is 1, hides views layouts of selected dimensions (i.e., dimensions with index < 2).
   */
  private computeIsDimensionVisible() {
    this.isDimVisible = new Array(
      this.viewsLayout.dimensionsViewsLayoutsVO.length,
    ).fill(true);
    for (let i = 0; i < this.viewsLayout.dimensionsViewsLayoutsVO.length; i++) {
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
