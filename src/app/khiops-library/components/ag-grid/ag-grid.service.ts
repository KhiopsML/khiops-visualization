/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { ColDef } from '@ag-grid-community/core';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { UtilsService } from '@khiops-library/providers/utils.service';

@Injectable({
  providedIn: 'root',
})
export class AgGridService {
  /**
   * Determines if a value represents a number (including string numbers like '10')
   * @param value - The value to check
   * @returns true if the value is numeric, false otherwise
   */
  isNumeric(value: any): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    // Convert to string and trim whitespace
    const stringValue = String(value).trim();

    // Handle empty string after trimming
    if (stringValue === '') {
      return false;
    }

    // Remove common number separators for better detection
    const cleanedValue = stringValue.replace(/[,\s]/g, '');

    // Check if it's a valid number (including decimal numbers, negative numbers, etc.)
    const numberValue = Number(cleanedValue);
    const parseFloatValue = parseFloat(cleanedValue);

    return (
      !isNaN(numberValue) && !isNaN(parseFloatValue) && isFinite(numberValue)
    );
  }

  /**
   * Determines the cell alignment based on the column data
   * @param inputDatas - The data array to analyze
   * @param columnField - The field name of the column
   * @param threshold - The percentage threshold for considering a column numeric (default: 0.7)
   * @returns 'right' for numeric data, 'left' for text data
   */
  getCellAlignment(
    inputDatas: any[],
    columnField: string,
    threshold: number = 0.7,
  ): 'left' | 'right' {
    if (!inputDatas || inputDatas.length === 0) {
      return 'left';
    }

    // Sample a larger set of values to be more accurate
    const sampleSize = Math.min(20, inputDatas.length);
    let numericCount = 0;
    let totalValidValues = 0;

    for (let i = 0; i < sampleSize; i++) {
      const value = inputDatas[i][columnField];
      if (value !== null && value !== undefined && value !== '') {
        totalValidValues++;
        if (this.isNumeric(value)) {
          numericCount++;
        }
      }
    }

    // If we don't have enough valid values, default to left alignment
    if (totalValidValues === 0) {
      return 'left';
    }

    // Calculate the ratio based on valid values only
    const numericRatio = numericCount / totalValidValues;

    // If most values are numeric, align right, otherwise align left
    return numericRatio >= threshold ? 'right' : 'left';
  }

  /**
   * Creates AG Grid column definitions with automatic alignment based on data types
   * @param displayedColumns - The column configuration
   * @param inputDatas - The data to analyze for alignment
   * @param options - Additional options for column configuration
   * @returns Array of AG Grid column definitions
   */
  createColumnDefs(
    displayedColumns: GridColumnsI[],
    inputDatas: any[],
    options: {
      cellsSizes?: DynamicI;
      gridId?: string;
      appConfig?: any;
    } = {},
  ): ColDef[] {
    const columnDefs: ColDef[] = [];

    for (let i = 0; i < displayedColumns.length; i++) {
      const col = displayedColumns[i];
      if (col && !col.hidden) {
        // Determine cell alignment based on data type
        const cellAlignment = this.getCellAlignment(inputDatas, col.field);

        const gridCol: ColDef = {
          headerName: col.headerName,
          headerTooltip: col.tooltip
            ? col.headerName + ': ' + col.tooltip
            : col.headerName,
          colId: col.headerName,
          field: col.field,
          sortable: true,
          suppressMovable: true,
          resizable: true,
          hide: col.show === false,
          width: options.cellsSizes?.[options.gridId!]?.[col.field],
          cellRenderer: col.cellRenderer,
          cellRendererParams: col.cellRendererParams,
          cellClass: (params: any) => {
            const alignmentClass =
              cellAlignment === 'right'
                ? 'ag-right-aligned-cell'
                : 'ag-left-aligned-cell';

            let customClass = '';
            if (col.cellClass) {
              customClass =
                typeof col.cellClass === 'function'
                  ? col.cellClass(params)
                  : col.cellClass;
            }

            return customClass
              ? `${alignmentClass} ${customClass}`
              : alignmentClass;
          },
          headerClass: (params: any) => {
            const alignmentClass =
              cellAlignment === 'right'
                ? 'ag-right-aligned-header'
                : 'ag-left-aligned-header';

            let customHeaderClass = '';
            if (col.headerClass) {
              customHeaderClass =
                typeof col.headerClass === 'function'
                  ? col.headerClass(params)
                  : col.headerClass;
            }

            return customHeaderClass
              ? `${alignmentClass} ${customHeaderClass}`
              : alignmentClass;
          },
          comparator: this.createComparator(),
        };

        // PERFORMANCE: Use cellRenderer instead of valueFormatter/valueGetter
        // cellRenderer is only called for VISIBLE cells (thanks to virtualization)
        // This allows formatting without impacting sort performance on 60k+ rows
        if (options.appConfig && !col.cellRenderer) {
          const isNumericColumn = cellAlignment === 'right';

          if (isNumericColumn) {
            // Only format numeric columns to preserve performance
            gridCol.cellRenderer = (params: any) => {
              if (
                params.value === null ||
                params.value === undefined ||
                params.value === ''
              ) {
                return '';
              }
              const formatted = UtilsService.getPrecisionNumber(
                params.value,
                options.appConfig.GLOBAL.TO_FIXED,
              );
              return String(formatted);
            };
          }
        }

        columnDefs.push(gridCol);
      }
    }

    return columnDefs;
  }

  /**
   * Creates a comparator function for AG Grid columns that handles both numeric and string values
   * PERFORMANCE OPTIMIZED: Uses fast comparison methods for large datasets (60k+ rows)
   * @returns Comparator function for AG Grid
   */
  createComparator() {
    return (a: any, b: any) => {
      // Handle null/undefined/empty values
      if (a == null || a === '') a = '';
      if (b == null || b === '') b = '';

      // Try numeric comparison first (fastest)
      const numA = Number(a);
      const numB = Number(b);

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }

      // String comparison - use simple comparison for performance
      // localeCompare with numeric:true is VERY slow on 60k+ rows
      const strA = String(a);
      const strB = String(b);

      if (strA < strB) return -1;
      if (strA > strB) return 1;
      return 0;
    };
  }

  /**
   * Analyzes data and suggests column types and configurations
   * @param inputDatas - The data to analyze
   * @param displayedColumns - Current column configuration
   * @returns Enhanced column configuration with suggested types
   */
  analyzeAndEnhanceColumns(
    inputDatas: any[],
    displayedColumns: GridColumnsI[],
  ): GridColumnsI[] {
    return displayedColumns.map((col) => {
      const alignment = this.getCellAlignment(inputDatas, col.field);

      // Enhance column with detected type information
      return {
        ...col,
        // Add custom properties for better handling
        _detectedType: alignment === 'right' ? 'numeric' : 'text',
        _alignment: alignment,
      } as GridColumnsI & { _detectedType: string; _alignment: string };
    });
  }

  /**
   * Validates and sanitizes grid data - replicates original logic exactly
   * @param inputDatas - The raw input data
   * @param displayedColumns - Column configuration
   * @returns Sanitized data ready for AG Grid
   */
  sanitizeGridData(inputDatas: any[], displayedColumns: GridColumnsI[]): any[] {
    if (!inputDatas || !displayedColumns) {
      return [];
    }

    const rowData: any[] = [];
    for (let i = 0; i < inputDatas.length; i++) {
      const currentData = inputDatas[i];
      if (currentData) {
        const currentRow: DynamicI = {};
        for (let j = 0; j < displayedColumns.length; j++) {
          currentRow[displayedColumns[j]!.field] =
            currentData[displayedColumns[j]!.field];
        }
        rowData.push(currentRow);
      }
    }
    return rowData;
  }

  /**
   * Generates CSS classes for column alignment
   * @param alignment - The alignment type ('left' or 'right')
   * @returns Object with cell and header CSS classes
   */
  getAlignmentClasses(alignment: 'left' | 'right'): {
    cellClass: string;
    headerClass: string;
  } {
    return {
      cellClass:
        alignment === 'right'
          ? 'ag-right-aligned-cell'
          : 'ag-left-aligned-cell',
      headerClass:
        alignment === 'right'
          ? 'ag-right-aligned-header'
          : 'ag-left-aligned-header',
    };
  }
}
