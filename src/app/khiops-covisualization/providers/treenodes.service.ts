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
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	SaveService
} from './save.service';
import { DimensionsDatasVO } from '@khiops-covisualization/model/dimensions-data-vo';
import { HierarchyDatasVO } from '@khiops-covisualization/model/hierarchy-datas-vo';

@Injectable({
	providedIn: 'root'
})
export class TreenodesService {

	dimensionsDatas: DimensionsDatasVO;
	collapsedNodesToSave: {} = {};

	constructor(
		private saveService: SaveService,
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

	getLeafNodesForARank(rank: number) {
		const collapsedNodes = {}
		for (let i = 0; i < this.dimensionsDatas.selectedDimensions.length; i++) {
			collapsedNodes[this.dimensionsDatas.selectedDimensions[i].name] = [];
			const nodesVO: TreeNodeVO[] = UtilsService.fastFilter(this.dimensionsDatas.dimensionsClusters[i], e => {
				return rank <= e.hierarchicalRank && !e.isLeaf;
			});
			collapsedNodes[this.dimensionsDatas.selectedDimensions[i].name] = nodesVO.map(e => e.cluster);
		}
		return collapsedNodes;
	}

	updateSelectedNodeName(dimensionName, name, newName) {
		if (!this.dimensionsDatas.nodesNames) {
			this.dimensionsDatas.nodesNames = {}
		}
		this.dimensionsDatas.nodesNames[dimensionName] = this.dimensionsDatas.nodesNames[dimensionName] || {};
		this.dimensionsDatas.nodesNames[dimensionName][name] = newName;
		this.update(dimensionName);
	}

	initSavedUnfoldRank() {
		//Initialize unfold rank if set into json
		const appDatas = this.appService.getDatas().datas;
		const savedUnfoldRank = appDatas.savedDatas && appDatas.savedDatas.unfoldHierarchyState
		savedUnfoldRank && this.setSelectedUnfoldHierarchy(savedUnfoldRank);
	}

	initConditionalOnContextNodes() {
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			if (i >= 2) {
				// re init context nodes with conditionalOnContext to false
				this.setSelectedNode(this.dimensionsDatas.dimensions[i].name, this.dimensionsDatas.selectedNodes[i]._id, false);
			}
		}
	}

	setSelectedNode(hierarchyName, nodeName, stopPropagation = false): TreeNodeVO {

		let nodeVO: TreeNodeVO;
		if (this.dimensionsDatas.selectedDimensions) {
			const previousSelectedNodes = Object.assign([], this.dimensionsDatas.selectedNodes);

			// Find current dim position
			const currentIndex: number = this.dimensionsDatas.selectedDimensions.findIndex(e => {
				return hierarchyName === e.name;
			});

			if (currentIndex !== -1) {

				// get Node VO from name
				nodeVO = this.dimensionsDatas.currentDimensionsClusters[currentIndex].find(e => {
					return nodeName === e.name || nodeName === e.shortDescription; // TODO ? also check into shortDescription (for distribution graph for instance)
				});
				if (!nodeVO) {
					// if not found take the first (it's maybe an unfoldHierarchy)
					nodeVO = this.dimensionsDatas.currentDimensionsClusters[currentIndex][0]
				}
				nodeVO.getChildrenList();

				if (currentIndex !== 0 && currentIndex !== 1) {
					if (this.dimensionsDatas.conditionalOnContext) {

						this.dimensionsDatas.contextSelection[currentIndex - 2] = nodeVO.childrenLeafIndexes;
						// for contexts, we must get the real node to get the childrenLeafIndexes
						// const realNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
						// 	return nodeVO.name === e.name || nodeVO.shortDescription === e.shortDescription; // also check into shortDescription (for distribution graph for instance)
						// });
						// realNodeVO.getChildrenList();
						// this.dimensionsDatas.contextSelection[currentIndex - 2] = realNodeVO.childrenLeafIndexes;
					} else {
						// conditionalOnContext unset
						// get the parent node
						const parentNodeVO: TreeNodeVO = this.dimensionsDatas.currentDimensionsClusters[currentIndex].find((e: TreeNodeVO) => e.isParentCluster);
						parentNodeVO.getChildrenList();
						// and set their chidren leafs to context nodes
						this.dimensionsDatas.contextSelection[currentIndex - 2] = parentNodeVO.childrenLeafIndexes;
					}
				}

				this.dimensionsDatas.selectedNodes[currentIndex] = nodeVO;
			}

			// Do not send event changed if only one node selected and if nodes does not changed
			if (!deepEqual(previousSelectedNodes, this.dimensionsDatas.selectedNodes)) {
				// search in the complete datas the corresponding node
				const realNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
					return nodeVO.name === e.name /*|| nodeVO.shortDescription === e.shortDescription*/ ;
					// also check into shortDescription (for distribution graph for instance)
					// no !!! otherwise it return multiple nodes
				});
				realNodeVO.getChildrenList();
				this.eventsService.emitTreeSelectedNodeChanged({
					hierarchyName: hierarchyName,
					selectedNode: nodeVO,
					realNodeVO: realNodeVO,
					stopPropagation: stopPropagation
				});
			}
		}
		return nodeVO;

	}

	updateSelectedNodes(dimension: DimensionVO, position: number) {
		// Find current dim position
		const currentIndex: number = this.dimensionsDatas.selectedDimensions.findIndex(e => {
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

	initSavedDatas() {
		this.dimensionsDatas.nodesNames = this.appService.getSavedDatas('nodesNames') || {};
		const savedNodes = this.appService.getSavedDatas('selectedNodes');
		if (savedNodes) {
			for (let index = 0; index < savedNodes.length; index++) {
				const nodeName = savedNodes[index];
				const dimension = this.dimensionsDatas.selectedDimensions[index];
				const node = dimension && this.getNodeFromName(dimension.name, nodeName);
				if (node) {
					this.dimensionsDatas.selectedNodes[index] = node;
				}
			}
		}
	}

	getNodesNames() {
		return this.dimensionsDatas.nodesNames;
	}

	getNodeFromName(dimensionName, nodeName): TreeNodeVO {
		let nodeVO: TreeNodeVO;
		const currentIndex: number = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimensionName === e.name;
		});

		if (currentIndex !== -1) {
			// get Node VO from name
			nodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
				return nodeName === e.name;
			});
			if (!nodeVO) {
				nodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
					return nodeName === e.bounds;
				});
			}
		}
		return _.cloneDeep(nodeVO); // important to clone datas to keep origin immmutable
	}

	setSavedCollapsedNodes(collapsedNodesToSave) {
		this.collapsedNodesToSave = collapsedNodesToSave
	}

	updateCurrentHierarchyClustersCount(rank: number) {
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			const nodesVO: TreeNodeVO[] = UtilsService.fastFilter(this.dimensionsDatas.dimensionsClusters[i], e => {
				return !e.isLeaf && e.hierarchicalRank < rank;
			});
			const dimension: DimensionVO = this.dimensionsDatas.dimensions[i];
			dimension.setCurrentHierarchyClusterCount(nodesVO.length + 1);
		}
	}

	/**
	 * Compute the number of clusters to manage to display a number of cells
	 * @param maxRank the current number of clusters
	 * @param nbCells the cells count wish
	 */
	getHierarchyFromClustersCount(maxRank: number, nbCells: number) {
		let currentDimClustersCount = 1;
		do {
			maxRank = maxRank - 1
			currentDimClustersCount = 1;
			for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
				const nodesVO: TreeNodeVO[] = UtilsService.fastFilter(this.dimensionsDatas.dimensionsClusters[i], e => {
					return !e.isLeaf && e.hierarchicalRank < maxRank;
				});
				currentDimClustersCount = currentDimClustersCount * nodesVO.length;
			}
		} while (currentDimClustersCount > nbCells);
		return maxRank;
	}

	getHierarchyDatas(): HierarchyDatasVO {
		const appDatas = this.appService.getInitialDatas().datas;

		if (appDatas.coclusteringReport && appDatas.coclusteringReport.dimensionSummaries) {
			const l = appDatas.coclusteringReport.dimensionSummaries.length;
			this.dimensionsDatas.hierarchyDatas.minClusters = l;
			for (let i = 0; i < l; i++) {
				// Concat all dimensions clusters
				this.dimensionsDatas.hierarchyDatas.totalClusters += appDatas.coclusteringReport.dimensionSummaries[i].parts;
			}
			// Init with all clusters
			if (this.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy === 0) {
				this.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy = this.dimensionsDatas.hierarchyDatas.totalClusters;
			}
		}
		if (appDatas.coclusteringReport && appDatas.coclusteringReport.summary) {
			// Get the total cell
			this.dimensionsDatas.hierarchyDatas.totalCells += appDatas.coclusteringReport.summary.cells;
		}
		return this.dimensionsDatas.hierarchyDatas;
	}

	getUnfoldHierarchy(): number{
		return this.dimensionsDatas.hierarchyDatas && this.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy || 0;
	}

	setSelectedUnfoldHierarchy(selectedUnfoldHierarchy: number) {
		this.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy = selectedUnfoldHierarchy;
	}

	updateCollapsedNodesToSave(dimensionName: string, nodeName: string, way) {
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

	getSavedCollapsedNodes() {
		return this.collapsedNodesToSave;
	}

	collapseNode(dimensionName: string, nodeName: string) {
		this.updateCollapsedNodesToSave(dimensionName, nodeName, 1);
		this.setSelectedNode(dimensionName, nodeName, false);
		this.update(dimensionName);
	}

	expandNode(dimensionName: string, nodeName: string) {
		this.updateCollapsedNodesToSave(dimensionName, nodeName, -1);
		this.setSelectedNode(dimensionName, nodeName, false);
		this.update(dimensionName);
	}

	update(dimensionName: string) {
		let collapsedNodes = this.getSavedCollapsedNodes();
		let datas =
			this.saveService.constructSavedJson( // 877
				collapsedNodes
			);
		this.appService.setCroppedFileDatas(datas);
		this.dimensionsDatas = this.dimensionsDatasService.getDatas();
		this.dimensionsDatasService.getDimensions();
		this.dimensionsDatasService.initSelectedDimensions(false); // do not to dont reinit selected context node
		this.dimensionsDatasService.saveInitialDimension();
		this.dimensionsDatasService.constructDimensionsTrees(); //

		const currentIndex: number = this.dimensionsDatas.selectedDimensions.findIndex(e => {
			return dimensionName === e.name;
		});
		const propagateChanges = currentIndex <= 1 ? true : false
		// hack to limit re-rendering and optimize perf
		this.dimensionsDatasService.getMatrixDatas(propagateChanges);
	}

}
