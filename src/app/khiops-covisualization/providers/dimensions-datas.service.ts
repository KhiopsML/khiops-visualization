import {
	Injectable
} from '@angular/core';
import {
	AppService
} from './app.service';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	TreeNodeVO
} from '../model/tree-node-vo';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	MatrixUtilsDatasService
} from '@khiops-library/providers/matrix-utils-datas.service';
import {
	EventsService
} from './events.service';
import * as _ from 'lodash'; // Important to import lodash in karma

@Injectable({
	providedIn: 'root'
})
export class DimensionsDatasService {

	dimensionsDatas: any;

	constructor(
		private appService: AppService,
		private eventsService: EventsService
	) {
		this.initialize();
	}

	initialize(): any {
		this.dimensionsDatas = {
			isAxisInverted: false,
			conditionalOnContext: true,
			matrixDatas: undefined,
			allMatrixDatas: undefined,
			allMatrixCellDatas: undefined,
			cellPartIndexes: [],
			initialDimensions: [],
			dimensions: [],
			selectedNodes: [],
			contextSelection: [],
			selectedDimensions: undefined,
			contextDimensionCount: 0,
			pendingUpdates: [],
			hierarchyDatas: {
				minClusters: 0,
				totalClusters: 0,
				totalCells: 0,
				selectedUnfoldHierarchy: 0,
				unfoldHierarchyState: 0
			},
			dimensionsTrees: [],
			selectedNodesSummary: [],
			dimensionsClusters: []
		};
		return this.dimensionsDatas;
	}

	getDatas(): any {
		return this.dimensionsDatas;
	}

	getDimensionCount() {
		return this.dimensionsDatas.dimensions.length;
	}

	isLargeCocluster() {
		const currentSize = (this.dimensionsDatas.dimensions.map(e => e.parts).reduce((a, b) => a * b))
		return this.dimensionsDatas.dimensions.length * 2 < currentSize;
	}

	isContextDimensions(): boolean {
		const appDatas = this.appService.getDatas().datas;
		return (appDatas && appDatas.coclusteringReport && appDatas.coclusteringReport.summary.initialDimensions > 2);
	}

	isContextDimension(dimensionName): boolean {
		// Find current dim position
		const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimensionName === e.name;
		});
		return currentIndex > 1;
	}

	toggleIsAxisInverted() {
		this.dimensionsDatas.isAxisInverted = !this.dimensionsDatas.isAxisInverted;
	}

	getDimensionPositionFromName(dimensionName): any {
		// Find current dim position
		return this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimensionName === e.name;
		});
	}

	getDimensionsToSave(): any {
		const selectedDimensions = [];
		const dimensions = this.getSelectedDimensions();
		if (dimensions) {
			for (let i = 0; i < dimensions.length; i++) {
				selectedDimensions.push({
					name: this.getSelectedDimensions()[i].name
				});
			}
		}
		return selectedDimensions;
	}

	getSelectedDimensions(): any {
		return this.dimensionsDatas.selectedDimensions;
	}

	getDimensionIntervals(dimensionName: string) {
		const t0 = performance.now();

		// Get nbclusters of current dimension based on collapsed nodes
		let count = 0;
		// Find current dim position
		const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimensionName === e.name;
		});
		if (this.dimensionsDatas.dimensionsTrees[currentIndex] && this.dimensionsDatas.dimensionsTrees[currentIndex][0]) {
			const currentTreeNode: TreeNodeVO = this.dimensionsDatas.dimensionsTrees[currentIndex][0];
			count = this.getNodeIntervalsCount(currentTreeNode);
		}
		const t1 = performance.now();
		// console.log("getDimensionIntervals " + (t1 - t0) + " milliseconds.");
		return count;
	}

	getNodeIntervalsCount(treeNode: TreeNodeVO, count = 0) {
		if (treeNode.isLeaf) {
			count++;
		}
		if (!treeNode.isCollapsed) {
			if (treeNode.children.length > 0) {
				for (let i = 0; i < treeNode.children.length; i++) {
					count = this.getNodeIntervalsCount(treeNode.children[i], count);
				}
			}
		} else {
			count++;
		}
		return count;
	}

	getDimensions(): any {

		const appDatas = this.appService.getDatas().datas;
		this.dimensionsDatas.dimensions = [];

		this.dimensionsDatas.cellPartIndexes = appDatas.coclusteringReport.cellPartIndexes;

		// Get dimension summaries
		if (appDatas.coclusteringReport && appDatas.coclusteringReport.dimensionSummaries) {
			const l = appDatas.coclusteringReport.dimensionSummaries.length;
			for (let i = 0; i < l; i++) {
				const dimension = new DimensionVO(appDatas.coclusteringReport.dimensionSummaries[i], i);
				const dimensionPartition = appDatas.coclusteringReport.dimensionPartitions[i];
				// Set  dimesnion partitions from intervals or valueGroup
				dimension.setPartition(dimensionPartition);
				this.dimensionsDatas.dimensions.push(dimension);
			}
		}

		// Initialize selected dimensions at first launch
		// if (!this.dimensionsDatas.selectedDimensions) {
			// this.getHierarchyDatas();
			this.initSelectedDimensions();
		// }

		return this.dimensionsDatas.dimensions;
	}

	saveInitialDimension() {
		// keep initial dim in memory
		if (this.dimensionsDatas.initialDimensions.length === 0) {
			this.dimensionsDatas.initialDimensions = Object.assign([], this.dimensionsDatas.selectedDimensions);
		}
	}

	updateDimensions(retrieveMatrixDatas = true): any {
		this.saveInitialDimension();
		this.constructDimensionsTrees();
		if (retrieveMatrixDatas) {
			this.getMatrixDatas();
		}
	}

	initSelectedDimensions() {
		this.dimensionsDatas.selectedDimensions = [];
		this.dimensionsDatas.contextDimensions = [];
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			this.dimensionsDatas.selectedDimensions[i] = this.dimensionsDatas.dimensions[i];
			if (i >= 2) {
				this.dimensionsDatas.contextDimensions.push(this.dimensionsDatas.selectedDimensions[i]);
				this.dimensionsDatas.contextDimensionCount = this.dimensionsDatas.contextDimensionCount + 1;
			}
		}
		this.dimensionsDatas.contextSelection = new Array(this.dimensionsDatas.contextDimensions.length).fill([0]);

		const savedSelectedDimensions = this.appService.getSavedDatas('selectedDimensions');
		if (savedSelectedDimensions) {
			for (let i = 0; i < savedSelectedDimensions.length; i++) {
				this.updateSelectedDimension(this.dimensionsDatas.selectedDimensions.find(e => e.name === savedSelectedDimensions[i].name), i);
			}
		}

		return this.dimensionsDatas.selectedDimensions;
	}

	updateSelectedDimension(dimension, position) {
		// Find current dim position
		const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimension.name === e.name;
		});

		if (currentIndex !== -1) {
			// Invert values if already selected
			[this.dimensionsDatas.selectedDimensions[currentIndex],
				this.dimensionsDatas.selectedDimensions[position]
			] = [this.dimensionsDatas.selectedDimensions[position],
				this.dimensionsDatas.selectedDimensions[currentIndex]
			];

			// Reverse indexes of cellPartIndexes when selection change to update matrix combinations
			const cellPartIndexesLength = this.dimensionsDatas.cellPartIndexes.length;
			for (let i = 0; i < cellPartIndexesLength; i++) {
				[this.dimensionsDatas.cellPartIndexes[i][currentIndex],
					this.dimensionsDatas.cellPartIndexes[i][position]
				] = [this.dimensionsDatas.cellPartIndexes[i][position],
					this.dimensionsDatas.cellPartIndexes[i][currentIndex]
				];
			}

		}
		this.dimensionsDatas.selectedDimensions[position] = dimension;
		this.eventsService.emitDimensionsSelectionChanged(this.dimensionsDatas.selectedDimensions);
		return this.dimensionsDatas.selectedDimensions;
	}

	constructDimensionsTrees() {

		this.dimensionsDatas.dimensionsTrees = [];
		const appDatas = this.appService.getDatas().datas;

		// At launch check if there are collapsed nodes into input json file
		const collapsedNodes = this.appService.getSavedDatas('collapsedNodes');

		if (appDatas && appDatas.coclusteringReport) {

			const selectedDimensionsLength = this.dimensionsDatas.selectedDimensions.length;
			for (let i = 0; i < selectedDimensionsLength; i++) {
				let leafPosition = -1;

				const dimension = this.dimensionsDatas.selectedDimensions[i];
				const currentDimensionHierarchy: any = appDatas.coclusteringReport.dimensionHierarchies.find(e => e.name === dimension.name);
				if (currentDimensionHierarchy) {

					this.dimensionsDatas.dimensionsTrees[i] = [];
					this.dimensionsDatas.dimensionsClusters[i] = [];

					const nbClusters = appDatas.coclusteringReport.dimensionSummaries[i].initialParts;
					let index = 0;

					// First convert each child into a treenode value object
					const clustersLength = currentDimensionHierarchy.clusters.length;
					for (let j = 0; j < clustersLength; j++) {

						if (currentDimensionHierarchy.clusters[j].isLeaf) {
							leafPosition++;
						}
						const currentDimensionNodesToCollapse = collapsedNodes && collapsedNodes[dimension.name] || [];
						const currentObj: TreeNodeVO = new TreeNodeVO(
							index,
							currentDimensionHierarchy.clusters[j],
							dimension,
							currentDimensionNodesToCollapse,
							nbClusters,
							leafPosition,
							i,
							j
						);
						this.dimensionsDatas.dimensionsClusters[i].push(currentObj);

						index++;
					}

					// Update parentShortDescription of childeren if user has changed the node name by the past
					this.updateAllParentShortDescription(currentDimensionHierarchy, i);

					// sort dimensionsClusters by rank to order intervals
					this.dimensionsDatas.dimensionsClusters[i] = _.orderBy(this.dimensionsDatas.dimensionsClusters[i], e => e.rank);

					this.dimensionsDatas.dimensionsTrees[i] = UtilsService.unflatten(this.dimensionsDatas.dimensionsClusters[i]);

				}

			}
		}
		return this.dimensionsDatas.dimensionsTrees;
	}

	updateAllParentShortDescription(currentDimensionHierarchy, dimensionIndex) {
		// Update parentShortDescription of childeren if user has changed the node name by the past
		const clustersLength = currentDimensionHierarchy.clusters.length;
		for (let j = 0; j < clustersLength; j++) {
			const currentObj = this.dimensionsDatas.dimensionsClusters[dimensionIndex][j];
			if (currentObj.shortDescription !== currentObj.cluster) {
				const currentChildObjs = this.dimensionsDatas.dimensionsClusters[dimensionIndex].filter(e => e.parentCluster === currentObj.cluster);
				if (currentChildObjs && currentChildObjs.length > 0) {
					const currentChildObjsLength = currentChildObjs.length;
					for (let k = 0; k < currentChildObjsLength; k++) {
						currentChildObjs[k].parentShortDescription = currentObj.shortDescription;
					}
				}
			}
		}
	}

	getMatrixDatas() {
		const t0 = performance.now();
		const appDatas = this.appService.getDatas().datas;

		this.dimensionsDatas.matrixDatas = {};
		this.dimensionsDatas.allMatrixDatas = {};
		this.dimensionsDatas.allMatrixCellDatas = {};

		const xDimension = this.dimensionsDatas.selectedDimensions[0];
		const yDimension = this.dimensionsDatas.selectedDimensions[1];
		const zDimension = [];
		for (let i = 2; i < this.dimensionsDatas.selectedDimensions.length; i++) {
			zDimension.push(this.dimensionsDatas.selectedDimensions[i]);
		}

		const zType = [];
		for (let i = 2; i < this.dimensionsDatas.selectedDimensions.length; i++) {
			zType.push(this.dimensionsDatas.selectedDimensions[i].type);
		}

		// context is an array of array (may have multiple contexts)
		const zDimensionClusters = [];
		for (let i = 2; i < this.dimensionsDatas.dimensionsClusters.length; i++) {
			zDimensionClusters.push(this.dimensionsDatas.dimensionsClusters[i]);
		}

		const xDimensionLeafs: any[] = UtilsService.fastFilter(this.dimensionsDatas.dimensionsClusters[0], item => item.isLeaf === true);
		const yDimensionLeafs: any[] = UtilsService.fastFilter(this.dimensionsDatas.dimensionsClusters[1], item => item.isLeaf === true);

		// Get dimensions parts
		const dimensionParts = this.dimensionsDatas.selectedDimensions.map(e => e.parts);

		// Get the full frequency list
		const cellFrequencies = MatrixUtilsDatasService.getCellFrequencies(
			dimensionParts,
			this.dimensionsDatas.cellPartIndexes,
			appDatas.coclusteringReport.cellFrequencies,
			zDimension);

		const xValues = {
			standard: [],
			frequency: []
		};
		const yValues = {
			standard: [],
			frequency: []
		};

		[xValues.frequency, yValues.frequency] = MatrixUtilsDatasService.getFrequencyAxisValues(xDimension, yDimension, cellFrequencies);
		[xValues.standard, yValues.standard] = MatrixUtilsDatasService.getStandardAxisValues(xDimension, yDimension);

		// TO display axis names
		// Maybe can be improved and be taken into cell datas ?
		this.dimensionsDatas.matrixDatas.variable = {
			nameX: this.dimensionsDatas.selectedDimensions[0].name,
			nameY: this.dimensionsDatas.selectedDimensions[1].name,
			xParts: this.dimensionsDatas.selectedDimensions[0].parts,
			yParts: this.dimensionsDatas.selectedDimensions[1].parts
		};
		this.dimensionsDatas.allMatrixDatas.variable = {
			nameX: this.dimensionsDatas.selectedDimensions[0].name,
			nameY: this.dimensionsDatas.selectedDimensions[1].name,
			xParts: this.dimensionsDatas.selectedDimensions[0].parts,
			yParts: this.dimensionsDatas.selectedDimensions[1].parts
		};

		const cellDatas = MatrixUtilsDatasService.getCellDatas(
			xDimension,
			yDimension,
			zDimension,
			xDimensionLeafs.map(e => e.name),
			yDimensionLeafs.map(e => e.name),
			xDimensionLeafs.map(e => e.shortDescription),
			yDimensionLeafs.map(e => e.shortDescription),
			cellFrequencies,
			undefined, // cellInterests only for KV
			undefined, // cellTargetFrequencies only for KV
			xValues,
			yValues);

		this.dimensionsDatas.matrixDatas.matrixCellDatas = cellDatas;
		this.dimensionsDatas.allMatrixDatas.matrixCellDatas = cellDatas;
		this.dimensionsDatas.allMatrixCellDatas = cellDatas;

		const t1 = performance.now();
		console.log("getMatrixDatas " + (t1 - t0) + " milliseconds.");
		const generationDuration = (t1 - t0);
		// console.log("TCL: DimensionsDatasService -> getMatrixDatas -> this.dimensionsDatas.matrixDatas", JSON.stringify(this.dimensionsDatas.matrixDatas))
		return [generationDuration, this.dimensionsDatas.matrixDatas];
	}

}
