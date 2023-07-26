/// <reference lib="webworker" />

import {
	ChartDatasetVO
} from "@khiops-library/model/chartDataset-vo";

addEventListener('message', ({
	data
}) => {
	var res = getDistributionDetailsFromNode(data.dimensionsDatas, data.currentIndex, data.otherIndex);
	postMessage(res);
});

function getDistributionDetailsFromNode(dimensionsDatas, currentIndex, otherIndex) {

	let distributionsGraphDetails = {
		datasets: [],
		labels: []
	};
	const t0 = performance.now();
	if (dimensionsDatas.selectedNodes.length >= 2) {

		let currentYpart = dimensionsDatas.selectedNodes[0].name;
		let currentDisplayYpart = dimensionsDatas.selectedNodes[0].shortDescription;

		if (currentIndex === 0) {
			currentYpart = dimensionsDatas.selectedNodes[1].name;
			currentDisplayYpart = dimensionsDatas.selectedNodes[1].shortDescription;
		}

		const currentDataSet = new ChartDatasetVO(currentDisplayYpart);
		const filteredDimensionsClusters = getCurrentClusterDetailsFromNode(dimensionsDatas.dimensionsTrees[currentIndex]);

		// First filter the cells by Ypart to optimize computing
		const filteredYAxisCurrentYpart = dimensionsDatas.matrixDatas.matrixCellDatas.filter(e => e.yaxisPart === currentYpart);
		const filteredXAxisCurrentYpart = dimensionsDatas.matrixDatas.matrixCellDatas.filter(e => e.xaxisPart === currentYpart);

		const filteredDimensionsClustersLength = filteredDimensionsClusters.length;
		for (let i = 0; i < filteredDimensionsClustersLength; i++) {
			const currentXpart = filteredDimensionsClusters[i].name;
			const currentDisplayXpart = filteredDimensionsClusters[i].shortDescription;
			distributionsGraphDetails.labels.push(currentDisplayXpart);

			let currentDataValue = 0;

			let cell: any;
			if (!dimensionsDatas.selectedNodes[otherIndex].isLeaf && !dimensionsDatas.selectedNodes[otherIndex].isCollapsed) {
				// if it is a node and it is collapsed, concat values of children leafs
				/**
				 * ChatGPT optimization
				 * Save more than 30 sec on top level nodes on big files
				 */
				const childrenLeafList = dimensionsDatas.selectedNodes[otherIndex].childrenLeafList;
				const matrixCellMap: any = new Map(dimensionsDatas.matrixDatas.matrixCellDatas.map(cell => [`${cell.yaxisPart}-${cell.xaxisPart}`, cell]));
				for (let j = 0; j < childrenLeafList.length; j++) {
					const currentChild = childrenLeafList[j];
					cell = currentIndex === 0 ?
						matrixCellMap.get(`${currentChild}-${currentXpart}`) :
						matrixCellMap.get(`${currentXpart}-${currentChild}`);
					if (cell) {
						currentDataValue += cell.displayedFreqValue;
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


function getCurrentClusterDetailsFromNode(nodes, currentClusterDetailsFromNode = []): any {
	const nodesLength = nodes.length;
	for (let i = 0; i < nodesLength; i++) {
		const currentNode: any = nodes[i];
		if (currentNode.isLeaf) {
			currentClusterDetailsFromNode.push(currentNode);
		} else {
			if (currentNode.isCollapsed) {
				currentClusterDetailsFromNode.push(currentNode);
			} else {
				getCurrentClusterDetailsFromNode(currentNode.children, currentClusterDetailsFromNode);
			}
		}
	}
	return currentClusterDetailsFromNode;
}
