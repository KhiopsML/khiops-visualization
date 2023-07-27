/// <reference lib="webworker" />

import {
	ChartDatasetVO
} from "@khiops-library/model/chartDataset-vo";

addEventListener('message', ({
	data
}) => {
	var res = getDistributionDetailsFromNode(data.selectedNodes, data.dimensionsTree, data.matrixCellDatas, data.currentIndex, data.otherIndex);
	postMessage(res);
});

function getDistributionDetailsFromNode(selectedNodes, dimensionsTree, matrixCellDatas, currentIndex, otherIndex) {

	let distributionsGraphDetails = {
		datasets: [],
		labels: []
	};
	const t0 = performance.now();
	if (selectedNodes.length >= 2) {

		let currentYpart = selectedNodes[0].name;
		let currentDisplayYpart = selectedNodes[0].shortDescription;

		if (currentIndex === 0) {
			currentYpart = selectedNodes[1].name;
			currentDisplayYpart = selectedNodes[1].shortDescription;
		}

		const currentDataSet = new ChartDatasetVO(currentDisplayYpart);
		const filteredDimensionsClusters = getCurrentClusterDetailsFromNode(dimensionsTree);

		const isNodeAndCollapsed = !selectedNodes[otherIndex].isLeaf && !selectedNodes[otherIndex].isCollapsed;

		if (!isNodeAndCollapsed) {
			let filterDatas = matrixCellDatas.filter(e => e.yaxisPart === currentYpart || e.xaxisPart === currentYpart);
			for (let i = 0; i < filteredDimensionsClusters.length; i++) {
				const currentXpart = filteredDimensionsClusters[i].name;
				const currentDisplayXpart = filteredDimensionsClusters[i].shortDescription;
				distributionsGraphDetails.labels.push(currentDisplayXpart);
				let currentDataValue = 0;
				let cell: any;
				// leaf
				if (currentIndex === 0) {
					cell = filterDatas.find(e => e.xaxisPart === currentXpart);
				} else {
					cell = filterDatas.find(e => e.yaxisPart === currentXpart);
				}
				if (cell) {
					currentDataValue = cell.displayedFreqValue;
				}
				currentDataSet.data.push(currentDataValue);
			}
		} else {
			const currentDataSetData = [];
			const distributionsGraphLabels = [];
			const childrenLeafSet = new Set(selectedNodes[otherIndex].childrenLeafList);

			const matrixCellDataMap = matrixCellDatas.reduce((map, data) => {
				const key = `${data.yaxisPart}-${data.xaxisPart}`;
				map[key] = data;
				return map;
			}, {});

			for (const filteredDimensionCluster of filteredDimensionsClusters) {
				const currentXpart = filteredDimensionCluster.name;
				const currentDisplayXpart = filteredDimensionCluster.shortDescription;
				distributionsGraphLabels.push(currentDisplayXpart);

				let currentDataValue = 0;

				for (const currentChild of childrenLeafSet) {
					const key = currentIndex === 0 ? `${currentChild}-${currentXpart}` : `${currentXpart}-${currentChild}`;
					const cell = matrixCellDataMap[key];
					if (cell) {
						currentDataValue += cell.displayedFreqValue;
					}
				}

				currentDataSetData.push(currentDataValue);
			}

			distributionsGraphDetails.labels.push(...distributionsGraphLabels);
			currentDataSet.data.push(...currentDataSetData);
		}

		distributionsGraphDetails.datasets.push(currentDataSet);

	}

	// Init obj if error or no value
	if (distributionsGraphDetails.labels.length === 0) {
		distributionsGraphDetails = undefined;
	}
	const t1 = performance.now();
	console.info("getDistributionDetailsFromNode took " + (t1 - t0) + " milliseconds.");

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
