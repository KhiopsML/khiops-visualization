/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { DistributionService } from '@khiops-visualization/providers/distribution.service';
import { TranslateService } from '@ngstack/translate';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { REPORT } from '@khiops-library/enum/report';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns.interface';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas.interface';
import { LevelDistributionGraphComponent } from '../../commons/level-distribution-graph/level-distribution-graph.component';
import { AppConfig } from '../../../../../environments/environment';
import { getPreparationVariablesGridColumns } from '../preparation-view.config';

@Component({
  selector: 'app-preparation-variables-panel',
  template: `
    @if (variablesDatas?.length === 0) {
      <kl-no-data class="kl-card" fxFlex [message]="noDataMessage"></kl-no-data>
    }
    @if (variablesDatas && variablesDatas.length > 0) {
      <kl-ag-grid
        #agGridRef
        id="preparation-variables-list"
        class="variables-list"
        fxFlexFill
        [showSearch]="true"
        [watchResize]="true"
        [displayCount]="true"
        (selectListItem)="onSelectListItemChanged($event)"
        titleTooltip="{{ 'TOOLTIPS.PREPARATION.VARIABLES.TITLE' | translate }}"
        [showLineSelection]="true"
        [showColumnsSelection]="true"
        [inputDatas]="variablesDatas"
        [displayedColumns]="variablesDisplayedColumns"
        [selectedVariable]="selectedVariable"
        [noDataMessage]="noDataMessage"
      >
        @if (hasLevelData()) {
          <app-level-distribution-button
            slot="header-tools"
            distributionType="level"
            [isSmallDiv]="agGridRef.isSmallDiv"
            [searchFormVisible]="agGridRef.searchFormVisible"
            (openLevelDistribution)="onShowLevelDistributionFromButton()"
          ></app-level-distribution-button>
        }
      </kl-ag-grid>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
        width: 100%;
      }
    `,
  ],
  standalone: false,
})
export class PreparationVariablesPanelComponent implements OnInit {
  @Input() api: any;
  @ViewChild('agGridRef') agGridRef: any;

  public variablesDatas?: VariableModel[];
  public variablesDisplayedColumns: GridColumnsI[] = [];
  public selectedVariable?: any;
  public noDataMessage?: string;

  private preparationSource: string = REPORT.PREPARATION_REPORT;
  private informationsDatas?: InfosDatasI[];

  constructor(
    private preparationDatasService: PreparationDatasService,
    private modelingDatasService: ModelingDatasService,
    private distributionService: DistributionService,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) {
    this.variablesDisplayedColumns = getPreparationVariablesGridColumns(
      this.translate,
    );
  }

  ngOnInit() {
    this.preparationSource =
      this.api?.params?.preparationSource ?? REPORT.PREPARATION_REPORT;

    const datas = this.preparationDatasService.getDatas(this.preparationSource);
    this.selectedVariable = datas?.selectedVariable;
    this.variablesDatas = this.preparationDatasService.getVariablesDatas(
      this.preparationSource,
    );
    this.informationsDatas = this.preparationDatasService.getInformationsDatas(
      this.preparationSource,
    );
    this.noDataMessage = this.getNoDataMessage();

    const includesTargetParts = this.preparationDatasService.includesTargetParts(
      this.variablesDatas,
    );
    if (includesTargetParts) {
      this.variablesDisplayedColumns.splice(3, 0, {
        headerName: this.translate.get('GLOBAL.TARGET_PARTS'),
        field: 'targetParts',
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.TARGET_PARTS'),
      });
    }
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

  hasLevelData(): boolean {
    return this.distributionService.hasLevelData(this.variablesDatas || []);
  }

  onShowLevelDistributionFromButton() {
    if (this.variablesDatas) {
      const sortedData = this.distributionService.sortDatasByLevel(
        this.variablesDatas,
      );
      const config = new MatDialogConfig();
      config.maxWidth = 'unset';
      config.width =
        AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
      config.height =
        AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
      const dialogRef: MatDialogRef<LevelDistributionGraphComponent> =
        this.dialog.open(LevelDistributionGraphComponent, config);
      dialogRef.componentInstance.datas = sortedData;
    }
  }

  private getNoDataMessage(): string | undefined {
    if (!this.informationsDatas || this.informationsDatas.length === 0) {
      return undefined;
    }
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
