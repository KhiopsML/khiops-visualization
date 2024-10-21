import {
  Component,
  OnInit,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AppService } from '@khiops-visualization/providers/app.service';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { VariableGraphDetailsComponent } from '../variable-graph-details/variable-graph-details.component';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { LayoutService } from '@khiops-library/providers/layout.service';

@Component({
  selector: 'app-var-details-preparation',
  templateUrl: './var-details-preparation.component.html',
  styleUrls: ['./var-details-preparation.component.scss'],
})
export class VarDetailsPreparationComponent implements OnInit, OnChanges {
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  appVariableGraphDetails: VariableGraphDetailsComponent;

  @Input() preparationSource: string;

  isRegressionOrExplanatoryAnalysis: boolean;
  preparationDatas: {
    selectedVariable: PreparationVariableModel;
    currentIntervalDatas: GridDatasI;
  };
  appDatas: any;
  sizes: any;

  summaryDatas: InfosDatasI[];
  informationsDatas: InfosDatasI[];
  targetVariableStatsDatas: ChartDatasModel;
  currentIntervalDatas: GridDatasI;
  matrixRegSelectedCell = 0;
  distributionSelectedBarIndex = 0;
  preparation2dDatas: Preparation2dDatasModel;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private evaluationDatasService: EvaluationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
    private layoutService: LayoutService,
    private appService: AppService,
  ) {}

  ngOnInit() {
    this.appDatas = this.appService.getDatas().datas;
    this.sizes = this.layoutService.getViewSplitSizes('preparationView');
    this.isRegressionOrExplanatoryAnalysis =
      this.preparationDatasService.isExplanatoryAnalysis() ||
      this.evaluationDatasService.isRegressionAnalysis();
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.preparationDatas = this.preparationDatasService.getDatas(
      this.preparationSource,
    );
  }

  onSplitDragEnd(event: any, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'preparationView',
    );

    // Resize to update graphs dimensions
    if (this.appVariableGraphDetails) {
      this.appVariableGraphDetails.resize();
    }
  }

  onSelectedMatrixCellChanged(index: number) {
    this.matrixRegSelectedCell = index;

    // Callback when user click on matrix cell to select corresponding bar distribution
    this.distributionSelectedBarIndex =
      this.preparation2dDatasService.computeDistributionIndexFromMatrixCellIndex(
        index,
      );
  }

  onSelectedGraphItemChanged(index: number) {
    // Keep in memory to keep bar charts index on type change
    this.distributionSelectedBarIndex = index;

    // Callback when user click on bar distribution to select matrix corresponding cell
    if (this.isRegressionOrExplanatoryAnalysis) {
      this.matrixRegSelectedCell = index;
    } else {
      // get interval data if no matrix
      this.preparationDatasService.getCurrentIntervalDatas(
        this.preparationSource,
        index,
      );
    }
  }
}
