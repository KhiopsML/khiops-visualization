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
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensions-data.model';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { ImportExtDatasService } from './import-ext-datas.service';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';
import { MatrixUtilsService } from '@khiops-library/components/matrix/matrix.utils.service';
@Injectable({
  providedIn: 'root',
})
export class ClustersService {
  private dimensionsDatas: DimensionsDatasModel | undefined;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private treenodesService: TreenodesService,
    private dimensionsDatasService: DimensionsDatasService,
    private importExtDatasService: ImportExtDatasService,
  ) {
    this.initialize();
  }
  /**
   * Initializes the dimensions data by retrieving it from the dimensions data service.
   */
  initialize() {
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();
  }

  /**
   * Retrieves the details of the selected clusters for each dimension.
   *
   * @returns {TreeNodeModel[][]} - An array of arrays containing the details of the selected clusters for each dimension.
   */
  getSelectedClustersDetails(): TreeNodeModel[][] {
    const details: TreeNodeModel[][] = [];
    for (let i = 0; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      details.push(
        this.getCurrentClusterDetailsFromNode(
          this.dimensionsDatas.dimensionsTrees[i],
        ),
      );
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
    for (let i = 0; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      currentCellsPerCluster =
        currentCellsPerCluster *
        this.dimensionsDatas.selectedDimensions[i].currentHierarchyClusterCount;
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
      const currentNode: TreeNodeModel = nodes[i];
      if (currentNode.isLeaf) {
        currentClusterDetailsFromNode.push(currentNode);
      } else {
        if (currentNode.isCollapsed) {
          currentClusterDetailsFromNode.push(currentNode);
        } else {
          this.getCurrentClusterDetailsFromNode(
            currentNode.children,
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
  getDistributionDetailsFromNode(position: number): ChartDatasModel {
    let filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
      this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[0],
    );
    let selectedNode =
      this.dimensionsDatasService.dimensionsDatas.selectedNodes[0];

    let otherselectedNode =
      this.dimensionsDatasService.dimensionsDatas.selectedNodes[1];

    if (position === 1) {
      filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
        this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[1],
      );
      selectedNode =
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[1];
      otherselectedNode =
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[0];
    }

    selectedNode.getChildrenList();
    otherselectedNode.getChildrenList();

    let distributionsGraphLabelsInit = [];
    let distributionsGraphLabels = [];

    distributionsGraphLabelsInit = filteredDimensionsClusters.map(
      (e) => e.name,
    );
    distributionsGraphLabels = filteredDimensionsClusters.map(
      (e) => e.shortDescription,
    );

    let [
      matrixFreqsValues,
      matrixValues,
      matrixExtras,
      matrixExpectedFreqsValues,
    ] = MatrixUtilsService.computeMatrixValues(
      {
        mode: 'FREQUENCY',
      },
      this.dimensionsDatasService.dimensionsDatas.matrixDatas.matrixCellDatas,
      this.dimensionsDatasService.dimensionsDatas.contextSelection,
      -1,
    );

    const currentDataSet = new ChartDatasetModel(
      this.dimensionsDatasService.dimensionsDatas.selectedNodes[
        position
      ].shortDescription,
    );

    let distributionsGraphDetails = new ChartDatasModel();
    const currentDataSetData = [];

    let filteredList;
    if (selectedNode.isLeaf || selectedNode.isCollapsed) {
      filteredList = selectedNode.name;
    } else {
      // not collapsed node remove the node of children list
      filteredList = selectedNode.childrenList;
      filteredList.shift();
    }

    let axisPartName = 'yaxisPart';
    if (position === 0) {
      axisPartName = 'xaxisPart';
    }
    let filteredotherList =
      this.dimensionsDatasService.dimensionsDatas.matrixDatas.matrixCellDatas.map(
        (e) => e[axisPartName],
      );
    filteredotherList = [...new Set(filteredotherList)]; // keep uniq

    const matrixCellFreqDataMap =
      this.dimensionsDatasService.dimensionsDatas.matrixCellFreqDataMap;

    for (let i = 0; i < otherselectedNode.childrenList.length; i++) {
      const element = otherselectedNode.childrenList[i];

      for (let j = 0; j < filteredotherList.length; j++) {
        const otherelement = filteredotherList[j];
        const labelIndex = distributionsGraphLabelsInit.indexOf(otherelement);

        const key =
          position === 1
            ? `${otherelement}-${element}`
            : `${element}-${otherelement}`;

        const cell = matrixCellFreqDataMap[key];

        if (cell !== undefined) {
          if (!currentDataSetData[labelIndex]) {
            currentDataSetData[labelIndex] = matrixValues[cell];
          } else {
            currentDataSetData[labelIndex] += matrixValues[cell];
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
    const appinitialDatas = this.appService.getInitialDatas().datas;

    const infoPerCluster = new ChartDatasModel();

    let currentDataSet: ChartDatasetModel;
    currentDataSet = new ChartDatasetModel('info', CHART_TYPES.LINE);
    for (
      let j = this.dimensionsDatas.dimensions.length - 1;
      j <= this.dimensionsDatas.hierarchyDatas.totalInitialClusters;
      j++
    ) {
      let currentCluster;
      for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
        const currentDimensionHierarchy: any =
          appinitialDatas.coclusteringReport.dimensionHierarchies[i];
        currentCluster = currentDimensionHierarchy.clusters.find(
          (e) => e.hierarchicalRank === j + 1,
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
      let j = this.dimensionsDatas.dimensions.length - 1;
      j < this.dimensionsDatas.hierarchyDatas.totalClusters;
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

    let currentDataSet: ChartDatasetModel;

    for (let i = 0; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      currentDataSet = new ChartDatasetModel(
        this.dimensionsDatas.selectedDimensions[i].name,
        CHART_TYPES.LINE,
      );

      let rankedCount = 1;
      for (
        let j = this.dimensionsDatas.selectedDimensions.length - 1;
        j <= this.dimensionsDatas.hierarchyDatas.totalClusters;
        j++
      ) {
        const isCurrentNodeRanked = this.dimensionsDatas.dimensionsClusters[
          i
        ].find((e) => e.hierarchicalRank === j && !e.isLeaf);
        if (isCurrentNodeRanked) {
          rankedCount++;
        }
        currentDataSet.data.push(rankedCount);
      }
      clustersPerDimDatas.datasets.push(currentDataSet);
    }

    for (let k = 0; k < clustersPerDimDatas.datasets.length; k++) {
      if (
        clustersPerDimDatas.datasets[k].data[
          rank - this.dimensionsDatas.selectedDimensions.length
        ] > maxGraphValue
      ) {
        maxGraphValue =
          clustersPerDimDatas.datasets[k].data[
            rank - this.dimensionsDatas.selectedDimensions.length
          ];
      }
    }

    currentDataSet = new ChartDatasetModel(
      this.translate.get('GLOBAL.NUMBER_OF_CLUSTERS'),
    );
    currentDataSet.maxBarThickness = 5;
    currentDataSet.barThickness = 5;

    for (
      let j = this.dimensionsDatas.selectedDimensions.length - 1;
      j < this.dimensionsDatas.hierarchyDatas.totalClusters;
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
    const appDatas = this.appService.getDatas().datas;
    const appinitialDatas = this.appService.getInitialDatas().datas;
    const compositionValues: CompositionModel[] = [];

    if (appDatas?.coclusteringReport?.dimensionPartitions) {
      const currentDimensionDetails: DimensionCovisualizationModel =
        this.dimensionsDatas.selectedDimensions.find(
          (e) => e.name === hierarchyName,
        );
      const currentIndex: number =
        this.dimensionsDatas.selectedDimensions.findIndex((e) => {
          return hierarchyName === e.name;
        });
      const currentInitialDimensionDetails: DimensionCovisualizationModel =
        new DimensionCovisualizationModel(
          appinitialDatas.coclusteringReport.dimensionSummaries[
            currentDimensionDetails.startPosition
          ],
          currentIndex,
        );
      const dimensionPartition =
        appinitialDatas.coclusteringReport.dimensionPartitions[
          currentDimensionDetails.startPosition
        ];

      // Set  dimension partitions from intervals or valueGroup
      currentInitialDimensionDetails.setPartition(dimensionPartition);

      // Composition only available for numerical Dimensions
      if (currentDimensionDetails?.isCategorical) {
        node.getChildrenList();

        if (node.childrenLeafList) {
          const currentDimensionClusters = Object.assign(
            [],
            this.dimensionsDatas.dimensionsClusters[currentIndex],
          );
          const childrenLeafListLength = node.childrenLeafList.length;

          for (let i = 0; i < childrenLeafListLength; i++) {
            const currentLeafName = node.childrenLeafList[i];
            // Check if this name has been updated
            const currentClusterDetails =
              currentInitialDimensionDetails.valueGroups.find(
                (e) => e.cluster === currentLeafName,
              );
            if (currentClusterDetails) {
              const currentClusterDetailsLength =
                currentClusterDetails.values.length;
              for (let j = 0; j < currentClusterDetailsLength; j++) {
                const currentDimensionHierarchyCluster: any =
                  currentDimensionClusters.find(
                    (e) => e.cluster === currentLeafName,
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
    if (dimensionsTree) {
      const appinitialDatas = this.appService.getInitialDatas().datas;
      const filteredDimensionsClustersDatas = [].concat(
        this.getCurrentClusterDetailsFromNode(dimensionsTree),
      );
      for (let i = 0; i < filteredDimensionsClustersDatas.length; i++) {
        const currentNodesNames =
          this.dimensionsDatas.nodesNames[selectedDimension.name];
        const clusterDetails: ClusterDetailsModel = new ClusterDetailsModel(
          filteredDimensionsClustersDatas[i],
          currentNodesNames,
        );

        if (!clusterDetails.size) {
          // get the size of collapsed nodes
          const treeNode: TreeNodeModel = this.treenodesService.getNodeFromName(
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
              const elementIndex = treeNode.childrenLeafIndexes[index];
              if (selectedDimension.isCategorical) {
                size +=
                  appinitialDatas.coclusteringReport.dimensionPartitions[
                    selectedDimension.startPosition
                  ].valueGroups[elementIndex].values.length;
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
}
