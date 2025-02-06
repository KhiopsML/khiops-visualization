/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { N } from '@khiops-hypertree/d/models/n/n';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';

@Injectable({
  providedIn: 'root',
})
export class TreeHyperService {
  /**
   * Determines the stroke width of a link based on its visibility.
   * @param n - The node to check.
   * @param displayedValues - The values that determine visibility.
   * @returns The stroke width of the link.
   */
  static getLinkStrokeWidth(_n: N, _displayedValues: ChartToggleValuesI[]) {
    // const isVisible = this.filterVisibleNodes(n, displayedValues);
    // if (isVisible) {
    return 0.001;
    // } else {
    //   return 0;
    // }
  }

  /**
   * Filters nodes to determine if they are visible based on displayed values.
   * @param n - The node to check.
   * @param displayedValues - The values that determine visibility.
   * @returns True if the node is visible, otherwise false.
   */
  static filterVisibleNodes(n: N, displayedValues: ChartToggleValuesI[]) {
    let isVisible = false;
    const values = n.data.targetValues.values;
    if (displayedValues) {
      for (let i = 0; i < values.length; i++) {
        if (n.data.isRegressionAnalysis) {
          // In case of regression
          const index = parseInt(values[i].replace(/\D/g, ''), 10);
          if (displayedValues[index]?.show) {
            return true;
          }
        } else {
          // In Classification case
          if (displayedValues.find((e) => e.show && e.name === values[i])) {
            isVisible = true;
          }
        }
      }
    }
    return isVisible;
  }

  /**
   * Gets the stroke color of a node.
   * @param n - The node to get the stroke color from.
   * @returns The stroke color of the node.
   */
  static getStrokeColor(n: N) {
    const node: TreeNodeModel = n.data;
    return node.color;
  }

  /**
   * Gets the color of a node.
   * @param n - The node to get the color from.
   * @returns The color of the node.
   */
  static getNodeColor(n: N) {
    const node: TreeNodeModel = n.data;
    return node.color;
  }

  /**
   * Gets the stroke width of a node.
   * @param n - The node to get the stroke width from.
   * @returns The stroke width of the node.
   */
  static getNodeStrokeWidth(_n: N) {
    // Selected Path stroke width
    return 0.01;
  }

  /**
   * Gets the opacity of a node based on its data and purity.
   * @param datas - The data to check.
   * @param purity - The purity value to consider.
   * @param n - The node to get the opacity from.
   * @returns The opacity of the node.
   */
  static getNodeOpacity(
    datas: TreePreparationDatasModel,
    purity: boolean,
    n: N,
  ) {
    const node: TreeNodeModel = n.data;
    if (datas && node.isLeaf) {
      if (purity) {
        return Math.sqrt(node.purity!);
      } else {
        return 0.9;
      }
    } else {
      return 0.9;
    }
  }

  /**
   * Determines if a node layer is visible based on displayed values.
   * @param displayedValues - The values that determine visibility.
   * @param n - The node to check.
   * @returns 'block' if the node layer is visible, otherwise 'none'.
   */
  static isNodeLayerVisible(displayedValues: ChartToggleValuesI[], n: N) {
    if (!displayedValues) {
      // Set layers visibles at init
      return 'block';
    }
    const isVisible = TreeHyperService.filterVisibleNodes(n, displayedValues);
    if (isVisible) {
      return 'block';
    } else {
      return 'none';
    }
  }
}
