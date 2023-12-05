import {
	Injectable
} from '@angular/core';
import _ from 'lodash'; // Important to import lodash in karma
import {
	AppService
} from './app.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	BarVO
} from '../model/bar-vo';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	VariableVO
} from '../model/variable-vo';
import {
	VariableDetailsVO
} from '../model/variableDetails-vo';
import {
	ChartDatasetVO
} from '@khiops-library/model/chartDataset-vo';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	SummaryVO
} from '../model/summary-vo';
import {
	InformationsVO
} from '../model/informations-vo';
import {
	TreePreparationVariableVO
} from '../model/tree-preparation-variable-vo';
import {
	TreeNodeVO
} from '../model/tree-node-vo';
import {
	TreePreparationDatasVO
} from '../model/tree-preparation-datas-vo';
import {
	GridDatasI
} from '@khiops-library/interfaces/grid-datas';

@Injectable({
	providedIn: 'root'
})
export class TreePreparationDatasService {

	treePreparationDatas: TreePreparationDatasVO;

	constructor(
		private translate: TranslateService,
		private khiopsLibraryService: KhiopsLibraryService,
		private appService: AppService) {

	}

	initialize(): any {

		const appDatas = this.appService.getDatas().datas;
		this.treePreparationDatas = new TreePreparationDatasVO(appDatas);

		// select the first item of the list by default
		if (this.treePreparationDatas.isValid()) {
			let defaultVariable = appDatas.treePreparationReport.variablesStatistics[0];

			// Check if there is a saved selected variable into json
			const savedSelectedRank = this.appService.getSavedDatas('selectedRank');
			if (savedSelectedRank) {
				defaultVariable = this.getVariableFromRank(savedSelectedRank);
			}

			this.setSelectedVariable(defaultVariable);
		}

	}

	getDatas(): TreePreparationDatasVO {
		return this.treePreparationDatas;
	}

	initSelectedNodes() {
		const appDatas = this.appService.getDatas().datas;
		const variablesDetailedStatistics = appDatas && appDatas.treePreparationReport &&
			appDatas.treePreparationReport.variablesDetailedStatistics;
		const dimensions = variablesDetailedStatistics[this.treePreparationDatas.selectedVariable.rank].dataGrid.dimensions;
		const firstpartition = dimensions[0].partition[0];
		this.setSelectedNodes(firstpartition, firstpartition[0]);
	}

	getFirstNodeLeaf(node): any {
		if (node.children.length > 0 && node.children[0].isLeaf === false) {
			return this.getFirstNodeLeaf(node.children[0]);
		} else {
			return node.children[0];
		}
	}

	getNodesLinkedToOneNode(id: any) {
		const appDatas = this.appService.getDatas().datas;
		const variablesDetailedStatistics = appDatas && appDatas.treePreparationReport &&
			appDatas.treePreparationReport.variablesDetailedStatistics;

		const dimensions = variablesDetailedStatistics[this.treePreparationDatas.selectedVariable.rank].dataGrid.dimensions;
		const dimIndex = dimensions.findIndex(e => e.variable === this.treePreparationDatas.selectedVariable.name);
		const dimDatas = dimensions[dimIndex].partition;
		const dimDatasIndex = dimDatas.findIndex(e => e.includes(id));
		return [dimDatasIndex, dimDatas[dimDatasIndex]];
	}

	setSelectedVariable(object: any): any {
		if (object) {
			const variable = this.getVariableFromName(object.name);
			if (variable) {
				// Init datas
				this.treePreparationDatas.selectedNodes = undefined;
				this.treePreparationDatas.selectedNode = undefined;

				// Init selected variable and construct tree
				this.treePreparationDatas.selectedVariable = new TreePreparationVariableVO(variable, variable.name);
				this.setSelectedFlattenTree(object.rank);
				this.computeNodesFreqsComparedToOthers();
				this.treePreparationDatas.computeTreeColorsMap();
				this.constructDimensionTree();
				return this.treePreparationDatas.selectedVariable;
			}
		}
	}

	setSelectedFlattenTree(rank): void {
		const appDatas = this.appService.getDatas().datas;
		const treeDatas = appDatas && appDatas.treePreparationReport &&
			appDatas.treePreparationReport.treeDetails;
		if (treeDatas && treeDatas[rank] && treeDatas[rank].treeNodes) {
			const flattenTree = UtilsService.flattenTree([], _.cloneDeep(treeDatas[rank].treeNodes));
			this.treePreparationDatas.selectedFlattenTree = flattenTree;
		}
	}

	constructDimensionTree() {
		const appDatas = this.appService.getDatas().datas;
		const treeDatas = appDatas && appDatas.treePreparationReport &&
			appDatas.treePreparationReport.treeDetails;
		const currentRank = this.getSelectedVariableRank();
		if (currentRank && treeDatas && treeDatas[currentRank]) {
			this.treePreparationDatas.dimensionTree = _.cloneDeep([treeDatas[currentRank].treeNodes]);
			this.treePreparationDatas.dimensionTree[0] = this.formatTreeNodesDatas(this.treePreparationDatas.dimensionTree[0]);
		}
	}

	computeNodesFreqsComparedToOthers() {
		let treeLeafs = this.treePreparationDatas &&
			this.treePreparationDatas.selectedFlattenTree &&
			this.treePreparationDatas.selectedFlattenTree.map(e => e.targetValues && e.targetValues.frequencies);
		if (treeLeafs) {
			treeLeafs = treeLeafs.filter(function (e) {
				return e !== undefined;
			});
			treeLeafs = UtilsService.sumArrayItemsOfArray(treeLeafs);
			const [minVal, maxVal] = UtilsService.getMinAndMaxFromArray(treeLeafs);
			this.treePreparationDatas.maxFrequencies = maxVal;
			this.treePreparationDatas.minFrequencies = minVal;
		}
	}

	formatTreeNodesDatas(item) {

		const color = this.treePreparationDatas.treeColorsMap[item.nodeId];
		item = new TreeNodeVO(item, this.treePreparationDatas.classesCount, color);

		if (item && item.children) {
			for (let i = 0; i < item.children.length; i++) {
				item.children[i] = this.formatTreeNodesDatas(item.children[i]);
			}
		}
		return item;
	}

	getSelectedVariable(): any {
		return this.treePreparationDatas.selectedVariable;
	}

	getSelectedVariableRank(): any {
		return this.treePreparationDatas.selectedVariable.rank;
	}

	getVariableFromName(name: string): any {
		let variable: any;
		const appDatas = this.appService.getDatas().datas;
		if (appDatas.treePreparationReport && appDatas.treePreparationReport.variablesStatistics) {
			variable = appDatas.treePreparationReport.variablesStatistics.find(e => e.name === name);
		}
		return variable;
	}

	getNodeFromName(name: string): any {
		let node: any;
		if (this.treePreparationDatas.selectedFlattenTree) {
			node = this.treePreparationDatas.selectedFlattenTree.find(e => e.nodeId === name);
		}
		return node;
	}

	getVariableFromRank(rank: string): any {
		let variable: any;
		const appDatas = this.appService.getDatas().datas;
		variable = appDatas.treePreparationReport.variablesStatistics.find(e => e.rank === rank);
		return variable;
	}

	getSummaryDatas(): any {
		const appDatas = this.appService.getDatas().datas;
		const summaryVO = new SummaryVO(appDatas.treePreparationReport.summary);
		return summaryVO.formatDatas();
	}

	getInformationsDatas(): any {
		const appDatas = this.appService.getDatas().datas;
		const informationsDatas = new InformationsVO(appDatas.treePreparationReport.summary);
		return informationsDatas.formatDatas();
	}

	getLeafRules(): any {
		return this.treePreparationDatas.selectedVariable;
	}

	getCurrentIntervalDatas(index ? ): any {

		index = index || 0;

		const datas = [];
		let title = '';
		const displayedColumns = [];

		// init the object
		this.treePreparationDatas.currentIntervalDatas = {
			title: title,
			values: datas,
			displayedColumns: displayedColumns,
		};

		if (index !== -1) { // otherwise it's a node selection

			const appDatas = this.appService.getDatas().datas;
			if (appDatas.treePreparationReport && appDatas.treePreparationReport.variablesDetailedStatistics) {

				const currentVar = appDatas.treePreparationReport.variablesDetailedStatistics[this.treePreparationDatas.selectedVariable.rank];
				const variableDetails: VariableDetailsVO = new VariableDetailsVO(currentVar, this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE);

				if (variableDetails && variableDetails.dataGrid) {
					const currentVariableType = variableDetails.dataGrid.dimensions[0].type;

					if (currentVariableType === 'Numerical') {

						displayedColumns.push({
							headerName: this.translate.get('GLOBAL.INTERVAL_OF') + variableDetails.dataGrid.dimensions[0].variable,
							field: 'interval'
						});

						// init datas array
						datas[0] = {};
						if (variableDetails.dataGrid.dimensions[0].partition[index].length > 0) {
							datas[0]['interval'] = JSON.stringify(variableDetails.dataGrid.dimensions[0].partition[index]);
						} else {
							datas[0]['interval'] = this.translate.get('GLOBAL.MISSING');
						}

						title = this.translate.get('GLOBAL.CURRENT_INTERVAL');

					} else if (currentVariableType === 'Categorical') {

						let dimensionLength = 0;
						let startIter = 0;

						const currentVal: any = variableDetails.dataGrid.dimensions[0].partition[index][0];

						displayedColumns.push({
							headerName: this.translate.get('GLOBAL.VALUES_OF') + variableDetails.dataGrid.dimensions[0].variable,
							field: 'values'
						});
						displayedColumns.push({
							headerName: this.translate.get('GLOBAL.FREQUENCY'),
							field: 'frequency'
						});

						const partValuesLength = UtilsService.flatten(variableDetails.dataGrid.dimensions[0].partition).length;
						const partLength = variableDetails.dataGrid.dimensions[0].partition.length;
						const isMultiDimPartition = partValuesLength !== partLength;
						const defaultGroupIndex = variableDetails.dataGrid.dimensions[0].defaultGroupIndex;

						// If multi dimension array, trash cat is managed at the end of treatment
						if (!isMultiDimPartition) {
							startIter = variableDetails.inputValues.values.indexOf(currentVal);
							if (index === defaultGroupIndex) {
								dimensionLength = variableDetails.inputValues.values.length;
							} else {
								dimensionLength = startIter + variableDetails.dataGrid.dimensions[0].partition[index].length;
							}

						} else {
							startIter = 0;
							dimensionLength = variableDetails.dataGrid.dimensions[0].partition[index].length;
						}

						for (let i = startIter; i < dimensionLength; i++) {
							let currentPartitionInput;
							if (isMultiDimPartition) {
								currentPartitionInput = variableDetails.dataGrid.dimensions[0].partition[index][i];
							} else {
								currentPartitionInput = variableDetails.inputValues.values[i];
							}

							datas[i - startIter] = {};
							datas[i - startIter]['values'] = currentPartitionInput;
							const currentValueIndex: any = variableDetails.inputValues.values.indexOf(currentPartitionInput);
							datas[i - startIter]['frequency'] = variableDetails.inputValues.frequencies[currentValueIndex];
						}

						// trash cat management for multi dim
						if (isMultiDimPartition && index === defaultGroupIndex) {
							const inputValuesLength = variableDetails.inputValues.values.length;
							const unpartitionnedValuesLength = inputValuesLength - partValuesLength;
							if (unpartitionnedValuesLength !== 0) {
								for (let i = partValuesLength; i < inputValuesLength; i++) {
									const currentPartitionInput = variableDetails.inputValues.values[i];
									datas.push({
										values: currentPartitionInput,
										frequency: variableDetails.inputValues.frequencies[i],
									});
								}
							}
						}

						title = this.translate.get('GLOBAL.CURRENT_GROUP');
					}

					if (variableDetails.isLimitedDatas) {
						title += ' ( * ' + this.translate.get('GLOBAL.LIMIT_GRAPH_DATAS_WARNING') + ')';
					}

				}
				this.treePreparationDatas.currentIntervalDatas.title = title;
			}
		}

		return this.treePreparationDatas.currentIntervalDatas;
	}

	getVariablesDatas(): any {
		const appDatas = this.appService.getDatas().datas;
		const currentDatas = appDatas.treePreparationReport.variablesStatistics;
		const currentDetailedDatas = appDatas.treePreparationReport.variablesDetailedStatistics;
		const variableDatas = [];

		if (currentDatas && currentDetailedDatas) {

			for (let i = 0; i < currentDatas.length; i++) {
				const varItem: VariableVO = new VariableVO(currentDatas[i], currentDetailedDatas[currentDatas[i].rank]);
				variableDatas.push(varItem);
			}
		}
		return variableDatas;
	}

	getTargetVariableStatsDatas(): any {
		let variableStatsDatas;

		const appDatas = this.appService.getDatas().datas;
		if (appDatas.treePreparationReport && appDatas.treePreparationReport.summary) {
			variableStatsDatas = {
				datasets: [],
				labels: ['']
			};
			const currentDatas = appDatas.treePreparationReport.summary.targetValues;

			if (currentDatas) {

				for (let i = 0; i < currentDatas.values.length; i++) {
					const currentDataSet = new ChartDatasetVO();

					const graphItem: BarVO = new BarVO();
					graphItem.name = currentDatas.values[i];
					graphItem.value = currentDatas.frequencies[i] * 100 / UtilsService.arraySum(currentDatas.frequencies) / 100;
					graphItem.extra.value = currentDatas.frequencies[i];
					graphItem.extra.percent = currentDatas.frequencies[i] * 100 / UtilsService.arraySum(currentDatas.frequencies);

					currentDataSet.label = graphItem.name;
					currentDataSet.data.push(graphItem.value);
					currentDataSet.extra.push(graphItem);
					variableStatsDatas.datasets.push(currentDataSet);
				}

			}
			if (variableStatsDatas.datasets.length === 0) {
				variableStatsDatas = undefined;
			}
		}
		return variableStatsDatas;
	}

	getTargetVariableStatsInformations(): any {
		const appDatas = this.appService.getDatas().datas;
		let informationsDatas;
		if (appDatas.treePreparationReport.summary.targetDescriptiveStats) {
			informationsDatas = [];
			for (const item in appDatas.treePreparationReport.summary.targetDescriptiveStats) {
				if (item) {
					informationsDatas.push({
						title: item,
						value: appDatas.treePreparationReport.summary.targetDescriptiveStats[item]
					});
				}
			}
		}
		return informationsDatas;
	}

	getTargetVariable(): any {
		const appDatas = this.appService.getDatas().datas;
		return appDatas.treePreparationReport.summary.targetVariable;
	}

	setSelectedNodes(nodes: any, trustedNodeSelection ? ) {
		const selectedNodes = [];
		for (let i = 0; i < nodes.length; i++) {
			const nodeDatas = this.getNodeFromName(nodes[i]);
			if (nodeDatas) {
				const color = this.treePreparationDatas.treeColorsMap[nodeDatas.nodeId];
				// Define the trusted node selection to go to clicked node into hyper tree
				const treeNodeVo = new TreeNodeVO(nodeDatas, this.treePreparationDatas.classesCount, color, nodeDatas.nodeId === trustedNodeSelection);
				selectedNodes.push(treeNodeVo);

				// Save current selected node
				if (trustedNodeSelection && trustedNodeSelection === nodes[i]) {
					this.setSelectedNode(nodeDatas, trustedNodeSelection)
				}
			}
		}

		const diff = UtilsService.deepDiff(this.treePreparationDatas.selectedNodes, selectedNodes);
		if (!this.treePreparationDatas.selectedNodes || !_.isEmpty(diff)) {
			// clone it to emit onchange
			this.treePreparationDatas.selectedNodes = _.cloneDeep(selectedNodes);
		}

	}

	getSelectedNodes(): TreeNodeVO[] {
		return this.treePreparationDatas.selectedNodes;
	}

	getSelectedNode(): TreeNodeVO {
		return this.treePreparationDatas.selectedNode;
	}

	setSelectedNode(node, trustedNodeSelection) {
		const nodeDatas = this.getNodeFromName(node.nodeId);
		const color = this.treePreparationDatas.treeColorsMap[nodeDatas.nodeId];
		// Define the trusted node selection to go to clicked node into hyper tree
		const treeNodeVo = new TreeNodeVO(nodeDatas, this.treePreparationDatas.classesCount, color, nodeDatas.nodeId === trustedNodeSelection);

		const diff = UtilsService.deepDiff(this.treePreparationDatas.selectedNode, treeNodeVo);
		if (!this.treePreparationDatas.selectedNode || !_.isEmpty(diff)) {
			// clone it to emit onchange
			this.treePreparationDatas.selectedNode = _.cloneDeep(treeNodeVo);
		}
	}


	toggleNode(trustedNodeSelection: string) {
		this.toggleNodeIntoDimenstionTree(this.treePreparationDatas.dimensionTree[0], trustedNodeSelection);
	}

	toggleNodeIntoDimenstionTree(node: TreeNodeVO, nodeToFind, parent ? , i ? ) {
		if (node && node.nodeId === nodeToFind) {
			if (parent.children[i].children) {
				parent.children[i].isCollapsed = true;
				parent.children[i].collapsedChildren = parent.children[i].children;
				delete parent.children[i].children;
			} else {
				parent.children[i].isCollapsed = false;
				parent.children[i].children = parent.children[i].collapsedChildren;
				delete parent.children[i].collapsedChildren;
			}

			return true;
		}
		if (node && node.children && node.children.length > 0) {
			for (let i = 0; i < node.children.length; i++) {
				if (node.children[i]) {
					const res = this.toggleNodeIntoDimenstionTree(node.children[i], nodeToFind, node, i);
					if (res) {
						return res;
					}
				}
			}
		}

	}

	getTreeDetails(): GridDatasI {
		const treeDetails: GridDatasI = {
			title: this.translate.get('GLOBAL.NODES_SELECTION_DETAILS') + ' : ' + this.treePreparationDatas.selectedNodes.map(e => e.nodeId).join(', '),
			values: [],
			displayedColumns: []
		};

		if (this.treePreparationDatas.selectedNodes[0]) {
			treeDetails.displayedColumns = [{
					headerName: 'Node Id',
					field: 'nodeId'
				},
				{
					headerName: 'Values',
					field: 'values'
				},
				{
					headerName: 'Frequencies',
					field: 'frequencies'
				}
			];

			for (let i = 0; i < this.treePreparationDatas.selectedNodes.length; i++) {
				const currentNode = this.treePreparationDatas.selectedNodes[i];
				if (currentNode && currentNode.isLeaf) {
					// it's a leaf
					const rowData: any = {
						_id: currentNode.nodeId,
						nodeId: currentNode.nodeId,
						values: JSON.stringify(currentNode.targetValues.values),
						frequencies: JSON.stringify(currentNode.targetValues.frequencies),
					};
					treeDetails.values.push(rowData);
				} else {
					// it's a node
				}

			}
		}

		return treeDetails;

	}

	getTreeLeafRules(): GridDatasI {
		const treeLeafRules: GridDatasI = {
			title: this.translate.get('GLOBAL.LEAF_RULES') + ' : ' + this.treePreparationDatas.selectedNode.nodeId,
			values: [],
			displayedColumns: []
		};

		if (this.treePreparationDatas.selectedNodes[0]) {

			treeLeafRules.displayedColumns = [{
					headerName: 'Variable',
					field: 'variable'
				},
				{
					headerName: 'Type',
					field: 'type'
				},
				{
					headerName: 'Partition',
					field: 'partition'
				}
			];

			// get a hierarchy branch with all recursive parents
			const nodeHierarchy: TreeNodeVO = UtilsService.returnHierarchy(
				_.cloneDeep(this.treePreparationDatas.dimensionTree),
				this.treePreparationDatas.selectedNode.id
			)

			// get obj rules into one array
			let rules: TreeNodeVO[] = [];
			if (nodeHierarchy) {
				rules = this.getRecursiveNodeDatasRules(nodeHierarchy[0], rules);
			}

			// construct the grid
			for (let i = 0; i < rules.length; i++) {
				// Find index of the current node to get correct partition info
				let currentChildrenId = rules[i].children[0].nodeId;
				let partitionIndex = rules[i].childNodes.findIndex((e: TreeNodeVO) => e.nodeId === currentChildrenId);
				let partition: any[] = rules[i].partition[partitionIndex];

				// Limit partition to 10 first elements
				let displayedPartition: string;
				if (partition.length > 10) {
					displayedPartition = partition.slice(0, 10).join(', ') + ' ...';
				} else {
					displayedPartition = partition.join(', ');
				}

				// Add data row
				const rowData: any = {
					_id: rules[i].nodeId,
					variable: rules[i].variable,
					type: rules[i].type,
					partition: '[' + displayedPartition + ']'
				};

				treeLeafRules.values.push(rowData);

			}
		}

		return treeLeafRules;
	}

	getRecursiveNodeDatasRules(node: TreeNodeVO, rules) {
		if (node.children && node.children.length > 0) {
			rules.push(node);
			return this.getRecursiveNodeDatasRules(node.children[0], rules);
		} else {
			return rules;
		}
	}

}
