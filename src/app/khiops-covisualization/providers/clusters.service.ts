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
import { MatrixCanvasService } from '@khiops-library/components/matrix-canvas/matrix-canvas.service';
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

	getDistributionDetailsFromNode(position) {
		let filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
			this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[0]
		);
		let selectedNode =
			this.dimensionsDatasService.dimensionsDatas.selectedNodes[0];

		let otherselectedNode =
			this.dimensionsDatasService.dimensionsDatas.selectedNodes[1];

		if (position === 1) {
			filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
				this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[1]
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
			(e) => e.name
		);
		distributionsGraphLabels = filteredDimensionsClusters.map(
			(e) => e.shortDescription
		);

		let [
			matrixFreqsValues,
			matrixValues,
			globalMatrixValues,
			matrixExtras,
			matrixExpectedFreqsValues,
		] = MatrixCanvasService.computeMatrixValues(
			{
				mode: "FREQUENCY",
			},
			this.dimensionsDatasService.dimensionsDatas.matrixDatas,
			this.dimensionsDatasService.dimensionsDatas.contextSelection,
			-1
		);

		const currentDataSet = new ChartDatasetVO(
			this.dimensionsDatasService.dimensionsDatas.selectedNodes[
				position
			].shortDescription
		);

		let distributionsGraphDetails = {
			datasets: [],
			labels: [],
		};
		const currentDataSetData = [];

		let filteredList;
		if (selectedNode.isLeaf || selectedNode.isCollapsed) {
			filteredList = selectedNode.name;
		} else {
			// not collapsed node remove the node of children list
			filteredList = selectedNode.childrenList;
			filteredList.shift();
		}

		let axisPartName = "yaxisPart";
		if (position === 0) {
			axisPartName = "xaxisPart";
		}
		let filteredotherList =
			this.dimensionsDatasService.dimensionsDatas.matrixDatas.matrixCellDatas.map(
				(e) => e[axisPartName]
			);
		filteredotherList = [...new Set(filteredotherList)]; // keep uniq

		const matrixCellDataMap =
			this.dimensionsDatasService.dimensionsDatas.matrixDatas.matrixCellDatas.reduce(
				(map, data, index) => {
					const key = `${data.yaxisPart}-${data.xaxisPart}`;
					map[key] = index;
					return map;
				},
				{}
			);

		for (let i = 0; i < otherselectedNode.childrenList.length; i++) {
			const element = otherselectedNode.childrenList[i];

			for (let j = 0; j < filteredotherList.length; j++) {
				const otherelement = filteredotherList[j];
				const labelIndex =
					distributionsGraphLabelsInit.indexOf(otherelement);

				const key =
					position === 1
						? `${otherelement}-${element}`
						: `${element}-${otherelement}`;

				const cell = matrixCellDataMap[key];

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
