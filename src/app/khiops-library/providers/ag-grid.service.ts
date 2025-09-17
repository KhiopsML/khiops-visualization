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

    // Check if it's a valid number (including decimal numbers, negative numbers, etc.)
    return !isNaN(Number(stringValue)) && !isNaN(parseFloat(stringValue));
  }

  /**
   * Determines the cell alignment based on the column data
   * @param inputDatas - The data array to analyze
   * @param columnField - The field name of the column
   * @param threshold - The percentage threshold for considering a column numeric (default: 0.7)
   * @returns 'right' for numeric data, 'left' for text data
   */
  getCellAlignment(inputDatas: any[], columnField: string, threshold: number = 0.7): 'left' | 'right' {
    if (!inputDatas || inputDatas.length === 0) {
      return 'left';
    }

    // Sample a few values from the column to determine if it's numeric
    const sampleSize = Math.min(10, inputDatas.length);
    let numericCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const value = inputDatas[i][columnField];
      if (value !== null && value !== undefined && value !== '') {
        if (this.isNumeric(value)) {
          numericCount++;
        }
      }
    }

    // If most values are numeric, align right, otherwise align left
    return numericCount >= sampleSize * threshold ? 'right' : 'left';
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
    } = {}
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
          cellRendererFramework: col.cellRendererFramework,
          cellRendererParams: col.cellRendererParams,
          cellClass: cellAlignment === 'right' ? 'ag-right-aligned-cell' : 'ag-left-aligned-cell',
          headerClass: cellAlignment === 'right' ? 'ag-right-aligned-header' : 'ag-left-aligned-header',
          comparator: this.createComparator(),
        };

        // Add value formatter if app config is provided
        if (options.appConfig) {
          gridCol.valueFormatter = (params: any) =>
            params.value && UtilsService.getPrecisionNumber(params.value, options.appConfig.GLOBAL.TO_FIXED);
        }

        columnDefs.push(gridCol);
      }
    }

    return columnDefs;
  }

  /**
   * Creates a comparator function for AG Grid columns that handles both numeric and string values
   * @returns Comparator function for AG Grid
   */
  createComparator() {
    return (a: any, b: any) => {
      const result = a - b;
      if (isNaN(result)) {
        if (!a || a === '' || a === 'undefined') {
          a = '0';
        }
        if (!b || b === '' || b === 'undefined') {
          b = '0';
        }
        return a
          .toString()
          .trim()
          .localeCompare(b.toString().trim(), undefined, {
            numeric: true,
          });
      } else {
        return result;
      }
    };
  }

  /**
   * Analyzes data and suggests column types and configurations
   * @param inputDatas - The data to analyze
   * @param displayedColumns - Current column configuration
   * @returns Enhanced column configuration with suggested types
   */
  analyzeAndEnhanceColumns(inputDatas: any[], displayedColumns: GridColumnsI[]): GridColumnsI[] {
    return displayedColumns.map(col => {
      const alignment = this.getCellAlignment(inputDatas, col.field);
      
      // Enhance column with detected type information
      return {
        ...col,
        // Add custom properties for better handling
        _detectedType: alignment === 'right' ? 'numeric' : 'text',
        _alignment: alignment
      } as GridColumnsI & { _detectedType: string; _alignment: string };
    });
  }

  /**
   * Validates and sanitizes grid data
   * @param inputDatas - The raw input data
   * @param displayedColumns - Column configuration
   * @returns Sanitized data ready for AG Grid
   */
  sanitizeGridData(inputDatas: any[], displayedColumns: GridColumnsI[]): any[] {
    if (!inputDatas || !displayedColumns) {
      return [];
    }

    return inputDatas.map(dataRow => {
      const sanitizedRow: DynamicI = {};
      
      displayedColumns.forEach(col => {
        let value = dataRow[col.field];
        
        // Clean up numeric values
        if (value !== null && value !== undefined && this.isNumeric(value)) {
          // Ensure numeric values are properly formatted
          value = parseFloat(value.toString().trim());
        }
        
        sanitizedRow[col.field] = value;
      });
      
      return sanitizedRow;
    });
  }

  /**
   * Generates CSS classes for column alignment
   * @param alignment - The alignment type ('left' or 'right')
   * @returns Object with cell and header CSS classes
   */
  getAlignmentClasses(alignment: 'left' | 'right'): { cellClass: string; headerClass: string } {
    return {
      cellClass: alignment === 'right' ? 'ag-right-aligned-cell' : 'ag-left-aligned-cell',
      headerClass: alignment === 'right' ? 'ag-right-aligned-header' : 'ag-left-aligned-header'
    };
  }
}
