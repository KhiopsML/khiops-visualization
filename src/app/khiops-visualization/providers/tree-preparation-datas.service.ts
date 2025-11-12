/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import cloneDeep from 'lodash-es/cloneDeep';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TreePreparationVariableModel } from '../model/tree-preparation-variable.model';
import { TreeNodeModel } from '../model/tree-node.model';
import { TREE_COLORS } from '@khiops-visualization/config/colors';
import {
  TreePreparationDatasModel,
  TreePreparationState,
} from '../model/tree-preparation-datas.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { PreparationDatasService } from './preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import {
  TreeChildNode,
  TreeDetails,
  TreePreparationVariableStatistic,
} from '@khiops-visualization/interfaces/tree-preparation-report';
import { VariableDetail } from '@khiops-visualization/interfaces/app-datas';
import { Observable, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectedNodesSelector } from '@khiops-visualization/selectors/tree-preparation.selector';
import { TASKS } from '@khiops-library/enum/tasks';

@Injectable({
  providedIn: 'root',
})
export class TreePreparationDatasService {
  private treePreparationDatas: TreePreparationDatasModel =
    new TreePreparationDatasModel();
  selectedNodes$: Observable<TreeNodeModel[]>;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private translate: TranslateService,
    private appService: AppService,
    private store: Store<{ TreePreparationState: TreePreparationState }>,
  ) {
    this.selectedNodes$ = this.store.select(selectedNodesSelector);
  }

  /**
   * Initializes the tree preparation data service by loading data from the app service
   * and setting the default selected variable.
   */
  initialize() {
    this.treePreparationDatas = new TreePreparationDatasModel();

    // select the first item of the list by default
    if (this.isValid()) {
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
    // const savedSelectedNodes = this.appService.getSavedDatas('selectedNodes');
    // Todo init nodes from json if exists

    let nodes;
    const variablesDetailedStatistics:
      | { [key: string]: VariableDetail }
      | undefined =
      this.appService.appDatas?.treePreparationReport
        ?.variablesDetailedStatistics;
    if (this.treePreparationDatas?.selectedVariable) {
      const rank: string = this.treePreparationDatas.selectedVariable.rank;
      if (rank && variablesDetailedStatistics?.[rank]) {
        const dimensions =
          variablesDetailedStatistics[rank].dataGrid.dimensions;
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
          this.treePreparationDatas?.selectedVariable?.rank || ''
        ]?.inputValues?.values;

      // put each element of partition into an array
      currentValues = partition?.map((item) => [item]);
    } else {
      currentValues =
        this.appService.appDatas?.treePreparationReport
          ?.variablesDetailedStatistics?.[
          this.treePreparationDatas?.selectedVariable?.rank || ''
        ]?.dataGrid?.dimensions[0]?.partition;
    }
    return currentValues?.[index] as string[];
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
        variablesDetailedStatistics?.[rank || ''];
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
        variablesDetailedStatistics?.[rank || ''];
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
        this.computeRegressionClassesCount();
        this.computeTreeColorsMap();
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
        cloneDeep(treeDatas[rank].treeNodes),
      );
      this.treePreparationDatas.selectedFlattenTree = flattenTree;
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
      this.treePreparationDatas.dimensionTree = cloneDeep([currentDimTree]);
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
      if (this.treePreparationDatas) {
        this.treePreparationDatas.maxFrequencies = maxVal;
        this.treePreparationDatas.minFrequencies = minVal;
      }
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
   * Sets the selected nodes based on the provided node IDs and optionally a trusted node selection.
   * @param {string[]} nodes - The array of node IDs to be selected.
   * @param {string} [trustedNodeSelection] - The ID of the trusted node selection.
   */
  setSelectedNodes(nodes: string[], trustedNodeSelection?: string) {
    const selectedNodes: TreeNodeModel[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const nodeDatas: TreeChildNode | undefined = this.getNodeFromName(
        nodes[i] || '',
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
   * Converts regression target interval IDs (I0, I1, I2...) to actual interval values.
   * @param {string[]} intervalIds - Array of interval IDs like ["I0", "I1"]
   * @returns {string[]} Array of formatted interval strings
   */
  convertIntervalIdsToValues(intervalIds: string[]): string[] {
    if (!this.treePreparationDatas?.isRegressionAnalysis) {
      return intervalIds; // Return as-is for classification
    }

    const treeDatas =
      this.appService.appDatas?.treePreparationReport?.treeDetails;
    const currentRank = this.getSelectedVariableRank();

    if (!currentRank || !treeDatas?.[currentRank]?.targetPartition) {
      return intervalIds; // Return as-is if no target partition found
    }

    const targetPartition = treeDatas[currentRank].targetPartition;
    const intervals = targetPartition.partition;

    return intervalIds.map((id) => {
      // Extract index from ID (I0 -> 0, I1 -> 1, etc.)
      const match = id.match(/I(\d+)/);
      if (match && match[1] && intervals) {
        const index = parseInt(match[1]);
        const interval = intervals[index];
        if (interval && interval.length === 2) {
          return `[${interval[0]}, ${interval[1]}]`;
        }
      }
      return id; // Return original if conversion fails
    });
  }

  /**
   * Gets formatted target values for display (converts I0, I1... to intervals in regression).
   * @param {TreeNodeModel} node - The tree node
   * @returns {string[]} Array of formatted target values
   */
  getFormattedTargetValues(node: TreeNodeModel): string[] {
    if (!node?.targetValues?.values) {
      return [];
    }
    return this.convertIntervalIdsToValues(node.targetValues.values);
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
          const displayValues = this.treePreparationDatas?.isRegressionAnalysis // Regression case
            ? this.convertIntervalIdsToValues(currentNode.targetValues.values)
            : currentNode.targetValues.values;

          const rowData: any = {
            _id: currentNode.nodeId,
            nodeId: currentNode.nodeId,
            values: '[' + displayValues.join(', ') + ']',
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
        cloneDeep(this.treePreparationDatas?.dimensionTree) || [],
        currentNode?.id || '',
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

  /**
   * Checks if the tree data is valid
   */
  isValid(): boolean {
    return !!this.appService.appDatas?.treePreparationReport
      ?.variablesStatistics?.[0];
  }

  /**
   * Computes whether the analysis is a regression and the number of classes.
   */
  computeRegressionClassesCount() {
    if (!this.treePreparationDatas) return;
    const appDatas = this.appService.appDatas;
    this.treePreparationDatas.isRegressionAnalysis =
      appDatas?.treePreparationReport?.summary?.learningTask ===
      TASKS.REGRESSION;
    if (
      this.treePreparationDatas.isRegressionAnalysis &&
      this.treePreparationDatas.selectedVariable
    ) {
      const details =
        appDatas?.treePreparationReport?.variablesDetailedStatistics?.[
          this.treePreparationDatas.selectedVariable.rank
        ];
      this.treePreparationDatas.classesCount =
        details?.inputValues?.values.length || 0;
    } else {
      this.treePreparationDatas.classesCount =
        appDatas?.treePreparationReport?.summary?.targetValues?.values
          ?.length || 0;
    }
  }

  /**
   * Compute the color map for the tree based on the selected variable's data.
   * It uses a predefined set of colors and assigns them to the partitions of the selected variable.
   * The color map is stored in the `treeColorsMap` property.
   *
   * @returns The computed tree color map or undefined if no variable is selected.
   */
  computeTreeColorsMap() {
    if (!this.treePreparationDatas?.selectedVariable) return;
    const appDatas = this.appService.appDatas;

    if (this.treePreparationDatas.isRegressionAnalysis) {
      this.treePreparationDatas.treeColorsMap = {};
      const details =
        appDatas?.treePreparationReport?.variablesDetailedStatistics;
      const values =
        details?.[this.treePreparationDatas.selectedVariable.rank]?.inputValues
          ?.values;
      if (values) {
        for (let i = 0; i < values.length; i++) {
          this.treePreparationDatas.treeColorsMap[values[i] || ''] =
            TREE_COLORS[i % TREE_COLORS.length];
        }
      }
    } else {
      const details =
        appDatas?.treePreparationReport?.variablesDetailedStatistics;
      this.treePreparationDatas.treeColorsMap = {};
      const dimensions =
        details?.[this.treePreparationDatas.selectedVariable.rank]?.dataGrid
          ?.dimensions;
      const dimIndex =
        dimensions?.findIndex(
          (e: any) =>
            e.variable === this.treePreparationDatas?.selectedVariable?.name,
        ) || 0;
      const dimDatas = dimensions?.[dimIndex]?.partition;
      if (dimDatas) {
        for (let i = 0; i < dimDatas.length; i++) {
          for (let j = 0; j < (dimDatas[i]?.length || 0); j++) {
            this.treePreparationDatas.treeColorsMap[dimDatas[i]?.[j] || ''] =
              TREE_COLORS[i % TREE_COLORS.length];
          }
        }
      }
    }
    return this.treePreparationDatas.treeColorsMap;
  }
}
