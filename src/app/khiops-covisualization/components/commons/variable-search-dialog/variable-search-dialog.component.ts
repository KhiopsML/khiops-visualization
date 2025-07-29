/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TranslateService } from '@ngstack/translate';
import { AgGridComponent } from '@khiops-library/components/ag-grid/ag-grid.component';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { VariableSearchService } from '@khiops-covisualization/providers/variable-search.service';

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
  // Map to quickly find cluster info by row data
  private rowToClusterMap: Map<string, { cluster: string; _id: string }> =
    new Map();

  @ViewChild(AgGridComponent) agGridComponent?: AgGridComponent;

  constructor(
    public translate: TranslateService,
    private dialogRef: MatDialogRef<VariableSearchDialogComponent>,
    private treenodesService: TreenodesService,
    private variableSearchService: VariableSearchService,
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
    // Restore search input
    if (this.data.searchInput) {
      if (this.agGridComponent) {
        this.agGridComponent.searchInput = this.data.searchInput;
        this.agGridComponent.search();
      }
    }
    setTimeout(() => {
      // Set focus on the search input field
      this.agGridComponent?.focusSearch();
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

  /**
   * Performs search using the VariableSearchService
   */
  private performSearch() {
    // Don't try to restore search input here - it will be done in ngAfterViewInit
    if (this.agGridComponent && !this.data.searchInput) {
      this.agGridComponent.searchInput = '';
      this.agGridComponent.search();
    }

    if (this.searchResults) {
      this.searchResults.displayedColumns = [];
      this.searchResults.values = [];
    }
    this.rowToClusterMap.clear(); // Reset row to cluster mapping

    if (!this.selectedInnerVariable) {
      return;
    }

    // Use the service to perform the search
    const searchData = this.variableSearchService.performVariableSearch(
      this.data.selectedDimension,
      this.selectedInnerVariable,
    );

    if (searchData) {
      this.searchResults = searchData.searchResults;
      this.rowToClusterMap = searchData.clusterMapping;
    }
  }

  /**
   * Handles row selection and navigates to the corresponding cluster
   * @param selectedRow - The selected row data
   */
  onSelectRowChanged(selectedRow: { [key: string]: any }) {
    // Use the service to get cluster info for the selected row
    const clusterInfo = this.variableSearchService.getClusterInfoForRow(
      selectedRow,
      this.rowToClusterMap,
    );

    if (clusterInfo) {
      if (this.data.selectedDimension?.name) {
        // Get the selected value (modality for categorical, interval for numerical)
        const selectedValue: string =
          selectedRow.modality || selectedRow.interval;

        this.treenodesService.setSelectedNode(
          this.data.selectedDimension.name,
          clusterInfo.cluster,
          false,
          selectedValue,
        );
      }
    }

    // Get current search input from AgGrid component
    const currentSearchInput = this.agGridComponent?.searchInput || '';
    this.dialogRef.close({
      selectedInnerVariable: this.selectedInnerVariable,
      searchInput: currentSearchInput,
    });
  }
}
