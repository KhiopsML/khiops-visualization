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
import { ClusterDetailsModel } from '@khiops-covisualization/model/cluster-details.model';
import { TreenodesService } from './treenodes.service';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';
import { MatrixUtilsService } from '@khiops-library/components/matrix/matrix.utils.service';
import {
  Cluster,
  DimensionHierarchy,
} from '@khiops-covisualization/interfaces/app-datas';
import { CellModel } from '@khiops-library/model/cell.model';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
import { BarModel } from '../../khiops-visualization/model/bar.model';
@Injectable({
  providedIn: 'root',
})
export class ClustersService {
  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private treenodesService: TreenodesService,
    private dimensionsDatasService: DimensionsDatasService,
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
        const dimTree =
          this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[i];
        if (dimTree) {
          details.push(this.getCurrentClusterDetailsFromNode(dimTree));
        }
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
        const selectedDim =
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions[i];
        if (selectedDim) {
          currentCellsPerCluster =
            currentCellsPerCluster * selectedDim.currentHierarchyClusterCount;
        }
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
          if (currentNode && currentNode.children) {
            this.getCurrentClusterDetailsFromNode(
              currentNode.children,
              currentClusterDetailsFromNode,
            );
          }
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
    if (!this.dimensionsDatasService.dimensionsDatas) return undefined;
    filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
      this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[0] || [],
    );
    let selectedNode =
      this.dimensionsDatasService.dimensionsDatas.selectedNodes[0];

    let otherselectedNode =
      this.dimensionsDatasService.dimensionsDatas.selectedNodes[1];

    if (position === 1) {
      filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
        this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[1] || [],
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
      (this.dimensionsDatasService.dimensionsDatas.matrixDatas &&
        this.dimensionsDatasService.dimensionsDatas.matrixDatas
          .matrixCellDatas) ||
        [],
      this.dimensionsDatasService.dimensionsDatas.contextSelection,
      -1,
    );

    // For distribution chart, we want to show the label of the OTHER dimension
    const otherPosition = position === 0 ? 1 : 0;
    const currentDataSet = new ChartDatasetModel(
      (this.dimensionsDatasService.dimensionsDatas.selectedNodes[
        otherPosition
      ] &&
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[otherPosition]
          .shortDescription) ||
        '',
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
      ) || [];
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

          const cell = matrixCellFreqDataMap && matrixCellFreqDataMap[key];

          if (cell !== undefined && matrixValues) {
            if (!currentDataSetData[labelIndex]) {
              currentDataSetData[labelIndex] = matrixValues[cell];
            } else {
              currentDataSetData[labelIndex] += matrixValues[cell] || 0;
            }
          }
        }
      }
    }

    // Create extra data for tooltips - only frequency for covisualization
    const currentDataSetExtras = [];

    // Calculate marginal frequency for conditional probability calculation
    const totalMarginalFrequency = currentDataSetData.reduce(
      (sum: number, freq) => sum + (freq || 0),
      0,
    );

    for (let i = 0; i < distributionsGraphLabels.length; i++) {
      const graphItem: BarModel = new BarModel();
      const frequencyValue = currentDataSetData[i] || 0;

      // Calculate conditional probability: P(cluster | context)
      const conditionalProba =
        totalMarginalFrequency > 0
          ? frequencyValue / totalMarginalFrequency
          : 0;

      graphItem.name = distributionsGraphLabels[i];
      graphItem.value = frequencyValue;
      graphItem.extra.frequencyValue = frequencyValue;
      graphItem.extra.value = frequencyValue;
      graphItem.extra.index = i;
      graphItem.extra.name = distributionsGraphLabels[i];
      // Explicitly set coverageValue to undefined to prevent probability display
      graphItem.extra.coverageValue = undefined;
      // Add conditional probability to extras
      (graphItem.extra as any).conditionalProba = conditionalProba;

      currentDataSetExtras.push(graphItem);
    }

    distributionsGraphDetails.labels.push(...distributionsGraphLabels);
    currentDataSet.data.push(...currentDataSetData);
    currentDataSet.extra.push(...currentDataSetExtras);

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
        this.dimensionsDatasService.dimensionsDatas.hierarchyDatas
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
        this.dimensionsDatasService.dimensionsDatas.hierarchyDatas
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
    const filteredDimensionsClusters: ClusterDetailsModel[] = [];
    if (dimensionsTree && selectedDimension) {
      const filteredDimensionsClustersDatas = [].concat(
        // @ts-ignore
        this.getCurrentClusterDetailsFromNode(dimensionsTree),
      );
      for (let i = 0; i < filteredDimensionsClustersDatas.length; i++) {
        const currentNode = filteredDimensionsClustersDatas[i];
        if (!currentNode) continue;
        const currentNodesNames =
          this.dimensionsDatasService.dimensionsDatas?.nodesNames[
            selectedDimension.name
          ];
        const clusterDetails: ClusterDetailsModel = new ClusterDetailsModel(
          currentNode,
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
                const coclusteringReport =
                  this.appService.initialDatas?.coclusteringReport;
                const dimensionPartitions =
                  coclusteringReport?.dimensionPartitions?.[
                    selectedDimension.startPosition
                  ];
                const valueGroups =
                  dimensionPartitions?.valueGroups?.[elementIndex];
                if (valueGroups?.values) {
                  size += valueGroups.values.length;
                }
              }
            }
            clusterDetails.size = size;
          }
        }

        // Calculate contextual frequency if conditional on context is enabled
        if (this.dimensionsDatasService.dimensionsDatas.conditionalOnContext) {
          this.calculateContextualValues(clusterDetails, selectedDimension);
        }

        filteredDimensionsClusters.push(clusterDetails);
      }
    }
    return filteredDimensionsClusters;
  }

  /**
   * Calculates contextual values (frequency, interest) for a cluster detail based on the current context selection.
   *
   * @param clusterDetails - The cluster details model to update.
   * @param selectedDimension - The selected dimension.
   */
  public calculateContextualValues(
    clusterDetails: ClusterDetailsModel,
    selectedDimension: DimensionCovisualizationModel,
  ): void {
    // Only calculate contextual values if conditional on context is enabled and there are context dimensions
    if (
      !this.dimensionsDatasService.dimensionsDatas.conditionalOnContext ||
      this.dimensionsDatasService.dimensionsDatas.contextDimensionCount === 0
    ) {
      return;
    }

    // Get all matrix data and context selection
    const matrixCellDatas =
      this.dimensionsDatasService.dimensionsDatas.matrixDatas?.matrixCellDatas;
    const contextSelection =
      this.dimensionsDatasService.dimensionsDatas.contextSelection;

    if (
      !matrixCellDatas ||
      !contextSelection ||
      contextSelection.length === 0
    ) {
      return;
    }

    // Get the dimension position to determine if it's xaxis or yaxis
    const dimensionPosition =
      this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
        (dim) => dim.name === selectedDimension.name,
      );

    if (dimensionPosition === -1) {
      return;
    }

    const axisProperty =
      dimensionPosition === 0 ? 'xDisplayaxisPart' : 'yDisplayaxisPart';

    // Calculate contextual frequency
    const [matrixFreqsValues] = MatrixUtilsService.computeMatrixValues(
      { mode: MATRIX_MODES.FREQUENCY },
      matrixCellDatas,
      contextSelection,
      -1,
    );

    if (matrixFreqsValues) {
      // Find all cells that match this cluster and sum their frequencies
      let contextualFrequency = 0;

      for (let i = 0; i < matrixCellDatas.length; i++) {
        const cell = matrixCellDatas[i];
        if (cell && cell[axisProperty] === clusterDetails.name) {
          contextualFrequency += matrixFreqsValues[i] || 0;
        }
      }

      clusterDetails.frequency = contextualFrequency;
    }
  }
}
