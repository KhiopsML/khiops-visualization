/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  DimensionCovisualization,
  DimensionPartition,
  ValueGroup,
} from '@khiops-covisualization/interfaces/app-datas';
import { ExtDatasModel } from './ext-datas.model';
import { TreeNodeModel } from './tree-node.model';
import { TYPES } from '@khiops-library/enum/types';
import { CompositionUtils } from '../providers/composition.utils.service';

export class CompositionModel {
  _id: string;
  cluster: string;
  terminalCluster: string;
  typicality: number | undefined;
  value: string | undefined;
  innerVariable: string | undefined;
  part: string | string[] | undefined;
  partFrequencies?: number[] | undefined; // Frequencies corresponding to each part element for numerical variables
  partDetails?: string[] | undefined; // Exhaustive list of parts (non-simplified) for numerical variables
  frequency: number | undefined;
  rank: number;
  externalData: string | undefined;
  innerVariableType?: string;
  valueGroups?: ValueGroup | undefined;
  type?: string;

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
      if (partition?.type === TYPES.CATEGORICAL) {
        // get the valueGroups of current cluster to have the exhaustive list of values
        const clusterIndex = partition?.valueGroups?.findIndex(
          (item) => item.cluster === this.value,
        );
        this.valueGroups =
          partition?.valueGroups && clusterIndex !== undefined
            ? partition?.valueGroups[clusterIndex]
            : undefined;
      }

      this.innerVariable = innerValues?.[0]?.toString();
      this.innerVariableType = innerVariables?.dimensionSummaries?.find(
        (item) => item.name === this.innerVariable,
      )?.type;

      const currentParts = innerValues?.[1];
      this.part = currentParts;
      this.frequency = 0;

      // Initialize partFrequencies and partDetails arrays for numerical variables
      if (this.innerVariableType === TYPES.NUMERICAL && currentParts) {
        this.partFrequencies = [];
        this.partDetails = Array.isArray(currentParts)
          ? [...currentParts]
          : [currentParts];

        // Sort partDetails by interval order using centralized utility
        this.partDetails = CompositionUtils.sortIntervals(this.partDetails);
      }

      for (let j = 0; currentParts && j < currentParts.length; j++) {
        const currentPart = currentParts[j];

        const matchingGroupIndex = object.values?.findIndex(
          (item) => item === this.innerVariable + ' ' + currentPart,
        );
        if (matchingGroupIndex !== -1) {
          const partFrequency =
            object.valueFrequencies?.[matchingGroupIndex] ?? 0;
          this.frequency += partFrequency;

          // Store individual part frequency for numerical variables
          if (
            this.innerVariableType === TYPES.NUMERICAL &&
            this.partFrequencies
          ) {
            this.partFrequencies.push(partFrequency);
          }
        }
      }
    }

    // @ts-ignore
    this.externalData = externalDatas?.[this.value] || undefined;

    // Get rank and name if it has been changed from dimensionHierarchies array
    this.rank = currentDimensionHierarchyCluster.rank;

    this._id = object.cluster + '_' + index;
  }
}
