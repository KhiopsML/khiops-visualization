import {
  DimensionCovisualization,
  Interval,
  ValueGroup,
} from '@khiops-covisualization/interfaces/app-datas';
import { TYPES } from '@khiops-library/enum/types';
import { DimensionVisualization } from '@khiops-visualization/interfaces/app-datas';
import _ from 'lodash';

export class DimensionVisualizationModel implements DimensionVisualization {
  partition: number[][] | string[]; // KV
  partitionType: string; // KV
  variable: string; // KV
  defaultGroupIndex: number; // KV
  type: string | TYPES;

  partitionInputs: number[][] | string[]; // KV
  parts: number; // KV
  name: string; // KV

  intervals: Interval[];
  valueGroups: ValueGroup[];

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
