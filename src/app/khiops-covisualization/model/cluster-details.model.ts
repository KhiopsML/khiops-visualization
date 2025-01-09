/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TreeNodeModel } from './tree-node.model';

export class ClusterDetailsModel {
  name: string;
  _id: string;
  father: string;
  frequency!: number;
  interest!: number;
  size: number | undefined;
  hierarchicalRank!: number;
  hierarchicalLevel!: number;
  rank!: number;

  constructor(object: TreeNodeModel, currentNodesNames?: TreeNodeModel[]) {
    // Assign values from input
    Object.assign(this, object);

    this.name = object.shortDescription;
    this.size = object.clusterCompositionSize;
    this._id = object.cluster;

    // @ts-ignore
    if (currentNodesNames?.[object.parentCluster]) {
      // @ts-ignore
      this.father = currentNodesNames[object.parentCluster];
    } else {
      this.father = object.parentCluster;
    }
  }
}
