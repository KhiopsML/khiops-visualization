import {
  DimensionCovisualization,
  ValueGroup,
} from '@khiops-covisualization/interfaces/app-datas';
import { TYPES } from '@khiops-library/enum/types';
import { DimensionVisualization } from '@khiops-visualization/interfaces/app-datas';
import _ from 'lodash';

export class DimensionCovisualizationModel implements DimensionCovisualization {
  name: string;
  parts: number;
  initialParts: number;
  values: number;
  interest: number;
  min: number;
  max: number;
  description: string;
  type: string | TYPES;

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
    // Assign values from input
    Object.assign(this, object);

    this.startPosition = startPosition;
    this.currentHierarchyClusterCount = this.parts;
    this.hierarchyFold = true;

    this.isNumerical = this.type === TYPES.NUMERICAL;
    this.isCategorical = this.type === TYPES.CATEGORICAL;
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
}
