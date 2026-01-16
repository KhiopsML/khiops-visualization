/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Inject,
  ViewChild,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TranslateService } from '@ngstack/translate';
import { AgGridComponent } from '@khiops-library/components/ag-grid/ag-grid.component';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { VariableSearchService } from '@khiops-covisualization/providers/variable-search.service';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

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
export class VariableSearchDialogComponent
  extends SelectableComponent
  implements AfterViewInit
{
  innerVariables: string[] = [];
  selectedInnerVariable = '';
  searchValue = '';
  searchResults: GridDatasI | undefined;
  searchInput = '';
  // Map to quickly find cluster info by row data
  private rowToClusterMap: Map<string, { cluster: string; _id: string }> =
    new Map();

  // Properties needed for kl-header-tools functionality
  public componentType = COMPONENT_TYPES.GRID; // needed to copy datas
  public override id: string = 'variable-search-dialog-comp';

  /**
   * Title for the copied data output
   * Will be set dynamically based on the selected inner variable
   */
  public title?: string;

  /**
   * Columns configuration for data copy functionality
   * Maps grid columns to copy-friendly format with headerName and field properties
   */
  public displayedColumns: any[] = [];

  /**
   * Data source for the copy functionality
   * Contains the actual row data to be copied
   */
  public inputDatas?: any[];

  @ViewChild(AgGridComponent) agGridComponent?: AgGridComponent;

  constructor(
    public translate: TranslateService,
    private dialogRef: MatDialogRef<VariableSearchDialogComponent>,
    private treenodesService: TreenodesService,
    private variableSearchService: VariableSearchService,
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    @Inject(MAT_DIALOG_DATA) public data: VariableSearchDialogData,
  ) {
    super(selectableService, ngzone, configService);

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

  override ngAfterViewInit() {
    super.ngAfterViewInit();

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

      // Trigger click event for copy functionality
      this.triggerClickEvent();
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
      // Clear copy data properties when no variable selected
      this.updateCopyDataProperties();
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

      // Update properties for data copy functionality
      this.updateCopyDataProperties();
    }
  }

  /**
   * Updates the properties needed for the copy data functionality
   */
  private updateCopyDataProperties() {
    if (
      this.searchResults &&
      this.searchResults.values &&
      this.searchResults.displayedColumns
    ) {
      // Set title for the copied data
      this.title = `${this.translate.get('GLOBAL.INNER_VARIABLE')} - ${this.selectedInnerVariable}`;

      // Set displayed columns for copy functionality
      this.displayedColumns = this.searchResults.displayedColumns.map(
        (col) => ({
          headerName: col.headerName,
          field: col.field,
          show: true,
        }),
      );

      // Set inputDatas directly from searchResults.values - no copy needed!
      this.inputDatas = this.searchResults.values as any[];
    } else {
      // Clear properties when no data
      this.title = '';
      this.displayedColumns = [];
      this.inputDatas = [];
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
