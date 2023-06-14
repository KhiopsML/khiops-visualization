import {
	Injectable
} from '@angular/core';
import {
	AppService
} from './app.service';
import {
	TreenodesService
} from './treenodes.service';
import {
	DimensionsDatasService
} from './dimensions-datas.service';
import _ from 'lodash';
import {
	SavedDatasVO
} from '../model/saved-datas-vo';
import {
	TreeNodeVO
} from '../model/tree-node-vo';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	ImportExtDatasService
} from './import-ext-datas.service';

@Injectable({
	providedIn: 'root'
})
export class SaveService {

	constructor(
		private appService: AppService,
		private treenodesService: TreenodesService,
		private importExtDatasService: ImportExtDatasService,
		private dimensionsService: DimensionsDatasService
	) {}

	constructDatasToSave() {
		const appDatas = this.appService.getDatas().datas;
		const initialDatas = _.cloneDeep(this.appService.getInitialDatas().datas);

		// Copy dimensionHierarchies into initial datas to save nodes names and annotations
		initialDatas.coclusteringReport.dimensionHierarchies = appDatas.coclusteringReport.dimensionHierarchies;

		const selectedDimensions = this.dimensionsService.getDimensionsToSave();

		// Check if user has changed something
		if (selectedDimensions.length > 0) {
			const unfoldHierarchyState = this.treenodesService.getUnfoldHierarchy();
			const splitSizes = this.appService.getSplitSizes();
			const viewsLayout = this.appService.getViewsLayout();
			const selectedNodes = this.treenodesService.getSelectedNodes();
			const collapsedNodes = this.treenodesService.getCollapsedNodesToSave();
			const importedDatas = this.importExtDatasService.getImportedDatas();

			initialDatas.savedDatas = new SavedDatasVO(
				viewsLayout,
				splitSizes,
				selectedNodes,
				selectedDimensions,
				collapsedNodes,
				importedDatas,
				unfoldHierarchyState
			);
		}

		return initialDatas;
	}

	constructSavedHierarchyToSave() {
		let datasToSave = this.constructDatasToSave();

		datasToSave = this.truncateJsonHierarchy(datasToSave);
		datasToSave = this.updateSummariesParts(datasToSave);
		datasToSave = this.truncateJsonPartition(datasToSave);
		datasToSave = this.truncateJsonCells(datasToSave);
		datasToSave = this.updateSummariesCells(datasToSave);
		// Remove collapsed nodes and selected nodes because they have been reduced
		delete datasToSave.savedDatas.collapsedNodes;
		delete datasToSave.savedDatas.selectedNodes;
		return datasToSave;
	}

	truncateJsonHierarchy(datas) {
		// console.log("SaveService -> truncateJsonHierarchy -> datas", datas)

		const truncatedHierarchy = _.cloneDeep(datas.coclusteringReport.dimensionHierarchies);

		Object.keys(datas.savedDatas.collapsedNodes).forEach((dim) => {
			const dimIndex = this.dimensionsService.dimensionsDatas.selectedDimensions.findIndex(e => e.name === dim);

			const nodes = datas.savedDatas.collapsedNodes[dim];
			const dimHierarchy = truncatedHierarchy.find(e => e.name === dim);

			const nodesLength = nodes.length;
			for (let i = 0; i < nodesLength; i++) {

				const nodeName = nodes[i];
				let nodeChildren = [];

				const nodeDetails: TreeNodeVO = this.dimensionsService.dimensionsDatas.dimensionsClusters[dimIndex].find(e => e.cluster === nodeName);

				// Get children list for tests purpose
				nodeDetails.getChildrenList();

				if (nodeDetails && nodeDetails.childrenList) {
					nodeChildren = nodeDetails.childrenList;
					const nodeChildrenLength = nodeChildren.length;
					for (let j = nodeChildrenLength - 1; j >= 0; j--) {
						const nodeIndex = dimHierarchy.clusters.findIndex(e => e.cluster === nodeChildren[j]);
						if (nodeChildren[j] !== nodeName) { // Do not remove current collapsed node
							if (nodeIndex !== -1) {
								dimHierarchy.clusters.splice(nodeIndex, 1);
							}
						} else {
							// Set the isLeaf of the last collapsed node
							dimHierarchy.clusters[nodeIndex].isLeaf = true;
						}

					}
				}

			}

		});

		// Sort clusters by leaf and rank
		for (let k = 0; k < truncatedHierarchy.length; k++) {
			truncatedHierarchy[k].clusters = _.sortBy(truncatedHierarchy[k].clusters, [(e) => e.isLeaf === false, 'rank']);
		}

		datas.coclusteringReport.dimensionHierarchies = truncatedHierarchy;
		return datas;

	}

	truncateJsonPartition(datas) {

		const truncatedPartition = _.cloneDeep(datas.coclusteringReport.dimensionPartitions);

		Object.keys(datas.savedDatas.collapsedNodes).forEach((dim, key) => {
			const nodes = datas.savedDatas.collapsedNodes[dim];

			const dimIndex = this.treenodesService.dimensionsDatas.selectedDimensions.findIndex(e => e.name === dim);
			const dimVO: DimensionVO = this.treenodesService.dimensionsDatas.selectedDimensions.find(e => e.name === dim);
			const dimIndexInitial = this.treenodesService.dimensionsDatas.dimensions.findIndex(e => e.name === dim);

			if (dimVO.isCategorical) {
				this.computeCatPartition(nodes, dimIndex, truncatedPartition[dimIndexInitial]);
			} else {
				this.computeNumPartition(nodes, dimIndex, truncatedPartition[dimIndexInitial]);
			}
		});

		datas.coclusteringReport.dimensionPartitions = truncatedPartition;
		return datas;

	}

	computeCatPartition(nodes, dimIndex, currentTruncatedPartition) {

		const nodesLength = nodes.length;
		for (let i = 0; i < nodesLength; i++) {

			const nodeName = nodes[i];
			let nodeChildren = [];
			const currentDefaultGroup = currentTruncatedPartition.valueGroups[currentTruncatedPartition.defaultGroupIndex].values;
			const nodeDetails: TreeNodeVO = this.treenodesService.dimensionsDatas.dimensionsClusters[dimIndex].find(e => e.cluster === nodeName);
			if (nodeDetails && nodeDetails.childrenList) {
				nodeChildren = nodeDetails.childrenList;

				let cancatValueGroup;
				const nodeChildrenLength = nodeChildren.length;
				// for (let j = nodeChildrenLength - 1; j >= 0; j--) {
				for (let j = 0; j < nodeChildrenLength; j++) {
					if (currentTruncatedPartition) {
						if (currentTruncatedPartition.valueGroups) {
							if (nodeChildren[j] !== nodeName) { // Do not remove current collapsed node
								const nodeIndex = currentTruncatedPartition.valueGroups.findIndex(e => e.cluster === nodeChildren[j]);
								// console.log("SaveService -> computeCatPartition -> nodeIndex", nodeChildren[j] , nodeIndex)
								const node = currentTruncatedPartition.valueGroups[nodeIndex];
								if (node) { // Because nodes are not present into partition values
									if (!cancatValueGroup) {
										cancatValueGroup = node;
									} else {
										cancatValueGroup = UtilsService.concat2ObjectsValues(cancatValueGroup, node);
										// Remove it from initial values
										currentTruncatedPartition.valueGroups.splice(nodeIndex, 1);
									}
									cancatValueGroup.cluster = nodeName;

								}
							}
						}
					}
				}
			}

			// Now find currentDefaultGroup into new constructed currentTruncatedPartition.valueGroups to set defaultGroupIndex
			currentTruncatedPartition.defaultGroupIndex = currentTruncatedPartition.valueGroups.findIndex(e => e.values.includes(currentDefaultGroup[0]));

		}

	}

	computeNumPartition(nodes, dimIndex, currentTruncatedPartition) {

		const nodesLength = nodes.length;
		for (let i = 0; i < nodesLength; i++) {

			const nodeName = nodes[i];
			let nodeChildren = [];

			const nodeDetails: TreeNodeVO = this.treenodesService.dimensionsDatas.dimensionsClusters[dimIndex].find(e => e.cluster === nodeName);
			if (nodeDetails && nodeDetails.childrenList) {
				nodeChildren = nodeDetails.childrenList;
				const nodeChildrenLength = nodeChildren.length;
				for (let j = 0; j < nodeChildrenLength; j++) {

					if (currentTruncatedPartition) {
						if (currentTruncatedPartition.intervals) {
							if (nodeChildren[j] !== nodeName) { // Do not remove current collapsed node
								const intervalIndex = currentTruncatedPartition.intervals.findIndex(e => e.cluster === nodeChildren[j]);
								const currentInterval = currentTruncatedPartition.intervals[intervalIndex];
								if (currentInterval) { // Because nodes are not present into partition values

									currentTruncatedPartition.intervals.splice(intervalIndex, 1);
								}
							}
						}
					}
				}
				// Add the current parent node after children deletion
				let currentNodeBound: any = nodeDetails.bounds;
				currentNodeBound = currentNodeBound.replaceAll('[', '');
				currentNodeBound = currentNodeBound.replaceAll(']', '');
				currentNodeBound = currentNodeBound.split(';');
				// convert each array string to number
				for (let j = 0; j < currentNodeBound.length; j++) {
					currentNodeBound[j] = 1 * currentNodeBound[j];
				}
				currentTruncatedPartition.intervals.push({
					cluster: nodeDetails.cluster,
					bounds: currentNodeBound
				});
				// Sort intervals
				currentTruncatedPartition.intervals.sort(function (a, b) {
					return a.bounds[0] - b.bounds[0];
				});
				// console.table(currentTruncatedPartition.intervals);
			}

		}

	}

	updateSummariesParts(datas) {

		for (let i = 0; i < datas.coclusteringReport.dimensionSummaries.length; i++) {
			const dimIndex = this.dimensionsService.dimensionsDatas.selectedDimensions.findIndex(e => e.name === datas.coclusteringReport.dimensionSummaries[i].name);
			datas.coclusteringReport.dimensionSummaries[dimIndex].parts = datas.coclusteringReport.dimensionHierarchies[dimIndex].clusters.filter(e => e.isLeaf === true).length
		}

		return datas;

	}

	updateSummariesCells(datas) {

		// the "cells" field in "summary" must contain the number of non-empty cells, which can be less than the theoretical number of cells. It is obtained by counting the number of elements in the list "cellPartIndexes" or in "cellFrequencies"
		datas.coclusteringReport.summary.cells = datas.coclusteringReport.cellFrequencies.length;

		return datas;

	}

	truncateJsonCells(CC) {

		const CI = _.cloneDeep(this.appService.getInitialDatas().datas);

		const transitionMatrix = [];

		// Step 1: we build the transition matrix which makes it possible to pass from the part indices of the CI to the part indices of the CC
		for (let k = 0; k < CI.coclusteringReport.dimensionHierarchies.length; k++) {

			let initialVariable;
			let currentVariable;
			if (CC.coclusteringReport.dimensionPartitions[k].type === 'Numerical') {
				initialVariable = CI.coclusteringReport.dimensionPartitions[
					k
				].intervals.map((e) => e.bounds);
				currentVariable = CC.coclusteringReport.dimensionPartitions[
					k
				].intervals.map((e) => e.bounds);
			} else {
				initialVariable = CI.coclusteringReport.dimensionPartitions[
					k
				].valueGroups.map((e) => e.values);
				currentVariable = CC.coclusteringReport.dimensionPartitions[
					k
				].valueGroups.map((e) => e.values);
			}

			// Loop the parts of the CI variable: for each part, we try to associate its index in the partition of the initial coclustering with its index in the partition of the final coclustering. We use the fact that the partitions are nested and that their order does not change: an "initial" part is either kept as it is in the current coclustering or included in a folded part in the current coclustering
			let currentP = 0; // initialize the index of the part of the current variable
			let currentPart = currentVariable[currentP]; // we initialize the current part

			// parcours des parties initiales
			for (let initialP = 0; initialP < initialVariable.length; initialP++) {
				let initialPart = initialVariable[initialP];
				if (!transitionMatrix[k]) {
					transitionMatrix[k] = [];
				}

				if (CC.coclusteringReport.dimensionPartitions[k].type === 'Numerical') {
					while (
						!(
							(initialPart[0] >=
							currentVariable[currentP][0] &&
							initialPart[1] <=
							currentVariable[currentP][1]) || currentP < currentVariable.length
						)
					) {
						currentPart = currentVariable[currentP];
						currentP = currentP + 1;
					}
				} else {
					// The inclusion test consists of going through the modalities of the initial part
					// and check that they are all in the list of modalities of the current part.
					if (

						!(
							initialPart.every((value, index) =>
								currentPart.includes(value)
							)
						)
					) {
						currentP = currentP + 1;
						currentPart = currentVariable[currentP];
					}
				}

				transitionMatrix[k][initialP] = currentP;
			}
		}
		// console.log('transitionMatrix', transitionMatrix);

		// Step 2: build the list of cells in the current coclustering by calculating the indexes of these cells and their resGroup
		let indexesCCList = [];
		let resGroup = [];

		// Browse the cells of the initial coclustering json file ("cellPartIndexes" field)
		for (let i = 0; i < CI.coclusteringReport.cellPartIndexes.length; i++) {
			let index_initiaux = CI.coclusteringReport.cellPartIndexes[i]; // Read indexes in the json file
			let currentIndexes = [];
			for (
				let k = 0; k < CI.coclusteringReport.dimensionHierarchies.length; k++
			) {
				// Calculation of indexes from the transition matrix calculated in step 1
				currentIndexes.push(transitionMatrix[k][index_initiaux[k]]);
			}
			if (
				indexesCCList.indexOf(currentIndexes.toString()) !== -1
			) {
				const index = resGroup.findIndex(
					(e) => e.key === currentIndexes.toString()
				);
				resGroup[index].value =
					resGroup[index].value + CI.coclusteringReport.cellFrequencies[i];
			} else {
				resGroup.push({
					key: currentIndexes.toString(),
					value: CI.coclusteringReport.cellFrequencies[i],
				});
				indexesCCList.push(currentIndexes.toString());
			}
		}

		resGroup.sort(function (a, b) {
			if (a.value === b.value) {
				return (
					parseFloat(a.key.replaceAll(',', '')) -
					parseFloat(b.key.replaceAll(',', ''))
				);
			}
			return b.value - a.value;
		});
		// console.table(resGroup);
		CC.coclusteringReport.cellFrequencies = resGroup.map(e => e.value);
		CC.coclusteringReport.cellPartIndexes = resGroup.map(e => e.key.split(','));

		// Convert cellPartIndexes strings to integers
		for (let k = 0; k < CC.coclusteringReport.cellPartIndexes.length; k++) {
			CC.coclusteringReport.cellPartIndexes[k] = CC.coclusteringReport.cellPartIndexes[k].map(function (x) {
				return parseInt(x, 10);
			});
		}
		return CC;

	}

}
