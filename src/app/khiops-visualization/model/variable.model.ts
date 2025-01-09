/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TYPES } from '@khiops-library/enum/types';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { VariableDetail } from '@khiops-visualization/interfaces/app-datas';
import { PreparationVariableStatistic } from '@khiops-visualization/interfaces/preparation-report';
import { TextPreparationVariableStatistic } from '@khiops-visualization/interfaces/text-preparation-report';
import { TreePreparationVariableStatistic } from '@khiops-visualization/interfaces/tree-preparation-report';

export class VariableModel {
  _id: string;
  rank?: string;
  name?: string;
  level: number;
  parts?: number;
  values: number;
  type?: string;
  mode?: string;
  modeCoverage: number | undefined;
  min?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
  missingNumber?: number;
  derivationRule?: string;
  targetParts?: number;

  constructor(
    object:
      | PreparationVariableStatistic
      | TextPreparationVariableStatistic
      | TreePreparationVariableStatistic,
    detailedDatas: VariableDetail,
  ) {
    // Assign values from input
    Object.assign(this, object);

    // Generate id for grid
    this._id = object.name;

    this.level = object.level || 0;

    this.values = object.values || 0;
    if (this.type === TYPES.CATEGORICAL && detailedDatas) {
      this.modeCoverage = this.computeModeCoverage(detailedDatas) || undefined;
    } else {
      this.modeCoverage = undefined;
    }

    if (this.type === TYPES.NUMERICAL) {
      this.missingNumber = object.missingNumber || 0;
    } else {
      // Missing number can be 0 or undefined for categorical variables #140
      this.missingNumber =
        object.missingNumber !== undefined ? object.missingNumber : undefined;
    }
  }

  /**
   * Computes the coverage of the mode value within the provided detailed data.
   *
   * @param detailedDatas - An object containing input values and their frequencies.
   * @returns The coverage of the mode value as a fraction of the total frequencies.
   */
  computeModeCoverage(detailedDatas: VariableDetail) {
    const modeIndex = detailedDatas.inputValues?.values.indexOf(this.mode!);
    if (modeIndex) {
      const modeCoverage =
        detailedDatas.inputValues?.frequencies[modeIndex]! /
        UtilsService.arraySum(detailedDatas.inputValues?.frequencies);
      return modeCoverage;
    } else {
      return undefined;
    }
  }
}
