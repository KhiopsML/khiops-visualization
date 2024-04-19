import { Injectable } from '@angular/core';
import { DimensionsDatasService } from './dimensions-datas.service';
import { TreeNodeVO } from '../model/tree-node-vo';
import { ChartDatasetVO } from '@khiops-library/model/chartDataset-vo';
import { TranslateService } from '@ngx-translate/core';
import { DimensionVO } from '@khiops-library/model/dimension-vo';
import { AppService } from './app.service';
import { CompositionVO } from '../model/composition-vo';
import { MatrixCanvasService } from '@khiops-library/components/matrix-canvas/matrix-canvas.service';
import { ClusterDetailsVO } from '@khiops-covisualization/model/cluster-details-vo';
import { TreenodesService } from './treenodes.service';
import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';
import { DimensionsDatasVO } from '@khiops-covisualization/model/dimensions-data-vo';
import { ExtDatasVO } from '@khiops-covisualization/model/ext-datas-vo';
import { ImportExtDatasService } from './import-ext-datas.service';
@Injectable({
  providedIn: 'root',
})
export class ClustersService {
  dimensionsDatas: DimensionsDatasVO;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private treenodesService: TreenodesService,
    private dimensionsDatasService: DimensionsDatasService,
    private importExtDatasService: ImportExtDatasService,
  ) {
    this.initialize();
  }

  initialize() {
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();
  }

  getSelectedClustersDetails(): TreeNodeVO[][] {
    const details: TreeNodeVO[][] = [];
    for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
      details.push(
        this.getCurrentClusterDetailsFromNode(
          this.dimensionsDatas.dimensionsTrees[i],
        ),
      );
    }
    return details;
  }

  getCurrentCellsPerCluster(): number {
    let currentCellsPerCluster = 1;
    for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
      currentCellsPerCluster =
        currentCellsPerCluster *
        this.dimensionsDatas.dimensions[i].currentHierarchyClusterCount;
    }
    return currentCellsPerCluster;
  }

  getCurrentClusterDetailsFromNode(
    nodes: TreeNodeVO[],
    currentClusterDetailsFromNode: TreeNodeVO[] = [],
  ): TreeNodeVO[] {
    const nodesLength = nodes.length;
    for (let i = 0; i < nodesLength; i++) {
      const currentNode: TreeNodeVO = nodes[i];
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

  getDistributionDetailsFromNode(position): ChartDatasVO {
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
    ] = MatrixCanvasService.computeMatrixValues(
      {
        mode: 'FREQUENCY',
      },
      this.dimensionsDatasService.dimensionsDatas.matrixDatas,
      this.dimensionsDatasService.dimensionsDatas.contextSelection,
      -1,
    );

    const currentDataSet = new ChartDatasetVO(
      this.dimensionsDatasService.dimensionsDatas.selectedNodes[
        position
      ].shortDescription,
    );

    let distributionsGraphDetails = new ChartDatasVO();
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

  getInfoPerCluster(rank: number): ChartDatasVO {
    const appinitialDatas = this.appService.getInitialDatas().datas;

    const infoPerCluster = new ChartDatasVO();

    let currentDataSet: ChartDatasetVO;
    currentDataSet = new ChartDatasetVO('info', 'line');
    for (
      let j = this.dimensionsDatas.dimensions.length - 1;
      j <= this.dimensionsDatas.hierarchyDatas.totalClusters;
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
      let currentInfo =
        (currentCluster && currentCluster.hierarchicalLevel * 100) || 0;
      if (currentInfo < 0) {
        currentInfo = 0;
      }
      currentDataSet.data.push(currentInfo);
    }
    infoPerCluster.datasets.push(currentDataSet);

    currentDataSet = new ChartDatasetVO(
      this.translate.instant('GLOBAL.NUMBER_OF_CLUSTERS'),
    );
    currentDataSet.maxBarThickness = 5;
    currentDataSet.barThickness = 5;

    for (
      let j = this.dimensionsDatas.dimensions.length - 1;
      j < this.dimensionsDatas.hierarchyDatas.totalClusters;
      j++
    ) {
      infoPerCluster.labels.push(j + 1 + '');
      let currentValue = 0;
      if (j + 1 === rank) {
        currentValue =
          infoPerCluster.datasets[0].data[
            rank - this.dimensionsDatas.dimensions.length
          ];
      }
      currentDataSet.data.push(currentValue);
    }
    infoPerCluster.datasets.push(currentDataSet);

    return infoPerCluster;
  }

  getClustersPerDimDatas(rank): ChartDatasVO {
    const clustersPerDimDatas = new ChartDatasVO();
    let maxGraphValue = 0;

    let currentDataSet: ChartDatasetVO;

    for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
      currentDataSet = new ChartDatasetVO(
        this.dimensionsDatas.dimensions[i].name,
        'line',
      );

      let rankedCount = 1;
      for (
        let j = this.dimensionsDatas.dimensions.length - 1;
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
          rank - this.dimensionsDatas.dimensions.length
        ] > maxGraphValue
      ) {
        maxGraphValue =
          clustersPerDimDatas.datasets[k].data[
            rank - this.dimensionsDatas.dimensions.length
          ];
      }
    }

    currentDataSet = new ChartDatasetVO(
      this.translate.instant('GLOBAL.NUMBER_OF_CLUSTERS'),
    );
    currentDataSet.maxBarThickness = 5;
    currentDataSet.barThickness = 5;

    for (
      let j = this.dimensionsDatas.dimensions.length - 1;
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

  getCompositionClusters(hierarchyName: string, node: any): CompositionVO[] {
    const appDatas = this.appService.getDatas().datas;
    const appinitialDatas = this.appService.getInitialDatas().datas;
    const compositionValues: CompositionVO[] = [];

    if (
      appDatas.coclusteringReport &&
      appDatas.coclusteringReport.dimensionPartitions
    ) {
      const currentDimensionDetails: DimensionVO =
        this.dimensionsDatas.selectedDimensions.find(
          (e) => e.name === hierarchyName,
        );
      const currentIndex: number =
        this.dimensionsDatas.selectedDimensions.findIndex((e) => {
          return hierarchyName === e.name;
        });
      const currentInitialDimensionDetails: DimensionVO = new DimensionVO(
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
      if (currentDimensionDetails && currentDimensionDetails.isCategorical) {
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
                const externalDatas: ExtDatasVO =
                  this.importExtDatasService.getImportedDatasFromDimension(
                    currentDimensionDetails,
                  );

                const composition = new CompositionVO(
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

  getFilteredDimensionTree(
    dimensionsTree,
    selectedDimension: DimensionVO,
  ): ClusterDetailsVO[] {
    let filteredDimensionsClusters: ClusterDetailsVO[] = [];
    if (dimensionsTree) {
      const appinitialDatas = this.appService.getInitialDatas().datas;
      const filteredDimensionsClustersDatas = [].concat(
        this.getCurrentClusterDetailsFromNode(dimensionsTree),
      );
      for (let i = 0; i < filteredDimensionsClustersDatas.length; i++) {
        const currentNodesNames =
          this.dimensionsDatas.nodesNames[selectedDimension.name];
        const clusterDetails: ClusterDetailsVO = new ClusterDetailsVO(
          filteredDimensionsClustersDatas[i],
          currentNodesNames,
        );

        if (!clusterDetails.size) {
          // get the size of collapsed nodes
          const treeNode: TreeNodeVO = this.treenodesService.getNodeFromName(
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
