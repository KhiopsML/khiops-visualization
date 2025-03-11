/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TYPES } from '@khiops-library/enum/types';
import { VARIABLE_TYPES } from '@khiops-library/enum/variable-types';
import { PreparationVariableStatistic } from '../interfaces/preparation-report';
import { REPORT } from '@khiops-library/enum/report';

export class PreparationVariableModel implements PreparationVariableStatistic {
  _id: string;
  mode!: string;

  rank!: string;
  variableType: string;
  type!: string;
  preparedName!: string;
  derivationRule!: string;

  isCategorical: boolean;
  isNumerical: boolean;

  weight!: number;
  values!: number;
  parts!: number;
  modeFrequency!: number;
  level!: number;

  is2dVariable = false;

  name!: string;
  targetParts!: number;
  min?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
  missingNumber!: number;
  sparseMissingNumber!: number;

  constructor(
    object: PreparationVariableStatistic,
    id: string,
    preparationSource: string,
  ) {
    // Assign values from input
    Object.assign(this, object);

    // Generate id for grid
    this._id = id;

    this.isNumerical = this.type === TYPES.NUMERICAL;
    this.isCategorical = this.type === TYPES.CATEGORICAL;

    this.variableType =
      preparationSource === REPORT.PREPARATION_REPORT
        ? VARIABLE_TYPES.PREPARATION
        : VARIABLE_TYPES.TEXT_PREPARATION;
  }
}
