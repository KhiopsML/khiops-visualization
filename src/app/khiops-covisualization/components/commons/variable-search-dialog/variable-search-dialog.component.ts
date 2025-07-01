/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { TYPES } from '@khiops-library/enum/types';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TranslateService } from '@ngstack/translate';
import { CompositionService } from '@khiops-covisualization/providers/composition.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { AgGridComponent } from '@khiops-library/components/ag-grid/ag-grid.component';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';

export interface VariableSearchDialogData {
  selectedDimension: DimensionCovisualizationModel;
}

export interface VariableSearchResult {
  selectedValue: string;
  selectedInnerVariable: string;
  innerVariableType: string;
}

@Component({
  selector: 'app-variable-search-dialog',
  templateUrl: './variable-search-dialog.component.html',
  styleUrls: ['./variable-search-dialog.component.scss'],
  standalone: false,
})
export class VariableSearchDialogComponent {
  innerVariables: string[] = [];
  selectedInnerVariable = '';
  searchValue = '';
  searchResults: GridDatasI | undefined;
  searchInput = '';

  @ViewChild(AgGridComponent) agGridComponent?: AgGridComponent;

  constructor(
    public translate: TranslateService,
    private dialogRef: MatDialogRef<VariableSearchDialogComponent>,
    private compositionService: CompositionService,
    private treenodesService: TreenodesService,

    private dimensionsDatasService: DimensionsDatasService,
    @Inject(MAT_DIALOG_DATA) public data: VariableSearchDialogData,
  ) {
    this.initializeInnerVariables();
    this.initializeSearchResults();
    this.performSearch();
  }

  private initializeInnerVariables() {
    if (this.data.selectedDimension?.innerVariables?.dimensionSummaries) {
      this.innerVariables =
        this.data.selectedDimension.innerVariables.dimensionSummaries.map(
          (dim) => dim.name,
        );
      if (this.innerVariables.length > 0) {
        this.selectedInnerVariable = this.innerVariables[0] || '';
      }
    }
  }

  private initializeSearchResults() {
    this.searchResults = {
      displayedColumns: [],
      values: [],
    };
  }

  onInnerVariableSelected(variable: string) {
    this.selectedInnerVariable = variable;
    this.searchValue = '';
    this.performSearch();
  }

  onClickOnClose() {
    this.dialogRef.close();
  }

  private performSearch() {
    // Reset aggrid search input
    if (this.agGridComponent) {
      this.agGridComponent.searchInput = '';
      this.agGridComponent.search();
    }

    this.searchResults!.displayedColumns = [];
    this.searchResults!.values = [];
    this.searchInput = '';
    if (!this.selectedInnerVariable) {
      return;
    }

    // Get the type of the selected inner variable
    const innerVariableIndex =
      this.data.selectedDimension?.innerVariables?.dimensionSummaries?.findIndex(
        (dim) => dim.name === this.selectedInnerVariable,
      );

    if (innerVariableIndex === undefined || innerVariableIndex === -1) {
      return;
    }

    const innerVariableType =
      this.data.selectedDimension?.innerVariables?.dimensionSummaries?.[
        innerVariableIndex
      ]?.type;

    // Get root compositions
    const dimIndex = this.dimensionsDatasService.getDimensionPositionFromName(
      this.data.selectedDimension.name,
    );
    const rootNode: TreeNodeModel | undefined =
      this.dimensionsDatasService.dimensionsDatas.dimensionsTrees?.[
        dimIndex
      ]?.[0];

    if (rootNode) {
      // Get composition of highest level node
      const relevantCompositions =
        this.compositionService.getCompositionClusters(
          this.data.selectedDimension.name,
          rootNode,
        );

      if (!relevantCompositions || relevantCompositions.length === 0) {
        return;
      }

      // let filteredValues: any[] = [];
      if (innerVariableType === TYPES.NUMERICAL) {
        // For numerical variables, show intervals and filter by inclusion
        this.searchResults!.displayedColumns = [
          {
            headerName: this.translate.get('GLOBAL.INTERVAL'),
            field: 'interval',
          },
          {
            headerName: this.translate.get('GLOBAL.FREQUENCY'),
            field: 'frequency',
          },
          {
            headerName: this.translate.get('GLOBAL.CLUSTER'),
            field: 'cluster',
            show: false,
          },
        ];

        relevantCompositions.forEach((comp) => {
          if (comp.partDetails && comp.partFrequencies) {
            comp.partDetails.forEach((interval, index) => {
              this.searchResults!.values!.push({
                cluster: comp.cluster,
                _id: comp._id,
                interval: interval,
                frequency: comp.partFrequencies![index] || 0,
              });
            });
          }
        });
      } else {
        // For categorical variables, show modalities
        this.searchResults!.displayedColumns = [
          {
            headerName: this.translate.get('GLOBAL.MODALITY'),
            field: 'modality',
          },
          {
            headerName: this.translate.get('GLOBAL.FREQUENCY'),
            field: 'frequency',
          },
          {
            headerName: this.translate.get('GLOBAL.CLUSTER'),
            field: 'cluster',
            show: false,
          },
        ];

        relevantCompositions.forEach((comp) => {
          if (comp.valueGroups?.values && comp.valueGroups?.valueFrequencies) {
            comp.valueGroups.values.forEach((modality, index) => {
              this.searchResults!.values!.push({
                cluster: comp.cluster,
                _id: comp._id,
                modality: modality,
                frequency: comp.valueGroups!.valueFrequencies[index] || 0,
              });
            });
          }
        });
      }
    }
  }

  onSelectRowChanged(selectedRow: any) {
    this.treenodesService.setSelectedNode(
      this.data.selectedDimension?.name!,
      selectedRow.cluster,
    );

    this.dialogRef.close();
  }
}
