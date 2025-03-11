/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TYPES } from '@khiops-library/enum/types';
import { VARIABLE_TYPES } from '@khiops-library/enum/variable-types';
import { TreePreparationVariableStatistic } from '@khiops-visualization/interfaces/tree-preparation-report';

export class TreePreparationVariableModel
  implements TreePreparationVariableStatistic
{
  _id: string;
  mode!: string;
  name!: string;
  rank!: string;
  variableType: string;
  type!: string;
  derivationRule!: string;
  values!: number;
  parts!: number;
  modeFrequency!: number;
  level!: number;

  isCategorical: boolean;
  isNumerical: boolean;

  constructor(object: TreePreparationVariableStatistic, id: string) {
    // Assign values from input
    Object.assign(this, object);

    // Generate id for grid
    this._id = id;

    this.variableType = VARIABLE_TYPES.TREE_PREPARATION;

    this.isNumerical = this.type === TYPES.NUMERICAL;
    this.isCategorical = this.type === TYPES.CATEGORICAL;
  }
}
