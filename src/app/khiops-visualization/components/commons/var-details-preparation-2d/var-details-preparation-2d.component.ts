/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, ViewChild } from '@angular/core';
import { AppService } from '@khiops-visualization/providers/app.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { TargetDistributionGraphComponent } from '../target-distribution-graph/target-distribution-graph.component';
import { Distribution2dDatasService } from '@khiops-visualization/providers/distribution2d-datas.service';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { LS } from '@khiops-library/enum/ls';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';

@Component({
    selector: 'app-var-details-preparation-2d',
    templateUrl: './var-details-preparation-2d.component.html',
    styleUrls: ['./var-details-preparation-2d.component.scss'],
    standalone: false
})
export class VarDetailsPreparation2dComponent {
  @ViewChild('targetDistributionGraph', {
    static: false,
  })
  private targetDistributionGraph?: TargetDistributionGraphComponent;

  public sizes: DynamicI;
  public preparation2dDatas?: Preparation2dDatasModel;
  public distribution2dDatas: DistributionDatasModel;
  public scaleValue: number = 0;
  private targetDistributionGraphType: string;

  constructor(
    private distribution2dDatasService: Distribution2dDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
    private layoutService: LayoutService,
  ) {
    this.targetDistributionGraphType = AppService.Ls.get(
      LS.TARGET_DISTRIBUTION_GRAPH_OPTION,
    );

    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
    this.distribution2dDatas = this.distribution2dDatasService.getDatas();

    this.sizes = this.layoutService.getViewSplitSizes('preparation2dView');
    this.distribution2dDatasService.getTargetDistributionGraphDatas(
      this.targetDistributionGraphType,
    );
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'preparation2dView',
    );
    this.resizeTargetDistributionGraph();
  }

  onSelectCellRowChanged() {
    this.distribution2dDatasService.getTargetDistributionGraphDatas(
      this.targetDistributionGraphType,
    );
    this.resizeTargetDistributionGraph();
  }

  resizeTargetDistributionGraph() {
    setTimeout(() => {
      // Resize to update graphs dimensions
      if (this.targetDistributionGraph) {
        this.targetDistributionGraph.resizeGraph();
      }
    }); // do it after view dom complete
  }

  onTargetDistributionGraphTypeChanged(type: string) {
    this.targetDistributionGraphType = type;
    this.distribution2dDatasService.getTargetDistributionGraphDatas(
      this.targetDistributionGraphType,
    );
  }
}
