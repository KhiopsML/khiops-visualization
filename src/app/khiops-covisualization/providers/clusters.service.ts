import {
	Injectable
} from '@angular/core';
import {
	DimensionsDatasService
} from './dimensions-datas.service';
import {
	TreeNodeVO
} from '../model/tree-node-vo';
import {
	ChartDatasetVO
} from '@khiops-library/model/chartDataset-vo';
import {
	TranslateService
} from '@ngstack/translate';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	AppService
} from './app.service';
import {
	CellVO
} from '@khiops-library/model/cell-vo';
import {
	CompositionVO
} from '../model/composition-vo';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	ImportExtDatasService
} from './import-ext-datas.service';
import {
	ExtDatasVO
} from '../model/ext-datas-vo';
import {
	ImportFileLoaderService
} from '@khiops-library/components/import-file-loader/import-file-loader.service';
import {
	FileVO
} from '@khiops-library/model/file-vo';
@Injectable({
	providedIn: 'root'
})
export class ClustersService {

	dimensionsDatas: any;

	constructor(
		private translate: TranslateService,
		private appService: AppService,
		private importExtDatasService: ImportExtDatasService,
		private importFileLoaderService: ImportFileLoaderService,
		private dimensionsDatasService: DimensionsDatasService
	) {
		this.initialize();
	}

	initialize() {
		this.dimensionsDatas = this.dimensionsDatasService.getDatas();
	}

	getClusterDatas(dimensionIndex, clusterName) {
		let clusterDatas;
		if (this.dimensionsDatas.dimensionsClusters[dimensionIndex]) {
			clusterDatas = this.dimensionsDatas.dimensionsClusters[dimensionIndex].find(e => e.cluster === clusterName);
		}
		return clusterDatas;
	}

	getSelectedClustersDetails() {
		const details = [];
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			details.push(this.getCurrentClusterDetailsFromNode(this.dimensionsDatas.dimensionsTrees[i]));

		}
		return details;
	}

	getCurrentCellsPerCluster() {
		let currentCellsPerCluster = 1;
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			currentCellsPerCluster = currentCellsPerCluster * this.dimensionsDatas.dimensions[i].currentHierarchyClusterCount;
		}
		return currentCellsPerCluster;
	}

	getCurrentClusterDetailsFromNode(nodes, currentClusterDetailsFromNode = []): any {
		const nodesLength = nodes.length;
		for (let i = 0; i < nodesLength; i++) {
			const currentNode: TreeNodeVO = nodes[i];
			if (currentNode.isLeaf) {
				currentClusterDetailsFromNode.push(currentNode);
			} else {
				if (currentNode.isCollapsed) {
					currentClusterDetailsFromNode.push(currentNode);
				} else {
					this.getCurrentClusterDetailsFromNode(currentNode.children, currentClusterDetailsFromNode);
				}
			}
		}
		return currentClusterDetailsFromNode;
	}

	getDistributionDetailsFromNode(currentIndex, otherIndex) {
		// if (currentIndex === 0) {
		// 	currentIndex = 1;
		// } else {
		// 	currentIndex = 0;
		// }

		let distributionsGraphDetails = {
			datasets: [],
			labels: []
		};
		const t0 = performance.now();
		if (this.dimensionsDatas.selectedNodes.length >= 2) {

			let currentYpart = this.dimensionsDatas.selectedNodes[0].name;
			let currentDisplayYpart = this.dimensionsDatas.selectedNodes[0].shortDescription;

			// let otherIndex = 0;
			if (currentIndex === 0) {
				// otherIndex = 1;
				currentYpart = this.dimensionsDatas.selectedNodes[1].name;
				currentDisplayYpart = this.dimensionsDatas.selectedNodes[1].shortDescription;
			}

			const currentDataSet = new ChartDatasetVO(currentDisplayYpart);

			const filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(this.dimensionsDatas.dimensionsTrees[currentIndex]);

			// First filter the cells by Ypart to optimize computing
			const filteredYAxisCurrentYpart = this.dimensionsDatas.matrixDatas.matrixCellDatas.filter(e => e.yaxisPart === currentYpart);
			const filteredXAxisCurrentYpart = this.dimensionsDatas.matrixDatas.matrixCellDatas.filter(e => e.xaxisPart === currentYpart);

			const filteredDimensionsClustersLength = filteredDimensionsClusters.length;
			for (let i = 0; i < filteredDimensionsClustersLength; i++) {
				const currentXpart = filteredDimensionsClusters[i].name;
				const currentDisplayXpart = filteredDimensionsClusters[i].shortDescription;
				distributionsGraphDetails.labels.push(currentDisplayXpart);

				let currentDataValue = 0;

				let cell: CellVO;
				if (!this.dimensionsDatas.selectedNodes[otherIndex].isLeaf && !this.dimensionsDatas.selectedNodes[otherIndex].isCollapsed) {
					// if it is a node and it is collapsed, concat values of children leafs
					const childrenLeafListLength = this.dimensionsDatas.selectedNodes[otherIndex].childrenLeafList.length;
					for (let j = 0; j < childrenLeafListLength; j++) {
						const currentChild = this.dimensionsDatas.selectedNodes[otherIndex].childrenLeafList[j];
						if (currentIndex === 0) {
							cell = this.dimensionsDatas.matrixDatas.matrixCellDatas.find(e => e.yaxisPart === currentChild && e.xaxisPart === currentXpart);
						} else {
							cell = this.dimensionsDatas.matrixDatas.matrixCellDatas.find(e => e.yaxisPart === currentXpart && e.xaxisPart === currentChild);
						}
						if (cell) {
							currentDataValue = currentDataValue + cell.displayedFreqValue;
						}
					}
				} else {
					if (currentIndex === 0) {
						cell = filteredYAxisCurrentYpart.find(e => e.xaxisPart === currentXpart);
					} else {
						cell = filteredXAxisCurrentYpart.find(e => e.yaxisPart === currentXpart);
					}
					if (cell) {
						currentDataValue = cell.displayedFreqValue;
					}
				}
				currentDataSet.data.push(currentDataValue);
			}
			distributionsGraphDetails.datasets.push(currentDataSet);

		}

		// Init obj if error or no value
		if (distributionsGraphDetails.labels.length === 0) {
			distributionsGraphDetails = undefined;
		}
		const t1 = performance.now();
		// console.info("getDistributionDetailsFromNode took " + (t1 - t0) + " milliseconds.");

		return distributionsGraphDetails;
	}

	getInfoPerCluster(rank: number): any {
		const appDatas = this.appService.getDatas().datas;
		const infoPerCluster = {
			datasets: [],
			labels: []
		};

		let currentDataSet: ChartDatasetVO;
		currentDataSet = new ChartDatasetVO('info', 'line');

		for (let j = this.dimensionsDatas.dimensions.length - 1; j <= this.dimensionsDatas.hierarchyDatas.totalClusters; j++) {
			let currentCluster;
			for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
				const currentDimensionHierarchy: any = appDatas.coclusteringReport.dimensionHierarchies[i];
				currentCluster = currentDimensionHierarchy.clusters.find(e => e.hierarchicalRank === j + 1);
				if (currentCluster) {
					break;
				}
			}
			let currentInfo = currentCluster && currentCluster.hierarchicalLevel * 100 || 0;
			if (currentInfo < 0) {
				currentInfo = 0;
			}
			currentDataSet.data.push(currentInfo);
		}
		infoPerCluster.datasets.push(currentDataSet);

		currentDataSet = new ChartDatasetVO(this.translate.get('GLOBAL.NUMBER_OF_CLUSTERS'));
		currentDataSet.maxBarThickness = 5;
		currentDataSet.barThickness = 5;

		for (let j = this.dimensionsDatas.dimensions.length - 1; j < this.dimensionsDatas.hierarchyDatas.totalClusters; j++) {
			infoPerCluster.labels.push(j + 1);
			let currentValue = 0;
			if (j + 1 === rank) {
				currentValue = infoPerCluster.datasets[0].data[rank - this.dimensionsDatas.dimensions.length];
			}
			currentDataSet.data.push(currentValue);
		}
		infoPerCluster.datasets.push(currentDataSet);

		return infoPerCluster;
	}

	getClustersPerDimDatas(rank): any {
		const clustersPerDimDatas = {
			datasets: [],
			labels: []
		};
		let maxGraphValue = 0;

		let currentDataSet: ChartDatasetVO;

		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {

			currentDataSet = new ChartDatasetVO(this.dimensionsDatas.dimensions[i].name, 'line');

			let rankedCount = 1;
			for (let j = this.dimensionsDatas.dimensions.length - 1; j <= this.dimensionsDatas.hierarchyDatas.totalClusters; j++) {
				const isCurrentNodeRanked = this.dimensionsDatas.dimensionsClusters[i].find(e => e.hierarchicalRank === j && !e.isLeaf);
				if (isCurrentNodeRanked) {
					rankedCount++;
				}
				currentDataSet.data.push(rankedCount);
			}
			clustersPerDimDatas.datasets.push(currentDataSet);
		}

		for (let k = 0; k < clustersPerDimDatas.datasets.length; k++) {
			if (clustersPerDimDatas.datasets[k].data[rank - this.dimensionsDatas.dimensions.length] > maxGraphValue) {
				maxGraphValue = clustersPerDimDatas.datasets[k].data[rank - this.dimensionsDatas.dimensions.length];
			}
		}

		currentDataSet = new ChartDatasetVO(this.translate.get('GLOBAL.NUMBER_OF_CLUSTERS'));
		currentDataSet.maxBarThickness = 5;
		currentDataSet.barThickness = 5;

		for (let j = this.dimensionsDatas.dimensions.length - 1; j < this.dimensionsDatas.hierarchyDatas.totalClusters; j++) {
			clustersPerDimDatas.labels.push(j + 1);
			let currentValue = 0;
			if (j + 1 === rank) {
				currentValue = maxGraphValue;
			}
			currentDataSet.data.push(currentValue);
		}
		clustersPerDimDatas.datasets.push(currentDataSet);

		return clustersPerDimDatas;
	}

	getCompositionClusters(hierarchyName: string, node: any) {

		const appDatas = this.appService.getDatas().datas;
		const compositionValues = [];

		if (appDatas.coclusteringReport && appDatas.coclusteringReport.dimensionPartitions) {

			const currentDimensionDetails: DimensionVO = this.dimensionsDatas.dimensions.find(e => e.name === hierarchyName);

			// Composition only available for numerical Dimensions
			if (currentDimensionDetails && currentDimensionDetails.isCategorical) {

				if (node.childrenLeafList) {

					const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
						return hierarchyName === e.name;
					});
					const currentDimensionClusters = Object.assign([], this.dimensionsDatas.dimensionsClusters[currentIndex]);

					// Check if external data file is saved
					const currentDimension = this.dimensionsDatas.selectedDimensions[currentIndex];
					const externalDatas: ExtDatasVO = this.importExtDatasService.getImportedDatasFromDimension(currentDimension);

					const childrenLeafListLength = node.childrenLeafList.length;
					for (let i = 0; i < childrenLeafListLength; i++) {

						const currentLeafName = node.childrenLeafList[i];

						// Check if this name has been updated
						const currentClusterDetails = currentDimensionDetails.valueGroups.find(e => e.cluster === currentLeafName);
						const currentClusterDetailsLength = currentClusterDetails.values.length;
						for (let j = 0; j < currentClusterDetailsLength; j++) {
							const currentDimensionHierarchyCluster: any = currentDimensionClusters.find(e => e.cluster === currentLeafName);
							const composition = new CompositionVO(currentClusterDetails, currentDimensionHierarchyCluster, j, externalDatas);
							compositionValues.push(composition);
						}
					}

					// Now for each collapsed nodes, change all children names to node name
					// Find current dim position
					const currentCollapsedNodes: TreeNodeVO[] = UtilsService.fastFilter(currentDimensionClusters, e => {
						return e.isCollapsed;
					});
					const currentCollapsedNodesLength = currentCollapsedNodes.length;
					for (let k = 0; k < currentCollapsedNodesLength; k++) {
						const compositionValuesLength = compositionValues.length;
						for (let l = 0; l < compositionValuesLength; l++) {
							if (currentCollapsedNodes[k].childrenLeafList.includes(compositionValues[l]._id)) {
								compositionValues[l].cluster = currentCollapsedNodes[k].shortDescription;
							}
						}
					}
				}

			}
		}

		return compositionValues;
	}

}
