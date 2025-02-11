/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TreeNodeModel } from './tree-node.model';
import { TreePreparationVariableModel } from './tree-preparation-variable.model';
import { TREE_COLORS } from '@khiops-visualization/config/colors';
import { TreeChildNode } from '@khiops-visualization/interfaces/tree-preparation-report';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas';
import { TASKS } from '@khiops-library/enum/tasks';

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
  appDatas: VisualizationDatas | undefined = undefined;
  maxFrequencies!: number;
  minFrequencies!: number;
  isRegressionAnalysis: boolean = false;
  classesCount: number;
  treePartsTargetFrequencies: number[][] = [];

  constructor(appDatas: VisualizationDatas) {
    this.appDatas = appDatas;

    this.isRegressionAnalysis =
      this.appDatas?.treePreparationReport?.summary?.learningTask ===
      TASKS.REGRESSION;

    this.classesCount =
      this.appDatas?.treePreparationReport?.summary?.targetValues?.values?.length;
  }

  /**
   * Check if current datas are valid
   */
  isValid(): boolean {
    return this.appDatas?.treePreparationReport?.variablesStatistics?.[0]
      ? true
      : false;
  }

  computeRegressionClassesCount() {
    if (this.isRegressionAnalysis && this.selectedVariable) {
      this.classesCount =
        this.appDatas?.treePreparationReport?.variablesDetailedStatistics?.[
          this.selectedVariable.rank
        ]?.inputValues?.values.length || 0;
    }
  }

  /**
   * Compute the color map for the tree based on the selected variable's data.
   * It uses a predefined set of colors and assigns them to the partitions of the selected variable.
   * The color map is stored in the `treeColorsMap` property.
   *
   * @returns The computed tree color map or undefined if no variable is selected.
   */
  computeTreeColorsMap() {
    if (this.selectedVariable) {
      if (this.isRegressionAnalysis) {
        this.treeColorsMap = {};
        const variablesDetailedStatistics =
          this.appDatas?.treePreparationReport?.variablesDetailedStatistics;
        const values =
          variablesDetailedStatistics?.[this.selectedVariable.rank]?.inputValues
            ?.values;
        if (values) {
          for (let i = 0; i < values.length; i++) {
            this.treeColorsMap[values[i]!] = TREE_COLORS[i];
          }
        }
        return this.treeColorsMap;
      } else {
        const variablesDetailedStatistics =
          this.appDatas?.treePreparationReport?.variablesDetailedStatistics;

        this.treeColorsMap = {};
        const dimensions =
          variablesDetailedStatistics?.[this.selectedVariable.rank]?.dataGrid
            .dimensions;
        const dimIndex =
          dimensions?.findIndex(
            (e: any) => e.variable === this.selectedVariable?.name,
          ) || 0;
        const dimDatas = dimensions![dimIndex]?.partition;

        this.treeColorsMap = {};
        if (dimDatas) {
          for (let i = 0; i < dimDatas.length; i++) {
            for (let j = 0; j < dimDatas[i]!.length; j++) {
              this.treeColorsMap[dimDatas[i]![j]!] = TREE_COLORS[i];
            }
          }
        }
        return this.treeColorsMap;
      }
    }
    return undefined;
  }

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
