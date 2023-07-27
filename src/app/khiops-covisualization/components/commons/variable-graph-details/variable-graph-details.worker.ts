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

		let filteredYAxisCurrentYpart;
		let filteredXAxisCurrentYpart;
		if (!isNodeAndCollapsed) {
			// First filter the cells by Ypart to optimize computing
			filteredYAxisCurrentYpart = matrixCellDatas.filter(e => e.yaxisPart === currentYpart);
			filteredXAxisCurrentYpart = matrixCellDatas.filter(e => e.xaxisPart === currentYpart);
		}

		for (let i = 0; i <  filteredDimensionsClusters.length; i++) {
			const currentXpart = filteredDimensionsClusters[i].name;
			const currentDisplayXpart = filteredDimensionsClusters[i].shortDescription;
			distributionsGraphDetails.labels.push(currentDisplayXpart);

			let currentDataValue = 0;

			let cell: any;
			if (isNodeAndCollapsed) {
				// if it is a node and it is collapsed, concat values of children leafs
				/**
				 * ChatGPT optimization
				 * Save more than 30 sec on top level nodes on big files
				 * But only work on top level nodes with a lot of ranks file
				 * because it depend of the order of leafs, so the find method sometimes works faster
				 * TODO: maybe sort the datas before search into it ?
				 * Or maybe do a filter instead of a loop of find ?
				 */
				// const childrenLeafList = selectedNodes[otherIndex].childrenLeafList;
				// const matrixCellMap: any = new Map(matrixCellDatas.map(cell => [`${cell.yaxisPart}-${cell.xaxisPart}`, cell]));
				// for (let j = 0; j < childrenLeafList.length; j++) {
				// 	const currentChild = childrenLeafList[j];
				// 	cell = currentIndex === 0 ?
				// 		matrixCellMap.get(`${currentChild}-${currentXpart}`) :
				// 		matrixCellMap.get(`${currentXpart}-${currentChild}`);
				// 	if (cell) {
				// 		currentDataValue += cell.displayedFreqValue;
				// 	}
				// }

				// if it is a node and it is collapsed, concat values of children leafs
				const childrenLeafList = selectedNodes[otherIndex].childrenLeafList;
				for (let j = 0; j < childrenLeafList.length; j++) {
					const currentChild = childrenLeafList[j];
					cell = currentIndex === 0 ?
						matrixCellDatas.find(e => e.yaxisPart === currentChild && e.xaxisPart === currentXpart) :
						matrixCellDatas.find(e => e.yaxisPart === currentXpart && e.xaxisPart === currentChild);
					if (cell) {
						currentDataValue += cell.displayedFreqValue;
					}
				}
			} else {
				// leaf
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
