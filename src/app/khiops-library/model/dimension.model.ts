import {
  DimensionCovisualization,
  ValueGroup,
} from '@khiops-covisualization/interfaces/app-datas';
import { TYPES } from '@khiops-library/enum/types';
import { DimensionVisualization } from '@khiops-visualization/interfaces/app-datas';
import _ from 'lodash';

export class DimensionModel {
  /**
   * KC use case
   */
  name: string;
  parts: number;
  initialParts: number;
  values: number;
  interest: number;
  min: number;
  max: number;
  description: string;

  /**
   * KV use case
   */
  partition: number[][] | string[]; // KV
  partitionType: string[]; // KV
  variable: string; // KV
  defaultGroupIndex: number; // KV

  /**
   * Commons
   */
  type: string;

  partitionInputs: number[][] | string[]; // KV

  hierarchyFold: boolean;
  isNumerical: boolean;
  isCategorical: boolean;
  currentHierarchyClusterCount: number;
  startPosition: number;
  intervals: {
    cluster: string;
    bounds: number[];
  }[];
  valueGroups: ValueGroup[];

  constructor(
    object: DimensionCovisualization | DimensionVisualization,
    startPosition = 0,
  ) {
    console.log('DimensionModel ~ constructor ~ object:', object);
    // Assign values from input
    Object.assign(this, object);

    this.startPosition = startPosition;
    this.currentHierarchyClusterCount = this.parts;
    this.hierarchyFold = true;

    this.isNumerical = this.type === TYPES.NUMERICAL;
    this.isCategorical = this.type === TYPES.CATEGORICAL;

    // KV
    if ('partition' in object) {
      // Clone partition to keep real datas
      this.partitionInputs = _.clone(object.partition);
      this.setMissingPartition();
      this.parts = this.partition.length;
    }
    if ('variable' in object) {
      this.name = object.variable;
    }
    if ('defaultGroupIndex' in object) {
      this.defaultGroupIndex = object.defaultGroupIndex;
    } else {
      this.defaultGroupIndex = 0;
    }
  }

  /**
   * Sets the hierarchy fold state.
   * @param state - The new state of the hierarchy fold.
   */
  setHierarchyFold(state: boolean) {
    this.hierarchyFold = state;
  }

  /**
   * Sets the current hierarchy cluster count.
   * @param count - The new count of the hierarchy clusters.
   */
  setCurrentHierarchyClusterCount(count) {
    this.currentHierarchyClusterCount = count;
  }

  /**
   * Sets the partition for the dimension.
   * @param dimensionPartition - The partition data for the dimension.
   */
  setPartition(dimensionPartition: any) {
    if (this.isNumerical) {
      this.intervals = dimensionPartition.intervals;
      this.min = this.intervals[0].bounds[0];

      if (this.min === undefined) {
        // bounds are missing for first interval, take the second #123
        /*
          {
            bounds: []
            cluster: "Missing"
          }
         */
        this.min = this.intervals[1].bounds[0];
      }
      this.max = this.intervals[this.intervals.length - 1].bounds[1];
    } else {
      this.valueGroups = dimensionPartition.valueGroups;
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
