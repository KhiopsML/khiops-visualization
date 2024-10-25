import { Component } from '@angular/core';
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
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { LevelDistributionGraphComponent } from '@khiops-visualization/components/commons/level-distribution-graph/level-distribution-graph.component';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { REPORTS } from '@khiops-library/enum/reports';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ModelingDatasModel } from '@khiops-visualization/model/modeling-datas.model';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { TrainedPredictorModel } from '@khiops-visualization/model/trained-predictor.model';
import { VariableModel } from '@khiops-visualization/model/variable.model';

@Component({
  selector: 'app-modeling-view',
  templateUrl: './modeling-view.component.html',
  styleUrls: ['./modeling-view.component.scss'],
})
export class ModelingViewComponent extends SelectableTabComponent {
  public preparationSource: string;
  public appDatas: any;
  public sizes: any;
  public summaryDatas: InfosDatasI[];
  public targetVariableStatsDatas: ChartDatasModel;
  public trainedPredictorsSummaryDatas: InfosDatasI[];
  public modelingDatas: ModelingDatasModel;
  public trainedPredictorsDisplayedColumns: GridColumnsI[];
  public targetVariableStatsInformations: InfosDatasI[];
  public override tabIndex = 3; // managed by selectable-tab component

  private preparationVariable: any; // Complex, can be multiple types according to the preparationSource

  constructor(
    private modelingDatasService: ModelingDatasService,
    private trackerService: TrackerService,
    private preparation2dDatasService: Preparation2dDatasService,
    private appService: AppService,
    private dialog: MatDialog,
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
    private layoutService: LayoutService,
  ) {
    super();

    this.preparationSource =
      this.preparationDatasService.getAvailablePreparationReport();
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'modeling');

    this.preparationSource =
      this.preparationDatasService.getAvailablePreparationReport();

    this.appDatas = this.appService.getDatas();
    this.modelingDatas = this.modelingDatasService.getDatas();
    this.sizes = this.layoutService.getViewSplitSizes('modelingView');

    this.summaryDatas = this.modelingDatasService.getSummaryDatas();
    this.targetVariableStatsDatas =
      this.preparationDatasService.getTargetVariableStatsDatas();
    this.targetVariableStatsInformations =
      this.preparationDatasService.getTargetVariableStatsInformations();
    this.trainedPredictorsSummaryDatas =
      this.modelingDatasService.getTrainedPredictorsSummaryDatas();
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'modelingView',
    );
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
    console.log(
      'ModelingViewComponent ~ onSelectListItemChanged ~ item:',
      item,
    );
    // Get var from name
    if (item.name?.includes('Tree_')) {
      this.preparationSource = REPORTS.TREE_PREPARATION_REPORT;
      this.preparationVariable =
        this.treePreparationDatasService.setSelectedVariable(item.name);
    } else {
      this.preparationSource =
        this.preparationDatasService.getPreparationSourceFromVariable(item);
      if (item.name?.includes('`')) {
        // Check the case of 2d variable : names are separated by `
        this.preparationVariable =
          this.preparation2dDatasService.setSelectedVariable(
            item.name.split('`')[0],
            item.name.split('`')[1],
          );
      } else {
        this.preparationVariable =
          this.preparationDatasService.setSelectedVariable(
            item.name,
            this.preparationSource,
          );
      }
    }

    this.modelingDatasService.setSelectedVariable(this.preparationVariable);
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
}
