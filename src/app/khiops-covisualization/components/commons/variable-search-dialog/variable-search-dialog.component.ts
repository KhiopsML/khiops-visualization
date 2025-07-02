/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
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
  selectedInnerVariable?: string;
  searchInput?: string;
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
export class VariableSearchDialogComponent implements AfterViewInit {
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
    // Restore selectedInnerVariable if provided in data
    if (
      this.data.selectedInnerVariable &&
      this.innerVariables.includes(this.data.selectedInnerVariable)
    ) {
      this.selectedInnerVariable = this.data.selectedInnerVariable;
    }
    // Store searchInput for later restoration in ngAfterViewInit
    this.performSearch();
  }

  ngAfterViewInit() {
    // Restore search input and set focus after view is initialized
    setTimeout(() => {
      if (this.agGridComponent) {
        if (this.data.searchInput) {
          this.agGridComponent.searchInput = this.data.searchInput;
          this.agGridComponent.search();
        }
        // Set focus on the search input field
        this.agGridComponent.focusSearch();
      }
    }, 250);
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
    // Reset search input when changing inner variable
    if (this.agGridComponent) {
      this.agGridComponent.searchInput = '';
      this.agGridComponent.search();
    }
    this.performSearch();
  }

  onClickOnClose() {
    // Get current search input from AgGrid component
    const currentSearchInput = this.agGridComponent?.searchInput || '';
    this.dialogRef.close({
      selectedInnerVariable: this.selectedInnerVariable,
      searchInput: currentSearchInput,
    });
  }

  private performSearch() {
    // Don't try to restore search input here - it will be done in ngAfterViewInit
    if (this.agGridComponent && !this.data.searchInput) {
      this.agGridComponent.searchInput = '';
      this.agGridComponent.search();
    }

    this.searchResults!.displayedColumns = [];
    this.searchResults!.values = [];
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
        // Sort by interval (assuming intervals are strings like '[a, b)')
        this.searchResults!.values = this.searchResults!.values!.sort(
          (a: any, b: any) => {
            // Helper to check if interval is -inf or +inf
            const isMinusInf = (interval: string) =>
              /-inf|−inf|Infinity|−Infinity|\u2212inf/i.test(interval) &&
              interval.trim().startsWith(']');
            const isPlusInf = (interval: string) =>
              /\+inf|\+Infinity|Infinity/i.test(interval) &&
              interval.trim().endsWith('[');
            if (isMinusInf(a.interval)) return -1;
            if (isMinusInf(b.interval)) return 1;
            if (isPlusInf(a.interval)) return 1;
            if (isPlusInf(b.interval)) return -1;
            // Try to extract the lower bound as a number
            const getLower = (interval: string) => {
              const match = interval.match(/[-+]?[0-9]*\.?[0-9]+/);
              return match ? parseFloat(match[0]) : 0;
            };
            return getLower(a.interval) - getLower(b.interval);
          },
        );
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
        // Sort by frequency descending
        this.searchResults!.values = this.searchResults!.values!.sort(
          (a: any, b: any) => b.frequency - a.frequency,
        );
      }
    }
  }

  onSelectRowChanged(selectedRow: any) {
    // Get the selected value (modality for categorical, interval for numerical)
    const selectedValue = selectedRow.modality || selectedRow.interval;

    this.treenodesService.setSelectedNode(
      this.data.selectedDimension?.name!,
      selectedRow.cluster,
      false,
      selectedValue,
    );

    // Get current search input from AgGrid component
    const currentSearchInput = this.agGridComponent?.searchInput || '';
    this.dialogRef.close({
      selectedInnerVariable: this.selectedInnerVariable,
      searchInput: currentSearchInput,
    });
  }
}
