/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { CellModel } from '../../model/cell.model';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';

/**
 * Service responsible for matrix multi-cell selection logic and hierarchy-based expansion
 */
@Injectable({
  providedIn: 'root',
})
export class MatrixSelectionService {
  constructor() {}

  /**
   * Get all cells within a rectangular area defined by two corner cells
   */
  getCellsInRect(
    startCell: CellModel,
    endCell: CellModel,
    matrixCellDatas: CellModel[],
  ): CellModel[] {
    if (!matrixCellDatas) return [];

    // Find the bounding rectangle
    const minX = Math.min(startCell.xCanvas, endCell.xCanvas);
    const maxX = Math.max(
      startCell.xCanvas + startCell.wCanvas,
      endCell.xCanvas + endCell.wCanvas,
    );
    const minY = Math.min(startCell.yCanvas, endCell.yCanvas);
    const maxY = Math.max(
      startCell.yCanvas + startCell.hCanvas,
      endCell.yCanvas + endCell.hCanvas,
    );

    const cellsInRect: CellModel[] = [];

    for (const cell of matrixCellDatas) {
      // Cell center must be within selection
      const cellCenterX = cell.xCanvas + cell.wCanvas / 2;
      const cellCenterY = cell.yCanvas + cell.hCanvas / 2;

      if (
        cellCenterX >= minX &&
        cellCenterX <= maxX &&
        cellCenterY >= minY &&
        cellCenterY <= maxY
      ) {
        cellsInRect.push(cell);
      }
    }

    return cellsInRect;
  }

  /**
   * Expand selection to include all cells from the common ancestor hierarchy
   */
  expandSelectionToHierarchy(
    cells: CellModel[],
    dimensionsClusters: TreeNodeModel[][],
    matrixCellDatas: CellModel[],
  ): CellModel[] {
    if (cells.length <= 1) return cells;

    // Get unique axis parts for X and Y
    const xAxisParts = new Set<string>();
    const yAxisParts = new Set<string>();
    for (const cell of cells) {
      if (cell.xaxisPart) xAxisParts.add(cell.xaxisPart);
      if (cell.yaxisPart) yAxisParts.add(cell.yaxisPart);
    }

    // Find the common parent for X axis and get all its children
    const xPartsArray = Array.from(xAxisParts);
    const expandedXParts = this.getExpandedAxisParts(
      xPartsArray,
      0,
      dimensionsClusters,
    );

    // Find the common parent for Y axis and get all its children
    const yPartsArray = Array.from(yAxisParts);
    const expandedYParts = this.getExpandedAxisParts(
      yPartsArray,
      1,
      dimensionsClusters,
    );

    // Filter all matrix cells to include only those in expanded parts
    const expandedCells: CellModel[] = [];
    if (matrixCellDatas) {
      for (const cell of matrixCellDatas) {
        if (
          expandedXParts.has(cell.xaxisPart ?? '') &&
          expandedYParts.has(cell.yaxisPart ?? '')
        ) {
          expandedCells.push(cell);
        }
      }
    }

    return expandedCells;
  }

  /**
   * Get expanded axis parts based on common parent hierarchy
   * Returns all leaf cluster names that should be selected given the input parts
   */
  private getExpandedAxisParts(
    axisParts: string[],
    dimensionIndex: number,
    dimensionsClusters: TreeNodeModel[][],
  ): Set<string> {
    if (axisParts.length === 0) return new Set();
    if (axisParts.length === 1) return new Set(axisParts);

    const clusters = dimensionsClusters[dimensionIndex];
    if (!clusters || clusters.length === 0) {
      return new Set(axisParts);
    }

    // Find the common parent of all selected parts
    const commonParent = this.findLowestCommonAncestor(axisParts, clusters);

    if (!commonParent) {
      return new Set(axisParts);
    }

    // Get all leaf children of the common parent
    const commonParentNode = clusters.find((c) => c.name === commonParent);
    if (commonParentNode) {
      commonParentNode.getChildrenList();
      if (
        commonParentNode.childrenLeafList &&
        commonParentNode.childrenLeafList.length > 0
      ) {
        return new Set(commonParentNode.childrenLeafList);
      }
    }

    return new Set(axisParts);
  }

  /**
   * Find the lowest common ancestor of multiple cluster names
   */
  private findLowestCommonAncestor(
    clusterNames: string[],
    clusters: TreeNodeModel[],
  ): string | null {
    if (clusterNames.length === 0) return null;
    if (clusterNames.length === 1) {
      const node = clusters.find((c) => c.name === clusterNames[0]);
      return node?.parentCluster || null;
    }

    // Build ancestor chain for each cluster
    const ancestorChains: string[][] = [];
    for (const name of clusterNames) {
      const chain = this.getAncestorChain(name, clusters);
      ancestorChains.push(chain);
    }

    // Find the lowest common ancestor (first shared ancestor from the bottom)
    if (ancestorChains.length === 0) return null;

    // Start from the first chain and find common ancestors with all others
    const firstChain = ancestorChains[0]!;
    for (const ancestor of firstChain) {
      let isCommon = true;
      for (let i = 1; i < ancestorChains.length; i++) {
        if (!ancestorChains[i]!.includes(ancestor)) {
          isCommon = false;
          break;
        }
      }
      if (isCommon) {
        return ancestor;
      }
    }

    return null;
  }

  /**
   * Get the ancestor chain for a cluster (from immediate parent up to root)
   */
  private getAncestorChain(
    clusterName: string,
    clusters: TreeNodeModel[],
  ): string[] {
    const chain: string[] = [];
    let currentName = clusterName;

    while (currentName) {
      const node = clusters.find((c) => c.name === currentName);
      if (!node) break;

      if (node.parentCluster) {
        chain.push(node.parentCluster);
        currentName = node.parentCluster;
      } else {
        break;
      }
    }

    return chain;
  }
}
