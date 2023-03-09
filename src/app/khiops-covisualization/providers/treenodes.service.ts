import {
	Injectable
} from '@angular/core';
import {
	DimensionsDatasService
} from './dimensions-datas.service';
import {
	EventsService
} from './events.service';
import {
	AppService
} from './app.service';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	TreeNodeVO
} from '../model/tree-node-vo';
import {
	deepEqual
} from 'fast-equals';
import _ from 'lodash';
import {
	CellVO
} from '@khiops-library/model/cell-vo';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	AppConfig
} from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class TreenodesService {

	dimensionsDatas: any;
	collapsedNodesToSave: any = {};

	constructor(
		private appService: AppService,
		private dimensionsDatasService: DimensionsDatasService,
		private eventsService: EventsService
	) {
		this.initialize();
	}

	initialize() {
		this.dimensionsDatas = this.dimensionsDatasService.getDatas();
		this.collapsedNodesToSave = this.appService.getSavedDatas('collapsedNodes') || {};
	}

	updateSelectedNodeName(hierarchyName, name, newName, isLeaf) {
		this.updateNodeNameIntoJson(hierarchyName, name, newName, isLeaf);
		this.updateNodeNameIntoModel(hierarchyName, name, newName, isLeaf);
	}

	updateNodeNameIntoJson(hierarchyName, name, newName, isLeaf) {
		const appDatas = this.appService.getDatas().datas;

		// Find current dim position
		const currentIndex: any = this.dimensionsDatas.selectedDimensions.find(e => {
			return hierarchyName === e.name;
		}).startPosition;

		let currentCluster;

		// update dimensionHierarchies json datas
		const currentDimensionHierarchy: any = appDatas.coclusteringReport.dimensionHierarchies[currentIndex];
		currentCluster = currentDimensionHierarchy.clusters.find(e => {
			return name === e.cluster;
		});
		if (currentCluster) {
			currentCluster.shortDescription = newName;
		}

		if (isLeaf) {
			// update dimensionPartitions json datas
			// const dimensionPartition = appDatas.coclusteringReport.dimensionPartitions[currentIndex];
			// if (dimensionPartition.type === 'Numerical') {
			// 	currentCluster = dimensionPartition.intervals.find(e => {
			// 		return name === e.cluster;
			// 	});
			// 	currentCluster.shortDescription = newName;
			// } else if (dimensionPartition.type === 'Categorical') {
			// 	currentCluster = dimensionPartition.valueGroups.find(e => {
			// 		return name === e.cluster;
			// 	});
			// 	currentCluster.shortDescription = newName;
			// }
		} else {
			// update parentCluster informations
			// const parentClusters: any[] = UtilsService.fastFilter(currentDimensionHierarchy.clusters, e => {
			// 	return name === e.parentCluster;
			// });
			// for (let i = 0; i < parentClusters.length; i++) {
			// 	parentClusters[i].parentShortDescription = newName;
			// }
		}

	}

	updateNodeNameIntoModel(hierarchyName, name, newName, isLeaf) {

		const currentIndex = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return hierarchyName === e.name;
		});

		// Update selected node
		const nodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
			return name === e.name;
		});
		nodeVO.shortDescription = newName;

		// Update dimension clusters
		const clusterLeafsToUpdate = this.dimensionsDatas.dimensionsClusters[currentIndex].filter(e => e.name === name || e.parentCluster === name);
		const clusterLeafsToUpdateLength = clusterLeafsToUpdate.length;
		for (let i = 0; i < clusterLeafsToUpdateLength; i++) {
			if (clusterLeafsToUpdate[i].name === name) {
				clusterLeafsToUpdate[i].xDisplayaxisPart = newName;
			} else if (clusterLeafsToUpdate[i].parentCluster === name) {
				clusterLeafsToUpdate[i].parentShortDescription = newName;
			}
		}

		this.dimensionsDatas.dimensionsTrees[currentIndex] = UtilsService.unflatten(this.dimensionsDatas.dimensionsClusters[currentIndex]);

		// now every where i find name in cells, update cells
		const cellsToUpdate = this.dimensionsDatas.matrixDatas.matrixCellDatas.filter(e => e.xaxisPart === name || e.yaxisPart === name || e.parentCluster === name);
		const cellsToUpdateLength = cellsToUpdate.length;
		for (let i = 0; i < cellsToUpdateLength; i++) {
			if (cellsToUpdate[i].xaxisPart === name) {
				cellsToUpdate[i].xDisplayaxisPart = newName;
			} else if (cellsToUpdate[i].yaxisPart === name) {
				cellsToUpdate[i].yDisplayaxisPart = newName;
			} else if (cellsToUpdate[i].parentCluster === name) {
				cellsToUpdate[i].parentShortDescription = newName;
			}
		}

		this.dimensionsDatas.allMatrixDatas = _.cloneDeep(this.dimensionsDatas.matrixDatas);

		// after recompute distrib graph
		// after update composition grid datas
		this.eventsService.emitTreeNodeNameChanged({
			hierarchyName: hierarchyName,
			selectedNode: nodeVO
		});

	}

	initSelectedNodes() {
		this.dimensionsDatas.selectedNodes = [];
	}

	initConditionalOnContextNodes() {
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			if (i >= 2) {
				// re init context nodes with conditionalOnContext to false
				this.setSelectedNode(this.dimensionsDatas.dimensions[i].name, this.dimensionsDatas.selectedNodes[i]._id, false);
			}
		}
	}

	setSelectedNode(hierarchyName, nodeName, stopPropagation = false) {

		let nodeVO: TreeNodeVO;
		if (this.dimensionsDatas.selectedDimensions) {
			const previousSelectedNodes = Object.assign([], this.dimensionsDatas.selectedNodes);

			// Find current dim position
			const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
				return hierarchyName === e.name;
			});

			if (currentIndex !== -1) {
				// Do it only if selection changed
				let init = true;
				if (this.dimensionsDatas.selectedNodes[currentIndex]) {
					init = false;
				}

				// get Node VO from name
				nodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
					return nodeName === e.name;
				});

				// Search into dimensionsTrees if node is into collapsed folder
				// if it is the case, search the first node that not collapsed
				nodeVO = this.getFirstVisibleNode(this.dimensionsDatas.dimensionsClusters[currentIndex], nodeVO, nodeVO);

				if (nodeVO) {
					nodeVO.getChildrenList();
				}

				if (currentIndex !== 0 && currentIndex !== 1) {
					if (this.dimensionsDatas.conditionalOnContext) {
						// Important to get children list for contexts when saving hierarchy as
						// const parentNodeVO: TreeNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find((e: TreeNodeVO) => e.isParentCluster);
						// parentNodeVO.getChildrenList();
						// it is context selection
						if (nodeVO && nodeVO.isLeaf) {
							this.dimensionsDatas.contextSelection[currentIndex - 2] = [nodeVO.id];
						} else {
							this.dimensionsDatas.contextSelection[currentIndex - 2] = nodeVO.childrenLeafIndexes;
						}
					} else {
						// conditionalOnContext unset
						// get the parent node
						const parentNodeVO: TreeNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find((e: TreeNodeVO) => e.isParentCluster);
						parentNodeVO.getChildrenList();
						// and set their chidren leafs to context nodes
						this.dimensionsDatas.contextSelection[currentIndex - 2] = parentNodeVO.childrenLeafIndexes;
					}

				}

				this.dimensionsDatas.selectedNodes[currentIndex] = nodeVO;
			}

			// Do not send event changed if only one node selected and if nodes does not changed
			if (!deepEqual(previousSelectedNodes, this.dimensionsDatas.selectedNodes)) {
				this.eventsService.emitTreeSelectedNodeChanged({
					hierarchyName: hierarchyName,
					selectedNode: nodeVO,
					stopPropagation: stopPropagation
				});
			}
		}
		return nodeVO;

	}

	updateSelectedNodes(dimension: any, position: number) {
		// Find current dim position
		const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimension.name === e.name;
		});

		if (currentIndex !== -1) {
			// Invert values if already selected
			[this.dimensionsDatas.selectedNodes[currentIndex],
			this.dimensionsDatas.selectedNodes[position]
			] = [this.dimensionsDatas.selectedNodes[position],
			this.dimensionsDatas.selectedNodes[currentIndex]
				];
		}
	}

	getFirstVisibleNode(nodes, nodeVO: TreeNodeVO, lastVisibleNode) {
		const parentNode: TreeNodeVO = nodes.find(e => e.name === nodeVO.parentCluster);
		if (!nodeVO.isParentCluster) {
			if (parentNode.isCollapsed) {
				lastVisibleNode = parentNode;
			}
			return this.getFirstVisibleNode(nodes, parentNode, lastVisibleNode);
		} else {
			return lastVisibleNode;
		}
	}

	getSelectedNodes() {
		return this.dimensionsDatas.selectedNodes;
	}

	getNodeFromName(dimensionName, nodeName) {
		let nodeVO: TreeNodeVO;
		const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimensionName === e.name;
		});

		if (currentIndex !== -1) {
			// get Node VO from name
			nodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
				return nodeName === e.name;
			});
		}
		return nodeVO;
	}

	getSelectedNodesToSave() {
		const selectedNodes = _.cloneDeep(this.getSelectedNodes());
		const selectedNodesLength = selectedNodes.length;
		for (let i = 0; i < selectedNodesLength; i++) {
			selectedNodes.push({
				id: selectedNodes[i].id,
				dimensionName: selectedNodes[i].hierarchy
			});
		}
		return selectedNodes;
	}

	getSelectedNodesSummary() {
		this.dimensionsDatas.selectedNodesSummary = [];
		const l = this.dimensionsDatas.selectedNodes.length;
		for (let i = 0; i < l; i++) {
			this.dimensionsDatas.selectedNodesSummary.push(this.dimensionsDatas.selectedNodes[i]);
		}
	}

	updateCurrentHierarchyClustersCount(rank) {
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			const nodesVO: any[] = UtilsService.fastFilter(this.dimensionsDatas.dimensionsClusters[i], e => {
				return !e.isLeaf && e.hierarchicalRank < rank;
			});
			const dimension: DimensionVO = this.dimensionsDatas.dimensions[i];
			dimension.setCurrentHierarchyClusterCount(nodesVO.length + 1);
		}
	}

	getHierarchyDatas(): any {
		const appDatas = this.appService.getDatas().datas;

		if (!this.dimensionsDatas.hierarchyDatas) {

			this.dimensionsDatas.hierarchyDatas = {
				minClusters: 0,
				totalClusters: 0,
				totalCells: 0,
				selectedUnfoldHierarchy: 0
			};

			if (appDatas.coclusteringReport && appDatas.coclusteringReport.dimensionSummaries) {
				const l = appDatas.coclusteringReport.dimensionSummaries.length;
				this.dimensionsDatas.hierarchyDatas.minClusters = l;
				for (let i = 0; i < l; i++) {
					// Concat all dimensions clusters
					this.dimensionsDatas.hierarchyDatas.totalClusters += appDatas.coclusteringReport.dimensionSummaries[i].parts;
				}
				// Init with all clusters
				this.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy = this.dimensionsDatas.hierarchyDatas.totalClusters;
			}
			if (appDatas.coclusteringReport && appDatas.coclusteringReport.summary) {
				// Get the total cell
				this.dimensionsDatas.hierarchyDatas.totalCells += appDatas.coclusteringReport.summary.cells;
			}
		}

		return this.dimensionsDatas.hierarchyDatas;
	}


	toggleDimensionHierarchyFold(dimensionName: string, state: boolean) {
		const dimension: DimensionVO = this.dimensionsDatas.dimensions.find(e => e.name === dimensionName);
		dimension.setHierarchyFold(state);
	}

	setSelectedUnfoldHierarchy(selectedUnfoldHierarchy) {
		this.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy = selectedUnfoldHierarchy;
	}

	initDefaultUnfoldRank() {
		// for big files, first unfold to default rank to optimize perf
		const hierarchyDatas = this.getHierarchyDatas();
		const unfoldRank = AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.DEFAULT_UNFOLD;
		if (hierarchyDatas.totalClusters > unfoldRank) {
			this.setSelectedUnfoldHierarchy(unfoldRank);
			this.unfoldHierarchy(0, unfoldRank, true);
			// this.dimensionsDatas.allMatrixDatas = Object.assign({}, this.dimensionsDatas.matrixDatas);
			// this.dimensionsDatas.allMatrixDatas = _.cloneDeep(this.dimensionsDatas.matrixDatas);
			return true;
		} else {
			return false;
		}
	}

	// getTreeNodesToCollapse(dimensionName, rank) {
	// 	const nodesToCollapse = [];
	// 	// Find current dim position
	// 	const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
	// 		return dimensionName === e.name;
	// 	});

	// 	if (currentIndex !== -1) {

	// 		const nodesVO: any[] = UtilsService.fastFilter(this.dimensionsDatas.dimensionsClusters[currentIndex], e => {
	// 			return rank <= e.hierarchicalRank && !e.isLeaf;
	// 		});

	// 		for (let j = 0; j < nodesVO.length; j++) {
	// 			const nodeVO: TreeNodeVO = nodesVO[j];
	// 			if (nodeVO) {
	// 				// get parent to check if node must be collapsed
	// 				const parent: TreeNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
	// 					return nodeVO.parentCluster === e.cluster;
	// 				});

	// 				if (!parent) {
	// 					// this.collapseNode(nodeVO.hierarchy, nodeVO.name, false);
	// 					nodesToCollapse.push(nodeVO);
	// 				} else if (parent.hierarchicalRank < rank) {
	// 					// check if parent level is > level
	// 					nodesToCollapse.push(nodeVO);

	// 					// this.collapseNode(nodeVO.hierarchy, nodeVO.name, false);
	// 				}
	// 			}
	// 		}
	// 	}

	// 	return nodesToCollapse;
	// }

	unfoldHierarchy(previousRank, currentRank, keepCurrentUnfolding = false) {
		const t2 = performance.now();

		if (!keepCurrentUnfolding && currentRank > previousRank) {

			// unfold first all tree
			for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {

				const nodesVO: any[] = UtilsService.fastFilter(this.dimensionsDatas.dimensionsClusters[i], e => {
					return e.isCollapsed;
				});
				const nodesVOLength = nodesVO.length;
				for (let j = 0; j < nodesVOLength; j++) {
					const nodeVO: TreeNodeVO = nodesVO[j];
					if (nodeVO) {
						nodeVO.isCollapsed = false;
					}
				}

				// expand parent node
				const parent: TreeNodeVO = this.dimensionsDatas.dimensionsClusters[i].find(e => {
					return e.isParentCluster;
				});
				if (parent) {
					this.expandNode(parent.hierarchy, parent.name);
				}
			}
		}

		// fold
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			if (this.dimensionsDatas.dimensions[i].hierarchyFold) {
				const nodesVO: any[] = UtilsService.fastFilter(this.dimensionsDatas.dimensionsClusters[i], e => {
					return currentRank <= e.hierarchicalRank && !e.isLeaf;
				});

				if (nodesVO.length > 0) {
					const nodesVOLength = nodesVO.length;
					for (let j = 0; j < nodesVOLength; j++) {
						const nodeVO: TreeNodeVO = nodesVO[j];
						if (nodeVO) {
							// get parent to check if node must be collapsed
							const parent: TreeNodeVO = this.dimensionsDatas.dimensionsClusters[i].find(e => {
								return nodeVO.parentCluster === e.cluster;
							});

							if (!parent) {
								this.collapseNode(nodeVO.hierarchy, nodeVO.name, false, keepCurrentUnfolding);
							} else if (parent.hierarchicalRank < currentRank) {
								// check if parent level is > level
								this.collapseNode(nodeVO.hierarchy, nodeVO.name, false, keepCurrentUnfolding);
							}
						}
					}

				}
				// emit event to reconstruct current cluster grid
				this.eventsService.emitTreeCollapseChanged(this.dimensionsDatas.dimensions[i].name);
			}
		}

		// Now we find the first visible node (or last selected if do not changed with unfold hierarchy)
		const newSelectedNodes = _.cloneDeep(this.dimensionsDatas.selectedNodes);
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			if (this.dimensionsDatas.dimensions[i].hierarchyFold) {

				const firstCollapsedNode = this.dimensionsDatas.dimensionsClusters[i].find(e => e.isCollapsed === true);
				if (firstCollapsedNode) {
					newSelectedNodes.push(firstCollapsedNode);
				} else {
					newSelectedNodes.push(this.dimensionsDatas.selectedNodes[i]);
				}
			}
		}

		// At the end emit event with selectes nodes details
		// Do not emit if it is first unfolding for performance purpose
		if (!keepCurrentUnfolding) {
			this.eventsService.emitTreeInit(newSelectedNodes);
		}

		const t3 = performance.now();
		// console.log("unfoldHierarchy " + (t3 - t2) + " milliseconds.");
	}

	updateCollapsedNodesToSave(dimensionName, nodeName, way) {
		// Add or remove collapsed nodes to save them into json file
		if (!this.collapsedNodesToSave[dimensionName]) {
			this.collapsedNodesToSave[dimensionName] = [];
		}
		const index = this.collapsedNodesToSave[dimensionName].indexOf(nodeName);
		if (way === -1) {
			if (index !== -1) {
				this.collapsedNodesToSave[dimensionName].splice(index, 1);
			}
		} else if (way === 1) {
			if (index === -1) {
				this.collapsedNodesToSave[dimensionName].push(nodeName);
			}
		}
	}

	getCollapsedNodesToSave() {
		return this.collapsedNodesToSave;
	}

	collapseNodesSaved() {
		const nodesToCollapse = this.getCollapsedNodesToSave();
		if (nodesToCollapse) {
			for (const dimension in nodesToCollapse) {
				if (nodesToCollapse[dimension]) {
					const nodesToCollapseDimLength = nodesToCollapse[dimension].length;
					for (let i = 0; i < nodesToCollapseDimLength; i++) {
						this.collapseNode(dimension, nodesToCollapse[dimension][i]);
					}
				}
			}
		}
	}

	collapseNode(dimensionName, nodeName, emitEvent = true, keepCurrentUnfolding = false) {
		const t0 = performance.now();

		// Find current dim position
		const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimensionName === e.name;
		});

		if (currentIndex === 0 || currentIndex === 1) { // more than 2 is context
			if (this.dimensionsDatas.selectedNodes[currentIndex] || keepCurrentUnfolding) {

				let newMatrixCellDatas = this.dimensionsDatas.matrixDatas.matrixCellDatas;

				// get Node VO from name
				const nodeVO: TreeNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
					return nodeName === e.name;
				});

				if (nodeVO) {

					// Set iscollapsed and update children lists
					if (keepCurrentUnfolding) {
						nodeVO.isUnfoldedByDefault = true;
					}

					nodeVO.isCollapsed = true;
					nodeVO.getChildrenList();

					// Pre filter the cells to optim perfs
					const filteredCells = [];
					const filteredOtherCells = [];
					const newMatrixCellDatasLength = newMatrixCellDatas.length;
					for (let i = 0; i < newMatrixCellDatasLength; i++) {
						const e = newMatrixCellDatas[i];
						if (currentIndex === 0) {
							if (nodeVO.childrenList.includes(e.xaxisPart)) {
								filteredCells.push(e);
							} else {
								filteredOtherCells.push(e);
							}
						} else {
							if (nodeVO.childrenList.includes(e.yaxisPart)) {
								filteredCells.push(e);
							} else {
								filteredOtherCells.push(e);
							}
						}
					}

					let cellsToConcat: CellVO[] = [];

					const childrenListLength = nodeVO.childrenList.length;
					for (let i = 0; i < childrenListLength; i++) {
						const child = nodeVO.childrenList[i];
						const leafs: any[] = UtilsService.fastFilter(filteredCells, e => {
							if (currentIndex === 0) {
								return e.xaxisPart === child;
							} else {
								return e.yaxisPart === child;
							}
						});
						// Get the cells to concat
						cellsToConcat = this.concatCells(cellsToConcat, leafs, currentIndex, nodeVO);
					}

					// Merge new cells with filtered other cells array
					newMatrixCellDatas = [];
					newMatrixCellDatas = UtilsService.fastConcat(filteredOtherCells, cellsToConcat);

					this.dimensionsDatas.matrixDatas.matrixCellDatas = newMatrixCellDatas;
					if (emitEvent) {
						this.eventsService.emitTreeCollapseChanged(dimensionName);
					}
				}
			}
		} else {
			// context case : do not concat values
			// get Node VO from name
			const nodeVO: TreeNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
				return nodeName === e.name;
			});
			nodeVO.isCollapsed = true;
			if (emitEvent) {
				this.eventsService.emitTreeCollapseChanged(dimensionName);
			}

			// Important to get children list for contexts when saving hierarchy as
			nodeVO.getChildrenList();
		}
		const t1 = performance.now();
		// console.info("collapseNode took " + (t1 - t0) + " milliseconds.");

		this.updateCollapsedNodesToSave(dimensionName, nodeName, 1);
	}

	concatCells(concatCells: CellVO[], leafs, currentIndex, nodeVO) {
		if (concatCells.length === 0) {
			concatCells = leafs;
		} else {
			const leafsLength = leafs.length;
			for (let j = 0; j < leafsLength; j++) {
				// conert cell into CellVO because obj has been copied with json parse to improve perf, and it lose CellVo properties
				concatCells[j] = new CellVO(concatCells[j]);
				concatCells[j].merge(leafs[j], currentIndex, nodeVO);
			}
		}
		return concatCells;
	}

	expandNode(dimensionName, nodeName) {
		// Find current dim position
		const currentIndex: any = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimensionName === e.name;
		});

		if (currentIndex === 0 || currentIndex === 1) { // more than 2 is context
			// cellVO is now deep so we must clone it, not assign
			const allMatrixCellDatas = _.cloneDeep(this.dimensionsDatas.allMatrixDatas.matrixCellDatas);

			this.dimensionsDatas.matrixDatas.matrixCellDatas = allMatrixCellDatas;

			// first collapse nodes of second tree
			let otherIndex = 0;
			if (currentIndex === 0) {
				otherIndex = 1;
			}
			const otherTreeVO: TreeNodeVO = this.dimensionsDatas.dimensionsTrees[otherIndex][0];
			otherTreeVO.getChildrenList();
			if (otherTreeVO.childrenNodesCollapsed) {
				let i = otherTreeVO.childrenNodesCollapsed.length;
				while (i--) {
					this.collapseNode(otherTreeVO.hierarchy, otherTreeVO.childrenNodesCollapsed[i], false);
				}
			}
			// If other tree is fully collapsed
			if (otherTreeVO.isParentCluster && otherTreeVO.isCollapsed) {
				this.collapseNode(otherTreeVO.hierarchy, otherTreeVO.cluster, false);
			}

			// Now set isCollapsed bool to false for current collapsed node
			const nodeVO: TreeNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
				return nodeName === e.name;
			});
			nodeVO.isCollapsed = false;

			// Finally, collapsed all nodes of current tree
			const currentTreeVO: TreeNodeVO = this.dimensionsDatas.dimensionsTrees[currentIndex][0];
			currentTreeVO.getChildrenList();
			if (currentTreeVO.childrenNodesCollapsed) {
				let i = currentTreeVO.childrenNodesCollapsed.length;
				while (i--) {
					this.collapseNode(currentTreeVO.hierarchy, currentTreeVO.childrenNodesCollapsed[i], false);
				}
			}

		} else {
			// Now set isCollapsed bool to false for context
			const nodeVO: TreeNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
				return nodeName === e.name;
			});
			nodeVO.isCollapsed = false;
		}

		this.eventsService.emitTreeCollapseChanged(dimensionName);

		this.updateCollapsedNodesToSave(dimensionName, nodeName, -1);

	}

}
