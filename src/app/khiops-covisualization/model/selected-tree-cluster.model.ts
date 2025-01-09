/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { TreeNodeModel } from './tree-node.model';

export class SelectedTreeClusterModel {
  // Dimension informations
  dimensionType: string;
  isCategorical: boolean = false;
  isNumerical: boolean = false;
  intervals: number = 0;

  // Node informations
  nbClusters: number = 0;
  values: number = 0;
  interval!: string;
  frequency!: number;

  constructor(dimension: DimensionCovisualizationModel) {
    this.isCategorical = dimension?.isCategorical;
    this.isNumerical = dimension?.isNumerical;
    this.dimensionType = dimension?.type;
  }
  /**
   * Sets the current node information based on the selected node.
   * @param selectedNode - The selected tree node.
   */
  setCurrentNodeInformations(selectedNode: TreeNodeModel) {
    this.interval = selectedNode?.name;
    this.frequency = selectedNode?.frequency;
    if (selectedNode?.valueGroups) {
      this.nbClusters = selectedNode?.valueGroups?.values?.length;
    } else {
      this.nbClusters = this.countClusters(selectedNode);
    }
  }

  /**
   * Counts the number of clusters in the selected node.
   * @param selectedNode - The selected tree node.
   * @returns The number of clusters.
   */
  countClusters(selectedNode: TreeNodeModel): number {
    let count = 0;

    function recursiveCount(node: TreeNodeModel): number {
      if (node.valueGroups) {
        return node.valueGroups.values.length;
      } else if (node.children) {
        return node.children.reduce(
          (acc, child) => acc + recursiveCount(child),
          0,
        );
      }
      return 0;
    }

    count = recursiveCount(selectedNode);
    return count;
  }
}
