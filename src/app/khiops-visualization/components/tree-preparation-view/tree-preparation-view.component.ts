/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  DoCheck,
  OnDestroy,
} from '@angular/core';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { LevelDistributionGraphComponent } from '../commons/level-distribution-graph/level-distribution-graph.component';
import { VariableGraphDetailsComponent } from '../commons/variable-graph-details/variable-graph-details.component';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns.interface';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas.interface';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { TreePreparationVariableModel } from '@khiops-visualization/model/tree-preparation-variable.model';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { TranslateService } from '@ngstack/translate';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { DistributionService } from '@khiops-visualization/providers/distribution.service';
import { REPORT } from '@khiops-library/enum/report';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals.interface';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { Observable } from 'rxjs';
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';
import { getTreePreparationVariablesGridColumns } from './tree-preparation-view.config';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { GraphSelectionSessionService } from '@khiops-visualization/providers/graph-selection-session.service';
import {
  InfoPanelLayoutMode,
  ViewLayoutModeService,
} from '@khiops-visualization/providers/view-layout-mode.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tree-preparation-view',
  templateUrl: './tree-preparation-view.component.html',
  styleUrls: ['./tree-preparation-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TreePreparationViewComponent
  extends SelectableTabComponent
  implements DoCheck, OnDestroy
{
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  private appVariableGraphDetails!: VariableGraphDetailsComponent;

  public preparationSource = REPORT.TREE_PREPARATION_REPORT;
  public sizes!: DynamicI;
  public summaryDatas?: InfosDatasI[];
  public informationsDatas?: InfosDatasI[];
  public targetVariableStatsDatas?: ChartDatasModel;
  public selectedBarIndex: number = 0;
  public variablesDatas?: VariableModel[];
  public targetVariableStatsInformations?: InfosDatasI[];
  public treePreparationDatas?: TreePreparationDatasModel;
  public distributionDatas?: DistributionDatasModel;
  public variablesDisplayedColumns: GridColumnsI[] = [];
  public override tabIndex = 5; // managed by selectable-tab component
  public showFilteredVariablesWarning: boolean = false;
  public isLeftInfosPanelMode: boolean = false;
  private splitViewKey: string = 'treePreparationView';

  selectedNodes$: Observable<TreeNodeModel[]>;
  selectedNode$: Observable<TreeNodeModel | undefined>;
  private previousSelectedVariableRank?: string;
  private infoPanelLayoutModeSub?: Subscription;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
    private translate: TranslateService,
    private trackerService: TrackerService,
    private distributionDatasService: DistributionDatasService,
    private modelingDatasService: ModelingDatasService,
    private layoutService: LayoutService,
    private store: TreePreparationStore,
    private distributionService: DistributionService,
    private dialogService: DialogService,
    private graphSelectionSessionService: GraphSelectionSessionService,
    private viewLayoutModeService: ViewLayoutModeService,
  ) {
    super();

    this.selectedNodes$ = this.store.selectedNodes$;
    this.selectedNode$ = this.store.selectedNode$;

    this.variablesDisplayedColumns = getTreePreparationVariablesGridColumns(
      this.translate,
    );
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'treePreparation');
    this.selectedBarIndex =
      this.graphSelectionSessionService.getSelectedIndex('treePreparation');

    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.applyInfoPanelLayoutMode(
      this.viewLayoutModeService.getInfoPanelLayoutMode(),
    );
    this.infoPanelLayoutModeSub =
      this.viewLayoutModeService.infoPanelLayoutMode$.subscribe((mode) => {
        this.applyInfoPanelLayoutMode(mode);
      });
    this.summaryDatas = this.preparationDatasService.getSummaryDatas(
      this.preparationSource,
    );
    this.informationsDatas = this.preparationDatasService.getInformationsDatas(
      this.preparationSource,
    );
    this.showFilteredVariablesWarning =
      this.preparationDatasService.isFilteredVariables(this.preparationSource);
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

    // Reapply session index into tree store when entering tab.
    this.store.selectNodesFromIndex({
      index: this.selectedBarIndex,
    });

    this.selectedNode$?.subscribe((selectedNode) => {
      if (selectedNode?._id) {
        let [index, _nodesToSelect] =
          this.treePreparationDatasService.getNodesLinkedToOneNode(
            selectedNode._id,
          );
        if (index !== undefined && index !== null) {
          this.selectedBarIndex = index;
          this.graphSelectionSessionService.setSelectedIndex(
            'treePreparation',
            index,
          );
          this.graphSelectionSessionService.setSelectedTreeNodeId(
            'treePreparation',
            selectedNode._id,
          );
        }
      }
    });
  }

  ngOnDestroy() {
    this.infoPanelLayoutModeSub?.unsubscribe();
  }

  ngDoCheck() {
    const currentRank = this.treePreparationDatas?.selectedVariable?.rank;

    if (this.previousSelectedVariableRank === undefined) {
      this.previousSelectedVariableRank = currentRank;
      return;
    }

    if (
      currentRank !== undefined &&
      currentRank !== this.previousSelectedVariableRank
    ) {
      this.onSelectedGraphItemChanged(0);
    }

    this.previousSelectedVariableRank = currentRank;
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      this.splitViewKey,
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
    this.dialogService.openDialog(
      LevelDistributionGraphComponent,
      {},
      {
        datas: datas,
      },
    );
  }

  onShowLevelDistributionFromButton() {
    if (this.variablesDatas) {
      // Sort data by level before showing distribution
      const sortedData = this.distributionService.sortDatasByLevel(
        this.variablesDatas,
      );
      this.onShowLevelDistributionGraph(sortedData);
    }
  }

  onSelectedGraphItemChanged(index: number) {
    // Keep in memory to keep bar charts index on type change
    this.selectedBarIndex = index;
    this.graphSelectionSessionService.setSelectedIndex(
      'treePreparation',
      index,
    );

    this.store.selectNodesFromIndex({
      index: this.selectedBarIndex,
    });
  }

  /**
   * Checks if the variables data has level information for displaying the level distribution button
   * @returns true if variables data has level property
   */
  hasLevelData(): boolean {
    return this.distributionService.hasLevelData(this.variablesDatas || []);
  }

  private applyInfoPanelLayoutMode(mode: InfoPanelLayoutMode) {
    this.isLeftInfosPanelMode = mode === 'left';
    this.splitViewKey = this.isLeftInfosPanelMode
      ? 'treePreparationViewLeftPanel'
      : 'treePreparationView';
    this.sizes = this.layoutService.getViewSplitSizes(this.splitViewKey);
  }

  /**
   * Checks if the selected variable is non-informative (level = 0)
   * @returns true if the selected variable has level 0
   */
  isNonInformativeVariable(): boolean {
    const hasLevel0 = this.treePreparationDatas?.selectedVariable?.level === 0;
    const hasDetailedStats =
      this.treePreparationDatasService.hasDetailedStatistics();
    return hasLevel0 || !hasDetailedStats;
  }

  /**
   * Gets the appropriate no-data message based on evaluated and selected variables
   * @returns the translation key for the no-data message
   */
  getNoDataMessage(): string | undefined {
    if (!this.informationsDatas || this.informationsDatas.length === 0) {
      return undefined;
    }

    // Find evaluatedVariables and selectedVariables from informationsDatas
    const evaluatedVarInfo = this.informationsDatas.find(
      (info) => info.title === 'GLOBAL.EVALUATED_VARIABLES',
    );
    const selectedVarInfo = this.informationsDatas.find(
      (info) => info.title === 'GLOBAL.SELECTED_VARIABLES',
    );

    const evaluatedVariables = evaluatedVarInfo
      ? Number(evaluatedVarInfo.value)
      : 0;
    const selectedVariables = selectedVarInfo
      ? Number(selectedVarInfo.value)
      : 0;

    if (evaluatedVariables === 0) {
      return 'NO_DATAS.NO_EVALUATED_VARIABLES';
    } else if (selectedVariables === 0) {
      return 'NO_DATAS.NO_SELECTED_VARIABLES';
    }

    return undefined;
  }
}
