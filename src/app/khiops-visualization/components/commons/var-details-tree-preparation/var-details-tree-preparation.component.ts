import { Component, ViewChild } from '@angular/core';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { VariableGraphDetailsComponent } from '../variable-graph-details/variable-graph-details.component';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';

@Component({
  selector: 'app-var-details-tree-preparation',
  templateUrl: './var-details-tree-preparation.component.html',
  styleUrls: ['./var-details-tree-preparation.component.scss'],
})
export class VarDetailsTreePreparationComponent {
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  private appVariableGraphDetails: VariableGraphDetailsComponent;
  public treePreparationDatas: TreePreparationDatasModel;
  public sizes: DynamicI;
  public selectedBarIndex = 0;

  constructor(
    private treePreparationDatasService: TreePreparationDatasService,
    private layoutService: LayoutService,
  ) {
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.sizes = this.layoutService.getViewSplitSizes('treePreparationView');

    this.onSelectedGraphItemChanged(0);
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'treePreparationView',
    );

    // Resize to update graphs dimensions
    if (this.appVariableGraphDetails) {
      this.appVariableGraphDetails.resize();
    }
  }

  onSelectedGraphItemChanged(index: number) {
    // Keep in memory to keep bar charts index on type change
    this.selectedBarIndex = index;
    const currentIntervalDatas =
      this.treePreparationDatasService.getCurrentIntervalDatas(
        this.selectedBarIndex,
      );
    this.treePreparationDatasService.setSelectedNodes(
      currentIntervalDatas.values.map((e) => e.values),
    );
  }
}
