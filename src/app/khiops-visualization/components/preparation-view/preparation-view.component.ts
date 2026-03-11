/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input } from '@angular/core';
import { PreparationDatasService } from '../../providers/preparation-datas.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { LevelDistributionGraphComponent } from '../commons/level-distribution-graph/level-distribution-graph.component';
import { TranslateService } from '@ngstack/translate';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { REPORT } from '@khiops-library/enum/report';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { DistributionService } from '../../providers/distribution.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { getPreparationVariablesGridColumns } from './preparation-view.config';
import { AppConfig } from '../../../../environments/environment';

@Component({
  selector: 'app-preparation-view',
  templateUrl: './preparation-view.component.html',
  styleUrls: ['./preparation-view.component.scss'],
  standalone: false,
})
export class PreparationViewComponent extends SelectableTabComponent {
  @Input() public preparationSource = REPORT.PREPARATION_REPORT; // By default
  public sizes?: DynamicI;
  public preparationDatas?: {
    selectedVariable: PreparationVariableModel;
    currentIntervalDatas: GridDatasI;
  };
  public summaryDatas?: InfosDatasI[];
  public informationsDatas?: InfosDatasI[];
  public targetVariableStatsDatas?: ChartDatasModel;
  public variablesDatas?: VariableModel[];
  public targetVariableStatsInformations?: InfosDatasI[];
  public override tabIndex = 1; // managed by selectable-tab component
  public variablesDisplayedColumns: GridColumnsI[] = [];
  public showFilteredVariablesWarning: boolean = false;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private translate: TranslateService,
    private trackerService: TrackerService,
    private dialog: MatDialog,
    private layoutService: LayoutService,
    private modelingDatasService: ModelingDatasService,
    private distributionService: DistributionService,
  ) {
    super();

    this.variablesDisplayedColumns = getPreparationVariablesGridColumns(
      this.translate,
    );
  }

  ngOnInit() {
    const trackView =
      this.preparationSource === REPORT.PREPARATION_REPORT
        ? 'preparation'
        : 'textPreparation';
    this.trackerService.trackEvent('page_view', trackView);

    this.preparationDatas = this.preparationDatasService.getDatas(
      this.preparationSource,
    );

    this.sizes = this.layoutService.getViewSplitSizes('preparationView');
    this.summaryDatas = this.preparationDatasService.getSummaryDatas();
    this.informationsDatas = this.preparationDatasService.getInformationsDatas(
      this.preparationSource,
    );
    this.showFilteredVariablesWarning =
      this.preparationDatasService.isFilteredVariables(this.preparationSource);
    this.targetVariableStatsDatas =
      this.preparationDatasService.getTargetVariableStatsDatas();
    this.targetVariableStatsInformations =
      this.preparationDatasService.getTargetVariableStatsInformations();
    this.variablesDatas = this.preparationDatasService.getVariablesDatas(
      this.preparationSource,
    );

    const includesTargetParts =
      this.preparationDatasService.includesTargetParts(this.variablesDatas);
    if (includesTargetParts) {
      this.variablesDisplayedColumns.splice(3, 0, {
        headerName: this.translate.get('GLOBAL.TARGET_PARTS'),
        field: 'targetParts',
        tooltip: this.translate.get(
          'TOOLTIPS.PREPARATION.VARIABLES.TARGET_PARTS',
        ),
      });
    }
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'preparationView',
    );
  }

  onSelectListItemChanged(item: VariableModel) {
    if (!item.name) {
      return;
    }
    const modelingVariable = this.preparationDatasService.setSelectedVariable(
      item.name,
      this.preparationSource,
    );
    if (modelingVariable) {
      this.modelingDatasService.setSelectedVariable(modelingVariable);
    }
  }

  onShowLevelDistributionGraph(datas: VariableModel[]) {
    const config = new MatDialogConfig();
    config.maxWidth = 'unset';
    config.width = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
    config.height =
      AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
    const dialogRef: MatDialogRef<LevelDistributionGraphComponent> =
      this.dialog.open(LevelDistributionGraphComponent, config);
    dialogRef.componentInstance.datas = datas;
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

  getDerivationRuleValue(): string {
    return (
      this.preparationDatas?.selectedVariable?.derivationRule ||
      this.translate.get('GLOBAL.NO_DERIVATION_RULE')
    );
  }

  /**
   * Checks if the variables data has level information for displaying the level distribution button
   * @returns true if variables data has level property
   */
  hasLevelData(): boolean {
    return this.distributionService.hasLevelData(this.variablesDatas || []);
  }

  /**
   * Checks if the selected variable is non-informative (level = 0)
   * @returns true if the selected variable has level 0
   */
  isNonInformativeVariable(): boolean {
    const hasLevel0 = this.preparationDatas?.selectedVariable?.level === 0;
    const hasDetailedStats = this.preparationDatasService.hasDetailedStatistics(
      this.preparationSource,
    );
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
