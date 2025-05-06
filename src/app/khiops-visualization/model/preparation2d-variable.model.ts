/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { VARIABLE_TYPES } from '@khiops-library/enum/variable-types';
import { VariablePairStatistics } from '@khiops-visualization/interfaces/bivariate-preparation-report';

export class Preparation2dVariableModel implements VariablePairStatistics {
  _id: string;

  noCorrelation: boolean;

  name!: string;
  name1!: string;
  name2!: string;
  nameX!: string;
  nameY!: string;
  variableType: string;
  rank!: string;

  values!: number;
  cells!: number;
  dataCost!: number;
  parts!: number;
  parts1!: number;
  parts2!: number;
  level!: number;
  level1!: number;
  level2!: number;
  variables!: number;

  constructor(object: VariablePairStatistics) {
    // Assign values from input
    Object.assign(this, object);

    this.variableType = VARIABLE_TYPES.PREPARATION_2D;

    if ((object.level1 === 0 || object.level2 === 0) && !object.level) {
      this.noCorrelation = true;
    } else {
      this.noCorrelation = false;
    }

    if (this.name1 && this.name2) {
      this.nameX = this.name1;
      this.nameY = this.name2;
      this.name = this.name1 + '`' + this.name2;
    }

    // Generate id for grid
    this._id = this.rank + '_' + this.name;
  }
}
