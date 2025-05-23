/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Interval,
  ValueGroup,
} from '@khiops-covisualization/interfaces/app-datas';
import { TYPES } from '@khiops-library/enum/types';
import { DimensionVisualization } from '@khiops-visualization/interfaces/app-datas';
import _ from 'lodash';

export class DimensionVisualizationModel implements DimensionVisualization {
  partition!: number[][] | string[];
  partitionType!: string;
  variable!: string;
  defaultGroupIndex: number | undefined;
  type!: string | TYPES;

  partitionInputs!: number[][] | string[];
  parts!: number;
  name!: string;

  intervals!: Interval[];
  valueGroups!: ValueGroup[];

  constructor(object: DimensionVisualization) {
    // Assign values from input
    Object.assign(this, object);

    if (this.partition) {
      // Clone partition to keep real datas
      this.partitionInputs = _.clone(object.partition);
      this.setMissingPartition();
      this.parts = this.partition.length;
    }
    if (this.variable) {
      this.name = object.variable;
    }
    if (this.defaultGroupIndex) {
      this.defaultGroupIndex = object.defaultGroupIndex;
    } else {
      this.defaultGroupIndex = 0;
    }
  }

  /**
   * Sets the missing partition input to 'Missing' if it is empty.
   */
  setMissingPartition() {
    if (this.partitionInputs[0] && this.partitionInputs[0].length === 0) {
      this.partitionInputs[0] = 'Missing';
    }
  }
}
