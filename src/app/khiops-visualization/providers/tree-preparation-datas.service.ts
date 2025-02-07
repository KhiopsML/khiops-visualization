/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import _ from 'lodash'; // Important to import lodash in karma
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { VariableDetailsModel } from '../model/variable-details.model';
import { TreePreparationVariableModel } from '../model/tree-preparation-variable.model';
import { TreeNodeModel } from '../model/tree-node.model';
import { TreePreparationDatasModel } from '../model/tree-preparation-datas.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TYPES } from '@khiops-library/enum/types';
import { PreparationDatasService } from './preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import {
  TreeChildNode,
  TreeDetails,
  TreePreparationVariableStatistic,
} from '@khiops-visualization/interfaces/tree-preparation-report';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { VariableDetail } from '@khiops-visualization/interfaces/app-datas';
import { Observable, take } from 'rxjs';
import { AppState } from '@khiops-visualization/store/app.state';
import { Store } from '@ngrx/store';
import { selectedNodesSelector } from '@khiops-visualization/selectors/app.selector';

@Injectable({
  providedIn: 'root',
})
export class TreePreparationDatasService {
  private treePreparationDatas: TreePreparationDatasModel | undefined;
  selectedNodes$: Observable<TreeNodeModel[]>;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private translate: TranslateService,
    private appService: AppService,
    private store: Store<{ appState: AppState }>,
  ) {
    this.selectedNodes$ = this.store.select(
      (state) => state.appState.selectedNodes,
    );
  }

  /**
   * Initializes the tree preparation data service by loading data from the app service
   * and setting the default selected variable.
   */
  initialize() {
    this.treePreparationDatas = new TreePreparationDatasModel(
      this.appService.appDatas!,
    );

    // select the first item of the list by default
    if (this.treePreparationDatas.isValid()) {
      let defaultVariable: TreePreparationVariableStatistic | undefined =
        this.appService.appDatas?.treePreparationReport.variablesStatistics[0];

      // Check if there is a saved selected variable into json
      const savedSelectedRank = this.appService.getSavedDatas('selectedRank');
      if (savedSelectedRank) {
        defaultVariable = this.preparationDatasService.getVariableFromRank(
          savedSelectedRank,
          REPORT.TREE_PREPARATION_REPORT,
        );
      }

      if (defaultVariable) {
        this.setSelectedVariable(defaultVariable.name);
      }
    }
  }

  /**
   * Returns the current tree preparation data model.
   * @returns {TreePreparationDatasModel | undefined} The current tree preparation data model.
   */
  getDatas(): TreePreparationDatasModel | undefined {
    return this.treePreparationDatas;
  }

  /**
   * Initializes the selected nodes based on the first partition of the selected variable.
   */
  initSelectedNodes() {
    let nodes;
    const variablesDetailedStatistics:
      | { [key: string]: VariableDetail }
      | undefined =
      this.appService.appDatas?.treePreparationReport
        ?.variablesDetailedStatistics;
    if (this.treePreparationDatas?.selectedVariable) {
      const rank: string = this.treePreparationDatas.selectedVariable.rank;
      if (rank && variablesDetailedStatistics![rank]) {
        const dimensions =
          variablesDetailedStatistics![rank].dataGrid.dimensions;
        const firstpartition: any = dimensions[0]?.partition[0];
        nodes = this.setSelectedNodes(firstpartition, firstpartition[0]);
      }
    }
    return nodes;
  }

  /**
   * Recursively finds the first leaf node in the tree starting from the given node.
   * @param {TreeNodeModel} node - The starting node.
   * @returns {TreeNodeModel | undefined} The first leaf node.
   */
  getFirstNodeLeaf(node: TreeNodeModel): TreeNodeModel | undefined {
    if (node.children.length > 0 && node?.children?.[0]?.isLeaf === false) {
      return this.getFirstNodeLeaf(node?.children?.[0]);
    } else {
      return node.children[0];
    }
  }

  /**
   * Retrieves the nodes linked to a specific index.
   * @param {number} index - The index of the node.
   * @returns {string[]} An array containing the linked nodes.
   */
  getNodesLinkedToOneIndex(index: number): string[] {
    let currentValues;
    if (this.treePreparationDatas?.isRegressionAnalysis) {
      const partition =
        this.appService.appDatas?.treePreparationReport
          ?.variablesDetailedStatistics?.[
          this.treePreparationDatas?.selectedVariable?.rank!
        ]?.inputValues?.values;

      // put each element of partition into an array
      currentValues = partition?.map((item) => [item]);
    } else {
      currentValues =
        this.appService.appDatas?.treePreparationReport
          ?.variablesDetailedStatistics?.[
          this.treePreparationDatas?.selectedVariable?.rank!
        ]?.dataGrid?.dimensions[0]?.partition;
    }
    return currentValues![index] as string[];
  }

  /**
   * Retrieves nodes linked to a specific node by its ID.
   * @param {string} id - The ID of the node.
   * @returns {Array} An array containing the dimension index and the linked nodes.
   */
  getNodesLinkedToOneNode(
    id: string,
  ): [number | undefined, string[] | undefined] {
    if (this.treePreparationDatas?.isRegressionAnalysis) {
      // Regression case
      const variablesDetailedStatistics =
        this.appService.appDatas?.treePreparationReport
          ?.variablesDetailedStatistics;

      const rank: string | undefined =
        this.treePreparationDatas?.selectedVariable?.rank;
      const varDetails: VariableDetail | undefined =
        variablesDetailedStatistics?.[rank!];
      const dimensions = varDetails?.inputValues?.values;
      const dimDatasIndex = dimensions?.findIndex((e: string) => e === id) || 0;
      const nodeToSelect = dimensions?.[dimDatasIndex] || '';
      return [dimDatasIndex, [nodeToSelect]];
    } else {
      // Classification case
      const variablesDetailedStatistics =
        this.appService.appDatas?.treePreparationReport
          ?.variablesDetailedStatistics;

      const rank: string | undefined =
        this.treePreparationDatas?.selectedVariable?.rank;
      const varDetails: VariableDetail | undefined =
        variablesDetailedStatistics?.[rank!];
      const dimensions = varDetails?.dataGrid?.dimensions;
      const dimIndex = dimensions?.findIndex(
        (e: any) =>
          e.variable === this.treePreparationDatas?.selectedVariable?.name,
      );
      // @ts-ignore
      const dimDatas: string[][] = dimensions[dimIndex].partition; // in case of tree, partition is never a number
      const dimDatasIndex = dimDatas.findIndex((e: any) => e.includes(id));
      return [dimDatasIndex, dimDatas[dimDatasIndex]];
    }
  }

  /**
   * Sets the selected variable and initializes related data.
   * @returns {TreePreparationVariableModel | undefined} The selected variable.
   */
  setSelectedVariable(name: string): TreePreparationVariableModel | undefined {
    if (this.treePreparationDatas && name) {
      const variable: TreePreparationVariableStatistic =
        this.preparationDatasService.getVariableFromName(
          name,
          REPORT.TREE_PREPARATION_REPORT,
        );
      if (variable) {
        // Init selected variable and construct tree
        this.treePreparationDatas.selectedVariable =
          new TreePreparationVariableModel(variable, variable.name);
        this.setSelectedFlattenTree(variable.rank);
        this.computeNodesFreqsComparedToOthers();
        this.treePreparationDatas.computeRegressionClassesCount();
        this.treePreparationDatas.computeTreeColorsMap();
        this.treePreparationDatas.computeTreePartTargetFrequencies();
        this.constructDimensionTree();
        return this.treePreparationDatas.selectedVariable;
      }
    }
    return undefined;
  }

  /**
   * Sets the selected flattened tree based on the given rank.
   * @param {string} rank - The rank of the variable.
   */
  setSelectedFlattenTree(rank: string) {
    const treeDatas: TreeDetails | undefined =
      this.appService.appDatas?.treePreparationReport?.treeDetails;
    if (treeDatas?.[rank]?.treeNodes) {
      const flattenTree: TreeChildNode[] = UtilsService.flattenTree(
        [],
        _.cloneDeep(treeDatas[rank].treeNodes),
      );
      this.treePreparationDatas!.selectedFlattenTree = flattenTree;
    }
  }

  /**
   * Constructs the dimension tree for the selected variable.
   * It clones the tree nodes from the application data and formats them.
   */
  constructDimensionTree() {
    const treeDatas: TreeDetails | undefined =
      this.appService.appDatas?.treePreparationReport?.treeDetails;
    const currentRank = this.getSelectedVariableRank();
    if (currentRank && treeDatas?.[currentRank]) {
      const nodeDatas = treeDatas[currentRank].treeNodes;
      const currentDimTree: TreeNodeModel = new TreeNodeModel(
        nodeDatas,
        this.treePreparationDatas,
      );
      this.treePreparationDatas!.dimensionTree = _.cloneDeep([currentDimTree]);
    }
  }

  /**
   * Computes the frequencies of nodes compared to others in the tree.
   * It calculates the minimum and maximum frequencies and updates the tree preparation data.
   */
  computeNodesFreqsComparedToOthers() {
    let treeLeafs: (number[] | undefined)[] | undefined =
      this.treePreparationDatas?.selectedFlattenTree?.map(
        (e: TreeChildNode) => e?.targetValues?.frequencies,
      );
    if (treeLeafs) {
      treeLeafs = treeLeafs.filter(function (e) {
        return e !== undefined;
      });
      const treeLeafsSums: number[] =
        UtilsService.sumArrayItemsOfArray(treeLeafs);
      const [minVal, maxVal]: any =
        UtilsService.getMinAndMaxFromArray(treeLeafsSums);
      this.treePreparationDatas!.maxFrequencies = maxVal;
      this.treePreparationDatas!.minFrequencies = minVal;
    }
  }

  /**
   * Retrieves the selected variable from the tree preparation data.
   * @returns {TreePreparationVariableModel | undefined} The selected variable.
   */
  getSelectedVariable(): TreePreparationVariableModel | undefined {
    return this.treePreparationDatas?.selectedVariable;
  }

  /**
   * Retrieves the rank of the selected variable.
   * @returns {string} The rank of the selected variable.
   */
  getSelectedVariableRank(): string | undefined {
    return this.treePreparationDatas?.selectedVariable?.rank;
  }

  /**
   * Retrieves a tree node by its name from the selected flattened tree.
   * @param {string} name - The name of the node.
   * @returns {TreeNodeModel | undefined} The tree node with the given name.
   */
  getNodeFromName(name: string): TreeChildNode | undefined {
    let node: TreeChildNode | undefined;
    if (this.treePreparationDatas?.selectedFlattenTree) {
      node = this.treePreparationDatas.selectedFlattenTree.find(
        (e) => e.nodeId === name,
      );
    }
    return node;
  }

  /**
   * Retrieves the current interval data for the selected variable.
   * This method constructs a grid data object containing the interval or group data
   * for the selected variable based on its type (numerical or categorical).
   *
   * @param {number} [index=0] - The index of the interval or group to retrieve. Defaults to 0.
   * @returns {GridDatasI} The grid data object containing the interval or group data.
   */
  getCurrentIntervalDatas(index?: number): GridDatasI | undefined {
    index = index || 0;

    const datas: DynamicI = [];
    let title = '';
    const displayedColumns: any[] = [];

    // init the object
    this.treePreparationDatas!.currentIntervalDatas = {
      title: title,
      values: datas,
      displayedColumns: displayedColumns,
    };

    if (index !== -1) {
      // otherwise it's a node selection

      if (
        this.appService.appDatas?.treePreparationReport
          ?.variablesDetailedStatistics
      ) {
        const currentVar =
          this.appService.appDatas.treePreparationReport
            .variablesDetailedStatistics[
            this.treePreparationDatas?.selectedVariable?.rank!
          ];
        if (currentVar) {
          const variableDetails: VariableDetailsModel =
            new VariableDetailsModel(currentVar);

          if (variableDetails?.dataGrid) {
            const currentVariableType =
              variableDetails.dataGrid.dimensions[0]?.type;

            if (currentVariableType === TYPES.NUMERICAL) {
              displayedColumns.push({
                headerName:
                  this.translate.get('GLOBAL.INTERVAL_OF') +
                  variableDetails.dataGrid.dimensions[0]?.variable,
                field: 'interval',
              });

              // init datas array
              datas[0] = {};
              if (
                variableDetails.dataGrid.dimensions[0]!.partition[index]!
                  .length > 0
              ) {
                datas[0]['interval'] = JSON.stringify(
                  variableDetails.dataGrid.dimensions[0]?.partition[index],
                );
              } else {
                datas[0]['interval'] = this.translate.get('GLOBAL.MISSING');
              }

              title = this.translate.get('GLOBAL.CURRENT_INTERVAL');
            } else if (currentVariableType === TYPES.CATEGORICAL) {
              let dimensionLength = 0;
              let startIter = 0;

              const currentVal: any =
                variableDetails.dataGrid.dimensions[0]?.partition[index]?.[0];

              displayedColumns.push({
                headerName:
                  this.translate.get('GLOBAL.VALUES_OF') +
                  variableDetails.dataGrid.dimensions[0]?.variable,
                field: 'values',
              });
              displayedColumns.push({
                headerName: this.translate.get('GLOBAL.FREQUENCY'),
                field: 'frequency',
              });

              const partValuesLength = UtilsService.flatten(
                variableDetails.dataGrid.dimensions[0]?.partition!,
              ).length;
              const partLength =
                variableDetails.dataGrid.dimensions[0]?.partition.length;
              const isMultiDimPartition = partValuesLength !== partLength;
              const defaultGroupIndex =
                variableDetails.dataGrid.dimensions[0]?.defaultGroupIndex;

              // If multi dimension array, trash cat is managed at the end of treatment
              if (!isMultiDimPartition) {
                startIter =
                  variableDetails.inputValues.values.indexOf(currentVal);
                if (index === defaultGroupIndex) {
                  dimensionLength = variableDetails.inputValues.values.length;
                } else {
                  dimensionLength =
                    startIter +
                    variableDetails.dataGrid.dimensions[0]!.partition[index]!
                      .length;
                }
              } else {
                startIter = 0;
                dimensionLength =
                  variableDetails.dataGrid.dimensions[0]?.partition[index]
                    ?.length || 0;
              }

              for (let i = startIter; i < dimensionLength; i++) {
                let currentPartitionInput;
                if (isMultiDimPartition) {
                  currentPartitionInput =
                    variableDetails.dataGrid.dimensions[0]?.partition[index]?.[
                      i
                    ];
                } else {
                  currentPartitionInput = variableDetails.inputValues.values[i];
                }

                datas[i - startIter] = {};
                datas[i - startIter]['values'] = currentPartitionInput;
                const currentValueIndex: number =
                  variableDetails.inputValues.values.indexOf(
                    currentPartitionInput as string,
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
        }

        this.treePreparationDatas!.currentIntervalDatas.title = title;
      }
    }

    return this.treePreparationDatas?.currentIntervalDatas;
  }

  /**
   * Sets the selected nodes based on the provided node IDs and optionally a trusted node selection.
   * @param {string[]} nodes - The array of node IDs to be selected.
   * @param {string} [trustedNodeSelection] - The ID of the trusted node selection.
   */
  setSelectedNodes(nodes: string[], trustedNodeSelection?: string) {
    const selectedNodes: TreeNodeModel[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const nodeDatas: TreeChildNode | undefined = this.getNodeFromName(
        nodes[i]!,
      );
      if (nodeDatas) {
        // Define the trusted node selection to go to clicked node into hyper tree
        const treeNodeVo = new TreeNodeModel(
          nodeDatas,
          this.treePreparationDatas,
          nodeDatas.nodeId === trustedNodeSelection,
        );
        selectedNodes.push(treeNodeVo);
      }
    }
    return selectedNodes;
  }

  /**
   * Sets the selected node based on the provided node and trusted node selection.
   * @param {TreeNodeModel} node - The node to be selected.
   * @param {string | boolean} trustedNodeSelection - The trusted node selection.
   */
  setSelectedNode(node: TreeNodeModel, trustedNodeSelection: string | boolean) {
    let selectedNode;
    if (this.treePreparationDatas) {
      const nodeDatas = this.getNodeFromName(node.nodeId);
      if (nodeDatas) {
        // Define the trusted node selection to go to clicked node into hyper tree
        selectedNode = new TreeNodeModel(
          nodeDatas,
          this.treePreparationDatas,
          nodeDatas && nodeDatas.nodeId === trustedNodeSelection,
        );
      }
    }
    return selectedNode;
  }

  /**
   * Retrieves the details of the selected tree nodes.
   * Constructs a grid data object containing the node ID, values, and frequencies.
   * @returns {GridDatasI} The grid data object containing the details of the selected tree nodes.
   */
  getTreeDetails(selectedNodes: TreeNodeModel[]): GridDatasI {
    const treeDetails: GridDatasI = {
      title:
        this.translate.get('GLOBAL.NODES_SELECTION_DETAILS') +
        ' : ' +
        selectedNodes?.map((e) => e.nodeId).join(', '),
      values: [],
      displayedColumns: [],
    };

    if (selectedNodes?.[0]) {
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

      for (let i = 0; i < selectedNodes?.length; i++) {
        const currentNode = selectedNodes[i];
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

  /**
   * Retrieves the rules for the selected tree leaf node.
   * Constructs a grid data object containing the variable, type, and partition information.
   * @returns {GridDatasI} The grid data object containing the rules for the selected tree leaf node.
   */
  getTreeLeafRules(currentNode: TreeNodeModel): GridDatasI {
    const treeLeafRules: GridDatasI = {
      title:
        this.translate.get('GLOBAL.LEAF_RULES') + ' : ' + currentNode?.nodeId,
      values: [],
      displayedColumns: [],
    };

    // Take selected nodes from app store with selector
    let selectedNodes: TreeNodeModel[] = [];
    this.store
      .select(selectedNodesSelector)
      .pipe(take(1))
      .subscribe((nodes) => (selectedNodes = nodes));

    if (selectedNodes?.[0]) {
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
        _.cloneDeep(this.treePreparationDatas?.dimensionTree)!,
        currentNode?.id!,
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
              (e: TreeChildNode) => e.nodeId === currentChildrenId,
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

  /**
   * Recursively retrieves the rules for a given node and its children.
   * @param {TreeNodeModel | undefined} node - The node to retrieve rules for.
   * @param {TreeNodeModel[]} rules - The array to store the rules.
   * @returns {TreeNodeModel[] | undefined} The array of rules.
   */
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
