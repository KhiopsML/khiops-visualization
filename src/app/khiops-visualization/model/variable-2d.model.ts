/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { VARIABLE_TYPES } from '@khiops-library/enum/variable-types';
import { VariablePairStatistics } from '@khiops-visualization/interfaces/bivariate-preparation-report';

/**
 * Model of 2D variable for grid display
 */
export class Variable2dModel {
  _id: string;
  rank?: string;
  name1?: string;
  name2?: string;
  deltaLevel?: number;
  level?: number;
  level1?: number;
  level2?: number;
  variables?: number;
  cells?: number;
  parts1?: number;
  parts2?: number;
  values?: number;
  variableType: string;

  constructor(object: VariablePairStatistics) {
    // Assign values from input
    Object.assign(this, object);

    this._id = object.rank + '_' + object.name1 + '`' + object.name2;

    this.variableType = VARIABLE_TYPES.PREPARATION_2D;
  }
}
