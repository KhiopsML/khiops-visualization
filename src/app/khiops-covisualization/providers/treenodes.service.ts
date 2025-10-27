/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { DimensionsDatasService } from './dimensions-datas.service';
import { EventsService } from './events.service';
import { AppService } from './app.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TreeNodeModel } from '../model/tree-node.model';
import { deepEqual } from 'fast-equals';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import { HierarchyDatasModel } from '@khiops-covisualization/model/hierarchy-datas.model';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';

@Injectable({
  providedIn: 'root',
})
export class TreenodesService {
  private collapsedNodesToSave: DynamicI | undefined = {};

  constructor(
    private appService: AppService,
    private dimensionsDatasService: DimensionsDatasService,
    private eventsService: EventsService,
  ) {
    this.initialize();
  }

  /**
   * Initializes the service by fetching collapsed nodes to save.
   */
  initialize() {
    this.collapsedNodesToSave =
      this.appService.getSavedDatas('collapsedNodes') || {};
  }

  /**
   * Retrieves leaf nodes for a given hierarchical rank.
   *
   * @param {number} rank - The hierarchical rank to filter nodes.
   * @returns {object} - An object containing the leaf nodes for each dimension.
   */
  getLeafNodesForARank(rank: number) {
    const collapsedNodes: { [key: string]: any[] } = {};
    for (
      let i = 0;
      i < this.dimensionsDatasService.dimensionsDatas.selectedDimensions.length;
      i++
    ) {
      const dimName =
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions[i]?.name;
      if (dimName) {
        collapsedNodes[dimName] = [];
        const nodesVO: TreeNodeModel[] = UtilsService.fastFilter(
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[i] ||
            [],
          (e: TreeNodeModel) => {
            return rank <= e.hierarchicalRank && !e.isLeaf;
          },
        );
        collapsedNodes[dimName] = nodesVO.map((e) => e.cluster);
      }
    }
    return collapsedNodes;
  }

  /**
   * Updates the name of a selected node.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} name - The current name of the node.
   * @param {string} newName - The new name to set for the node.
   */
  updateSelectedNodeName(dimensionName: string, name: string, newName: string) {
    if (!this.dimensionsDatasService.dimensionsDatas.nodesNames) {
      this.dimensionsDatasService.dimensionsDatas.nodesNames = {};
    }
    this.dimensionsDatasService.dimensionsDatas.nodesNames[dimensionName] =
      this.dimensionsDatasService.dimensionsDatas.nodesNames[dimensionName] ||
      {};
    this.dimensionsDatasService.dimensionsDatas.nodesNames[dimensionName][
      name
    ] = newName;
  }

  /**
   * Initializes the saved unfold rank from the application data.
   */
  initSavedUnfoldRank() {
    // Initialize unfold rank if set into json
    const savedUnfoldRank =
      this.appService.appDatas?.savedDatas?.unfoldHierarchyState;
    savedUnfoldRank && this.setSelectedUnfoldHierarchy(savedUnfoldRank);
  }

  /**
   * Initializes conditional context nodes for selected dimensions.
   */
  initConditionalOnContextNodes() {
    for (
      let i = 0;
      i < this.dimensionsDatasService.dimensionsDatas.selectedDimensions.length;
      i++
    ) {
      if (i >= 2) {
        // re init context nodes with conditionalOnContext to false
        this.setSelectedNode(
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions[i]
            ?.name || '',
          this.dimensionsDatasService.dimensionsDatas.selectedNodes[i]?._id ||
            '',
        );
      }
    }
  }

  /**
   * Merges two collapsed nodes objects.
   *
   * @param {object} obj1 - The first collapsed nodes object.
   * @param {object} obj2 - The second collapsed nodes object.
   * @returns {object} - The merged collapsed nodes object.
   */
  mergeCollapsedNodes(obj1: DynamicI, obj2: DynamicI): any {
    if (!obj1) {
      obj1 = {};
    }
    if (!obj2) {
      obj2 = {};
    }
    const result = { ...obj1 };
    Object.keys(obj2).forEach((key) => {
      if (Array.isArray(obj2[key])) {
        const set = new Set([...(result[key] || []), ...obj2[key]]);
        result[key] = [...set];
      } else {
        result[key] = obj2[key];
      }
    });

    return result;
  }

  /**
   * Sets the selected node for a given hierarchy and node name.
   * This method updates the selected node in the dimensions data and emits
   * a tree selection changed event if the nodes have changed or if a
   * selectedValue is provided (for variable search within the same cluster).
   *
   * @param {string} hierarchyName - The name of the hierarchy.
   * @param {string} nodeName - The name of the node.
   * @param {boolean} stopPropagation - Flag to stop event propagation.
   * @param {string} selectedValue - Optional selected value (modality or interval).
   *                                  When provided, forces event emission even if node hasn't changed.
   * @returns {TreeNodeModel} - The selected node model.
   */
  setSelectedNode(
    hierarchyName: string,
    nodeName: string | number,
    stopPropagation = false,
    selectedValue?: string,
  ): TreeNodeModel | undefined {
    let nodeVO: TreeNodeModel | undefined;
    if (this.dimensionsDatasService.dimensionsDatas.selectedDimensions) {
      const previousSelectedNodes = Object.assign(
        [],
        this.dimensionsDatasService.dimensionsDatas.selectedNodes,
      );

      // Find current dim position
      const currentIndex: number =
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
          (e) => {
            return hierarchyName === e.name;
          },
        );

      if (currentIndex !== -1) {
        // get Node VO from name
        nodeVO =
          this.dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[
            currentIndex
          ]?.find((e) => {
            return nodeName === e.name || nodeName === e.shortDescription;
          });
        if (!nodeVO) {
          nodeVO =
            this.dimensionsDatasService.dimensionsDatas
              .currentDimensionsClusters[currentIndex] &&
            this.dimensionsDatasService.dimensionsDatas
              .currentDimensionsClusters[currentIndex][0];
        }
        if (nodeVO) {
          nodeVO.getChildrenList();

          if (currentIndex !== 0 && currentIndex !== 1) {
            if (
              this.dimensionsDatasService.dimensionsDatas.conditionalOnContext
            ) {
              this.dimensionsDatasService.dimensionsDatas.contextSelection[
                currentIndex - 2
              ] = nodeVO.childrenLeafIndexes;
            } else {
              // conditionalOnContext unset
              // get the parent node
              const parentNodeVO: TreeNodeModel | undefined =
                this.dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[
                  currentIndex
                ]?.find((e: TreeNodeModel) => e.isParentCluster);
              if (parentNodeVO) {
                parentNodeVO.getChildrenList();
                // and set their chidren leafs to context nodes
                this.dimensionsDatasService.dimensionsDatas.contextSelection[
                  currentIndex - 2
                ] = parentNodeVO.childrenLeafIndexes;
              }
            }
            // Emit context selection changed event when context dimensions are updated
            this.eventsService.emitContextSelectionChanged();
          }
        }

        if (nodeVO) {
          this.dimensionsDatasService.dimensionsDatas.selectedNodes[
            currentIndex
          ] = nodeVO;
        }
      }

      // Do not send event changed if only one node selected and if nodes does not changed
      // However, if selectedValue is provided, we should emit the event even if the node hasn't changed
      // This is important for variable search where we search within the same cluster
      const nodesChanged = !deepEqual(
        previousSelectedNodes,
        this.dimensionsDatasService.dimensionsDatas.selectedNodes,
      );

      if (nodesChanged || selectedValue) {
        // search in the complete datas the corresponding node
        const realNodeVO =
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
            currentIndex
          ]?.find((e: TreeNodeModel) => {
            return (
              nodeVO?.name ===
              e.name /*|| nodeVO.shortDescription === e.shortDescription*/
            );
            // do not check into shortDescription (for distribution graph for instance)
            // otherwise it return multiple nodes
          });
        if (realNodeVO && nodeVO) {
          realNodeVO.getChildrenList();
          if (!stopPropagation) {
            this.eventsService.emitTreeSelectedNodeChanged({
              hierarchyName: hierarchyName,
              selectedNode: nodeVO,
              realNodeVO: realNodeVO,
              stopPropagation: stopPropagation,
              selectedValue: selectedValue,
            });
          }
        }
      }
    }
    return nodeVO;
  }

  /**
   * Updates the selected nodes for a given dimension and position.
   *
   * @param {DimensionCovisualizationModel} dimension - The dimension model.
   * @param {number} position - The position to update.
   */
  updateSelectedNodes(
    dimension: DimensionCovisualizationModel,
    position: number,
  ) {
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
        (e) => {
          return dimension.name === e.name;
        },
      );

    if (currentIndex !== -1) {
      // Invert values if already selected
      [
        // @ts-ignore
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[currentIndex],
        // @ts-ignore
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[position],
      ] = [
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[position],
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[currentIndex],
      ];
    }
  }

  /**
   * Retrieves the last visible node from a list of nodes.
   *
   * @param {TreeNodeModel[]} nodes - The list of nodes.
   * @returns {TreeNodeModel} - The last visible node.
   */
  getLastVisibleNode(nodes: TreeNodeModel[]): TreeNodeModel {
    if (nodes[0]?.isLeaf) {
      return nodes[0];
    } else if (!nodes[0]?.isCollapsed) {
      return this.getLastVisibleNode(nodes[0]?.children || []);
    } else {
      return nodes[0];
    }
  }

  /**
   * Retrieves the first visible node from a list of nodes.
   *
   * @param {TreeNodeModel[]} nodes - The list of nodes.
   * @param {TreeNodeModel} nodeVO - The node model.
   * @param {TreeNodeModel} lastVisibleNode - The last visible node.
   * @returns {TreeNodeModel} - The first visible node.
   */
  getFirstVisibleNode(
    nodes: TreeNodeModel[],
    nodeVO: TreeNodeModel,
    lastVisibleNode?: TreeNodeModel,
  ): TreeNodeModel | undefined {
    const parentNode: TreeNodeModel | undefined = nodes.find(
      (e) => e.name === nodeVO?.parentCluster,
    );
    if (!nodeVO.isParentCluster) {
      if (parentNode?.isCollapsed) {
        lastVisibleNode = parentNode;
      }
      return this.getFirstVisibleNode(
        nodes,
        parentNode || nodeVO,
        lastVisibleNode,
      );
    } else {
      return lastVisibleNode;
    }
  }

  /**
   * Initializes the selected nodes array.
   */
  initSelectedNodes() {
    this.dimensionsDatasService.dimensionsDatas.selectedNodes = [];
  }

  /**
   * Retrieves the selected nodes.
   *
   * @returns {TreeNodeModel[]} - The selected nodes.
   */
  getSelectedNodes(): TreeNodeModel[] {
    return this.dimensionsDatasService.dimensionsDatas.selectedNodes;
  }

  /**
   * Initializes the saved data for the service.
   */
  initSavedDatas() {
    // Don't reset collapsedNodesToSave to undefined here, as it would lose
    // the savedDatas collapsed nodes that were already loaded from JSON
    // Only reset if there are no existing collapsed nodes from savedDatas
    const savedCollapsedNodes = this.appService.getSavedDatas('collapsedNodes');
    if (!savedCollapsedNodes || Object.keys(savedCollapsedNodes).length === 0) {
      this.collapsedNodesToSave = undefined;
    } else {
      // Preserve the collapsed nodes from savedDatas
      this.collapsedNodesToSave = { ...savedCollapsedNodes };
    }

    this.dimensionsDatasService.dimensionsDatas.nodesNames =
      this.appService.getSavedDatas('nodesNames') || {};
    const savedNodes = this.appService.getSavedDatas('selectedNodes');
    if (savedNodes) {
      for (let index = 0; index < savedNodes.length; index++) {
        const nodeName = savedNodes[index];
        const dimension =
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions[index];
        const node =
          dimension && this.getNodeFromName(dimension.name, nodeName);
        if (node) {
          this.dimensionsDatasService.dimensionsDatas.selectedNodes[index] =
            node;
        }
      }
    }
    const savedHierarchy =
      this.appService.getSavedDatas('unfoldHierarchyState') || 0;
    this.setSelectedUnfoldHierarchy(savedHierarchy);
  }

  /**
   * Retrieves the names of the nodes.
   *
   * @returns {object} - The names of the nodes.
   */
  getNodesNames(): DynamicI {
    return this.dimensionsDatasService.dimensionsDatas.nodesNames;
  }

  /**
   * Retrieves a node from the dimension tree by its name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   * @returns {TreeNodeModel} - The node model.
   */
  getNodeFromDimensionTree(
    dimensionName: string,
    nodeName: string,
  ): TreeNodeModel | undefined {
    let nodeVO: TreeNodeModel | undefined;
    const currentIndex: number =
      this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
        (e) => {
          return dimensionName === e.name;
        },
      );

    if (currentIndex !== -1) {
      // here we must search recursively into getNodeFromDimensionTree field of
      // this.dimensionsDatasService.dimensionsDatas.dimensionTrees[currentIndex]
      const searchNode = (
        nodes: TreeNodeModel[],
        nodeName: string,
      ): TreeNodeModel | undefined => {
        for (const node of nodes) {
          if (node.name === nodeName) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const foundNode = searchNode(node.children, nodeName);
            if (foundNode) {
              return foundNode;
            }
          }
        }
        return undefined;
      };

      nodeVO = searchNode(
        this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[
          currentIndex
        ] || [],
        nodeName,
      );
    }
    return cloneDeep(nodeVO); // important to clone datas to keep origin immmutable
  }

  /**
   * Retrieves a node by its name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   * @returns {TreeNodeModel} - The node model.
   */
  getNodeFromName(
    dimensionName: string,
    nodeName: string,
  ): TreeNodeModel | undefined {
    let nodeVO: TreeNodeModel | undefined;
    const currentIndex: number =
      this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
        (e) => {
          return dimensionName === e.name;
        },
      );

    if (currentIndex !== -1) {
      // get Node VO from name
      nodeVO = this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
        currentIndex
      ]?.find((e) => {
        return nodeName === e.name;
      });
      if (!nodeVO) {
        nodeVO =
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
            currentIndex
          ] &&
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
            currentIndex
          ].find((e) => {
            return nodeName === e.bounds;
          });
      }
    }
    return cloneDeep(nodeVO); // important to clone datas to keep origin immmutable
  }

  /**
   * Sets the saved collapsed nodes.
   *
   * @param {object} collapsedNodesToSave - The collapsed nodes to save.
   */
  setSavedCollapsedNodes(collapsedNodesToSave: DynamicI) {
    this.collapsedNodesToSave = collapsedNodesToSave;
  }

  /**
   * Updates the current hierarchy clusters count for a given rank.
   *
   * @param {number} rank - The hierarchical rank to update.
   */
  updateCurrentHierarchyClustersCount(rank: number) {
    for (
      let i = 0;
      i < this.dimensionsDatasService.dimensionsDatas.dimensions.length;
      i++
    ) {
      const currentIndex: number =
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
          (e) => {
            return (
              this.dimensionsDatasService.dimensionsDatas.dimensions[i]
                ?.name === e.name
            );
          },
        );
      const nodesVO: TreeNodeModel[] = UtilsService.fastFilter(
        this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
          currentIndex
        ] || [],
        (e: TreeNodeModel) => {
          return !e.isLeaf && e.hierarchicalRank < rank;
        },
      );
      const dimension: DimensionCovisualizationModel | undefined =
        this.dimensionsDatasService.dimensionsDatas.dimensions[i];
      dimension?.setCurrentHierarchyClusterCount(nodesVO.length + 1);
    }
  }

  /**
   * Compute the number of clusters to manage to display a number of cells
   * @param maxRank the current number of clusters
   * @param nbCells the cells count wish
   */
  getHierarchyFromClustersCount(maxRank: number, nbCells: number): number {
    let currentDimClustersCount = 1;
    do {
      maxRank = maxRank - 1;
      currentDimClustersCount = 1;
      for (
        let i = 0;
        i < this.dimensionsDatasService.dimensionsDatas.dimensions.length;
        i++
      ) {
        const nodesVO: TreeNodeModel[] = UtilsService.fastFilter(
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[i] ||
            [],
          (e: TreeNodeModel) => {
            return !e.isLeaf && e.hierarchicalRank < maxRank;
          },
        );
        currentDimClustersCount = currentDimClustersCount * nodesVO.length;
      }
    } while (currentDimClustersCount > nbCells);
    return maxRank;
  }

  /**
   * Retrieves the hierarchy data from the initial application data.
   * This method calculates the total number of clusters, initial clusters, and cells
   * from the coclustering report and updates the hierarchy data accordingly.
   *
   * @returns {HierarchyDatasModel} - The updated hierarchy data model.
   */
  getHierarchyDatas(): HierarchyDatasModel | undefined {
    if (this.appService.initialDatas?.coclusteringReport?.dimensionSummaries) {
      this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!.totalClusters = 0;
      const l =
        this.appService.initialDatas.coclusteringReport.dimensionSummaries
          .length;
      this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!.minClusters =
        l;
      for (let i = 0; i < l; i++) {
        // Concat all dimensions clusters
        this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!.totalClusters +=
          this.appService.initialDatas.coclusteringReport.dimensionSummaries[
            i
          ]!.parts;
        // 150 Also compute totalInitialClusters to generate information rate chart
        this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!.totalInitialClusters +=
          this.appService.initialDatas.coclusteringReport.dimensionSummaries[
            i
          ]!.initialParts;
      }
      // Init with all clusters
      if (
        this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!
          .selectedUnfoldHierarchy === 0
      ) {
        this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!.selectedUnfoldHierarchy =
          this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!.totalClusters;
      }
    }
    if (this.appService.initialDatas?.coclusteringReport?.summary) {
      // Get the total cell
      this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!.totalCells +=
        this.appService.initialDatas.coclusteringReport.summary.cells;
    }
    return this.dimensionsDatasService.dimensionsDatas.hierarchyDatas;
  }

  /**
   * Retrieves the selected unfold hierarchy value.
   *
   * @returns {number} - The selected unfold hierarchy value.
   */
  getUnfoldHierarchy(): number {
    return (
      this.dimensionsDatasService.dimensionsDatas?.hierarchyDatas
        ?.selectedUnfoldHierarchy || 0
    );
  }

  /**
   * Sets the selected unfold hierarchy value.
   *
   * @param {number} selectedUnfoldHierarchy - The value to set for the selected unfold hierarchy.
   */
  setSelectedUnfoldHierarchy(selectedUnfoldHierarchy: number) {
    this.dimensionsDatasService.dimensionsDatas.hierarchyDatas &&
      (this.dimensionsDatasService.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy =
        selectedUnfoldHierarchy);
  }

  /**
   * Updates the collapsed nodes to save based on the given dimension name and node name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   * @param {number} way - The way to update the collapsed nodes (1 to add, -1 to remove).
   */
  updateCollapsedNodesToSave(
    dimensionName: string,
    nodeName: string,
    way = 1 | -1,
  ) {
    if (!this.collapsedNodesToSave) {
      this.collapsedNodesToSave = {};
    }
    // Add or remove collapsed nodes to save them into json file
    if (!this.collapsedNodesToSave?.[dimensionName]) {
      this.collapsedNodesToSave[dimensionName] = [];
    }
    const index = this.collapsedNodesToSave?.[dimensionName].indexOf(nodeName);
    if (way === -1) {
      if (index !== -1) {
        this.collapsedNodesToSave[dimensionName].splice(index, 1);
      }
    } else if (way === 1) {
      if (index === -1) {
        this.collapsedNodesToSave[dimensionName].push(nodeName);
      }
    }
  }

  /**
   * Retrieves the saved collapsed nodes.
   *
   * @returns {object} - The saved collapsed nodes.
   */
  getSavedCollapsedNodes(): {} | undefined {
    return this.collapsedNodesToSave;
  }

  /**
   * Collapses a node based on the given dimension name and node name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   */
  collapseNode(dimensionName: string, nodeName: string) {
    this.updateCollapsedNodesToSave(dimensionName, nodeName, 1);
    this.setSelectedNode(dimensionName, nodeName, true);
  }

  /**
   * Expands a node based on the given dimension name and node name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   */
  expandNode(dimensionName: string, nodeName: string) {
    this.updateCollapsedNodesToSave(dimensionName, nodeName, -1);
    this.setSelectedNode(dimensionName, nodeName, true);
  }

  /**
   * Checks if the saved data has changed compared to the tested saved data.
   * This method uses a deep equality check to determine if the two data objects are equal.
   *
   * @param {any} savedDatas - The original saved data object.
   * @param {any} testedSavedDatas - The tested saved data object to compare against.
   * @returns {boolean} - True if the saved data has changed, false otherwise.
   */
  isSaveChanged(savedDatas: DynamicI, testedSavedDatas: DynamicI): boolean {
    return !isEqual(savedDatas, testedSavedDatas);
  }
}
