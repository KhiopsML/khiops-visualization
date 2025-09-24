/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, ViewChild } from '@angular/core';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { LevelDistributionGraphComponent } from '../commons/level-distribution-graph/level-distribution-graph.component';
import { VariableGraphDetailsComponent } from '../commons/variable-graph-details/variable-graph-details.component';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import {
  TreePreparationDatasModel,
  TreePreparationState,
} from '@khiops-visualization/model/tree-preparation-datas.model';
import { TreePreparationVariableModel } from '@khiops-visualization/model/tree-preparation-variable.model';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { TranslateService } from '@ngstack/translate';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { LevelDistributionService } from '@khiops-visualization/providers/level-distribution.service';
import { REPORT } from '@khiops-library/enum/report';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { selectNodesFromIndex } from '@khiops-visualization/actions/tree-preparation.action';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectedNodeSelector,
  selectedNodesSelector,
} from '@khiops-visualization/selectors/tree-preparation.selector';
import { getTreePreparationVariablesGridColumns } from './tree-preparation-view.config';
import { AppConfig } from '../../../../environments/environment';

@Component({
  selector: 'app-tree-preparation-view',
  templateUrl: './tree-preparation-view.component.html',
  styleUrls: ['./tree-preparation-view.component.scss'],
  standalone: false,
})
export class TreePreparationViewComponent extends SelectableTabComponent {
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  private appVariableGraphDetails!: VariableGraphDetailsComponent;
  private preparationSource = REPORT.TREE_PREPARATION_REPORT;

  public sizes!: DynamicI;
  public summaryDatas?: InfosDatasI[];
  public informationsDatas?: InfosDatasI[];
  public targetVariableStatsDatas?: ChartDatasModel;
  public selectedBarIndex: number | undefined = 0;
  public variablesDatas?: VariableModel[];
  public targetVariableStatsInformations?: InfosDatasI[];
  public treePreparationDatas?: TreePreparationDatasModel;
  public distributionDatas?: DistributionDatasModel;
  public variablesDisplayedColumns: GridColumnsI[] = [];
  public override tabIndex = 5; // managed by selectable-tab component

  selectedNodes$: Observable<TreeNodeModel[]>;
  selectedNode$: Observable<TreeNodeModel | undefined>;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private trackerService: TrackerService,
    private distributionDatasService: DistributionDatasService,
    private modelingDatasService: ModelingDatasService,
    private layoutService: LayoutService,
    private store: Store<{ TreePreparationState: TreePreparationState }>,
    private levelDistributionService: LevelDistributionService,
  ) {
    super();

    this.selectedNodes$ = this.store.select(selectedNodesSelector);
    this.selectedNode$ = this.store.select(selectedNodeSelector);

    this.variablesDisplayedColumns = getTreePreparationVariablesGridColumns(
      this.translate,
    );
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'treePreparation');

    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.sizes = this.layoutService.getViewSplitSizes('treePreparationView');
    this.summaryDatas = this.preparationDatasService.getSummaryDatas(
      this.preparationSource,
    );
    this.informationsDatas = this.preparationDatasService.getInformationsDatas(
      this.preparationSource,
    );
    this.targetVariableStatsDatas =
      this.preparationDatasService.getTargetVariableStatsDatas(
        this.preparationSource,
      );
    this.targetVariableStatsInformations =
      this.preparationDatasService.getTargetVariableStatsInformations(
        this.preparationSource,
      );
    this.variablesDatas = this.preparationDatasService.getVariablesDatas(
      this.preparationSource,
    );
    this.distributionDatas = this.distributionDatasService.getDatas();

    this.selectedNode$?.subscribe((selectedNode) => {
      if (selectedNode?._id) {
        let [index, _nodesToSelect] =
          this.treePreparationDatasService.getNodesLinkedToOneNode(
            selectedNode._id,
          );
        this.selectedBarIndex = index;
      }
    });
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

  onSelectListItemChanged(item: TreePreparationVariableModel) {
    const modelingVariable =
      this.treePreparationDatasService.setSelectedVariable(item.name);
    if (modelingVariable) {
      this.modelingDatasService.setSelectedVariable(modelingVariable);
    }
  }

  onShowLevelDistributionGraph(datas: VariableModel[]) {
    const config = new MatDialogConfig();
    config.width = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
    config.height =
      AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
    const dialogRef: MatDialogRef<LevelDistributionGraphComponent> =
      this.dialog.open(LevelDistributionGraphComponent, config);
    dialogRef.componentInstance.datas = datas;
  }

  onShowLevelDistributionFromButton() {
    if (this.variablesDatas) {
      this.onShowLevelDistributionGraph(this.variablesDatas);
    }
  }

  onSelectedGraphItemChanged(index: number) {
    // Keep in memory to keep bar charts index on type change
    this.selectedBarIndex = index;

    this.store.dispatch(
      selectNodesFromIndex({
        index: this.selectedBarIndex,
      }),
    );
  }

  /**
   * Checks if the variables data has level information for displaying the level distribution button
   * @returns true if variables data has level property
   */
  hasLevelData(): boolean {
    return this.levelDistributionService.hasLevelData(this.variablesDatas || []);
  }
}
