/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ModelingDatasModel } from '@khiops-visualization/model/modeling-datas.model';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { AppService } from '../../../khiops-visualization/providers/app.service';
import { TrainedPredictor } from '@khiops-visualization/interfaces/modeling-report';
import { DistributionService } from '@khiops-visualization/providers/distribution.service';
import { LevelDistributionGraphComponent } from '@khiops-visualization/components/commons/level-distribution-graph/level-distribution-graph.component';
import { TrainedPredictorModel } from '@khiops-visualization/model/trained-predictor.model';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas';
import { AppConfig } from '../../../../environments/environment';

@Component({
  selector: 'app-modeling-view',
  templateUrl: './modeling-view.component.html',
  styleUrls: ['./modeling-view.component.scss'],
  standalone: false,
})
export class ModelingViewComponent extends SelectableTabComponent {
  public preparationSource: string;
  public appDatas?: VisualizationDatas;
  public sizes?: DynamicI;
  public summaryDatas?: InfosDatasI[];
  public targetVariableStatsDatas?: ChartDatasModel;
  public trainedPredictorsSummaryDatas?: InfosDatasI[];
  public modelingDatas?: ModelingDatasModel;
  public trainedPredictorsDisplayedColumns?: GridColumnsI[];
  public targetVariableStatsInformations?: InfosDatasI[];
  public override tabIndex = 3; // managed by selectable-tab component
  public trainedPredictors?: TrainedPredictor[];

  private preparationVariable: any; // Complex, can be multiple types according to the preparationSource

  constructor(
    private modelingDatasService: ModelingDatasService,
    private trackerService: TrackerService,
    private preparation2dDatasService: Preparation2dDatasService,
    private dialog: MatDialog,
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
    private layoutService: LayoutService,
    private appService: AppService,
    private distributionService: DistributionService,
  ) {
    super();

    this.preparationSource =
      this.preparationDatasService.getAvailablePreparationReport();
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'modeling');
    this.trainedPredictors =
      this.appService.appDatas?.modelingReport?.trainedPredictors;

    this.preparationSource =
      this.preparationDatasService.getAvailablePreparationReport();

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

  onSelectedPredictorChanged(value: TrainedPredictor) {
    this.modelingDatasService.setSelectedPredictor(value);
    this.modelingDatasService.getTrainedPredictorListDatas();
    this.trainedPredictorsDisplayedColumns =
      this.modelingDatasService.getTrainedPredictorDisplayedColumns();

    // Check if selected variable from another tab is available into current modeling datas.
    // Otherwise, select a new one
    if (
      this.modelingDatas?.trainedPredictorsListDatas &&
      this.modelingDatas?.selectedVariable
    ) {
      const isVarAvailable = this.modelingDatas.trainedPredictorsListDatas.find(
        (e) => e.name === this.modelingDatas?.selectedVariable?.name,
      );
      if (!isVarAvailable) {
        if (this.modelingDatas.trainedPredictorsListDatas[0]) {
          this.onSelectListItemChanged(
            this.modelingDatas.trainedPredictorsListDatas[0],
          );
        }
      } else {
        // Select trained predictor auto redirection #202
        this.onSelectListItemChanged(isVarAvailable);
      }
    } else {
      // no modeling datas
      this.modelingDatasService.removeSelectedVariable();
    }
  }

  onSelectListItemChanged(item: TrainedPredictorModel) {
    // Get var from name
    if (item.name?.includes('Tree_')) {
      this.preparationSource = REPORT.TREE_PREPARATION_REPORT;
      this.preparationVariable =
        this.treePreparationDatasService.setSelectedVariable(item.name);
    } else {
      this.preparationSource =
        this.preparationDatasService.getPreparationSourceFromVariable(item);
      if (item.name?.includes('`')) {
        // Check the case of 2d variable : names are separated by `
        // #269 Check if Name1 and Name2 are given
        const name1 = item.isPair ? item.name1 : item.name.split('`')[0];
        const name2 = item.isPair ? item.name2 : item.name.split('`')[1];

        if (name1 && name2) {
          this.preparationVariable =
            this.preparation2dDatasService.setSelectedVariable(name1, name2);
        }
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

  onShowLevelDistributionFromButton() {
    if (this.modelingDatas?.trainedPredictorsListDatas) {
      // Cast to VariableModel[] as the level distribution expects this type
      this.onShowLevelDistributionGraph(
        this.modelingDatas.trainedPredictorsListDatas as any,
      );
    }
  }

  onShowLevelDistributionGraph(datas: VariableModel[]) {
    this.onShowDistributionGraph(datas, 'level');
  }

  onShowImportanceDistributionFromButton() {
    if (this.modelingDatas?.trainedPredictorsListDatas) {
      // Cast to VariableModel[] as the importance distribution expects this type
      this.onShowDistributionGraph(
        this.modelingDatas.trainedPredictorsListDatas as any,
        'importance',
      );
    }
  }

  onShowDistributionGraph(
    datas: VariableModel[],
    distributionType: 'level' | 'importance',
  ) {
    const config = new MatDialogConfig();
    config.maxWidth = 'unset';
    config.width = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
    config.height =
      AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
    const dialogRef: MatDialogRef<LevelDistributionGraphComponent> =
      this.dialog.open(LevelDistributionGraphComponent, config);
    dialogRef.componentInstance.datas = datas;
    dialogRef.componentInstance.distributionType = distributionType;
  }

  /**
   * Checks if the trained predictors data has level information for displaying the level distribution button
   * @returns true if trained predictors data has level property
   */
  hasLevelData(): boolean {
    return this.distributionService.hasLevelData(
      this.modelingDatas?.trainedPredictorsListDatas || [],
    );
  }

  /**
   * Checks if the trained predictors data has importance information for displaying the importance distribution button
   * @returns true if trained predictors data has importance property
   */
  hasImportanceData(): boolean {
    return this.distributionService.hasImportanceData(
      this.modelingDatas?.trainedPredictorsListDatas || [],
    );
  }
}
