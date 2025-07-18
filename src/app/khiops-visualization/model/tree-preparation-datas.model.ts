/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TreeNodeModel } from './tree-node.model';
import { TreePreparationVariableModel } from './tree-preparation-variable.model';
import { TreeChildNode } from '@khiops-visualization/interfaces/tree-preparation-report';

export interface TreePreparationState {
  selectedNode: TreeNodeModel | undefined;
  selectedNodes: TreeNodeModel[];
  previousSelectedNodes: TreeNodeModel[];
}

export const initialState: TreePreparationState = {
  selectedNode: undefined,
  selectedNodes: [],
  previousSelectedNodes: [],
};

export class TreePreparationDatasModel {
  selectedVariable?: TreePreparationVariableModel = undefined;
  treeColorsMap?: any = undefined;
  dimensionTree?: [TreeNodeModel] = undefined;
  selectedFlattenTree?: TreeChildNode[] = undefined;
  maxFrequencies!: number;
  minFrequencies!: number;
  isRegressionAnalysis: boolean = false;
  classesCount: number = 0;
  treePartsTargetFrequencies: number[][] = [];

  /**
   * Computes the target frequencies for each part of the tree
   *
   * @example
   * nodesId: L2, L3, L4
   * targetValues: I0, I1, I2, I3
   * Give an array of frequencies for each node
   * For instance:
   * [
   *  [38, 0, 0, 0],
   *  [0, 1, 34, 0],
   *  [0, 2, 3, 27]
   * ]
   */
  computeTreePartTargetFrequencies() {
    const leafs = this.selectedFlattenTree?.filter((e) => e.targetValues);

    if (this.selectedFlattenTree && this.selectedVariable) {
      const allValues = leafs
        ?.map((item) => item.targetValues?.values)
        .flat()
        .filter((value, index, self) => self.indexOf(value) === index);
      if (allValues) {
        allValues.sort();
        this.treePartsTargetFrequencies = leafs
          ? leafs.map((item) => {
              const frequencyRow = new Array(allValues.length).fill(0);
              item.targetValues?.values.forEach((value, index) => {
                const valueIndex = allValues.indexOf(value);
                if (valueIndex !== -1) {
                  frequencyRow[valueIndex] =
                    item.targetValues?.frequencies[index];
                }
              });
              return frequencyRow;
            })
          : [];

        // Sort this.treePartsTargetFrequencies by line total count
        // to order them by the most frequent to the less frequent
        // In regression case it's not sorted
        this.treePartsTargetFrequencies.sort((a, b) => {
          const aTotal = a.reduce((acc, val) => acc + val, 0);
          const bTotal = b.reduce((acc, val) => acc + val, 0);
          return bTotal - aTotal;
        });
      }
    }
  }
}
