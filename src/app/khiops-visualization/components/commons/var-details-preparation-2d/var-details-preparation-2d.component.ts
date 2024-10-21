import { Component, ViewChild } from '@angular/core';
import { AppService } from '@khiops-visualization/providers/app.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { TargetDistributionGraphComponent } from '../target-distribution-graph/target-distribution-graph.component';
import { AppConfig } from 'src/environments/environment';
import { Distribution2dDatasService } from '@khiops-visualization/providers/distribution2d-datas.service';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { LS } from '@khiops-library/enum/ls';

@Component({
  selector: 'app-var-details-preparation-2d',
  templateUrl: './var-details-preparation-2d.component.html',
  styleUrls: ['./var-details-preparation-2d.component.scss'],
})
export class VarDetailsPreparation2dComponent {
  @ViewChild('targetDistributionGraph', {
    static: false,
  })
  targetDistributionGraph: TargetDistributionGraphComponent;
  appDatas: any;
  sizes: any;
  preparation2dDatas: Preparation2dDatasModel;
  distribution2dDatas: DistributionDatasModel;
  scaleValue: number;
  currentCellIndex: number;
  targetDistributionGraphType: string;

  constructor(
    private distribution2dDatasService: Distribution2dDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
    private appService: AppService,
  ) {
    this.scaleValue = AppService.Ls.get(
      LS.SCALE_VALUE,
      AppConfig.visualizationCommon.GLOBAL.DEFAULT_GRAPH_SCALE,
    );
    this.targetDistributionGraphType = AppService.Ls.get(
      LS.TARGET_DISTRIBUTION_GRAPH_OPTION,
    );

    this.appDatas = this.appService.getDatas().datas;
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
    this.distribution2dDatas = this.distribution2dDatasService.getDatas();

    this.sizes = this.appService.getViewSplitSizes('preparation2dView');
    this.distribution2dDatasService.getTargetDistributionGraphDatas(
      this.targetDistributionGraphType,
    );
  }

  onSplitDragEnd(event: any, item: string) {
    this.appService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'preparation2dView',
    );
    this.resizeTargetDistributionGraph();
  }

  onSelectCellRowChanged(index: number) {
    this.currentCellIndex = index;
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
