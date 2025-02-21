/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { AppConfig } from 'src/environments/environment';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { LevelDistributionGraphComponent } from '@khiops-visualization/components/commons/level-distribution-graph/level-distribution-graph.component';
import { TargetDistributionGraphComponent } from '@khiops-visualization/components/commons/target-distribution-graph/target-distribution-graph.component';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { TranslateService } from '@ngstack/translate';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { Variable2dModel } from '@khiops-visualization/model/variable-2d.model';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { Preparation2dVariableModel } from '@khiops-visualization/model/preparation2d-variable.model';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { getPreparation2dVariablesGridColumns } from './preparation-2d-view.config';

@Component({
    selector: 'app-preparation-2d-view',
    templateUrl: './preparation-2d-view.component.html',
    styleUrls: ['./preparation-2d-view.component.scss'],
    standalone: false
})
export class Preparation2dViewComponent extends SelectableTabComponent {
  @ViewChild('targetDistributionGraph', {
    static: false,
  })
  private targetDistributionGraph: TargetDistributionGraphComponent | undefined;

  public sizes: DynamicI;
  public preparation2dDatas?: Preparation2dDatasModel;
  public summaryDatas: InfosDatasI[];
  public informationsDatas?: InfosDatasI[];
  public targetVariableStatsDatas?: ChartDatasModel;
  public variables2dDatas: Variable2dModel[];
  public levelDistributionTitle: string = '';
  public override tabIndex = 2; // managed by selectable-tab component
  public variablesDisplayedColumns: GridColumnsI[] = [];

  constructor(
    private preparationDatasService: PreparationDatasService,
    private trackerService: TrackerService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private modelingDatasService: ModelingDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
    private layoutService: LayoutService,
  ) {
    super();

    this.variablesDisplayedColumns = getPreparation2dVariablesGridColumns(
      this.translate,
      preparation2dDatasService.isSupervised(),
    );

    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
    this.sizes = this.layoutService.getViewSplitSizes('preparation2dView');
    this.informationsDatas =
      this.preparation2dDatasService.getInformationsDatas();
    this.summaryDatas = this.preparationDatasService.getSummaryDatas();
    this.targetVariableStatsDatas =
      this.preparationDatasService.getTargetVariableStatsDatas();
    this.variables2dDatas =
      this.preparation2dDatasService.getVariablesd2Datas();
    this.levelDistributionTitle = this.preparation2dDatasService.isSupervised()
      ? this.translate.get('GLOBAL.DELTA_LEVEL_DISTRIBUTION')
      : '';
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'preparation2d');
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

  onSelectListItemChanged(item: Preparation2dVariableModel) {
    this.preparation2dDatasService.setSelectedVariable(item.name1, item.name2);
    const modelingVariable =
      this.preparation2dDatasService.getVariableFromNames(
        item.name1,
        item.name2,
      );
    this.modelingDatasService.setSelectedVariable(modelingVariable!);
  }

  onShowLevelDistributionGraph(datas: VariableModel[] | Variable2dModel[]) {
    console.log(
      'Preparation2dViewComponent ~ onShowLevelDistributionGraph ~ datas:',
      datas,
    );
    const config = new MatDialogConfig();
    config.width = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
    config.height =
      AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
    const dialogRef: MatDialogRef<LevelDistributionGraphComponent> =
      this.dialog.open(LevelDistributionGraphComponent, config);
    dialogRef.componentInstance.levelDistributionTitle =
      this.levelDistributionTitle;
    dialogRef.componentInstance.datas = datas;
  }

  private resizeTargetDistributionGraph() {
    setTimeout(() => {
      // Resize to update graphs dimensions
      if (this.targetDistributionGraph) {
        this.targetDistributionGraph.resizeGraph();
      }
    }); // do it after view dom complete
  }
}
