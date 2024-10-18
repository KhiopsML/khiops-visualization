import { Injectable } from '@angular/core';
import _ from 'lodash'; // Important to import lodash in karma
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { VariableDetailsVO } from '../model/variableDetails-vo';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { TreePreparationVariableVO } from '../model/tree-preparation-variable-vo';
import { TreeNodeModel } from '../model/tree-node-vo';
import { TreePreparationDatasVO } from '../model/tree-preparation-datas-vo';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TYPES } from '@khiops-library/enum/types';
import { PreparationDatasService } from './preparation-datas.service';

@Injectable({
  providedIn: 'root',
})
export class TreePreparationDatasService {
  treePreparationDatas: TreePreparationDatasVO | undefined;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private translate: TranslateService,
    private khiopsLibraryService: KhiopsLibraryService,
    private appService: AppService,
  ) {}

  initialize() {
    const appDatas = this.appService.getDatas().datas;
    this.treePreparationDatas = new TreePreparationDatasVO(appDatas);

    // select the first item of the list by default
    if (this.treePreparationDatas.isValid()) {
      let defaultVariable =
        appDatas.treePreparationReport.variablesStatistics[0];

      // Check if there is a saved selected variable into json
      const savedSelectedRank = this.appService.getSavedDatas('selectedRank');
      if (savedSelectedRank) {
        defaultVariable = this.preparationDatasService.getVariableFromRank(
          savedSelectedRank,
          'treePreparationReport',
        );
      }

      this.setSelectedVariable(defaultVariable);
    }
  }

  getDatas(): TreePreparationDatasVO | undefined {
    return this.treePreparationDatas;
  }

  initSelectedNodes() {
    const appDatas = this.appService.getDatas().datas;
    const variablesDetailedStatistics =
      appDatas?.treePreparationReport?.variablesDetailedStatistics;
    if (this.treePreparationDatas?.selectedVariable) {
      const dimensions =
        variablesDetailedStatistics[
          this.treePreparationDatas.selectedVariable.rank
        ].dataGrid.dimensions;
      const firstpartition = dimensions[0].partition[0];
      this.setSelectedNodes(firstpartition, firstpartition[0]);
    }
  }

  getFirstNodeLeaf(node: TreeNodeModel): TreeNodeModel | undefined {
    if (node.children.length > 0 && node?.children?.[0]?.isLeaf === false) {
      return this.getFirstNodeLeaf(node?.children?.[0]);
    } else {
      return node.children[0];
    }
  }

  getNodesLinkedToOneNode(id: string) {
    const appDatas = this.appService.getDatas().datas;
    const variablesDetailedStatistics =
      appDatas?.treePreparationReport?.variablesDetailedStatistics;

    const dimensions =
      variablesDetailedStatistics[
        this.treePreparationDatas.selectedVariable.rank
      ].dataGrid.dimensions;
    const dimIndex = dimensions.findIndex(
      (e: any) =>
        e.variable === this.treePreparationDatas.selectedVariable.name,
    );
    const dimDatas = dimensions[dimIndex].partition;
    const dimDatasIndex = dimDatas.findIndex((e: any) => e.includes(id));
    return [dimDatasIndex, dimDatas[dimDatasIndex]];
  }

  setSelectedVariable(
    object: TreePreparationVariableVO,
  ): TreePreparationVariableVO | undefined {
    if (this.treePreparationDatas && object) {
      const variable = this.preparationDatasService.getVariableFromName(
        object.name,
        'treePreparationReport',
      );
      if (variable) {
        // Init datas
        this.treePreparationDatas.selectedNodes = undefined;
        this.treePreparationDatas.selectedNode = undefined;

        // Init selected variable and construct tree
        this.treePreparationDatas.selectedVariable =
          new TreePreparationVariableVO(variable, variable.name);
        this.setSelectedFlattenTree(object.rank);
        this.computeNodesFreqsComparedToOthers();
        this.treePreparationDatas.computeTreeColorsMap();
        this.constructDimensionTree();
        return this.treePreparationDatas.selectedVariable;
      }
    }
    return undefined;
  }

  setSelectedFlattenTree(rank: string) {
    const appDatas = this.appService.getDatas().datas;
    const treeDatas = appDatas?.treePreparationReport?.treeDetails;
    if (treeDatas?.[rank]?.treeNodes) {
      const flattenTree = UtilsService.flattenTree(
        [],
        _.cloneDeep(treeDatas[rank].treeNodes),
      );
      this.treePreparationDatas.selectedFlattenTree = flattenTree;
    }
  }

  constructDimensionTree() {
    const appDatas = this.appService.getDatas().datas;
    const treeDatas = appDatas?.treePreparationReport?.treeDetails;
    const currentRank = this.getSelectedVariableRank();
    if (currentRank && treeDatas?.[currentRank]) {
      this.treePreparationDatas.dimensionTree = _.cloneDeep([
        treeDatas[currentRank].treeNodes,
      ]);
      this.treePreparationDatas.dimensionTree[0] = this.formatTreeNodesDatas(
        this.treePreparationDatas.dimensionTree[0],
      );
    }
  }

  computeNodesFreqsComparedToOthers() {
    let treeLeafs: any = this.treePreparationDatas?.selectedFlattenTree?.map(
      (e) => e?.targetValues?.frequencies,
    );
    if (treeLeafs) {
      treeLeafs = treeLeafs.filter(function (e) {
        return e !== undefined;
      });
      treeLeafs = UtilsService.sumArrayItemsOfArray(treeLeafs);
      const [minVal, maxVal]: any =
        UtilsService.getMinAndMaxFromArray(treeLeafs);
      this.treePreparationDatas.maxFrequencies = maxVal;
      this.treePreparationDatas.minFrequencies = minVal;
    }
  }

  formatTreeNodesDatas(item: TreeNodeModel) {
    const color = this.treePreparationDatas?.treeColorsMap[item.nodeId];
    item = new TreeNodeModel(item, this.treePreparationDatas?.classesCount, color);

    if (item?.children) {
      for (let i = 0; i < item.children.length; i++) {
        item.children[i] = this.formatTreeNodesDatas(item.children[i]);
      }
    }
    return item;
  }

  getSelectedVariable(): TreePreparationVariableVO | undefined {
    return this.treePreparationDatas.selectedVariable;
  }

  getSelectedVariableRank(): string {
    return this.treePreparationDatas.selectedVariable.rank;
  }

  getNodeFromName(name: string): TreeNodeModel | undefined {
    let node: TreeNodeModel | undefined;
    if (this.treePreparationDatas?.selectedFlattenTree) {
      node = this.treePreparationDatas.selectedFlattenTree.find(
        (e) => e.nodeId === name,
      );
    }
    return node;
  }

  getCurrentIntervalDatas(index?: number): GridDatasI {
    index = index || 0;

    const datas: any[] = [];
    let title = '';
    const displayedColumns: any[] = [];

    // init the object
    this.treePreparationDatas.currentIntervalDatas = {
      title: title,
      values: datas,
      displayedColumns: displayedColumns,
    };

    if (index !== -1) {
      // otherwise it's a node selection

      const appDatas = this.appService.getDatas().datas;
      if (appDatas?.treePreparationReport?.variablesDetailedStatistics) {
        const currentVar =
          appDatas.treePreparationReport.variablesDetailedStatistics[
            this.treePreparationDatas.selectedVariable.rank
          ];
        const variableDetails: VariableDetailsVO = new VariableDetailsVO(
          currentVar,
          this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE,
        );

        if (variableDetails?.dataGrid) {
          const currentVariableType =
            variableDetails.dataGrid.dimensions[0].type;

          if (currentVariableType === TYPES.NUMERICAL) {
            displayedColumns.push({
              headerName:
                this.translate.get('GLOBAL.INTERVAL_OF') +
                variableDetails.dataGrid.dimensions[0].variable,
              field: 'interval',
            });

            // init datas array
            datas[0] = {};
            if (
              variableDetails.dataGrid.dimensions[0].partition[index].length > 0
            ) {
              datas[0]['interval'] = JSON.stringify(
                variableDetails.dataGrid.dimensions[0].partition[index],
              );
            } else {
              datas[0]['interval'] = this.translate.get('GLOBAL.MISSING');
            }

            title = this.translate.get('GLOBAL.CURRENT_INTERVAL');
          } else if (currentVariableType === TYPES.CATEGORICAL) {
            let dimensionLength = 0;
            let startIter = 0;

            const currentVal: any =
              variableDetails.dataGrid.dimensions[0].partition[index][0];

            displayedColumns.push({
              headerName:
                this.translate.get('GLOBAL.VALUES_OF') +
                variableDetails.dataGrid.dimensions[0].variable,
              field: 'values',
            });
            displayedColumns.push({
              headerName: this.translate.get('GLOBAL.FREQUENCY'),
              field: 'frequency',
            });

            const partValuesLength = UtilsService.flatten(
              variableDetails.dataGrid.dimensions[0].partition,
            ).length;
            const partLength =
              variableDetails.dataGrid.dimensions[0].partition.length;
            const isMultiDimPartition = partValuesLength !== partLength;
            const defaultGroupIndex =
              variableDetails.dataGrid.dimensions[0].defaultGroupIndex;

            // If multi dimension array, trash cat is managed at the end of treatment
            if (!isMultiDimPartition) {
              startIter =
                variableDetails.inputValues.values.indexOf(currentVal);
              if (index === defaultGroupIndex) {
                dimensionLength = variableDetails.inputValues.values.length;
              } else {
                dimensionLength =
                  startIter +
                  variableDetails.dataGrid.dimensions[0].partition[index]
                    .length;
              }
            } else {
              startIter = 0;
              dimensionLength =
                variableDetails.dataGrid.dimensions[0].partition[index].length;
            }

            for (let i = startIter; i < dimensionLength; i++) {
              let currentPartitionInput;
              if (isMultiDimPartition) {
                currentPartitionInput =
                  variableDetails.dataGrid.dimensions[0].partition[index][i];
              } else {
                currentPartitionInput = variableDetails.inputValues.values[i];
              }

              datas[i - startIter] = {};
              datas[i - startIter]['values'] = currentPartitionInput;
              const currentValueIndex: number =
                variableDetails.inputValues.values.indexOf(
                  currentPartitionInput,
                );
              datas[i - startIter]['frequency'] =
                variableDetails.inputValues.frequencies[currentValueIndex];
            }

            // trash cat management for multi dim
            if (isMultiDimPartition && index === defaultGroupIndex) {
              const inputValuesLength =
                variableDetails.inputValues.values.length;
              const unpartitionnedValuesLength =
                inputValuesLength - partValuesLength;
              if (unpartitionnedValuesLength !== 0) {
                for (let i = partValuesLength; i < inputValuesLength; i++) {
                  const currentPartitionInput =
                    variableDetails.inputValues.values[i];
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
            title +=
              ' ( * ' +
              this.translate.get('GLOBAL.LIMIT_GRAPH_DATAS_WARNING') +
              ')';
          }
        }
        this.treePreparationDatas.currentIntervalDatas.title = title;
      }
    }

    return this.treePreparationDatas.currentIntervalDatas;
  }

  setSelectedNodes(nodes: string[], trustedNodeSelection?: string) {
    const selectedNodes: TreeNodeModel[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const nodeDatas = this.getNodeFromName(nodes[i]);
      if (nodeDatas) {
        const color =
          this.treePreparationDatas?.treeColorsMap[nodeDatas.nodeId];
        // Define the trusted node selection to go to clicked node into hyper tree
        const treeNodeVo = new TreeNodeModel(
          nodeDatas,
          this.treePreparationDatas.classesCount,
          color,
          nodeDatas.nodeId === trustedNodeSelection,
        );
        selectedNodes.push(treeNodeVo);

        // Save current selected node
        if (trustedNodeSelection && trustedNodeSelection === nodes[i]) {
          this.setSelectedNode(nodeDatas, trustedNodeSelection);
        }
      }
    }

    const diff = UtilsService.deepDiff(
      this.treePreparationDatas?.selectedNodes,
      selectedNodes,
    );
    if (!this.treePreparationDatas.selectedNodes || !_.isEmpty(diff)) {
      // clone it to emit onchange
      this.treePreparationDatas.selectedNodes = _.cloneDeep(selectedNodes);
    }
  }

  getSelectedNodes(): TreeNodeModel[] | undefined {
    return this.treePreparationDatas?.selectedNodes;
  }

  getSelectedNode(): TreeNodeModel | undefined {
    return this.treePreparationDatas?.selectedNode;
  }

  setSelectedNode(node: TreeNodeModel, trustedNodeSelection: string | boolean) {
    if (this.treePreparationDatas) {
      const nodeDatas = this.getNodeFromName(node.nodeId);
      const color = this.treePreparationDatas?.treeColorsMap[nodeDatas.nodeId];
      // Define the trusted node selection to go to clicked node into hyper tree
      const treeNodeVo = new TreeNodeModel(
        nodeDatas,
        this.treePreparationDatas.classesCount,
        color,
        nodeDatas && nodeDatas.nodeId === trustedNodeSelection,
      );

      const diff = UtilsService.deepDiff(
        this.treePreparationDatas.selectedNode,
        treeNodeVo,
      );
      if (!this.treePreparationDatas.selectedNode || !_.isEmpty(diff)) {
        // clone it to emit onchange
        this.treePreparationDatas.selectedNode = _.cloneDeep(treeNodeVo);
      }
    }
  }

  getTreeDetails(): GridDatasI {
    const treeDetails: GridDatasI = {
      title:
        this.translate.get('GLOBAL.NODES_SELECTION_DETAILS') +
        ' : ' +
        this.treePreparationDatas?.selectedNodes
          ?.map((e) => e.nodeId)
          .join(', '),
      values: [],
      displayedColumns: [],
    };

    if (this.treePreparationDatas?.selectedNodes?.[0]) {
      treeDetails.displayedColumns = [
        {
          headerName: this.translate.get('GLOBAL.NODE_ID'),
          field: 'nodeId',
        },
        {
          headerName: this.translate.get('GLOBAL.VALUES'),
          field: 'values',
        },
        {
          headerName: this.translate.get('GLOBAL.FREQUENCIES'),
          field: 'frequencies',
        },
      ];

      for (
        let i = 0;
        i < this.treePreparationDatas?.selectedNodes?.length;
        i++
      ) {
        const currentNode = this.treePreparationDatas?.selectedNodes[i];
        if (currentNode?.isLeaf) {
          // it's a leaf
          const rowData: any = {
            _id: currentNode.nodeId,
            nodeId: currentNode.nodeId,
            values: JSON.stringify(currentNode.targetValues.values),
            frequencies: JSON.stringify(currentNode.targetValues.frequencies),
          };
          treeDetails.values?.push(rowData);
        } else {
          // it's a node
        }
      }
    }

    return treeDetails;
  }

  getTreeLeafRules(): GridDatasI {
    const treeLeafRules: GridDatasI = {
      title:
        this.translate.get('GLOBAL.LEAF_RULES') +
        ' : ' +
        this.treePreparationDatas?.selectedNode?.nodeId,
      values: [],
      displayedColumns: [],
    };

    if (this.treePreparationDatas?.selectedNodes?.[0]) {
      treeLeafRules.displayedColumns = [
        {
          headerName: this.translate.get('GLOBAL.VARIABLE'),
          field: 'variable',
        },
        {
          headerName: this.translate.get('GLOBAL.TYPE'),
          field: 'type',
        },
        {
          headerName: this.translate.get('GLOBAL.PARTITION'),
          field: 'partition',
        },
      ];

      // get a hierarchy branch with all recursive parents
      const nodeHierarchy: TreeNodeModel[] = UtilsService.returnHierarchy(
        _.cloneDeep(this.treePreparationDatas.dimensionTree),
        this.treePreparationDatas.selectedNode.id,
      );

      // get obj rules into one array
      let rules: TreeNodeModel[] | undefined = [];
      if (nodeHierarchy) {
        rules = this.getRecursiveNodeDatasRules(nodeHierarchy[0], rules);
      }

      if (rules) {
        // construct the grid
        for (let i = 0; i < rules.length; i++) {
          let rule = rules[i];
          if (rule) {
            // Find index of the current node to get correct partition info
            let currentChildrenId = rule?.children?.[0]?.nodeId;
            let partitionIndex = rule.childNodes.findIndex(
              (e: TreeNodeModel) => e.nodeId === currentChildrenId,
            );
            let partition: any = rule.partition[partitionIndex];

            // Limit partition to 10 first elements
            let displayedPartition: string;
            if (partition.length > 10) {
              displayedPartition = partition.slice(0, 10).join(', ') + ' ...';
            } else {
              displayedPartition = partition.join(', ');
            }

            // Add data row
            const rowData: any = {
              _id: rule.nodeId,
              variable: rule.variable,
              type: rule.type,
              partition: '[' + displayedPartition + ']',
            };

            treeLeafRules?.values?.push(rowData);
          }
        }
      }
    }

    return treeLeafRules;
  }

  getRecursiveNodeDatasRules(
    node: TreeNodeModel | undefined,
    rules: TreeNodeModel[],
  ): TreeNodeModel[] | undefined {
    if (node?.children && node.children.length > 0) {
      rules.push(node);
      return this.getRecursiveNodeDatasRules(node.children[0], rules);
    } else {
      return rules;
    }
  }
}
