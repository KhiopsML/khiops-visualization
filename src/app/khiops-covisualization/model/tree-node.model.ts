/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Cluster,
  ValueGroup,
} from '@khiops-covisualization/interfaces/app-datas';
import { TYPES } from '@khiops-library/enum/types';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { UtilsService } from '@khiops-library/providers/utils.service';

export class TreeNodeModel {
  id: number;
  _id: string;
  hierarchy: string;
  nbClusters!: number;
  leafPosition: number;

  // name and cluster have always same value
  name: string;
  cluster!: string;
  bounds: string;
  valueGroups: ValueGroup | undefined; // in case of categorical

  shortDescription: string;
  parentCluster!: string;
  frequency!: number;
  interest!: number;
  hierarchicalLevel!: number;
  rank!: number;
  hierarchicalRank!: number;
  isLeaf!: boolean;
  children: TreeNodeModel[];
  description: string | undefined;
  annotation: string;

  childrenList: string[] = [];
  childrenLeafIndexes: number[] = [];
  childrenLeafList: string[] = [];

  isCollapsed: boolean;
  matrixIndex: number | string;
  isParentCluster = false;
  isUnfoldedByDefault = false;

  externalData!: DynamicI;

  clusterCompositionSize: number | undefined;
  innerValues: ((string | string[])[][] | undefined)[] = [];

  /**
   * Constructor to initialize a TreeNodeModel instance.
   * @param id - The unique identifier for the node.
   * @param object - The object containing node properties.
   * @param dimension - The dimension information.
   * @param collapsedNodes - List of nodes that are collapsed.
   * @param nbClusters - Number of clusters.
   * @param leafPosition - Position of the leaf.
   * @param j - Index for matrix.
   * @param currentNodesNames - Optional current node names.
   * @param currentAnnotations - Optional current annotations.
   * @param extData - Optional external data.
   * @param valueGroups - Optional value group for categorical data.
   */
  constructor(
    id: number,
    object: Cluster,
    dimension: DimensionCovisualizationModel,
    collapsedNodes: string[],
    leafPosition: number,
    j: number,
    currentNodesNames?: Record<string, string>,
    currentAnnotations?: Record<string, string>,
    extData?: Record<string, any>,
    valueGroups?: ValueGroup,
  ) {
    // Assign values from input
    Object.assign(this, object);

    // Generate id for tree node plugin
    this.id = id;

    this.valueGroups = valueGroups;

    // Generate id for grid
    this._id = object.cluster;
    this.leafPosition = leafPosition || -1;
    this.hierarchy = dimension.name || '';

    this.bounds = this.cluster;

    if (dimension.type === TYPES.NUMERICAL) {
      // Reformat numerical values
      this.bounds = this.bounds.replace(']-inf', '[' + dimension.min);
      this.bounds = this.bounds.replace('+inf[', dimension.max + ']');
      // this.bounds = this.bounds.replace('*', 'Missing U ');
      // Code scanning alerts #4
      this.bounds = this.bounds.replace(/\*/g, 'Missing U ');
    }

    this.name = this.cluster;

    if (currentNodesNames?.[this.name]) {
      this.shortDescription = currentNodesNames[this.name] ?? '';
    } else {
      this.shortDescription = this.bounds;
    }
    if (currentAnnotations?.[this.name]) {
      this.annotation = currentAnnotations[this.name] ?? '';
    } else {
      this.annotation = '';
    }

    if (this.valueGroups && extData) {
      for (let index = 0; index < this.valueGroups?.values.length; index++) {
        const element = this.valueGroups.values[index];
        if (element && extData[element]) {
          if (!this.externalData) {
            this.externalData = {};
          }
          this.externalData[element] = extData[element];
        }
      }
    }

    this.children = [];

    if (this.parentCluster === '') {
      this.isParentCluster = true;
    }
    this.isCollapsed = collapsedNodes.includes(this.name) || false;

    if (this.isLeaf) {
      this.matrixIndex = j;
    } else {
      this.matrixIndex = '';
    }
    if (dimension.type === TYPES.CATEGORICAL) {
      this.clusterCompositionSize =
        dimension.valueGroups?.[leafPosition]?.values?.length;
    }
  }

  updateAnnotation(annotation: string) {
    this.annotation = annotation;
  }

  /**
   * Populates the childrenList, childrenLeafList, and childrenLeafIndexes arrays
   * by traversing the tree starting from the current node.
   */
  getChildrenList() {
    this.childrenList = [];
    this.childrenLeafList = [];
    this.childrenLeafIndexes = [];
    // Use the optimized iterative version by default
    this.deepGetChildrenNames(this.children, this.name, this.matrixIndex);
  }

  getInnerValueGroups(dimension: DimensionCovisualizationModel) {
    if (
      this.valueGroups &&
      dimension.type === TYPES.CATEGORICAL &&
      dimension.isVarPart &&
      this.isLeaf
    ) {
      // it's a leaf node
      // valueGroups are already set
      // Merge identical elements in innerValues
      const mergedGroums = UtilsService.mergeIdenticalValues(
        this.valueGroups?.values,
      );

      //@ts-ignore
      this.innerValues.push(mergedGroums);
    } else {
      // it's a node
      // get valueGroups of children
      for (let index = 0; index < this.childrenList.length; index++) {
        const node = this.childrenList[index];
        if (node !== this.name) {
          const valueGroups = dimension.valueGroups?.find(
            (child) => child.cluster === node,
          );
          if (valueGroups) {
            // Merge identical elements in innerValues
            const mergedGroums = UtilsService.mergeIdenticalValues(
              valueGroups?.values,
            );
            //@ts-ignore
            this.innerValues.push(mergedGroums);
          }
        }
      }
    }
  }

  /**
   * Traverses the tree to collect names and matrix indexes of children nodes.
   * Uses iterative approach with stack to avoid recursion depth issues.
   * @param children - The children nodes to traverse.
   * @param name - The name of the current node.
   * @param matrixIndex - The matrix index of the current node.
   */
  deepGetChildrenNames(
    children: TreeNodeModel[],
    name: string,
    matrixIndex: number | string,
  ) {
    // Use iterative approach with stack to avoid recursion depth issues
    const stack: Array<{
      children: TreeNodeModel[];
      name: string;
      matrixIndex: number | string;
    }> = [{ children, name, matrixIndex }];

    // Cache array references to avoid repeated property access
    const childrenList = this.childrenList;
    const childrenLeafList = this.childrenLeafList;
    const childrenLeafIndexes = this.childrenLeafIndexes;

    while (stack.length > 0) {
      const current = stack.pop()!;

      childrenList.push(current.name);

      if (current.children.length === 0) {
        childrenLeafList.push(current.name);
        childrenLeafIndexes.push(current.matrixIndex as number);
      } else {
        // Use for...of for better performance and add children to stack in reverse order
        // to maintain the same traversal order as the recursive version
        for (let i = current.children.length - 1; i >= 0; i--) {
          const child = current.children[i];
          if (child) {
            stack.push({
              children: child.children,
              name: child.name,
              matrixIndex: child.matrixIndex,
            });
          }
        }
      }
    }
  }
}
