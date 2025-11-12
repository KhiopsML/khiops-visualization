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
   * Calculates a fixed scale factor to keep node sizes constant regardless of container size.
   * @param containerElement - The container element to measure.
   * @returns A scale factor that makes nodes appear the same pixel size always.
   */
  static getFixedNodeScale(containerElement?: HTMLElement | null): number {
    if (!containerElement) {
      return 1; // fallback
    }

    const containerWidth = containerElement.clientWidth || 800;
    const containerHeight = containerElement.clientHeight || 600;
    const containerSize = Math.min(containerWidth, containerHeight);

    // Base size for calculations (typical container size)
    const BASE_CONTAINER_SIZE = 600;

    // Calculate inverse scale to maintain constant pixel size
    const scale = BASE_CONTAINER_SIZE / containerSize;

    return scale;
  }

  /**
   * Calculates the radius of a node in the hypertree visualization.
   *
   * @param n - The node for which the radius is being calculated.
   * @param treePreparationDatas - The tree preparation data containing min/max frequencies.
   * @param visualization - The visualization settings (population, purity).
   * @param displayedValues - The values that determine visibility.
   * @returns The radius of the node.
   *
   * The radius is determined based on several factors:
   * - If the node is a leaf and population visualization is enabled, the radius is proportional to the node's population.
   * - If the node is a leaf and population visualization is not enabled, the radius is constant for all visible nodes.
   * - If the node is not a leaf, the radius is constant and smaller.
   */
  static getNodeRadius(
    n: N,
    treePreparationDatas?: TreePreparationDatasModel,
    visualization?: { population: boolean },
    displayedValues?: ChartToggleValuesI[],
  ): number {
    // Base constant radius values (will be scaled by getFixedNodeScale())
    const BASE_LEAF_RADIUS = 0.03;
    const BASE_COLLAPSED_RADIUS = 0.015;
    const BASE_INTERNAL_RADIUS = 0.009;

    if (treePreparationDatas && n.data.isLeaf) {
      if (visualization?.population) {
        // Keep original population-based sizing logic
        let totalFreqsToShow = displayedValues ? 0 : n.data.totalFreqs;
        if (displayedValues) {
          const values = n.data.targetValues.values;
          for (let i = 0; i < n.data.targetValues.values.length; i++) {
            if (n.data.isRegressionAnalysis) {
              // In case of regression
              const index = parseInt(values[i].replace(/\D/g, ''), 10);
              if (displayedValues[index]?.show) {
                totalFreqsToShow += n.data.targetValues.frequencies[i];
              }
            } else {
              // In Classification case
              if (displayedValues.find((e) => e.show && e.name === values[i])) {
                totalFreqsToShow += n.data.targetValues.frequencies[i];
              }
            }
            if (
              displayedValues.find(
                (e) => e.show && e.name === n.data.targetValues.values[i],
              )
            ) {
              totalFreqsToShow += n.data.targetValues.frequencies[i];
            }
          }
        }
        // display of the size of the leaves of the hypertree according to their population #60
        // Limit max size to ensure it doesn't exceed 100px equivalent
        const MAX_RADIUS = 0.15; // Reduced max radius to limit final size

        const percent =
          ((totalFreqsToShow - treePreparationDatas.minFrequencies) /
            (treePreparationDatas.maxFrequencies -
              treePreparationDatas.minFrequencies)) *
          100;
        let D = (MAX_RADIUS * percent) / 100;
        // Hypertree out of bounds #293
        if (D > 0.2) {
          D = 0.2;
        }
        return D;
      } else {
        // Constant size when population visualization is off
        const isVisible = TreeHyperService.filterVisibleNodes(
          n,
          displayedValues || [],
        );
        if (isVisible) {
          return BASE_LEAF_RADIUS;
        } else {
          return 0;
        }
      }
    } else {
      // Constant size for non-leaf nodes
      if (n.data.isCollapsed) {
        return BASE_COLLAPSED_RADIUS;
      } else {
        return BASE_INTERNAL_RADIUS;
      }
    }
  }

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
   * Determines whether the node layer is visible based on the displayed values.
   * @param displayedValues - The values that determine visibility.
   * @param n - The node to check.
   * @returns 'block' if the node layer is visible, otherwise 'none'.
   */
  static isNodeLayerVisible(displayedValues: ChartToggleValuesI[], n: N) {
    if (!displayedValues || displayedValues.length === 0) {
      // Set layers visible at init or when no display values configured yet
      return 'block';
    }

    // For regression analysis, ensure we have valid display values
    if (n.data.isRegressionAnalysis) {
      // Check if displayedValues seems to have regression interval format
      const hasValidRegressionValues = displayedValues.some(
        (dv) => dv.name && (dv.name.includes('[') || dv.name.includes('I')),
      );
      if (!hasValidRegressionValues) {
        // If displayedValues don't look like regression intervals, show all nodes
        return 'block';
      }
    }

    const isVisible = TreeHyperService.filterVisibleNodes(n, displayedValues);
    if (isVisible) {
      return 'block';
    } else {
      return 'none';
    }
  }
}
