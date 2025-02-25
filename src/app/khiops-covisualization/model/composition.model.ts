/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ValueGroup } from '@khiops-covisualization/interfaces/app-datas';
import { ExtDatasModel } from './ext-datas.model';
import { TreeNodeModel } from './tree-node.model';

export class CompositionModel {
  _id: string;
  cluster: string;
  terminalCluster: string;
  typicality: number | undefined;
  value: string | undefined;
  frequency: number | undefined;
  rank: number;
  externalData: string | undefined;

  constructor(
    object: ValueGroup,
    currentDimensionHierarchyCluster: TreeNodeModel,
    index: number,
    externalDatas: ExtDatasModel,
  ) {
    this.terminalCluster =
      object.cluster || currentDimensionHierarchyCluster.shortDescription;
    this.cluster = currentDimensionHierarchyCluster.shortDescription;

    this.value = object.values[index];
    this.value = this.value?.replace(/[\n\r]+/g, ''); // remove carriage return #53
    this.typicality = object.valueTypicalities[index];
    this.frequency = object.valueFrequencies[index];

    // @ts-ignore
    this.externalData = externalDatas?.[this.value] || undefined;

    // Get rank and name if it has been changed from dimensionHierarchies array
    this.rank = currentDimensionHierarchyCluster.rank;

    this._id = object.cluster + '_' + index;
  }
}
