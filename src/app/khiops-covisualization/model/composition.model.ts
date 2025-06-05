/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  DimensionCovisualization,
  DimensionPartition,
  Interval,
  ValueGroup,
} from '@khiops-covisualization/interfaces/app-datas';
import { ExtDatasModel } from './ext-datas.model';
import { TreeNodeModel } from './tree-node.model';
import { TYPES } from '@khiops-library/enum/types';

export interface DetailedInterval extends Interval {
  valueFrequencies: number[];
}

export class CompositionModel {
  _id: string;
  cluster: string;
  terminalCluster: string;
  typicality: number | undefined;
  value: string | undefined;
  innerVariable: string | undefined;
  part: string | string[] | undefined;
  frequency: number | undefined;
  rank: number;
  externalData: string | undefined;
  innerVariableType?: string;
  valueGroups?: ValueGroup | undefined;
  intervals?: DetailedInterval | undefined;
  detailedParts?: any;

  constructor(
    object: ValueGroup,
    currentDimensionHierarchyCluster: TreeNodeModel,
    currentPartIndex: number,
    index: number,
    externalDatas: ExtDatasModel,
    innerVariables?:
      | {
          dimensionSummaries: DimensionCovisualization[];
          dimensionPartitions: DimensionPartition[];
        }
      | undefined,
    innerValues?: string | (string | string[])[] | undefined,
  ) {
    this.terminalCluster =
      object.cluster || currentDimensionHierarchyCluster.shortDescription;
    this.cluster = currentDimensionHierarchyCluster.shortDescription;

    this.value = object.values[index];
    this.value = this.value?.replace(/[\n\r]+/g, ''); // remove carriage return #53
    this.typicality = object.valueTypicalities[index];
    this.frequency = object.valueFrequencies[index];

    if (innerVariables) {
      const partition = innerVariables.dimensionPartitions[currentPartIndex];
      console.log(' CompositionModel ~ partition:', partition);
      if (partition?.type === TYPES.CATEGORICAL) {
        // get the valueGroups of current cluster to have the exhaustive list of values
        const clusterIndex = partition?.valueGroups?.findIndex(
          (item) => item.cluster === this.value,
        );
        this.valueGroups =
          partition?.valueGroups && clusterIndex !== undefined
            ? partition?.valueGroups[clusterIndex]
            : undefined;
      } else {
        const clusterIndex = partition?.intervals?.findIndex(
          (item) => item.cluster === this.value,
        );
        // @ts-ignore
        this.intervals =
          partition?.intervals && clusterIndex !== undefined
            ? partition?.intervals[clusterIndex]
            : undefined;
        if (!this.intervals?.valueFrequencies) {
          this.intervals!.valueFrequencies = [];
        }

        this.frequency && this.intervals?.valueFrequencies.push(this.frequency);
      }

      this.innerVariable = innerValues?.[0]?.toString();
      this.innerVariableType =
        innerVariables?.dimensionSummaries?.[index]?.type;
      const currentParts = innerValues?.[1];
      this.part = currentParts;
      this.frequency = 0;
      for (let j = 0; currentParts && j < currentParts.length; j++) {
        const currentPart = currentParts[j];

        const matchingGroupIndex = object.values?.findIndex(
          (item) => item === this.innerVariable + ' ' + currentPart,
        );
        if (matchingGroupIndex !== -1) {
          this.frequency += object.valueFrequencies?.[matchingGroupIndex] ?? 0;
        }
        // this.detailedParts?.push(currentPart);
      }
    }
    // console.log(' CompositionModel ~  this.part:', this);

    // @ts-ignore
    this.externalData = externalDatas?.[this.value] || undefined;

    // Get rank and name if it has been changed from dimensionHierarchies array
    this.rank = currentDimensionHierarchyCluster.rank;

    this._id = object.cluster + '_' + index;
  }
}
