/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input } from '@angular/core';
import { PreparationDatasService } from '../../providers/preparation-datas.service';
import { AppConfig } from 'src/environments/environment';
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
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { getPreparationVariablesGridColumns } from './preparation-view.config';

@Component({
    selector: 'app-preparation-view',
    templateUrl: './preparation-view.component.html',
    styleUrls: ['./preparation-view.component.scss'],
    standalone: false
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

  constructor(
    private preparationDatasService: PreparationDatasService,
    private translate: TranslateService,
    private trackerService: TrackerService,
    private dialog: MatDialog,
    private layoutService: LayoutService,
    private modelingDatasService: ModelingDatasService,
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
    const modelingVariable = this.preparationDatasService.setSelectedVariable(
      item.name!,
      this.preparationSource,
    );
    this.modelingDatasService.setSelectedVariable(modelingVariable!);
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

  getDerivationRuleValue(): string {
    return (
      this.preparationDatas?.selectedVariable?.derivationRule ||
      this.translate.get('GLOBAL.NO_DERIVATION_RULE')
    );
  }
}
