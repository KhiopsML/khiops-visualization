/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import cloneDeep from 'lodash-es/cloneDeep';
import { AppConfig } from '../../../environments/environment';
import {
  DimensionVisualization,
  VariableDetail,
} from '@khiops-visualization/interfaces/shared-interfaces';

export class VariableDetailsModel {
  dataGrid!: {
    dimensions: DimensionVisualization[];
    partTargetFrequencies: number[][]; // regression or explanatory case
    partInterests: number[]; // regression or explanatory case
    cellTargetFrequencies: number[][]; // bivariate case
    cellInterests: number[]; // bivariate case
    cellIds: string[]; // normal 2d case
    cellPartIndexes: number[][]; // normal 2d case
    cellFrequencies: number[]; // normal 2d case
    frequencies: number[]; // normal case
  };
  inputValues!: {
    // regression or explanatory case
    values: string[];
    frequencies: string[];
  };
  isLimitedDatas!: boolean;

  constructor(object: VariableDetail) {
    this.isLimitedDatas = false;
    if (object) {
      const clone: VariableDetail = cloneDeep(object);

      // @ts-ignore
      this.dataGrid = clone?.dataGrid || undefined;

      // @ts-ignore
      this.inputValues = clone?.inputValues || undefined;

      // Limit datas to 10000
      const maxDatasSize = AppConfig.visualizationCommon.GLOBAL.MAX_TABLE_SIZE;
      if (
        maxDatasSize &&
        this.inputValues &&
        this.inputValues.values.length > maxDatasSize
      ) {
        this.inputValues.values.length = maxDatasSize;
        this.isLimitedDatas = true;
      }
    }
  }

  /**
   * Sets the cell frequencies for the data grid.
   * @param cellFrequencies - An array of cell frequencies.
   */
  setCellFrequencies(cellFrequencies: number[]) {
    this.dataGrid.cellFrequencies = cellFrequencies;
  }

  /**
   * Sets the part target frequencies for the data grid.
   * @param partTargetFrequencies - A 2D array of part target frequencies.
   */
  setTargetCellFrequencies(cellTargetFrequencies: number[][]) {
    this.dataGrid.cellTargetFrequencies = cellTargetFrequencies;
  }
}
