/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { DimensionsDatasService } from './dimensions-datas.service';
import { TreeNodeModel } from '../model/tree-node.model';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { TranslateService } from '@ngstack/translate';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { AppService } from './app.service';
import { CompositionModel } from '../model/composition.model';
import { ClusterDetailsModel } from '@khiops-covisualization/model/cluster-details.model';
import { TreenodesService } from './treenodes.service';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { ImportExtDatasService } from './import-ext-datas.service';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';
import { MatrixUtilsService } from '@khiops-library/components/matrix/matrix.utils.service';
import {
  Cluster,
  DimensionHierarchy,
} from '@khiops-covisualization/interfaces/app-datas';
import { CellModel } from '@khiops-library/model/cell.model';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
@Injectable({
  providedIn: 'root',
})
export class ClustersService {
  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private treenodesService: TreenodesService,
    private dimensionsDatasService: DimensionsDatasService,
    private importExtDatasService: ImportExtDatasService,
  ) {}

  /**
   * Retrieves the details of the selected clusters for each dimension.
   *
   * @returns {TreeNodeModel[][]} - An array of arrays containing the details of the selected clusters for each dimension.
   */
  getSelectedClustersDetails(): TreeNodeModel[][] {
    const details: TreeNodeModel[][] = [];
    if (this.dimensionsDatasService.dimensionsDatas) {
      for (
        let i = 0;
        i <
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.length;
        i++
      ) {
        details.push(
          this.getCurrentClusterDetailsFromNode(
            this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[i]!,
          ),
        );
      }
    }
    return details;
  }

  /**
   * Calculates the current number of cells per cluster based on the selected dimensions.
   *
   * @returns {number} - The current number of cells per cluster.
   */
  getCurrentCellsPerCluster(): number {
    let currentCellsPerCluster = 1;
    if (this.dimensionsDatasService.dimensionsDatas) {
      for (
        let i = 0;
        i <
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.length;
        i++
      ) {
        currentCellsPerCluster =
          currentCellsPerCluster *
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions[i]!
            .currentHierarchyClusterCount;
      }
    }
    return currentCellsPerCluster;
  }

  /**
   * Retrieves the current cluster details from the given nodes.
   * This method processes the nodes recursively to gather details of the clusters.
   *
   * @param {TreeNodeModel[]} nodes - The nodes representing the current clusters.
   * @param {TreeNodeModel[]} [currentClusterDetailsFromNode=[]] - An array to store the details of the current clusters.
   * @returns {TreeNodeModel[]} - An array containing the details of the current clusters.
   */
  getCurrentClusterDetailsFromNode(
    nodes: TreeNodeModel[],
    currentClusterDetailsFromNode: TreeNodeModel[] = [],
  ): TreeNodeModel[] {
    const nodesLength = nodes.length;
    for (let i = 0; i < nodesLength; i++) {
      const currentNode: TreeNodeModel | undefined = nodes[i];
      if (currentNode?.isLeaf) {
        currentClusterDetailsFromNode.push(currentNode);
      } else {
        if (currentNode?.isCollapsed) {
          currentClusterDetailsFromNode.push(currentNode);
        } else {
          this.getCurrentClusterDetailsFromNode(
            currentNode!.children,
            currentClusterDetailsFromNode,
          );
        }
      }
    }
    return currentClusterDetailsFromNode;
  }

  /**
   * Retrieves the distribution details from a specified node position.
   *
   * @param {number} position - The position of the node to get distribution details from.
   * @returns {ChartDatasModel} - The chart data model containing distribution details.
   */
  getDistributionDetailsFromNode(
    position: number,
  ): ChartDatasModel | undefined {
    let filteredDimensionsClusters: TreeNodeModel[] = [];
    filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
      this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[0]!,
    );
    let selectedNode =
      this.dimensionsDatasService.dimensionsDatas.selectedNodes[0];

    let otherselectedNode =
      this.dimensionsDatasService.dimensionsDatas.selectedNodes[1];

    if (position === 1) {
      filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
        this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[1]!,
      );
      selectedNode =
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[1];
      otherselectedNode =
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[0];
    }

    selectedNode && selectedNode.getChildrenList();
    otherselectedNode && otherselectedNode.getChildrenList();

    let distributionsGraphLabelsInit = [];
    let distributionsGraphLabels = [];

    distributionsGraphLabelsInit = filteredDimensionsClusters.map(
      (e) => e.name,
    );
    distributionsGraphLabels = filteredDimensionsClusters.map(
      (e) => e.shortDescription,
    );

    let [
      _matrixFreqsValues,
      matrixValues,
      _matrixExtras,
      _matrixExpectedFreqsValues,
    ] = MatrixUtilsService.computeMatrixValues(
      {
        mode: MATRIX_MODES.FREQUENCY,
      },
      this.dimensionsDatasService.dimensionsDatas.matrixDatas.matrixCellDatas!,
      this.dimensionsDatasService.dimensionsDatas.contextSelection,
      -1,
    );

    const currentDataSet = new ChartDatasetModel(
      this.dimensionsDatasService.dimensionsDatas.selectedNodes[
        position
      ]!.shortDescription,
    );

    let distributionsGraphDetails: ChartDatasModel | undefined =
      new ChartDatasModel();
    const currentDataSetData = [];

    let filteredList;
    if (selectedNode?.isLeaf || selectedNode?.isCollapsed) {
      filteredList = selectedNode.name;
    } else {
      // not collapsed node remove the node of children list
      filteredList = selectedNode?.childrenList;
      filteredList && filteredList.shift();
    }

    let axisPartName = 'yaxisPart';
    if (position === 0) {
      axisPartName = 'xaxisPart';
    }
    let filteredotherList =
      this.dimensionsDatasService.dimensionsDatas?.matrixDatas?.matrixCellDatas?.map(
        (e: CellModel) => e[axisPartName as keyof CellModel],
      );
    filteredotherList = [...new Set(filteredotherList)]; // keep uniq

    const matrixCellFreqDataMap =
      this.dimensionsDatasService.dimensionsDatas.matrixCellFreqDataMap;

    if (otherselectedNode) {
      for (let i = 0; i < otherselectedNode.childrenList.length; i++) {
        const element = otherselectedNode.childrenList[i];

        for (let j = 0; j < filteredotherList.length; j++) {
          const otherelement = filteredotherList[j];
          // @ts-ignore
          const labelIndex = distributionsGraphLabelsInit.indexOf(otherelement);

          const key =
            position === 1
              ? `${otherelement}-${element}`
              : `${element}-${otherelement}`;

          const cell = matrixCellFreqDataMap?.[key];

          if (cell !== undefined) {
            if (!currentDataSetData[labelIndex]) {
              currentDataSetData[labelIndex] = matrixValues![cell];
            } else {
              currentDataSetData[labelIndex] += matrixValues![cell]!;
            }
          }
        }
      }
    }

    distributionsGraphDetails.labels.push(...distributionsGraphLabels);
    currentDataSet.data.push(...currentDataSetData);

    distributionsGraphDetails.datasets.push(currentDataSet);

    // Init obj if error or no value
    if (distributionsGraphDetails.labels.length === 0) {
      distributionsGraphDetails = undefined;
    }
    return distributionsGraphDetails;
  }

  /**
   * Generates a dataset representing information per cluster at a given rank.
   * This method processes the initial data and hierarchy data to create a chart dataset.
   *
   * @param rank - The rank at which the clusters are being evaluated.
   * @returns A ChartDatasModel containing the information per cluster data.
   */
  getInfoPerCluster(rank: number): ChartDatasModel {
    const infoPerCluster = new ChartDatasModel();

    let currentDataSet: ChartDatasetModel;
    currentDataSet = new ChartDatasetModel('info', CHART_TYPES.LINE);
    if (this.dimensionsDatasService.dimensionsDatas?.hierarchyDatas) {
      for (
        let j =
          this.dimensionsDatasService.dimensionsDatas.dimensions.length - 1;
        j <=
        this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!
          .totalInitialClusters;
        j++
      ) {
        let currentCluster;
        for (
          let i = 0;
          i < this.dimensionsDatasService.dimensionsDatas.dimensions.length;
          i++
        ) {
          const currentDimensionHierarchy: DimensionHierarchy | undefined =
            this.appService.initialDatas?.coclusteringReport
              .dimensionHierarchies[i];
          currentCluster = currentDimensionHierarchy?.clusters.find(
            (e: Cluster) => e.hierarchicalRank === j + 1,
          );
          if (currentCluster) {
            break;
          }
        }
        // 150 currentCluster may be deleted by an auto unfold,
        // If not found, do nothing and loop
        if (currentCluster) {
          let currentInfo = currentCluster.hierarchicalLevel * 100 || 0;
          if (currentInfo < 0) {
            currentInfo = 0;
          }
          currentDataSet.data.push(currentInfo);
        }
      }
      infoPerCluster.datasets.push(currentDataSet);

      currentDataSet = new ChartDatasetModel(
        this.translate.get('GLOBAL.NUMBER_OF_CLUSTERS'),
      );
      currentDataSet.maxBarThickness = 5;
      currentDataSet.barThickness = 5;

      // Manage current rank selection bar
      for (
        let j =
          this.dimensionsDatasService.dimensionsDatas.dimensions.length - 1;
        j <
        this.dimensionsDatasService.dimensionsDatas.hierarchyDatas!
          .totalClusters;
        j++
      ) {
        infoPerCluster.labels.push(j + 1 + '');
        let currentValue = 0;

        if (j + 1 === rank) {
          currentValue = 100;
        }
        currentDataSet.data.push(currentValue);
      }
      infoPerCluster.datasets.push(currentDataSet);
    }

    return infoPerCluster;
  }

  /**
   * Generates a dataset representing the number of clusters per dimension at a given rank.
   * This method processes the selected dimensions and their hierarchy data to create a chart dataset.
   *
   * @param rank - The rank at which the clusters are being evaluated.
   * @returns A ChartDatasModel containing the clusters per dimension data.
   */
  getClustersPerDimDatas(rank: number): ChartDatasModel {
    const clustersPerDimDatas = new ChartDatasModel();
    let maxGraphValue = 0;

    if (
      this.dimensionsDatasService.dimensionsDatas?.selectedDimensions &&
      this.dimensionsDatasService.dimensionsDatas.hierarchyDatas
    ) {
      let currentDataSet: ChartDatasetModel;

      for (
        let i = 0;
        i <
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.length;
        i++
      ) {
        currentDataSet = new ChartDatasetModel(
          this.dimensionsDatasService.dimensionsDatas?.selectedDimensions[
            i
          ]?.name,
          CHART_TYPES.LINE,
        );

        let rankedCount = 1;
        for (
          let j =
            this.dimensionsDatasService.dimensionsDatas.selectedDimensions
              .length - 1;
          j <=
          this.dimensionsDatasService.dimensionsDatas.hierarchyDatas
            .totalClusters;
          j++
        ) {
          const isCurrentNodeRanked =
            this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
              i
            ]?.find((e) => e.hierarchicalRank === j && !e.isLeaf);
          if (isCurrentNodeRanked) {
            rankedCount++;
          }
          currentDataSet.data.push(rankedCount);
        }
        clustersPerDimDatas.datasets.push(currentDataSet);
      }

      for (let k = 0; k < clustersPerDimDatas.datasets.length; k++) {
        if (
          clustersPerDimDatas.datasets[k]?.data[
            rank -
              this.dimensionsDatasService.dimensionsDatas.selectedDimensions
                .length
          ] > maxGraphValue
        ) {
          maxGraphValue =
            clustersPerDimDatas.datasets[k]?.data[
              rank -
                this.dimensionsDatasService.dimensionsDatas.selectedDimensions
                  .length
            ];
        }
      }

      currentDataSet = new ChartDatasetModel(
        this.translate.get('GLOBAL.NUMBER_OF_CLUSTERS'),
      );
      currentDataSet.maxBarThickness = 5;
      currentDataSet.barThickness = 5;

      for (
        let j =
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions
            .length - 1;
        j <
        this.dimensionsDatasService.dimensionsDatas.hierarchyDatas
          .totalClusters;
        j++
      ) {
        clustersPerDimDatas.labels.push(j + 1 + '');
        let currentValue = 0;
        if (j + 1 === rank) {
          currentValue = maxGraphValue;
        }
        currentDataSet.data.push(currentValue);
      }
      clustersPerDimDatas.datasets.push(currentDataSet);
    }

    return clustersPerDimDatas;
  }

  /**
   * Retrieves the composition clusters for a given hierarchy and node.
   * This method processes the dimension partitions and clusters to generate
   * composition models, which include details about the clusters and their
   * associated data.
   *
   * @param hierarchyName - The name of the hierarchy for which composition clusters are being retrieved.
   * @param node - The node representing the current cluster in the hierarchy.
   * @returns An array of CompositionModel containing details of the composition clusters.
   */
  getCompositionClusters(
    hierarchyName: string,
    node: TreeNodeModel,
  ): CompositionModel[] {
    if (
      this.appService.initialDatas?.coclusteringReport?.dimensionSummaries &&
      this.appService.appDatas?.coclusteringReport?.dimensionPartitions &&
      this.dimensionsDatasService.dimensionsDatas?.selectedDimensions
    ) {
      const currentDimensionDetails: DimensionCovisualizationModel | undefined =
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.find(
          (e) => e.name === hierarchyName,
        );
      if (currentDimensionDetails) {
        const currentIndex: number =
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
            (e) => {
              return hierarchyName === e.name;
            },
          );
        const position = currentDimensionDetails.startPosition;
        const currentInitialDimensionDetails: DimensionCovisualizationModel =
          new DimensionCovisualizationModel(
            this.appService.initialDatas.coclusteringReport.dimensionSummaries[
              position
            ]!,
            currentIndex,
          );
        const dimensionPartition =
          this.appService.initialDatas.coclusteringReport.dimensionPartitions[
            position
          ];

        // Set dimension partitions from intervals or valueGroup
        currentInitialDimensionDetails.setPartition(dimensionPartition!);

        if (currentDimensionDetails?.isVarPart) {
          // Individuals * Variables case
          return this.getIndiVarCompositionValues(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            node,
            currentIndex,
          );
        } else {
          // Normal case : Variabe * Variable
          return this.getVarVarCompositionValues(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            node,
            currentIndex,
          );
        }
      }
    }
    return [];
  }

  getIndiVarCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
  ) {
    let compositionValues: CompositionModel[] = [];
    if (currentDimensionDetails?.isCategorical) {
      node.getChildrenList();
      node.getValueGroups(currentInitialDimensionDetails);

      if (node.childrenLeafList) {
        const currentDimensionClusters = Object.assign(
          [],
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
            currentIndex
          ],
        );

        const childrenLeafListLength = node.childrenLeafList.length;

        for (let i = 0; i < childrenLeafListLength; i++) {
          const currentLeafName = node.childrenLeafList[i];
          // Check if this name has been updated
          const currentClusterDetails =
            currentInitialDimensionDetails.valueGroups?.find(
              (e) => e.cluster === currentLeafName,
            );
          if (currentClusterDetails) {
            const currentParts = node.formatedValues?.[i];

            for (let j = 0; j < (currentParts?.length ?? 0); j++) {
              const currentDimensionHierarchyCluster: any =
                currentDimensionClusters.find(
                  (e: any) => e.cluster === currentLeafName,
                );
              if (node.isCollapsed) {
                currentDimensionHierarchyCluster.shortDescription =
                  node.shortDescription;
              }
              const externalDatas: ExtDatasModel =
                this.importExtDatasService.getImportedDatasFromDimension(
                  currentDimensionDetails,
                );
              const composition = new CompositionModel(
                currentClusterDetails,
                currentDimensionHierarchyCluster,
                j,
                externalDatas,
                currentDimensionDetails.innerVariables,
                currentParts?.[j],
              );
              compositionValues.push(composition);
            }
          }
        }
      }
    }
    console.log(
      ' ClustersService ~ compositionValues:',
      JSON.stringify(compositionValues),
    );

    if (node.isCollapsed) {
      // Merge compositionValues elements with contiguous intervals
      compositionValues = this.mergeAllContiguousModels(compositionValues);
    }

    console.log(' ClustersService ~ compositionValues:', compositionValues);
    return compositionValues;
  }

  getVarVarCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
  ) {
    const compositionValues: CompositionModel[] = [];
    // Composition only available for categorical Dimensions
    if (currentDimensionDetails?.isCategorical) {
      node.getChildrenList();

      if (node.childrenLeafList) {
        const currentDimensionClusters = Object.assign(
          [],
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
            currentIndex
          ],
        );
        const childrenLeafListLength = node.childrenLeafList.length;

        for (let i = 0; i < childrenLeafListLength; i++) {
          const currentLeafName = node.childrenLeafList[i];
          // Check if this name has been updated
          const currentClusterDetails =
            currentInitialDimensionDetails.valueGroups?.find(
              (e) => e.cluster === currentLeafName,
            );
          if (currentClusterDetails) {
            const currentClusterDetailsLength =
              currentClusterDetails.values.length;
            for (let j = 0; j < currentClusterDetailsLength; j++) {
              const currentDimensionHierarchyCluster: any =
                currentDimensionClusters.find(
                  (e: any) => e.cluster === currentLeafName,
                );
              if (node.isCollapsed) {
                currentDimensionHierarchyCluster.shortDescription =
                  node.shortDescription;
              }
              const externalDatas: ExtDatasModel =
                this.importExtDatasService.getImportedDatasFromDimension(
                  currentDimensionDetails,
                );

              const composition = new CompositionModel(
                currentClusterDetails,
                currentDimensionHierarchyCluster,
                j,
                externalDatas,
              );
              compositionValues.push(composition);
            }
          }
        }
      }
    }
    return compositionValues;
  }

  /**
   * Filters the dimension tree to retrieve cluster details for a selected dimension.
   *
   * @param dimensionsTree - The tree structure representing the dimensions.
   * @param selectedDimension - The dimension model for which clusters are being filtered.
   * @returns An array of ClusterDetailsModel containing details of the filtered clusters.
   */
  getFilteredDimensionTree(
    dimensionsTree: TreeNodeModel[] | undefined,
    selectedDimension: DimensionCovisualizationModel | undefined,
  ): ClusterDetailsModel[] {
    let filteredDimensionsClusters: ClusterDetailsModel[] = [];
    if (dimensionsTree && selectedDimension && dimensionsTree) {
      const filteredDimensionsClustersDatas = [].concat(
        // @ts-ignore
        this.getCurrentClusterDetailsFromNode(dimensionsTree),
      );
      for (let i = 0; i < filteredDimensionsClustersDatas.length; i++) {
        const currentNodesNames =
          this.dimensionsDatasService.dimensionsDatas?.nodesNames[
            selectedDimension.name
          ];
        const clusterDetails: ClusterDetailsModel = new ClusterDetailsModel(
          filteredDimensionsClustersDatas[i]!,
          currentNodesNames,
        );

        if (!clusterDetails.size) {
          // get the size of collapsed nodes
          const treeNode: TreeNodeModel | undefined =
            this.treenodesService.getNodeFromName(
              selectedDimension.name,
              clusterDetails.name,
            );
          if (treeNode) {
            treeNode.getChildrenList();

            // now for each children leaf, get the size into dimensionPartitions.valueGroups
            let size = 0;
            for (
              let index = 0;
              index < treeNode.childrenLeafIndexes.length;
              index++
            ) {
              const elementIndex: number =
                treeNode.childrenLeafIndexes[index] || 0;
              if (selectedDimension.isCategorical) {
                size +=
                  // @ts-ignore
                  this.appService.initialDatas.coclusteringReport
                    .dimensionPartitions[selectedDimension.startPosition]
                    .valueGroups[elementIndex].values.length;
              }
            }
            clusterDetails.size = size;
          }
        }
        filteredDimensionsClusters.push(clusterDetails);
      }
    }
    return filteredDimensionsClusters;
  }

  /**
   * Checks if two intervals are contiguous
   * Supported interval format: ]-inf;a], ]a;b], ]b;+inf[
   */
  areIntervalsContiguous(interval1: string, interval2: string): boolean {
    // Extract bounds from intervals
    const extractBounds = (
      interval: string,
    ): { lowerBound: number; upperBound: number } => {
      // Patterns for different interval formats
      const infPattern = /\]-inf;([\d.]+)\]/;
      const rangePattern = /\]([\d.]+);([\d.]+)\]/;
      const plusInfPattern = /\]([\d.]+);\+inf\[/;

      let lowerBound: number, upperBound: number;

      if (infPattern.test(interval)) {
        const match = interval.match(infPattern);
        lowerBound = -Infinity;
        upperBound = match ? parseFloat(match[1]!) : NaN;
      } else if (plusInfPattern.test(interval)) {
        const match = interval.match(plusInfPattern);
        lowerBound = match ? parseFloat(match[1]!) : NaN;
        upperBound = Infinity;
      } else if (rangePattern.test(interval)) {
        const match = interval.match(rangePattern);
        lowerBound = match ? parseFloat(match[1]!) : NaN;
        upperBound = match ? parseFloat(match[2]!) : NaN;
      } else {
        return { lowerBound: NaN, upperBound: NaN };
      }

      return { lowerBound, upperBound };
    };

    const bounds1 = extractBounds(interval1);
    const bounds2 = extractBounds(interval2);

    // Check if intervals are contiguous (one upper bound equals one lower bound)
    return (
      bounds1.upperBound === bounds2.lowerBound ||
      bounds2.upperBound === bounds1.lowerBound
    );
  }

  /**
   * Merges two contiguous intervals into a single one
   */
  mergeIntervals(interval1: string, interval2: string): string {
    const extractBounds = (
      interval: string,
    ): { lowerBound: number; upperBound: number; format: string } => {
      // Patterns for different interval formats
      const infPattern = /\]-inf;([\d.]+)\]/;
      const rangePattern = /\]([\d.]+);([\d.]+)\]/;
      const plusInfPattern = /\]([\d.]+);\+inf\[/;

      let lowerBound: number, upperBound: number, format: string;

      if (infPattern.test(interval)) {
        const match = interval.match(infPattern);
        lowerBound = -Infinity;
        upperBound = match ? parseFloat(match[1]!) : NaN;
        format = 'inf';
      } else if (plusInfPattern.test(interval)) {
        const match = interval.match(plusInfPattern);
        lowerBound = match ? parseFloat(match[1]!) : NaN;
        upperBound = Infinity;
        format = 'plusInf';
      } else if (rangePattern.test(interval)) {
        const match = interval.match(rangePattern);
        lowerBound = match ? parseFloat(match[1]!) : NaN;
        upperBound = match ? parseFloat(match[2]!) : NaN;
        format = 'range';
      } else {
        return { lowerBound: NaN, upperBound: NaN, format: 'unknown' };
      }

      return { lowerBound, upperBound, format };
    };

    const bounds1 = extractBounds(interval1);
    const bounds2 = extractBounds(interval2);

    // Determine new min and max bounds
    const minLowerBound = Math.min(bounds1.lowerBound, bounds2.lowerBound);
    const maxUpperBound = Math.max(bounds1.upperBound, bounds2.upperBound);

    // Format the new interval
    if (minLowerBound === -Infinity && maxUpperBound === Infinity) {
      return ']-inf;+inf[';
    } else if (minLowerBound === -Infinity) {
      return `]-inf;${maxUpperBound}]`;
    } else if (maxUpperBound === Infinity) {
      return `]${minLowerBound};+inf[`;
    } else {
      return `]${minLowerBound};${maxUpperBound}]`;
    }
  }

  /**
   * Determines if two CompositionModel objects have contiguous parts
   */
  haveContiguousParts(
    model1: CompositionModel,
    model2: CompositionModel,
  ): boolean {
    // Check if models concern the same variable
    if (model1.innerVariable !== model2.innerVariable) {
      return false;
    }

    // Iterate through parts of both models to find contiguous intervals
    for (const part1 of model1.part!) {
      for (const part2 of model2.part!) {
        if (this.areIntervalsContiguous(part1, part2)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Sorts interval strings in ascending order
   * @param intervals Array of interval strings to sort
   * @returns Sorted array of interval strings
   */
  sortIntervals(intervals: string[]): string[] {
    return [...intervals].sort((a, b) => {
      // Extract lower bounds for comparison
      const extractLowerBound = (interval: string): number => {
        const infPattern = /\]-inf;([\d.]+)\]/;
        const rangePattern = /\]([\d.]+);([\d.]+)\]/;
        const plusInfPattern = /\]([\d.]+);\+inf\[/;

        if (infPattern.test(interval)) {
          return -Infinity;
        } else if (rangePattern.test(interval)) {
          const match = interval.match(rangePattern);
          return match ? parseFloat(match[1]!) : NaN;
        } else if (plusInfPattern.test(interval)) {
          const match = interval.match(plusInfPattern);
          return match ? parseFloat(match[1]!) : NaN;
        }
        return NaN;
      };

      const lowerBoundA = extractLowerBound(a);
      const lowerBoundB = extractLowerBound(b);

      return lowerBoundA - lowerBoundB;
    });
  }

  /**
   * Merges a list of intervals into a simplified form
   * @param intervals Array of interval strings to merge
   * @returns Array of simplified interval strings
   */
  simplifyIntervals(intervals: string[]): string[] {
    if (intervals.length === 0) return [];

    // First, sort the intervals
    const sortedIntervals = this.sortIntervals(intervals);

    // Extract numeric ranges from the intervals
    const ranges: Array<{ lower: number; upper: number }> = [];

    sortedIntervals.forEach((interval) => {
      const infPattern = /\]-inf;([\d.]+)\]/;
      const rangePattern = /\]([\d.]+);([\d.]+)\]/;
      const plusInfPattern = /\]([\d.]+);\+inf\[/;

      let lower: number, upper: number;

      if (infPattern.test(interval)) {
        const match = interval.match(infPattern);
        lower = -Infinity;
        upper = match ? parseFloat(match[1]!) : NaN;
      } else if (plusInfPattern.test(interval)) {
        const match = interval.match(plusInfPattern);
        lower = match ? parseFloat(match[1]!) : NaN;
        upper = Infinity;
      } else if (rangePattern.test(interval)) {
        const match = interval.match(rangePattern);
        lower = match ? parseFloat(match[1]!) : NaN;
        upper = match ? parseFloat(match[2]!) : NaN;
      } else {
        // Non-numeric interval, keep as is
        return;
      }

      ranges.push({ lower, upper });
    });

    // No ranges to merge
    if (ranges.length === 0) return sortedIntervals;

    // Merge overlapping or contiguous ranges
    const mergedRanges: Array<{ lower: number; upper: number }> = [];
    let currentRange = ranges[0];

    for (let i = 1; i < ranges.length; i++) {
      const range = ranges[i];

      // Check if current range overlaps or is contiguous with the next one
      if (
        // @ts-ignore
        currentRange.upper >= range.lower ||
        // @ts-ignore
        Math.abs(currentRange.upper - range.lower) < 0.0001
      ) {
        // Merge ranges
        // @ts-ignore
        currentRange.upper = Math.max(currentRange.upper, range.upper);
      } else {
        // No overlap, store current range and start a new one
        mergedRanges.push(currentRange!);
        currentRange = range;
      }
    }

    // Add the last range
    mergedRanges.push(currentRange!);

    // Convert back to interval strings
    const result = mergedRanges.map((range) => {
      if (range.lower === -Infinity && range.upper === Infinity) {
        return ']-inf;+inf[';
      } else if (range.lower === -Infinity) {
        return `]-inf;${range.upper}]`;
      } else if (range.upper === Infinity) {
        return `]${range.lower};+inf[`;
      } else {
        return `]${range.lower};${range.upper}]`;
      }
    });

    return result;
  }

  /**
   * Fuses two CompositionModel objects that can be merged
   * @param model1 First CompositionModel
   * @param model2 Second CompositionModel
   * @returns Merged CompositionModel
   */
  mergeCompositionModels(
    model1: CompositionModel,
    model2: CompositionModel,
  ): CompositionModel {
    // Check if models can be merged
    if (!this.canMergeModels(model1, model2)) {
      throw new Error('Models cannot be merged');
    }

    let mergedParts: string[];

    // Handle categorical variables
    if (model1.innerVariableType === 'Categorical') {
      mergedParts = this.mergeCategoricalSets([
        ...model1.part!,
        ...model2.part!,
      ]);
    } else {
      // Handle numerical variables (intervals)
      mergedParts = this.simplifyIntervals([...model1.part!, ...model2.part!]);
    }

    // Create the merged model
    const mergedModel: CompositionModel = {
      ...model1,
      frequency: model1.frequency! + model2.frequency!,
      part: mergedParts,
      _id: `${model1._id}_${model2._id}_merged`, // Temporary ID
      // Update value to reflect the merged parts
      value: model1.innerVariable + ' ' + mergedParts[0],
    };

    return mergedModel;
  }

  /**
   * Processes a batch of CompositionModel objects to merge those with the same innerVariable
   * @param models Array of CompositionModel objects to analyze
   * @returns Array of merged CompositionModel objects
   */
  mergeAllContiguousModels(models: CompositionModel[]): CompositionModel[] {
    // Group models by innerVariable
    const modelsByVariable: Record<string, CompositionModel[]> = {};

    models.forEach((model) => {
      if (!modelsByVariable[model.innerVariable!]) {
        modelsByVariable[model.innerVariable!] = [];
      }
      modelsByVariable[model.innerVariable!]!.push(model);
    });

    // Process each group separately
    const results: CompositionModel[] = [];

    for (const variable in modelsByVariable) {
      const variableModels = modelsByVariable[variable];

      // Skip if there's only one model for this variable
      // @ts-ignore
      if (variableModels.length <= 1) {
        results.push(...variableModels!);
        continue;
      }

      // Get the type of the variable
      const variableType = variableModels?.[0]!.innerVariableType;

      if (variableType === 'Categorical') {
        // For categorical variables, merge all models with the same innerVariable
        const baseModel = variableModels?.[0];
        const allParts = variableModels?.flatMap((model) => model.part);
        const totalFrequency = variableModels?.reduce(
          (sum, model) => sum + model.frequency!,
          0,
        );

        const mergedCategoricalModel = {
          ...baseModel,
          frequency: totalFrequency,
          // @ts-ignore
          part: this.mergeCategoricalSets(allParts!),
          _id: variableModels?.map((m) => m._id).join('_') + '_merged',
          value:
            baseModel?.innerVariable +
            ' ' +
            // @ts-ignore
            this.mergeCategoricalSets(allParts)[0],
        };

        // @ts-ignore
        results.push(mergedCategoricalModel);
      } else {
        // For numerical variables, continue with the existing merging logic
        let workingModels = [...variableModels!];
        let mergeOccurred = true;

        // Continue merging until no more merges are possible
        while (mergeOccurred) {
          mergeOccurred = false;

          for (let i = 0; i < workingModels.length; i++) {
            if (mergeOccurred) break;

            for (let j = i + 1; j < workingModels.length; j++) {
              if (this.canMergeModels(workingModels[i]!, workingModels[j]!)) {
                // Merge models
                const mergedModel = this.mergeCompositionModels(
                  workingModels[i]!,
                  workingModels[j]!,
                );

                // Remove original models and add merged model
                workingModels.splice(j, 1);
                workingModels.splice(i, 1);
                workingModels.push(mergedModel);

                mergeOccurred = true;
                break;
              }
            }
          }
        }

        // Check if numeric intervals cover the entire range
        const finalModels = workingModels.map((model) => {
          // @ts-ignore
          if (model.part.length === 1 && model.part[0] === ']-inf;+inf[') {
            return {
              ...model,
              value: model.innerVariable + ' ]-inf;+inf[',
            };
          }
          return model;
        });

        // Add processed models to results
        results.push(...finalModels);
      }
    }

    return results;
  }

  /**
   * For categorical values, merges the contents of sets in the format "{value1, value2, ...}"
   * @param categoricalSets Array of string sets in the format "{value1, value2, ...}"
   * @returns Merged set of values
   */
  mergeCategoricalSets(categoricalSets: string[]): string[] {
    // Helper function to extract values from a set string
    const extractValues = (setStr: string): string[] => {
      // Match content inside curly braces
      const match = setStr.match(/{([^}]*)}/);
      if (!match) return [];

      // Split by comma and trim
      // @ts-ignore
      return match[1].split(',').map((s) => s.trim());
    };

    // Collect all unique values
    const allValues = new Set<string>();

    categoricalSets.forEach((set) => {
      extractValues(set).forEach((value) => {
        allValues.add(value);
      });
    });

    // Create a new set string with all values
    return [`{${Array.from(allValues).join(', ')}}`];
  }

  /**
   * Checks if two CompositionModel objects can be merged
   * @param model1 First CompositionModel
   * @param model2 Second CompositionModel
   * @returns Boolean indicating if models can be merged
   */
  canMergeModels(model1: CompositionModel, model2: CompositionModel): boolean {
    // Must have the same innerVariable
    if (model1.innerVariable !== model2.innerVariable) {
      return false;
    }

    // Categorical variables can always be merged if they have the same innerVariable
    if (
      model1.innerVariableType === 'Categorical' &&
      model2.innerVariableType === 'Categorical'
    ) {
      return true;
    }

    // For numerical variables, check if parts are contiguous
    return this.haveContiguousParts(model1, model2);
  }
}
