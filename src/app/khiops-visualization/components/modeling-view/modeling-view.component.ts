import { ViewChild, Component } from '@angular/core';
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
import { LevelDistributionGraphComponent } from '@khiops-visualization/components/commons/level-distribution-graph/level-distribution-graph.component';
import { VariableGraphDetailsComponent } from '@khiops-visualization/components/commons/variable-graph-details/variable-graph-details.component';
import { TargetDistributionGraphComponent } from '@khiops-visualization/components/commons/target-distribution-graph/target-distribution-graph.component';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { Distribution2dDatasService } from '@khiops-visualization/providers/distribution2d-datas.service';
import { REPORTS } from '@khiops-library/enum/reports';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ModelingDatasModel } from '@khiops-visualization/model/modeling-datas.model';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { LS } from '@khiops-library/enum/ls';

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
  @ViewChild('targetDistributionGraph', {
    static: false,
  })
  targetDistributionGraph: TargetDistributionGraphComponent;
  preparationSource: string;
  appDatas: any;
  sizes: any;
  preparationVariable: any; // Complex, can be multiple types according to the preparationSource
  summaryDatas: InfosDatasI[];
  targetVariableStatsDatas: ChartDatasModel;
  trainedPredictorsSummaryDatas: InfosDatasI[];
  modelingDatas: ModelingDatasModel;
  preparation2dDatas: Preparation2dDatasModel;
  treePreparationDatas: TreePreparationDatasModel;
  matrixRegSelectedCell = 0;
  distributionSelectedBarIndex = 0;
  trainedPredictorsDisplayedColumns: GridColumnsI[];
  isRegressionOrExplanatoryAnalysis: boolean;
  scaleValue: number;
  targetDistributionGraphDatas: ChartDatasModel;
  currentIntervalDatas: GridDatasI;
  targetVariableStatsInformations: InfosDatasI[];

  // managed by selectable-tab component
  override tabIndex = 3;

  constructor(
    private modelingDatasService: ModelingDatasService,
    private evaluationDatasService: EvaluationDatasService,
    private trackerService: TrackerService,
    private preparation2dDatasService: Preparation2dDatasService,
    private appService: AppService,
    private dialog: MatDialog,
    private distribution2dDatasService: Distribution2dDatasService,
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
  ) {
    super();
    this.scaleValue = AppService.Ls.get(
      LS.SCALE_VALUE,
      AppConfig.visualizationCommon.GLOBAL.DEFAULT_GRAPH_SCALE,
    );
    this.preparationSource =
      this.preparationDatasService.getAvailablePreparationReport();
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'modeling');

    this.preparationSource =
      this.preparationDatasService.getAvailablePreparationReport();

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
      } else {
        // Select trained predictor auto redirection #202
        this.onSelectListItemChanged(isVarAvailable);
      }
    } else {
      // no modeling datas
      this.modelingDatasService.removeSelectedVariable();
    }
  }

  onSelectListItemChanged(item: any) {
    // Get var from name
    if (item.name?.includes('Tree_')) {
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
      if (item.name?.includes('`')) {
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
    const dialogRef: MatDialogRef<LevelDistributionGraphComponent> =
      this.dialog.open(LevelDistributionGraphComponent, config);
    dialogRef.componentInstance.datas = datas;
  }

  resizeTargetDistributionGraph() {
    setTimeout(() => {
      // Resize to update graphs dimensions
      if (this.targetDistributionGraph) {
        this.targetDistributionGraph.resizeGraph();
      }
    }); // do it after view dom complete
  }
}
