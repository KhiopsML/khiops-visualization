/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { UtilsService } from '@khiops-library/providers/utils.service';
import { TargetValues } from '@khiops-visualization/interfaces/app-datas';
import { TreeChildNode } from '@khiops-visualization/interfaces/tree-preparation-report';
import { TreePreparationDatasModel } from './tree-preparation-datas.model';

export class TreeNodeModel implements TreeChildNode {
  id: string | undefined;
  nodeId!: string;
  _id: string | undefined;
  shortDescription: string;
  isLeaf: boolean;
  variable!: string;
  partitionType!: string;
  type!: string;
  childNodes!: TreeChildNode[];
  partition!: [];
  targetValues: TargetValues;
  children: TreeNodeModel[];
  color: string;
  isTrusted: boolean;
  defaultGroupIndex?: number;
  valuesProbs: number[] = [];
  purity?: number;
  totalFreqs?: number;
  isCollapsed?: boolean;
  isRegressionAnalysis?: boolean;

  constructor(
    object: TreeChildNode,
    treePreparationDatas?: TreePreparationDatasModel,
    isTrusted?: boolean,
  ) {
    // Assign values from input
    Object.assign(this, object);

    this.id = object.nodeId || undefined;
    this._id = this.id;
    this.isLeaf = object.childNodes ? false : true;
    this.color = treePreparationDatas?.treeColorsMap[this.id || ''] || '#999'; // for folders : grey

    this.isTrusted = isTrusted || false;
    this.shortDescription = object.nodeId + ' ';
    this.shortDescription += this.variable ? this.variable : '';

    this.targetValues = object.targetValues || {
      frequencies: [],
      values: [],
    };
    this.children = [];
    this.isRegressionAnalysis = treePreparationDatas?.isRegressionAnalysis;

    this.formatChildrenNodesDatas(this.childNodes, treePreparationDatas);
    if (this.isLeaf) {
      this.totalFreqs = UtilsService.arraySum(this.targetValues?.frequencies);
    } else {
      this.deepGetChildrenModalityTargetValues(this.childNodes);
    }

    if (treePreparationDatas?.classesCount) {
      this.purity = this.computePurity(treePreparationDatas?.classesCount);
    }
  }

  /**
   * Formats the child nodes data.
   * This method initializes the `children` array and populates it with new instances
   * of `TreeNodeModel` created from the provided `childNodes`. Each child node is
   * recursively processed to ensure the entire tree structure is correctly instantiated.
   *
   * @param childNodes - The array of child nodes to format.
   * @param treePreparationDatas - Optional data used for tree preparation, such as color mapping.
   */
  formatChildrenNodesDatas(
    childNodes: TreeChildNode[],
    treePreparationDatas?: TreePreparationDatasModel,
  ) {
    if (childNodes) {
      this.children = [];
      for (let i = 0; i < childNodes.length; i++) {
        const childNode = childNodes[i];
        if (childNode) {
          this.children.push(
            new TreeNodeModel(childNode, treePreparationDatas, this.isTrusted),
          );
        }
      }
    }
  }

  /**
   * Computes the probabilities of each target value.
   * This method calculates the probability of each target value by dividing
   * its frequency by the total frequency of all target values. The computed
   * probabilities are stored in the `valuesProbs` array.
   *
   * @returns The array of computed probabilities.
   */
  computeValuesProbs() {
    this.valuesProbs = [];
    for (let i = 0; i < this.targetValues.frequencies.length; i++) {
      const frequency = this.targetValues.frequencies[i];
      if (frequency !== undefined && this.totalFreqs) {
        this.valuesProbs.push(frequency / this.totalFreqs);
      }
    }
    return this.valuesProbs;
  }

  /**
   * Recursively aggregates the target values (frequencies and values) from child nodes.
   * This method traverses through the child nodes and collects their target values,
   * merging them into the current node's target values. If a value already exists,
   * its frequency is updated; otherwise, the value and its frequency are added.
   *
   * @param childNodes - The child nodes to aggregate target values from.
   */
  deepGetChildrenModalityTargetValues(childNodes: TreeChildNode[]) {
    if (childNodes) {
      for (let i = 0; i < childNodes.length; i++) {
        const childNode = childNodes[i];
        if (childNode?.targetValues) {
          const targetValues = childNode.targetValues;
          for (let j = 0; j < targetValues.frequencies.length; j++) {
            const value = targetValues.values[j];
            const frequency = targetValues.frequencies[j];

            if (value !== undefined && frequency !== undefined) {
              const isExistingIndex =
                this.targetValues.values.length > 0 &&
                this.targetValues.values.indexOf(value);

              if (!isExistingIndex || isExistingIndex === -1) {
                this.targetValues.values.push(value);
                this.targetValues.frequencies.push(frequency);
              } else {
                const existingFreq =
                  this.targetValues.frequencies[isExistingIndex];
                if (existingFreq !== undefined) {
                  this.targetValues.frequencies[isExistingIndex] =
                    existingFreq + frequency;
                }
              }
            }
          }
        }
        if (childNode?.childNodes) {
          this.deepGetChildrenModalityTargetValues(childNode.childNodes);
        }
      }
    }
  }

  /**
   * Compute the purity of a node.
   * Purity is defined as the entropy S of the distribution of classes.
   * The formula used is: 1 + (p1*log2(p1) + p2*log2(p2) + … + pM*log2(pM)) / log2(M)
   * Example for [30, 20, 50]: 1 + (0.3*log2(0.3) + 0.2*log2(0.2) + 0.5*log2(0.5)) / log2(3)
   *
   * @param M - The number of classes.
   * @returns The purity value or undefined if the node is not a leaf.
   */
  computePurity(M: number): number | undefined {
    let purity = undefined;
    if (this.isLeaf) {
      this.computeValuesProbs();

      let pClassLog2 = 0;
      for (let i = 0; i < this.targetValues.frequencies.length; i++) {
        const prob = this.valuesProbs[i];
        if (prob !== undefined && prob > 0) {
          pClassLog2 += prob * Math.log2(prob);
        }
      }
      purity = 1 + pClassLog2 / Math.log2(M);
    }
    return purity;
  }
}
