/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { TreeNodeModel } from '../model/tree-node.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { MatrixUtilsService } from '@khiops-library/components/matrix/matrix.utils.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppConfig } from '../../../environments/environment';
import { DimensionsDatasModel } from '../model/dimensions-data.model';
import { TYPES } from '@khiops-library/enum/types';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { ImportExtDatasService } from './import-ext-datas.service';
import { MatrixValuesModel } from '@khiops-library/model/matrix-value.model';
import { MatrixDatasModel } from '@khiops-library/model/matrix-datas.model';
import {
  DimensionHierarchy,
  Interval,
  ValueGroup,
} from '@khiops-covisualization/interfaces/app-datas';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';

@Injectable({
  providedIn: 'root',
})
export class DimensionsDatasService {
  public dimensionsDatas: DimensionsDatasModel = new DimensionsDatasModel();

  constructor(
    private importExtDatasService: ImportExtDatasService,
    private appService: AppService,
  ) {
    this.initialize();
  }
  /**
   * Initializes the dimensions data model.
   * This method creates a new instance of the DimensionsDatasModel and assigns it to the dimensionsDatas property.
   *
   * @returns {DimensionsDatasModel} - The initialized dimensions data model.
   */
  initialize(): DimensionsDatasModel {
    this.dimensionsDatas = new DimensionsDatasModel();
    return this.dimensionsDatas;
  }

  /**
   * Recomputes data from a new JSON input.
   * This method updates the dimensions, initializes selected dimensions, saves the initial dimensions,
   * constructs the dimensions trees, and recalculates the matrix data and frequency map.
   *
   * @param {string} dimensionName - The name of the dimension to be updated.
   */
  recomputeDatasFromNewJson(dimensionName: string) {
    this.getDimensions();
    this.initSelectedDimensions(false); // do not reinitialize selected context node
    this.saveInitialDimension();
    this.constructDimensionsTrees();
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });
    const propagateChanges = currentIndex <= 1 ? true : false;
    // hack to limit re-rendering and optimize performance
    this.getMatrixDatas(propagateChanges);
    this.computeMatrixDataFreqMap();
    this.setIsLoading(false);
  }

  /**
   * Initializes the saved data.
   * This method retrieves saved data from the app service and assigns it to the dimensions data model.
   * It sets various properties such as conditionalOnContext, matrixContrast, matrixMode, matrixOption, and isAxisInverted.
   */
  initSavedDatas() {
    // Set it to false if no context
    if (!this.isContextDimensions()) {
      this.dimensionsDatas.conditionalOnContext = false;
    } else {
      const savedConditionalOnContext = this.appService.getSavedDatas(
        'conditionalOnContext',
      );
      this.dimensionsDatas.conditionalOnContext =
        savedConditionalOnContext !== undefined
          ? savedConditionalOnContext
          : true;
    }
    const savedMatrixContrast = this.appService.getSavedDatas('matrixContrast');
    if (savedMatrixContrast !== undefined) {
      this.dimensionsDatas.matrixContrast = savedMatrixContrast;
    }
    const savedMatrixMode = this.appService.getSavedDatas('matrixMode');
    if (savedMatrixMode !== undefined) {
      this.dimensionsDatas.matrixMode = savedMatrixMode;
    }
    const savedMatrixOption = this.appService.getSavedDatas('matrixOption');
    if (savedMatrixOption !== undefined) {
      this.dimensionsDatas.matrixOption = savedMatrixOption;
    }
    const savedIsAxisInverted = this.appService.getSavedDatas('isAxisInverted');
    if (savedIsAxisInverted !== undefined) {
      this.dimensionsDatas.isAxisInverted = savedIsAxisInverted;
    }
  }

  /**
   * Retrieves the dimensions data model.
   * This method returns the current state of the dimensions data model.
   *
   * @returns {DimensionsDatasModel} - The current dimensions data model.
   */
  getDatas(): DimensionsDatasModel {
    return this.dimensionsDatas;
  }

  /**
   * Retrieves the count of dimensions.
   * This method returns the number of dimensions in the dimensions data model.
   *
   * @returns {number} - The count of dimensions.
   */
  getDimensionCount(): number {
    return this.dimensionsDatas.dimensions.length;
  }

  /**
   * Checks if the cocluster is large.
   * This method calculates the current size of the cocluster and compares it to an ergonomic limit.
   *
   * @returns {boolean} - True if the cocluster is large, false otherwise.
   */
  isLargeCocluster(): boolean {
    const currentSize = this.dimensionsDatas.dimensions
      .map((e) => e.parts)
      .reduce((a, b) => a + b);
    return (
      this.dimensionsDatas.dimensions.length *
        AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.ERGONOMIC_LIMIT <
      currentSize
    );
  }

  /**
   * Sets the loading status.
   * This method updates the isLoading property based on the number of parts in the initial dimensions.
   *
   * @param {boolean} status - The loading status to be set.
   * @returns {void}
   */
  setIsLoading(status: boolean) {
    const nb = this.dimensionsDatas.initialDimensions
      .map((e) => e.parts)
      .reduce((accumulator, currentValue) => accumulator * currentValue, 1);
    if (nb > 10000) {
      this.dimensionsDatas.isLoading = status;
    }
  }

  /**
   * Checks if there are context dimensions.
   * This method determines if the application data contains more than two initial dimensions.
   *
   * @returns {boolean} - True if there are context dimensions, false otherwise.
   */
  isContextDimensions(): boolean {
    const initialDimsCount =
      this.appService.appDatas?.coclusteringReport?.summary?.initialDimensions;
    return initialDimsCount! > 2 || false;
  }

  /**
   * Checks if a dimension is a context dimension.
   * This method determines if the specified dimension is a context dimension based on its position.
   *
   * @param {string} dimensionName - The name of the dimension to check.
   * @returns {boolean} - True if the dimension is a context dimension, false otherwise.
   */
  isContextDimension(dimensionName: string): boolean {
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });
    return currentIndex > 1;
  }

  /**
   * Toggles the axis inversion status.
   * This method inverts the current value of the isAxisInverted property.
   *
   * @returns {void}
   */
  toggleIsAxisInverted() {
    this.dimensionsDatas.isAxisInverted = !this.dimensionsDatas.isAxisInverted;
  }

  /**
   * Retrieves the position of a dimension by its name.
   * This method finds the index of the specified dimension in the selected dimensions array.
   *
   * @param {string} dimensionName - The name of the dimension to find.
   * @returns {number} - The position of the dimension in the selected dimensions array.
   */
  getDimensionPositionFromName(dimensionName: string): number {
    // Find current dim position
    return this.dimensionsDatas?.selectedDimensions?.findIndex((e) => {
      return dimensionName === e.name;
    });
  }

  /**
   * Retrieves the dimensions to be saved.
   * This method extracts the names of the selected dimensions and returns them in an array.
   *
   * @returns {any} - An array of objects containing the names of the selected dimensions.
   */
  getDimensionsToSave(): { name: string }[] {
    const selectedDimensions: { name: string }[] = [];
    const dimensions = this.getSelectedDimensions();
    if (dimensions) {
      for (let i = 0; i < dimensions.length; i++) {
        const dim = dimensions[i];
        if (dim && typeof dim.name === 'string') {
          selectedDimensions.push({
            name: dim.name,
          });
        }
      }
    }
    return selectedDimensions;
  }

  /**
   * Retrieves the selected dimensions.
   * This method returns the array of selected dimensions from the dimensions data.
   *
   * @returns {DimensionCovisualizationModel[]} - The array of selected dimensions.
   */
  getSelectedDimensions(): DimensionCovisualizationModel[] {
    return this.dimensionsDatas.selectedDimensions;
  }

  /**
   * Retrieves the number of intervals for a given dimension.
   * This method calculates the number of intervals for the specified dimension based on its collapsed nodes.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @returns {number} - The number of intervals for the specified dimension.
   */
  getDimensionIntervals(dimensionName: string): number {
    // Get nbclusters of current dimension based on collapsed nodes
    let count = 0;
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });
    if (this.dimensionsDatas?.dimensionsTrees?.[currentIndex]?.[0]) {
      const currentTreeNode: TreeNodeModel =
        this.dimensionsDatas.dimensionsTrees[currentIndex][0];
      count = this.getNodeIntervalsCount(currentTreeNode);
    }
    return count;
  }

  /**
   * Recursively counts the number of intervals in a tree node.
   * This method traverses the tree node and its children to count the number of intervals.
   *
   * @param {TreeNodeModel} treeNode - The tree node to count intervals for.
   * @param {number} count - The current count of intervals (default is 0).
   * @returns {number} - The total count of intervals.
   */
  getNodeIntervalsCount(treeNode: TreeNodeModel, count = 0): number {
    if (treeNode.isLeaf) {
      count++;
    }
    if (!treeNode.isCollapsed) {
      if (treeNode.children.length > 0) {
        for (let i = 0; i < treeNode.children.length; i++) {
          const child = treeNode.children[i];
          if (child) {
            count = this.getNodeIntervalsCount(child, count);
          }
        }
      }
    } else {
      count++;
    }
    return count;
  }

  /**
   * Retrieves the dimensions from the application data.
   * This method extracts the dimension summaries and partitions from the application data and initializes the dimensions data.
   *
   * @returns {DimensionCovisualizationModel[]} - The array of dimensions.
   */
  getDimensions(): DimensionCovisualizationModel[] {
    this.dimensionsDatas.dimensions = [];

    if (this.appService.appDatas) {
      this.dimensionsDatas.cellPartIndexes =
        this.appService.appDatas?.coclusteringReport?.cellPartIndexes;

      // Get dimension summaries
      if (this.appService.appDatas?.coclusteringReport?.dimensionSummaries) {
        const l =
          this.appService.appDatas.coclusteringReport.dimensionSummaries.length;
        for (let i = 0; i < l; i++) {
          const dimension = new DimensionCovisualizationModel(
            this.appService.appDatas.coclusteringReport.dimensionSummaries[i]!,
            i,
          );
          const dimensionPartition =
            this.appService.appDatas.coclusteringReport.dimensionPartitions[i];
          // Set  dimension partitions from intervals or valueGroup
          dimension.setPartition(dimensionPartition!);
          this.dimensionsDatas.dimensions.push(dimension);
        }
      }
    }

    return this.dimensionsDatas.dimensions;
  }

  /**
   * Saves the initial dimensions.
   * This method stores the initial dimensions in memory if they have not been saved yet.
   *
   * @returns {void}
   */
  saveInitialDimension() {
    // keep initial dim in memory
    if (this.dimensionsDatas.initialDimensions.length === 0) {
      this.dimensionsDatas.initialDimensions = Object.assign(
        [],
        this.dimensionsDatas.selectedDimensions,
      );
    }
  }

  /**
   * Initializes the selected dimensions.
   * This method sets the selected dimensions and context dimensions based on the initial dimensions data.
   * It also restores the saved selected dimensions if available.
   *
   * @param {boolean} initContextSelection - Flag to determine if context selection should be initialized (default is true).
   * @returns {DimensionCovisualizationModel[]} - The array of selected dimensions.
   */
  initSelectedDimensions(initContextSelection = true) {
    this.dimensionsDatas.selectedDimensions = [];
    for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
      const dimension = this.dimensionsDatas.dimensions[i];
      if (dimension) {
        this.dimensionsDatas.selectedDimensions[i] = dimension;
      }
    }
    if (initContextSelection) {
      this.dimensionsDatas.contextDimensions = [];
      for (let i = 2; i < this.dimensionsDatas.dimensions.length; i++) {
        const selectedDimension = this.dimensionsDatas.selectedDimensions[i];
        if (selectedDimension) {
          this.dimensionsDatas.contextDimensions.push(selectedDimension);
          this.dimensionsDatas.contextDimensionCount =
            this.dimensionsDatas.contextDimensionCount + 1;
        }
      }
      this.dimensionsDatas.contextSelection = new Array(
        this.dimensionsDatas.contextDimensions.length,
      ).fill([0]);
    }

    const savedSelectedDimensions =
      this.appService.getSavedDatas('selectedDimensions');
    if (savedSelectedDimensions) {
      for (let i = 0; i < savedSelectedDimensions.length; i++) {
        if (savedSelectedDimensions[i]) {
          const dimension = this.dimensionsDatas.selectedDimensions.find(
            (e) => e.name === savedSelectedDimensions[i].name,
          );
          if (dimension) {
            this.updateSelectedDimension(dimension, i);
          }
        }
      }
    }

    return this.dimensionsDatas.selectedDimensions;
  }

  /**
   * Updates the selected dimension at a given position.
   *
   * This method swaps the positions of the current dimension and the new dimension
   * in the selected dimensions array. It also updates the cell part indexes to reflect
   * the new selection order, ensuring that matrix combinations are updated accordingly.
   *
   * @param {DimensionCovisualizationModel} dimension - The dimension to be updated.
   * @param {number} position - The position at which the dimension should be placed.
   * @returns {DimensionCovisualizationModel[]} - The updated array of selected dimensions.
   */
  updateSelectedDimension(
    dimension: DimensionCovisualizationModel,
    position: number,
  ): DimensionCovisualizationModel[] {
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimension && dimension.name === e.name;
      });

    if (currentIndex !== -1) {
      // Invert values if already selected
      [
        // @ts-ignore
        this.dimensionsDatas.selectedDimensions[currentIndex],
        // @ts-ignore
        this.dimensionsDatas.selectedDimensions[position],
      ] = [
        this.dimensionsDatas.selectedDimensions[position],
        this.dimensionsDatas.selectedDimensions[currentIndex],
      ];

      // Reverse indexes of cellPartIndexes when selection change to update matrix combinations
      const cellPartIndexesLength =
        this.dimensionsDatas?.cellPartIndexes?.length;
      for (let i = 0; i < cellPartIndexesLength; i++) {
        [
          // @ts-ignore
          this.dimensionsDatas.cellPartIndexes[i][currentIndex],
          // @ts-ignore
          this.dimensionsDatas.cellPartIndexes[i][position],
        ] = [
          this.dimensionsDatas.cellPartIndexes[i]?.[position],
          this.dimensionsDatas.cellPartIndexes[i]?.[currentIndex],
        ];
      }
    }
    this.dimensionsDatas.selectedDimensions[position] = dimension;
    // #141 Update combobox on selection change
    this.dimensionsDatas.selectedDimensions = [
      ...this.dimensionsDatas.selectedDimensions,
    ];
    return this.dimensionsDatas.selectedDimensions;
  }

  /**
   * Constructs the dimensions trees for the visualization component.
   *
   * This method initializes the `dimensionsTrees` and `currentDimensionsTrees` arrays,
   * and populates them based on the initial and current data from the application service.
   * It also checks for any collapsed nodes from the saved data.
   *
   * The method processes each selected dimension, converting each child into a `TreeNodeModel`
   * object and sorting them by rank to order intervals. The trees are then unflattened and set
   * to the respective clusters.
   *
   * @remarks
   * - Collapsed nodes are taken into account if they exist in the saved data.
   * - Optimized for performance by reducing redundant operations and improving lookups.
   */
  constructDimensionsTrees() {
    this.dimensionsDatas.dimensionsTrees = [];
    this.dimensionsDatas.currentDimensionsTrees = [];

    // At launch check if there are collapsed nodes into input json file
    const collapsedNodes = this.appService.getSavedDatas('collapsedNodes');

    if (!this.appService.initialDatas?.coclusteringReport) {
      return;
    }

    const selectedDimensionsLength =
      this.dimensionsDatas.selectedDimensions.length;

    // Create lookup maps for performance optimization
    const initialDimensionHierarchiesMap = new Map<
      string,
      DimensionHierarchy
    >();
    const currentDimensionHierarchiesMap = new Map<
      string,
      DimensionHierarchy
    >();

    // Pre-populate hierarchy maps
    this.appService.initialDatas.coclusteringReport.dimensionHierarchies.forEach(
      (hierarchy) => {
        initialDimensionHierarchiesMap.set(hierarchy.name, hierarchy);
      },
    );

    if (this.appService.appDatas?.coclusteringReport?.dimensionHierarchies) {
      this.appService.appDatas.coclusteringReport.dimensionHierarchies.forEach(
        (hierarchy) => {
          currentDimensionHierarchiesMap.set(hierarchy.name, hierarchy);
        },
      );
    }

    for (let i = 0; i < selectedDimensionsLength; i++) {
      const dimension = this.dimensionsDatas.selectedDimensions[i];
      if (!dimension?.name) continue;

      // Pre-compute common values for this dimension
      const dimensionName = dimension.name;
      const currentDimensionNodesToCollapse =
        collapsedNodes?.[dimensionName] || [];
      const currentNodesNames =
        this.dimensionsDatas?.nodesNames?.[dimensionName];
      const currentAnnotations =
        this.dimensionsDatas?.annotations?.[dimensionName];
      const externalDatas: ExtDatasModel =
        this.importExtDatasService.getImportedDatasFromDimension(dimension);

      // Create value groups lookup map for better performance
      const valueGroupsMap = new Map<string, any>();
      if (dimension.valueGroups) {
        dimension.valueGroups.forEach((vg) => {
          valueGroupsMap.set(vg.cluster, vg);
        });
      }

      // Process initial dimension hierarchy
      const dimensionHierarchy =
        initialDimensionHierarchiesMap.get(dimensionName);
      if (dimensionHierarchy) {
        const { clusters, trees } = this.processDimensionHierarchy(
          dimensionHierarchy,
          dimension,
          currentDimensionNodesToCollapse,
          currentNodesNames,
          currentAnnotations,
          externalDatas,
          valueGroupsMap,
        );

        this.dimensionsDatas.dimensionsClusters[i] = clusters;
        this.dimensionsDatas.dimensionsTrees[i] = trees;
      } else {
        this.dimensionsDatas.dimensionsTrees[i] = [];
        this.dimensionsDatas.dimensionsClusters[i] = [];
      }

      // Process current dimension hierarchy
      const currentDimensionHierarchy =
        currentDimensionHierarchiesMap.get(dimensionName);
      if (currentDimensionHierarchy) {
        const { clusters, trees } = this.processDimensionHierarchy(
          currentDimensionHierarchy,
          dimension,
          currentDimensionNodesToCollapse,
          currentNodesNames,
          currentAnnotations,
          externalDatas,
          valueGroupsMap,
        );

        this.dimensionsDatas.currentDimensionsClusters[i] = clusters;
        this.dimensionsDatas.currentDimensionsTrees[i] = trees;
      } else {
        this.dimensionsDatas.currentDimensionsTrees[i] = [];
        this.dimensionsDatas.currentDimensionsClusters[i] = [];
      }
    }
  }

  /**
   * Processes a single dimension hierarchy to create tree nodes and clusters.
   * This helper method extracts the common logic for processing both initial and current dimension hierarchies.
   *
   * @param {DimensionHierarchy} dimensionHierarchy - The dimension hierarchy to process.
   * @param {DimensionCovisualizationModel} dimension - The dimension model.
   * @param {any[]} currentDimensionNodesToCollapse - Array of nodes to collapse.
   * @param {any} currentNodesNames - Current node names mapping.
   * @param {any} currentAnnotations - Current annotations mapping.
   * @param {ExtDatasModel} externalDatas - External data model.
   * @param {Map<string, any>} valueGroupsMap - Lookup map for value groups.
   * @returns {object} - Object containing clusters and trees arrays.
   */
  private processDimensionHierarchy(
    dimensionHierarchy: DimensionHierarchy,
    dimension: DimensionCovisualizationModel,
    currentDimensionNodesToCollapse: any[],
    currentNodesNames: any,
    currentAnnotations: any,
    externalDatas: ExtDatasModel,
    valueGroupsMap: Map<string, any>,
  ): { clusters: TreeNodeModel[]; trees: TreeNodeModel[] } {
    const clusters: TreeNodeModel[] = [];
    let leafPosition = -1;
    let index = 0;

    const clustersLength = dimensionHierarchy.clusters.length;

    // Pre-allocate array for better performance
    clusters.length = clustersLength;

    for (let j = 0; j < clustersLength; j++) {
      const cluster = dimensionHierarchy.clusters[j];
      if (!cluster) continue;

      if (cluster.isLeaf) {
        leafPosition++;
      }

      const currentValueGroups = valueGroupsMap.get(cluster.cluster);

      const treeNode = new TreeNodeModel(
        index,
        cluster,
        dimension,
        currentDimensionNodesToCollapse,
        leafPosition,
        j,
        currentNodesNames,
        currentAnnotations,
        externalDatas,
        currentValueGroups,
      );

      clusters[index] = treeNode;
      index++;
    }

    // Remove any undefined elements and sort by rank
    const validClusters = clusters.filter(Boolean);
    const sortedClusters = _.orderBy(validClusters, (e) => e.rank);

    // Unflatten the tree
    const trees = UtilsService.unflatten(sortedClusters);

    return { clusters: sortedClusters, trees };
  }

  /**
   * Retrieves and processes matrix data based on the selected dimensions.
   * This method initializes the matrix data structures, extracts relevant data
   * from the application state, and computes the necessary values for matrix visualization.
   *
   * @param {boolean} propagateChanges - Flag to determine if changes should be propagated.
   * @returns {any} - The processed matrix data.
   */
  getMatrixDatas(propagateChanges = true): MatrixDatasModel {
    // const t0 = performance.now();

    if (this.dimensionsDatas.selectedDimensions) {
      this.dimensionsDatas.matrixDatas = new MatrixDatasModel();

      const xDimension: DimensionCovisualizationModel | undefined =
        this.dimensionsDatas.selectedDimensions[0];
      const yDimension: DimensionCovisualizationModel | undefined =
        this.dimensionsDatas.selectedDimensions[1];
      const zDimension: DimensionCovisualizationModel[] = [];
      for (let i = 2; i < this.dimensionsDatas.selectedDimensions.length; i++) {
        if (this.dimensionsDatas.selectedDimensions[i]) {
          zDimension.push(
            this.dimensionsDatas.selectedDimensions[
              i
            ] as DimensionCovisualizationModel,
          );
        }
      }

      const zType: string[] = [];
      for (let i = 2; i < this.dimensionsDatas.selectedDimensions.length; i++) {
        if (this.dimensionsDatas.selectedDimensions[i]) {
          const dim = this.dimensionsDatas.selectedDimensions[i];
          if (dim) {
            zType.push(dim.type);
          }
        }
      }

      // context is an array of array (may have multiple contexts)
      const zDimensionClusters: TreeNodeModel[][] = [];
      for (let i = 2; i < this.dimensionsDatas.dimensionsClusters.length; i++) {
        if (this.dimensionsDatas.dimensionsClusters[i]) {
          zDimensionClusters.push(
            this.dimensionsDatas.dimensionsClusters[i] as TreeNodeModel[],
          );
        } else {
          zDimensionClusters.push([]);
        }
      }

      const xDimensionLeafs: Interval[] | ValueGroup[] | undefined =
        this.dimensionsDatas.selectedDimensions[0]?.type === TYPES.NUMERICAL
          ? this.dimensionsDatas.selectedDimensions[0]?.intervals
          : this.dimensionsDatas.selectedDimensions[0]?.valueGroups;
      const yDimensionLeafs: Interval[] | ValueGroup[] | undefined =
        this.dimensionsDatas.selectedDimensions[1]?.type === TYPES.NUMERICAL
          ? this.dimensionsDatas.selectedDimensions[1]?.intervals
          : this.dimensionsDatas.selectedDimensions[1]?.valueGroups;
      const xDimensionLeafsNames = xDimensionLeafs?.map((e) => e.cluster);
      const yDimensionLeafsNames = yDimensionLeafs?.map((e) => e.cluster);

      // Get shortdescriptions if defined
      const xDimensionLeafsShortDescription = xDimensionLeafsNames
        ? [...xDimensionLeafsNames]
        : [];
      const yDimensionLeafsShortDescription = yDimensionLeafsNames
        ? [...yDimensionLeafsNames]
        : [];
      if (xDimension && this.dimensionsDatas?.nodesNames?.[xDimension.name]) {
        for (const [key, value] of Object.entries(
          this.dimensionsDatas.nodesNames[xDimension.name],
        )) {
          const index = xDimensionLeafsShortDescription.indexOf(key);
          xDimensionLeafsShortDescription.splice(index, 1, value as string);
        }
      }
      if (yDimension && this.dimensionsDatas?.nodesNames?.[yDimension.name]) {
        for (const [key, value] of Object.entries(
          this.dimensionsDatas.nodesNames[yDimension.name],
        )) {
          const index = yDimensionLeafsShortDescription.indexOf(key);
          yDimensionLeafsShortDescription.splice(index, 1, value as string);
        }
      }

      // Get dimensions parts
      const dimensionParts = this.dimensionsDatas.selectedDimensions.map(
        (e) => e.parts,
      );

      // Get the full frequency list
      const cellFrequencies = MatrixUtilsService.getCellFrequencies(
        dimensionParts,
        this.dimensionsDatas.cellPartIndexes,
        (this.appService.appDatas &&
          this.appService.appDatas.coclusteringReport &&
          this.appService.appDatas.coclusteringReport.cellFrequencies) ||
          [],
        zDimension,
      );

      const xValues = new MatrixValuesModel();
      const yValues = new MatrixValuesModel();

      [xValues.frequency, yValues.frequency] =
        MatrixUtilsService.getFrequencyAxisValues(
          xDimension as any,
          yDimension as any,
          cellFrequencies,
        );

      xValues.standard =
        MatrixUtilsService.getStandardCovisualizationAxisValues(
          xDimension as any,
        );
      yValues.standard =
        MatrixUtilsService.getStandardCovisualizationAxisValues(
          yDimension as any,
        );

      // To display axis names
      this.dimensionsDatas.matrixDatas.variable = {
        nameX: this.dimensionsDatas.selectedDimensions[0]
          ? this.dimensionsDatas.selectedDimensions[0].name
          : '',
        nameY: this.dimensionsDatas.selectedDimensions[1]
          ? this.dimensionsDatas.selectedDimensions[1].name
          : '',
        xParts: this.dimensionsDatas.selectedDimensions[0]
          ? this.dimensionsDatas.selectedDimensions[0].parts
          : 0,
        yParts: this.dimensionsDatas.selectedDimensions[1]
          ? this.dimensionsDatas.selectedDimensions[1].parts
          : 0,
      };

      // Compute cells
      const cellDatas = MatrixUtilsService.getCellDatas(
        xDimension as any,
        yDimension as any,
        zDimension,
        xDimensionLeafsNames || [],
        yDimensionLeafsNames || [],
        xDimensionLeafsShortDescription,
        yDimensionLeafsShortDescription,
        cellFrequencies,
        undefined, // cellInterests only for KV
        undefined, // cellTargetFrequencies only for KV
        xValues,
        yValues,
      );

      this.dimensionsDatas.matrixDatas.matrixCellDatas = cellDatas;

      // hack to limit re-rendering and optimize perf
      this.dimensionsDatas.matrixDatas.propagateChanges = propagateChanges;

      // const t1 = performance.now();
      // console.log("getMatrixDatas " + (t1 - t0) + " milliseconds.");
      // const generationDuration = t1 - t0;
      // console.log("TCL: DimensionsDatasService -> getMatrixDatas -> this.dimensionsDatas.matrixDatas", JSON.stringify(this.dimensionsDatas.matrixDatas))
      // console.log(
      //   'DimensionsDatasService ~ getMatrixDatas ~ this.dimensionsDatas.matrixDatas:',
      //   this.dimensionsDatas.matrixDatas,
      // );
    }

    return this.dimensionsDatas.matrixDatas;
  }

  /**
   * Compute a frequency map for matrix data cells.
   * The map keys are combinations of y-axis and x-axis parts,
   * and the values are the corresponding indices in the matrix cell data array.
   * for instance:
   *
    {11th, 10th, 9th, ...}-{Local-gov}: 21
    {11th, 10th, 9th, ...}-{Private, Never-worked}: 3
    {11th, 10th, 9th, ...}-{Self-emp-inc}: 15
    {11th, 10th, 9th, ...}-{Self-emp-not-inc, Without-pay}: 9
    {11th, 10th, 9th, ...}-{State-gov, Federal-gov}: 27
    ...
   */
  computeMatrixDataFreqMap() {
    this.dimensionsDatas.matrixCellFreqDataMap =
      this.dimensionsDatas.matrixDatas.matrixCellDatas?.reduce(
        (map, data, index) => {
          const key = `${data.yaxisPart}-${data.xaxisPart}`;
          // @ts-ignore
          map[key] = index;
          return map;
        },
        {},
      );
  }
}
