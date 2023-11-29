import {
	Injectable,
	Injector
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
	private treenodesService;
	constructor(
		private appService: AppService,
		private injector: Injector,
		private importExtDatasService: ImportExtDatasService,
		private dimensionsService: DimensionsDatasService
	) {}

	constructDatasToSave(collapsedNodesInput ? ) {
		this.treenodesService = this.injector.get(TreenodesService);
		const initialDatas = JSON.parse(JSON.stringify(this.appService.getInitialDatas().datas));

		const selectedDimensions = this.dimensionsService.getDimensionsToSave();

		// Check if user has changed something
		if (selectedDimensions.length > 0) {
			const unfoldHierarchyState = this.treenodesService.getUnfoldHierarchy();
			const splitSizes = this.appService.getSplitSizes();
			const viewsLayout = this.appService.getViewsLayout();
			const nodesNames = this.treenodesService.getNodesNames();
			let selectedNodes = this.treenodesService.getSelectedNodes();
			if (selectedNodes) {
				selectedNodes = selectedNodes.map(e => e.name);
			}
			let collapsedNodes;
			if (collapsedNodesInput) {
				collapsedNodes = collapsedNodesInput
			} else {
				collapsedNodes = this.treenodesService.getSavedCollapsedNodes();
			}
			const importedDatas = this.importExtDatasService.getImportedDatas();
			const matrixContrast = this.dimensionsService.dimensionsDatas.matrixContrast;
			const conditionalOnContext = this.dimensionsService.dimensionsDatas.conditionalOnContext;
			const matrixOption = this.dimensionsService.dimensionsDatas.matrixOption;
			const matrixMode = this.dimensionsService.dimensionsDatas.matrixMode;

			initialDatas.savedDatas = new SavedDatasVO(
				viewsLayout,
				splitSizes,
				selectedNodes,
				selectedDimensions,
				collapsedNodes,
				nodesNames,
				importedDatas,
				matrixContrast,
				unfoldHierarchyState,
				conditionalOnContext,
				matrixOption,
				matrixMode
			);
		}

		return initialDatas;
	}

	constructSavedHierarchyToSave(collapsedNodesInput ? ) {
		let datasToSave = this.constructDatasToSave(collapsedNodesInput);
		let t0 = performance.now();
		datasToSave = this.truncateJsonHierarchy(datasToSave);
		let t1 = performance.now();
		// console.log("truncateJsonHierarchy " + (t1 - t0) + " milliseconds.");

		t0 = performance.now();
		datasToSave = this.updateSummariesParts(datasToSave);
		t1 = performance.now();
		// console.log("updateSummariesParts " + (t1 - t0) + " milliseconds.");

		t0 = performance.now();
		datasToSave = this.truncateJsonPartition(datasToSave);
		t1 = performance.now();
		// console.log("truncateJsonPartition " + (t1 - t0) + " milliseconds.");

		t0 = performance.now();
		datasToSave = this.truncateJsonCells(datasToSave);
		t1 = performance.now();
		// console.log("truncateJsonCells " + (t1 - t0) + " milliseconds.");

		t0 = performance.now();
		datasToSave = this.updateSummariesCells(datasToSave);
		t1 = performance.now();
		// console.log("updateSummariesCells " + (t1 - t0) + " milliseconds.");

		if (!collapsedNodesInput) {
			// Remove collapsed nodes and selected nodes because they have been reduced
			delete datasToSave.savedDatas.collapsedNodes; // TODO ?
		}
		// delete datasToSave.savedDatas.selectedNodes; // do not do that to keep context selection
		console.log('file: save.service.ts:114 ~ constructSavedHierarchyToSave ~ datasToSave:', datasToSave);
		return datasToSave;
	}


	truncateJsonHierarchy(datas) {
		const truncatedHierarchy = [...datas.coclusteringReport.dimensionHierarchies];

		Object.keys(datas.savedDatas.collapsedNodes).forEach((dim) => {
			const dimIndex = this.dimensionsService.dimensionsDatas.selectedDimensions.findIndex(e => e.name === dim);

			const nodes = datas.savedDatas.collapsedNodes[dim];
			const dimHierarchy = truncatedHierarchy.find(e => e.name === dim);

			const nodesLength = nodes.length;
			for (let i = 0; i < nodesLength; i++) {

				const nodeName = nodes[i];
				let nodeChildren: any[] = [];
				const nodeDetails: TreeNodeVO = this.dimensionsService.dimensionsDatas.dimensionsClusters[dimIndex].find(e => e.cluster === nodeName);

				// Get children list
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
							if (nodeIndex !== -1) {
								// Set the isLeaf of the last collapsed node
								dimHierarchy.clusters[nodeIndex].isLeaf = true;
							}
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
		this.treenodesService = this.injector.get(TreenodesService);

		const truncatedPartition = _.cloneDeep(datas.coclusteringReport.dimensionPartitions);
		// const truncatedPartition = [ ...datas.coclusteringReport.dimensionPartitions ];

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
		this.treenodesService = this.injector.get(TreenodesService);

		const nodesLength = nodes.length;
		for (let i = 0; i < nodesLength; i++) {

			const nodeName = nodes[i];
			let nodeChildren: any[] = [];
			const currentDefaultGroup = currentTruncatedPartition.defaultGroupIndex && currentTruncatedPartition.valueGroups[currentTruncatedPartition.defaultGroupIndex].values;
			const nodeDetails: TreeNodeVO = this.treenodesService.dimensionsDatas.dimensionsClusters[dimIndex].find(e => e.cluster === nodeName);
			if (nodeDetails && nodeDetails.childrenList) {
				nodeChildren = nodeDetails.childrenList;

				let cancatValueGroup;
				const nodeChildrenLength = nodeChildren.length;
				for (let j = 0; j < nodeChildrenLength; j++) {
					if (currentTruncatedPartition) {
						if (currentTruncatedPartition.valueGroups) {
							if (nodeChildren[j] !== nodeName) { // Do not remove current collapsed node
								const nodeIndex = currentTruncatedPartition.valueGroups.findIndex(e => e.cluster === nodeChildren[j]);
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
			if (currentDefaultGroup) {
				currentTruncatedPartition.defaultGroupIndex = currentTruncatedPartition.valueGroups.findIndex(e => e.values.includes(currentDefaultGroup[0]));
			}
		}

	}

	computeNumPartition(nodes, dimIndex, currentTruncatedPartition) {
		this.treenodesService = this.injector.get(TreenodesService);

		const nodesLength = nodes.length;
		for (let i = 0; i < nodesLength; i++) {

			const nodeName = nodes[i];
			let nodeChildren: any[] = [];

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
				currentNodeBound = currentNodeBound.replaceAll('Missing U ', ''); // #73
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

	/**
	 * ChatGPT optimization
	 */
	truncateJsonCells(CC) {
		const CI = {
			...this.appService.getInitialDatas().datas
		};

		const transitionMatrix: any[] = [];

		let t0 = performance.now();

		// Step 1: we build the transition matrix which makes it possible to pass from the part indices of the CI to the part indices of the CC
		for (let k = 0; k < CI.coclusteringReport.dimensionHierarchies.length; k++) {
			let initialVariable;
			let currentVariable;
			if (CC.coclusteringReport.dimensionPartitions[k].type === 'Numerical') {
				initialVariable = CI.coclusteringReport.dimensionPartitions[k].intervals.map((e) => e.bounds);
				currentVariable = CC.coclusteringReport.dimensionPartitions[k].intervals.map((e) => e.bounds);
			} else {
				initialVariable = CI.coclusteringReport.dimensionPartitions[k].valueGroups.map((e) => e.values);
				currentVariable = CC.coclusteringReport.dimensionPartitions[k].valueGroups.map((e) => e.values);
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
					if (initialPart.length !== 0) { // #73
						try {
							while (!(initialPart[0] >= currentVariable[currentP][0] && initialPart[1] <= currentVariable[currentP][1])) {
								// while (!(this.isRangeIncluded(initialPart, currentVariable))) {
								currentPart = currentVariable[++currentP];
							}
						} catch (e) {
							console.log('file: save.service.ts:446 ~ truncateJsonCells ~ e:', e);
						}
					}

				} else {
					// The inclusion test consists of going through the modalities of the initial part
					// and check that they are all in the list of modalities of the current part.
					if (!currentPart.includes(initialPart[0])) {
						currentPart = currentVariable[++currentP];
					}
				}

				transitionMatrix[k][initialP] = currentP;
			}
		}

		let t1 = performance.now();
		// console.log("STEP 1 " + (t1 - t0) + " milliseconds.");


		t0 = performance.now();

		// Step 2: build the list of cells in the current coclustering by calculating the indexes of these cells and their resGroup
		// let indexesCCSet = new Set();
		let resGroup: any[] = [];

		// chat GPT optimization
		const {
			cellPartIndexes,
			dimensionHierarchies,
			cellFrequencies
		} = CI.coclusteringReport;
		let resGroupMap = new Map();
		// Browse the cells of the initial coclustering json file ("cellPartIndexes" field)
		for (let i = 0; i < cellPartIndexes.length; i++) {
			const initial_indexes = cellPartIndexes[i];
			const currentIndexes: any[] = [];
			for (let k = 0; k < dimensionHierarchies.length; k++) {
				// Calculation of indexes from the transition matrix calculated in step 1
				currentIndexes.push(transitionMatrix[k][initial_indexes[k]]);
			}
			const currentIndexesString = currentIndexes.join(',');

			if (resGroupMap.has(currentIndexesString)) {
				resGroupMap.set(
					currentIndexesString,
					resGroupMap.get(currentIndexesString) + cellFrequencies[i]
				);
			} else {
				resGroupMap.set(currentIndexesString, cellFrequencies[i]);
			}
		}
		// console.log('file: save.service.ts:540 ~ truncateJsonCells ~ resGroupMap:', resGroupMap);
		resGroupMap = new Map([...resGroupMap.entries()].sort());

		// Convert the map back to an array of objects if needed
		resGroup = Array.from(resGroupMap, ([key, value]) => ({
			key,
			value
		}));


		t1 = performance.now();
		// console.log("STEP 2 " + (t1 - t0) + " milliseconds.");

		t0 = performance.now();
		/// TRY TO OPTIM THAT
		// TODO : sort array only when we save as. dont needed for current cluster CC ?
		resGroup.sort(function (a: any, b: any) {
			if (a.value === b.value) {
				return a.key.localeCompare(b.key, undefined, {
					numeric: true
				});
			}
			return b.value - a.value;
		});
		/// END TRY TO OPTIM THAT
		t1 = performance.now();
		// console.log("STEP 3 " + (t1 - t0) + " milliseconds.");


		CC.coclusteringReport.cellFrequencies = resGroup.map(e => e.value);
		// Convert cellPartIndexes strings to integers
		CC.coclusteringReport.cellPartIndexes = resGroup.map(e => e.key.split(/\s*,\s*/).map(Number));

		// console.log('file: save.service.ts:547 ~ truncateJsonCells ~ CC:', CC.coclusteringReport.cellFrequencies);
		return CC;
	}

}
