/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { VariablePairStatistics } from '@khiops-visualization/interfaces/bivariate-preparation-report';

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

  constructor(object: VariablePairStatistics) {
    // Assign values from input
    Object.assign(this, object);

    this._id = object.name1 + '`' + object.name2;
  }
}
