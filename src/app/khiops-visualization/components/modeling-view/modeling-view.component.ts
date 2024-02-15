import { ViewChild, Component } from '@angular/core';
import _ from 'lodash';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { AppService } from '@khiops-visualization/providers/app.service';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { AppConfig } from 'src/environments/environment';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { LevelDistributionGraphCanvasComponent } from '@khiops-visualization/components/commons/level-distribution-graph-canvas/level-distribution-graph-canvas.component';
import { VariableGraphDetailsComponent } from '@khiops-visualization/components/commons/variable-graph-details/variable-graph-details.component';
import { TargetDistributionGraphCanvasComponent } from '@khiops-visualization/components/commons/target-distribution-graph-canvas/target-distribution-graph-canvas.component';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { Distribution2dDatasService } from '@khiops-visualization/providers/distribution2d-datas.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { REPORTS } from '@khiops-library/enum/reports';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ModelingDatasVO } from '@khiops-visualization/model/modeling-datas-vo';
import { Preparation2dDatasVO } from '@khiops-visualization/model/preparation2d-datas-vo';
import { TreePreparationDatasVO } from '@khiops-visualization/model/tree-preparation-datas-vo';

@Component({
  selector: 'app-modeling-view',
  templateUrl: './modeling-view.component.html',
  styleUrls: ['./modeling-view.component.scss'],
})
export class ModelingViewComponent extends SelectableTabComponent {
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  appVariableGraphDetails: VariableGraphDetailsComponent;

  @ViewChild('targetDistributionGraphCanvas', {
    static: false,
  })
  targetDistributionGraphCanvas: TargetDistributionGraphCanvasComponent;

  preparationSource =
    this.preparationDatasService.getAvailablePreparationReport();

  appDatas: any;
  sizes: any;

  preparationVariable: any; // Complex, can be multiple types according to the preparationSource

  summaryDatas: InfosDatasI[];
  targetVariableStatsDatas: ChartDatasVO;
  trainedPredictorsSummaryDatas: InfosDatasI[];
  modelingDatas: ModelingDatasVO;
  preparation2dDatas: Preparation2dDatasVO;
  treePreparationDatas: TreePreparationDatasVO;
  matrixRegSelectedCell = 0;
  distributionSelectedBarIndex = 0;
  trainedPredictorsDisplayedColumns: GridColumnsI[];
  isRegressionOrExplanatoryAnalysis: boolean;
  scaleValue =
    localStorage.getItem(
      AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SCALE_VALUE',
    ) || AppConfig.visualizationCommon.GLOBAL.DEFAULT_GRAPH_SCALE;
  targetDistributionGraphDatas: ChartDatasVO;
  currentIntervalDatas: GridDatasI;
  targetVariableStatsInformations: InfosDatasI[];

  // managed by selectable-tab component
  override tabIndex = 3;

  constructor(
    private modelingDatasService: ModelingDatasService,
    private evaluationDatasService: EvaluationDatasService,
    private khiopsLibraryService: KhiopsLibraryService,
    private preparation2dDatasService: Preparation2dDatasService,
    private appService: AppService,
    private dialog: MatDialog,
    private distribution2dDatasService: Distribution2dDatasService,
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
  ) {
    super();
  }

  ngOnInit() {
    this.khiopsLibraryService.trackEvent('page_view', 'modeling');

    this.appDatas = this.appService.getDatas();
    this.modelingDatas = this.modelingDatasService.getDatas();
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
    this.sizes = this.appService.getViewSplitSizes('modelingView');

    this.summaryDatas = this.modelingDatasService.getSummaryDatas();
    this.targetVariableStatsDatas =
      this.preparationDatasService.getTargetVariableStatsDatas();
    this.targetVariableStatsInformations =
      this.preparationDatasService.getTargetVariableStatsInformations();
    this.trainedPredictorsSummaryDatas =
      this.modelingDatasService.getTrainedPredictorsSummaryDatas();

    this.isRegressionOrExplanatoryAnalysis =
      this.preparationDatasService.isExplanatoryAnalysis() ||
      this.evaluationDatasService.isRegressionAnalysis();
  }

  onSplitDragEnd(event, item?) {
    this.appService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'modelingView',
    );

    // Resize to update graphs dimensions
    if (this.appVariableGraphDetails) {
      this.appVariableGraphDetails.resize();
    }
    this.resizeTargetDistributionGraph();
  }

  onSelectedPredictorChanged(value) {
    this.modelingDatasService.setSelectedPredictor(value);
    this.modelingDatasService.getTrainedPredictorListDatas();
    this.trainedPredictorsDisplayedColumns =
      this.modelingDatasService.getTrainedPredictorDisplayedColumns();

    // Check if selected variable from another tab is available into current modeling datas.
    // Otherwise, select a new one
    if (
      this.modelingDatas.trainedPredictorsListDatas &&
      this.modelingDatas.selectedVariable
    ) {
      const isVarAvailable = this.modelingDatas.trainedPredictorsListDatas.find(
        (e) => e.name === this.modelingDatas.selectedVariable.name,
      );
      if (!isVarAvailable) {
        this.onSelectListItemChanged(
          this.modelingDatas.trainedPredictorsListDatas[0],
        );
      }
    } else {
      // no modeling datas
      this.modelingDatasService.removeSelectedVariable();
    }
  }

  onSelectListItemChanged(item: any) {
    // Get var from name
    if (item.name && item.name.includes('Tree_')) {
      this.preparationSource = REPORTS.TREE_PREPARATION_REPORT;
      this.preparationVariable =
        this.treePreparationDatasService.setSelectedVariable(item);
      this.currentIntervalDatas =
        this.treePreparationDatasService.getCurrentIntervalDatas(
          this.distributionSelectedBarIndex,
        );
    } else {
      this.preparationSource =
        this.preparationDatasService.getPreparationSourceFromVariable(item);
      if (item.name && item.name.includes('`')) {
        // Check the case of 2d variable : names are separated by `
        item.name1 = item.name.split('`')[0];
        item.name2 = item.name.split('`')[1];
        this.preparationVariable =
          this.preparation2dDatasService.setSelectedVariable(item);
      } else {
        this.preparationVariable =
          this.preparationDatasService.setSelectedVariable(
            item,
            this.preparationSource,
          );
      }
      this.currentIntervalDatas =
        this.preparationDatasService.getCurrentIntervalDatas(
          this.preparationSource,
          this.distributionSelectedBarIndex,
        );
    }

    this.modelingDatasService.setSelectedVariable(this.preparationVariable);

    // check if current variable is explanatory on change
    this.isRegressionOrExplanatoryAnalysis =
      this.preparationDatasService.isExplanatoryAnalysis() ||
      this.evaluationDatasService.isRegressionAnalysis();

    // do it async if previous var was not 2d and chart was not initialized
    this.targetDistributionGraphDatas =
      this.distribution2dDatasService.getTargetDistributionGraphDatas();
  }

  onShowLevelDistributionGraph(datas: any) {
    const config = new MatDialogConfig();
    config.width = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
    config.height =
      AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
    const dialogRef: MatDialogRef<LevelDistributionGraphCanvasComponent> =
      this.dialog.open(LevelDistributionGraphCanvasComponent, config);
    dialogRef.componentInstance.datas = datas;
  }

  resizeTargetDistributionGraph() {
    setTimeout(() => {
      // Resize to update graphs dimensions
      if (this.targetDistributionGraphCanvas) {
        this.targetDistributionGraphCanvas.resizeGraph();
      }
    }); // do it after view dom complete
  }
}
