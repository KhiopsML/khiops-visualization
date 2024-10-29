import { Injectable } from '@angular/core';
import { DimensionsDatasService } from './dimensions-datas.service';
import { EventsService } from './events.service';
import { AppService } from './app.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TreeNodeModel } from '../model/tree-node.model';
import { deepEqual } from 'fast-equals';
import _ from 'lodash';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensions-data.model';
import { HierarchyDatasModel } from '@khiops-covisualization/model/hierarchy-datas.model';
import { TYPES } from '@khiops-library/enum/types';
import { SavedDatasModel } from '@khiops-covisualization/model/saved-datas.model';
import { AnnotationService } from './annotation.service';
import { ImportExtDatasService } from './import-ext-datas.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { ViewManagerService } from './view-manager.service';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import {
  CovisualizationDatas,
  DimensionPartition,
} from '@khiops-covisualization/interfaces/app-datas';

@Injectable({
  providedIn: 'root',
})
export class TreenodesService {
  private dimensionsDatas!: DimensionsDatasModel;
  private collapsedNodesToSave: DynamicI | undefined = {};

  constructor(
    private annotationService: AnnotationService,
    private appService: AppService,
    private importExtDatasService: ImportExtDatasService,
    private dimensionsDatasService: DimensionsDatasService,
    private eventsService: EventsService,
    private layoutService: LayoutService,
    private viewManagerService: ViewManagerService,
  ) {
    this.initialize();
  }

  /**
   * Initializes the service by fetching dimensions data and collapsed nodes to save.
   */
  initialize() {
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();
    this.collapsedNodesToSave =
      this.appService.getSavedDatas('collapsedNodes') || {};
  }

  /**
   * Retrieves leaf nodes for a given hierarchical rank.
   *
   * @param {number} rank - The hierarchical rank to filter nodes.
   * @returns {object} - An object containing the leaf nodes for each dimension.
   */
  getLeafNodesForARank(rank: number) {
    const collapsedNodes = {};
    for (let i = 0; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      // @ts-ignore
      collapsedNodes[this.dimensionsDatas.selectedDimensions[i]?.name] = [];
      const nodesVO: TreeNodeModel[] = UtilsService.fastFilter(
        this.dimensionsDatas.dimensionsClusters[i],
        (e: TreeNodeModel) => {
          return rank <= e.hierarchicalRank && !e.isLeaf;
        },
      );
      // @ts-ignore
      collapsedNodes[this.dimensionsDatas.selectedDimensions[i]?.name] =
        nodesVO.map((e) => e.cluster);
    }
    return collapsedNodes;
  }

  /**
   * Updates the name of a selected node.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} name - The current name of the node.
   * @param {string} newName - The new name to set for the node.
   */
  updateSelectedNodeName(dimensionName: string, name: string, newName: string) {
    if (!this.dimensionsDatas.nodesNames) {
      this.dimensionsDatas.nodesNames = {};
    }
    this.dimensionsDatas.nodesNames[dimensionName] =
      this.dimensionsDatas.nodesNames[dimensionName] || {};
    this.dimensionsDatas.nodesNames[dimensionName][name] = newName;
    this.update(dimensionName);
  }

  /**
   * Initializes the saved unfold rank from the application data.
   */
  initSavedUnfoldRank() {
    // Initialize unfold rank if set into json
    const savedUnfoldRank =
      this.appService.appDatas?.savedDatas?.unfoldHierarchyState;
    savedUnfoldRank && this.setSelectedUnfoldHierarchy(savedUnfoldRank);
  }

  /**
   * Initializes conditional context nodes for selected dimensions.
   */
  initConditionalOnContextNodes() {
    for (let i = 0; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      if (i >= 2) {
        // re init context nodes with conditionalOnContext to false
        this.setSelectedNode(
          this.dimensionsDatas.selectedDimensions[i]!.name,
          this.dimensionsDatas.selectedNodes[i]!._id,
        );
      }
    }
  }

  /**
   * Merges two collapsed nodes objects.
   *
   * @param {object} obj1 - The first collapsed nodes object.
   * @param {object} obj2 - The second collapsed nodes object.
   * @returns {object} - The merged collapsed nodes object.
   */
  mergeCollapsedNodes(obj1: DynamicI, obj2: DynamicI): any {
    if (!obj1) {
      obj1 = {};
    }
    if (!obj2) {
      obj2 = {};
    }
    const result = { ...obj1 };
    Object.keys(obj2).forEach((key) => {
      if (Array.isArray(obj2[key])) {
        const set = new Set([...(result[key] || []), ...obj2[key]]);
        result[key] = [...set];
      } else {
        result[key] = obj2[key];
      }
    });

    return result;
  }

  /**
   * Sets the selected node for a given hierarchy and node name.
   *
   * @param {string} hierarchyName - The name of the hierarchy.
   * @param {string} nodeName - The name of the node.
   * @param {boolean} stopPropagation - Flag to stop event propagation.
   * @returns {TreeNodeModel} - The selected node model.
   */
  setSelectedNode(
    hierarchyName: string,
    nodeName: string | number,
    stopPropagation = false,
  ): TreeNodeModel | undefined {
    let nodeVO: TreeNodeModel | undefined;
    if (this.dimensionsDatas.selectedDimensions) {
      const previousSelectedNodes = Object.assign(
        [],
        this.dimensionsDatas.selectedNodes,
      );

      // Find current dim position
      const currentIndex: number =
        this.dimensionsDatas.selectedDimensions.findIndex((e) => {
          return hierarchyName === e.name;
        });

      if (currentIndex !== -1) {
        // get Node VO from name
        nodeVO = this.dimensionsDatas.currentDimensionsClusters[
          currentIndex
        ]?.find((e) => {
          return nodeName === e.name || nodeName === e.shortDescription; // also check into shortDescription (for distribution graph for instance)
        });
        if (!nodeVO) {
          // if not found take the first (it's maybe an unfoldHierarchy)
          nodeVO =
            this.dimensionsDatas.currentDimensionsClusters[currentIndex]?.[0];
        }
        if (nodeVO) {
          nodeVO.getChildrenList();

          if (currentIndex !== 0 && currentIndex !== 1) {
            if (this.dimensionsDatas.conditionalOnContext) {
              // @ts-ignore
              this.dimensionsDatas.contextSelection[currentIndex - 2] =
                nodeVO.childrenLeafIndexes;
            } else {
              // conditionalOnContext unset
              // get the parent node
              const parentNodeVO: TreeNodeModel | undefined =
                this.dimensionsDatas.currentDimensionsClusters[
                  currentIndex
                ]?.find((e: TreeNodeModel) => e.isParentCluster);
              if (parentNodeVO) {
                parentNodeVO.getChildrenList();
                // and set their chidren leafs to context nodes
                // @ts-ignore
                this.dimensionsDatas.contextSelection[currentIndex - 2] =
                  parentNodeVO.childrenLeafIndexes;
              }
            }
          }
        }

        if (nodeVO) {
          this.dimensionsDatas.selectedNodes[currentIndex] = nodeVO;
        }
      }

      // Do not send event changed if only one node selected and if nodes does not changed
      if (
        !deepEqual(previousSelectedNodes, this.dimensionsDatas.selectedNodes)
      ) {
        // search in the complete datas the corresponding node
        const realNodeVO = this.dimensionsDatas.dimensionsClusters[
          currentIndex
        ]?.find((e: TreeNodeModel) => {
          return (
            nodeVO?.name ===
            e.name /*|| nodeVO.shortDescription === e.shortDescription*/
          );
          // do not check into shortDescription (for distribution graph for instance)
          // otherwise it return multiple nodes
        });
        if (realNodeVO) {
          realNodeVO.getChildrenList();
          if (!stopPropagation) {
            this.eventsService.emitTreeSelectedNodeChanged({
              hierarchyName: hierarchyName,
              selectedNode: nodeVO!,
              realNodeVO: realNodeVO,
              stopPropagation: stopPropagation,
            });
          }
        }
      }
    }
    return nodeVO;
  }

  /**
   * Updates the selected nodes for a given dimension and position.
   *
   * @param {DimensionCovisualizationModel} dimension - The dimension model.
   * @param {number} position - The position to update.
   */
  updateSelectedNodes(
    dimension: DimensionCovisualizationModel,
    position: number,
  ) {
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimension.name === e.name;
      });

    if (currentIndex !== -1) {
      // Invert values if already selected
      [
        // @ts-ignore
        this.dimensionsDatas.selectedNodes[currentIndex],
        // @ts-ignore
        this.dimensionsDatas.selectedNodes[position],
      ] = [
        this.dimensionsDatas.selectedNodes[position],
        this.dimensionsDatas.selectedNodes[currentIndex],
      ];
    }
  }

  /**
   * Retrieves the last visible node from a list of nodes.
   *
   * @param {TreeNodeModel[]} nodes - The list of nodes.
   * @returns {TreeNodeModel} - The last visible node.
   */
  getLastVisibleNode(nodes: TreeNodeModel[]): TreeNodeModel {
    if (nodes[0]?.isLeaf) {
      return nodes[0];
    } else if (!nodes[0]?.isCollapsed) {
      return this.getLastVisibleNode(nodes[0]!.children);
    } else {
      return nodes[0];
    }
  }

  /**
   * Retrieves the first visible node from a list of nodes.
   *
   * @param {TreeNodeModel[]} nodes - The list of nodes.
   * @param {TreeNodeModel} nodeVO - The node model.
   * @param {TreeNodeModel} lastVisibleNode - The last visible node.
   * @returns {TreeNodeModel} - The first visible node.
   */
  getFirstVisibleNode(
    nodes: TreeNodeModel[],
    nodeVO: TreeNodeModel,
    lastVisibleNode?: TreeNodeModel,
  ): TreeNodeModel | undefined {
    const parentNode: TreeNodeModel | undefined = nodes.find(
      (e) => e.name === nodeVO?.parentCluster,
    );
    if (!nodeVO.isParentCluster) {
      if (parentNode?.isCollapsed) {
        lastVisibleNode = parentNode;
      }
      return this.getFirstVisibleNode(nodes, parentNode!, lastVisibleNode);
    } else {
      return lastVisibleNode;
    }
  }

  /**
   * Initializes the selected nodes array.
   */
  initSelectedNodes() {
    this.dimensionsDatas.selectedNodes = [];
  }

  /**
   * Retrieves the selected nodes.
   *
   * @returns {TreeNodeModel[]} - The selected nodes.
   */
  getSelectedNodes(): TreeNodeModel[] {
    return this.dimensionsDatas.selectedNodes;
  }

  /**
   * Initializes the saved data for the service.
   */
  initSavedDatas() {
    this.collapsedNodesToSave = undefined;
    this.dimensionsDatas.nodesNames =
      this.appService.getSavedDatas('nodesNames') || {};
    const savedNodes = this.appService.getSavedDatas('selectedNodes');
    if (savedNodes) {
      for (let index = 0; index < savedNodes.length; index++) {
        const nodeName = savedNodes[index];
        const dimension = this.dimensionsDatas.selectedDimensions[index];
        const node =
          dimension && this.getNodeFromName(dimension.name, nodeName);
        if (node) {
          this.dimensionsDatas.selectedNodes[index] = node;
        }
      }
    }
    const savedHierarchy =
      this.appService.getSavedDatas('unfoldHierarchyState') || 0;
    this.setSelectedUnfoldHierarchy(savedHierarchy);
  }

  /**
   * Retrieves the names of the nodes.
   *
   * @returns {object} - The names of the nodes.
   */
  getNodesNames(): DynamicI {
    return this.dimensionsDatas.nodesNames;
  }

  /**
   * Retrieves a node from the dimension tree by its name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   * @returns {TreeNodeModel} - The node model.
   */
  getNodeFromDimensionTree(
    dimensionName: string,
    nodeName: string,
  ): TreeNodeModel | undefined {
    let nodeVO: TreeNodeModel | undefined;
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });

    if (currentIndex !== -1) {
      // here we must search recursively into getNodeFromDimensionTree field of
      // this.dimensionsDatas.dimensionTrees[currentIndex]
      const searchNode = (
        nodes: TreeNodeModel[],
        nodeName: string,
      ): TreeNodeModel | undefined => {
        for (const node of nodes) {
          if (node.name === nodeName) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const foundNode = searchNode(node.children, nodeName);
            if (foundNode) {
              return foundNode;
            }
          }
        }
        return undefined;
      };

      nodeVO = searchNode(
        this.dimensionsDatas.dimensionsTrees[currentIndex]!,
        nodeName,
      );
    }
    return _.cloneDeep(nodeVO); // important to clone datas to keep origin immmutable
  }

  /**
   * Retrieves a node by its name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   * @returns {TreeNodeModel} - The node model.
   */
  getNodeFromName(
    dimensionName: string,
    nodeName: string,
  ): TreeNodeModel | undefined {
    let nodeVO: TreeNodeModel | undefined;
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });

    if (currentIndex !== -1) {
      // get Node VO from name
      nodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex]?.find(
        (e) => {
          return nodeName === e.name;
        },
      );
      if (!nodeVO) {
        nodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex]?.find(
          (e) => {
            return nodeName === e.bounds;
          },
        );
      }
    }
    return _.cloneDeep(nodeVO); // important to clone datas to keep origin immmutable
  }

  /**
   * Sets the saved collapsed nodes.
   *
   * @param {object} collapsedNodesToSave - The collapsed nodes to save.
   */
  setSavedCollapsedNodes(collapsedNodesToSave: DynamicI) {
    this.collapsedNodesToSave = collapsedNodesToSave;
  }

  /**
   * Updates the current hierarchy clusters count for a given rank.
   *
   * @param {number} rank - The hierarchical rank to update.
   */
  updateCurrentHierarchyClustersCount(rank: number) {
    for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
      const currentIndex: number =
        this.dimensionsDatas.selectedDimensions.findIndex((e) => {
          return this.dimensionsDatas.dimensions[i]?.name === e.name;
        });
      const nodesVO: TreeNodeModel[] = UtilsService.fastFilter(
        this.dimensionsDatas.dimensionsClusters[currentIndex],
        (e: TreeNodeModel) => {
          return !e.isLeaf && e.hierarchicalRank < rank;
        },
      );
      const dimension: DimensionCovisualizationModel | undefined =
        this.dimensionsDatas.dimensions[i];
      dimension?.setCurrentHierarchyClusterCount(nodesVO.length + 1);
    }
  }

  /**
   * Compute the number of clusters to manage to display a number of cells
   * @param maxRank the current number of clusters
   * @param nbCells the cells count wish
   */
  getHierarchyFromClustersCount(maxRank: number, nbCells: number): number {
    let currentDimClustersCount = 1;
    do {
      maxRank = maxRank - 1;
      currentDimClustersCount = 1;
      for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
        const nodesVO: TreeNodeModel[] = UtilsService.fastFilter(
          this.dimensionsDatas.dimensionsClusters[i],
          (e: TreeNodeModel) => {
            return !e.isLeaf && e.hierarchicalRank < maxRank;
          },
        );
        currentDimClustersCount = currentDimClustersCount * nodesVO.length;
      }
    } while (currentDimClustersCount > nbCells);
    return maxRank;
  }

  /**
   * Retrieves the hierarchy data from the initial application data.
   * This method calculates the total number of clusters, initial clusters, and cells
   * from the coclustering report and updates the hierarchy data accordingly.
   *
   * @returns {HierarchyDatasModel} - The updated hierarchy data model.
   */
  getHierarchyDatas(): HierarchyDatasModel | undefined {
    if (this.appService.initialDatas?.coclusteringReport?.dimensionSummaries) {
      this.dimensionsDatas.hierarchyDatas!.totalClusters = 0;
      const l =
        this.appService.initialDatas.coclusteringReport.dimensionSummaries
          .length;
      this.dimensionsDatas.hierarchyDatas!.minClusters = l;
      for (let i = 0; i < l; i++) {
        // Concat all dimensions clusters
        this.dimensionsDatas.hierarchyDatas!.totalClusters +=
          this.appService.initialDatas.coclusteringReport.dimensionSummaries[
            i
          ]!.parts;
        // 150 Also compute totalInitialClusters to generate information rate chart
        this.dimensionsDatas.hierarchyDatas!.totalInitialClusters +=
          this.appService.initialDatas.coclusteringReport.dimensionSummaries[
            i
          ]!.initialParts;
      }
      // Init with all clusters
      if (this.dimensionsDatas.hierarchyDatas!.selectedUnfoldHierarchy === 0) {
        this.dimensionsDatas.hierarchyDatas!.selectedUnfoldHierarchy =
          this.dimensionsDatas.hierarchyDatas!.totalClusters;
      }
    }
    if (this.appService.initialDatas?.coclusteringReport?.summary) {
      // Get the total cell
      this.dimensionsDatas.hierarchyDatas!.totalCells +=
        this.appService.initialDatas.coclusteringReport.summary.cells;
    }
    return this.dimensionsDatas.hierarchyDatas;
  }

  /**
   * Retrieves the selected unfold hierarchy value.
   *
   * @returns {number} - The selected unfold hierarchy value.
   */
  getUnfoldHierarchy(): number {
    return this.dimensionsDatas?.hierarchyDatas?.selectedUnfoldHierarchy || 0;
  }

  /**
   * Sets the selected unfold hierarchy value.
   *
   * @param {number} selectedUnfoldHierarchy - The value to set for the selected unfold hierarchy.
   */
  setSelectedUnfoldHierarchy(selectedUnfoldHierarchy: number) {
    this.dimensionsDatas.hierarchyDatas!.selectedUnfoldHierarchy =
      selectedUnfoldHierarchy;
  }

  /**
   * Updates the collapsed nodes to save based on the given dimension name and node name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   * @param {number} way - The way to update the collapsed nodes (1 to add, -1 to remove).
   */
  updateCollapsedNodesToSave(
    dimensionName: string,
    nodeName: string,
    way = 1 | -1,
  ) {
    if (!this.collapsedNodesToSave) {
      this.collapsedNodesToSave = {};
    }
    // Add or remove collapsed nodes to save them into json file
    if (!this.collapsedNodesToSave?.[dimensionName]) {
      this.collapsedNodesToSave[dimensionName] = [];
    }
    const index = this.collapsedNodesToSave?.[dimensionName].indexOf(nodeName);
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

  /**
   * Retrieves the saved collapsed nodes.
   *
   * @returns {object} - The saved collapsed nodes.
   */
  getSavedCollapsedNodes(): {} | undefined {
    return this.collapsedNodesToSave;
  }

  /**
   * Collapses a node based on the given dimension name and node name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   */
  collapseNode(dimensionName: string, nodeName: string) {
    this.updateCollapsedNodesToSave(dimensionName, nodeName, 1);
    this.setSelectedNode(dimensionName, nodeName, true);
    this.update(dimensionName);
  }

  /**
   * Expands a node based on the given dimension name and node name.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @param {string} nodeName - The name of the node.
   */
  expandNode(dimensionName: string, nodeName: string) {
    this.updateCollapsedNodesToSave(dimensionName, nodeName, -1);
    this.setSelectedNode(dimensionName, nodeName, true);
    this.update(dimensionName);
  }

  /**
   * Updates the current state based on the given dimension name.
   * This method retrieves the saved collapsed nodes, constructs the saved JSON data,
   * updates the application service with the cropped file data, and reinitializes
   * the dimensions data and selected dimensions. It also propagates changes if necessary
   * and optimizes performance by limiting re-rendering.
   *
   * @param {string} dimensionName - The name of the dimension to update.
   */
  update(dimensionName: string) {
    let collapsedNodes = this.getSavedCollapsedNodes();
    let datas = this.constructSavedJson(
      // 877
      collapsedNodes,
    );
    this.appService.setCroppedFileDatas(datas);
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();
    this.dimensionsDatasService.getDimensions();
    this.dimensionsDatasService.initSelectedDimensions(false); // do not to dont reinit selected context node
    this.dimensionsDatasService.saveInitialDimension();
    this.dimensionsDatasService.constructDimensionsTrees(); //

    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });
    const propagateChanges = currentIndex <= 1 ? true : false;
    // hack to limit re-rendering and optimize perf
    this.dimensionsDatasService.getMatrixDatas(propagateChanges);
    this.dimensionsDatasService.computeMatrixDataFreqMap();
    this.dimensionsDatasService.setIsLoading(false);
  }

  /**
   * Constructs the data object to be saved, including various states and configurations.
   * This method retrieves the initial data, selected dimensions, hierarchy state, layout settings,
   * node names, annotations, selected nodes, collapsed nodes, imported data, and other relevant
   * settings. It then creates a new SavedDatasModel object with these values.
   *
   * @param {any} [collapsedNodesInput] - Optional input for collapsed nodes.
   * @returns {any} - The constructed data object to be saved.
   */
  constructDatasToSave(collapsedNodesInput?: DynamicI): CovisualizationDatas {
    const initialDatas = JSON.parse(
      JSON.stringify(this.appService.initialDatas),
    );

    const selectedDimensions =
      this.dimensionsDatasService.getDimensionsToSave();
    const unfoldHierarchyState = this.getUnfoldHierarchy();
    const splitSizes = this.layoutService.getSplitSizes();
    const viewsLayout = this.viewManagerService.getViewsLayout();

    const nodesNames = this.getNodesNames();
    const annotations = this.annotationService.getAnnotations();

    let selectedNodes = this.getSelectedNodes();
    let selectedNodesMap: string[] = [];
    if (selectedNodes) {
      selectedNodesMap = selectedNodes.map((e) => e.name);
    }
    let collapsedNodes;
    if (collapsedNodesInput) {
      collapsedNodes = collapsedNodesInput;
    } else {
      collapsedNodes = this.getSavedCollapsedNodes();
    }

    const importedDatas = this.importExtDatasService.getImportedDatas();
    const matrixContrast = this.dimensionsDatas.matrixContrast;
    const conditionalOnContext = this.dimensionsDatas.conditionalOnContext;
    const matrixOption = this.dimensionsDatas.matrixOption;
    const matrixMode = this.dimensionsDatas.matrixMode;
    const isAxisInverted = this.dimensionsDatas.isAxisInverted;

    initialDatas.savedDatas = new SavedDatasModel(
      viewsLayout,
      splitSizes,
      selectedNodesMap,
      selectedDimensions,
      collapsedNodes,
      nodesNames,
      annotations,
      importedDatas,
      matrixContrast,
      unfoldHierarchyState,
      conditionalOnContext,
      matrixOption,
      matrixMode,
      isAxisInverted,
    );

    return initialDatas;
  }

  /**
   * Checks if the saved data has changed compared to the tested saved data.
   * This method uses a deep equality check to determine if the two data objects are equal.
   *
   * @param {any} savedDatas - The original saved data object.
   * @param {any} testedSavedDatas - The tested saved data object to compare against.
   * @returns {boolean} - True if the saved data has changed, false otherwise.
   */
  isSaveChanged(savedDatas: DynamicI, testedSavedDatas: DynamicI): boolean {
    return !_.isEqual(savedDatas, testedSavedDatas);
  }

  /**
   * Constructs the saved JSON data, optionally truncating it based on collapsed nodes.
   * This method constructs the data to save, and if collapsed nodes are provided, it
   * truncates the hierarchy, updates summaries, partitions, and cells, and removes
   * collapsed nodes and selected nodes if necessary.
   *
   * @param {DynamicI} [collapsedNodesInput] - Optional input for collapsed nodes.
   * @param {boolean} [isReduced=false] - Flag indicating whether to reduce the data.
   * @returns {CovisualizationDatas} - The constructed saved JSON data.
   */
  constructSavedJson(
    collapsedNodesInput?: DynamicI,
    isReduced = false,
  ): CovisualizationDatas {
    let newJson = this.constructDatasToSave(collapsedNodesInput);
    if (collapsedNodesInput) {
      // Transform json if collapsed nodes
      newJson = this.truncateJsonHierarchy(newJson);
      newJson = this.updateSummariesParts(newJson);
      newJson = this.truncateJsonPartition(newJson);
      newJson = this.truncateJsonCells(newJson);
      newJson = this.updateSummariesCells(newJson);

      if (!collapsedNodesInput || isReduced) {
        // Remove collapsed nodes and selected nodes because they have been reduced
        delete newJson.savedDatas.collapsedNodes;
      }
    }

    // delete datasToSave.savedDatas.selectedNodes; // do not do that to keep context selection
    return newJson;
  }

  /**
   * Truncates the hierarchy in the given data object based on the collapsed nodes.
   * This method processes each dimension, retrieves the collapsed nodes, and updates
   * the corresponding hierarchy by removing the clusters corresponding to the children nodes
   * and marking the parent node as a leaf.
   *
   * @param {CovisualizationDatas} datas - The data object containing the coclustering report and saved data.
   * @returns {CovisualizationDatas} - The updated data object with the truncated hierarchy.
   */
  truncateJsonHierarchy(datas: CovisualizationDatas): CovisualizationDatas {
    if (datas.savedDatas.collapsedNodes) {
      const truncatedHierarchy = [
        ...datas.coclusteringReport.dimensionHierarchies,
      ];
      Object.keys(datas.savedDatas.collapsedNodes).forEach((dim) => {
        const dimIndex = this.dimensionsDatas.selectedDimensions.findIndex(
          (e) => e.name === dim,
        );

        // Check for collapsed node integrity
        if (dimIndex !== -1) {
          const nodes = datas.savedDatas.collapsedNodes[dim];
          const dimHierarchy = truncatedHierarchy.find((e) => e.name === dim);

          const nodesLength = nodes.length;
          for (let i = 0; i < nodesLength; i++) {
            const nodeName = nodes[i];
            let nodeChildren: any[] = [];
            const nodeDetails: TreeNodeModel | undefined =
              this.dimensionsDatas.dimensionsClusters[dimIndex]?.find(
                (e) => e.cluster === nodeName,
              );

            // Get children list
            nodeDetails && nodeDetails.getChildrenList();

            if (nodeDetails?.childrenList) {
              nodeChildren = nodeDetails.childrenList;
              const nodeChildrenLength = nodeChildren.length;
              for (let j = nodeChildrenLength - 1; j >= 0; j--) {
                const nodeIndex = dimHierarchy?.clusters.findIndex(
                  (e) => e.cluster === nodeChildren[j],
                );
                if (nodeChildren[j] !== nodeName) {
                  // Do not remove current collapsed node
                  if (nodeIndex !== undefined && nodeIndex !== -1) {
                    dimHierarchy!.clusters.splice(nodeIndex, 1);
                  }
                } else {
                  if (nodeIndex !== undefined && nodeIndex !== -1) {
                    // Set the isLeaf of the last collapsed node
                    if (dimHierarchy?.clusters[nodeIndex]) {
                      dimHierarchy.clusters[nodeIndex].isLeaf = true;
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Sort clusters by leaf and rank
      for (let k = 0; k < truncatedHierarchy.length; k++) {
        truncatedHierarchy[k]!.clusters = _.sortBy(
          truncatedHierarchy[k]?.clusters,
          [(e) => e.isLeaf === false, 'rank'],
        );
      }

      datas.coclusteringReport.dimensionHierarchies = truncatedHierarchy;
    }

    return datas;
  }

  /**
   * Truncates the partitions in the given data object based on the collapsed nodes.
   * This method processes each dimension, retrieves the collapsed nodes, and updates
   * the corresponding partition (categorical or numerical) by removing the values or
   * intervals corresponding to the children nodes and concatenating them into the parent node.
   *
   * @param {CovisualizationDatas} datas - The data object containing the coclustering report and saved data.
   * @returns {CovisualizationDatas} - The updated data object with the truncated partitions.
   */
  truncateJsonPartition(datas: CovisualizationDatas): CovisualizationDatas {
    const truncatedPartition = _.cloneDeep(
      datas.coclusteringReport.dimensionPartitions,
    );

    Object.keys(datas.savedDatas.collapsedNodes).forEach((dim, key) => {
      const nodes = datas.savedDatas.collapsedNodes[dim];

      const dimIndex = this.dimensionsDatas.selectedDimensions.findIndex(
        (e) => e.name === dim,
      );

      // Check for collapsed node integrity
      if (dimIndex !== -1) {
        const dimVO: DimensionCovisualizationModel | undefined =
          this.dimensionsDatas.selectedDimensions.find((e) => e.name === dim);
        const dimIndexInitial = this.dimensionsDatas.dimensions.findIndex(
          (e) => e.name === dim,
        );

        if (dimVO?.isCategorical) {
          this.computeCatPartition(
            nodes,
            dimIndex,
            truncatedPartition[dimIndexInitial]!,
          );
        } else {
          this.computeNumPartition(
            nodes,
            dimIndex,
            truncatedPartition[dimIndexInitial]!,
          );
        }
      }
    });

    datas.coclusteringReport.dimensionPartitions = truncatedPartition;
    return datas;
  }

  /**
   * Computes the categorical partition for the given nodes and updates the current truncated partition.
   * This method processes each node, retrieves its children, and updates the value groups in the partition
   * by removing the value groups corresponding to the children nodes and concatenating them into the parent node.
   * It also ensures that the default group index is correctly set in the updated partition.
   *
   * @param {string[]} nodes - The list of node names to process.
   * @param {number} dimIndex - The index of the dimension in the dimensionsClusters array.
   * @param {any} currentTruncatedPartition - The current truncated partition to update.
   * @returns {any} - The updated truncated partition with the computed categorical value groups.
   */
  computeCatPartition(
    nodes: string[],
    dimIndex: number,
    currentTruncatedPartition: DimensionPartition,
  ): DimensionPartition {
    const nodesLength = nodes.length;
    for (let i = 0; i < nodesLength; i++) {
      const nodeName = nodes[i];
      let nodeChildren: string[] = [];
      const currentDefaultGroup =
        currentTruncatedPartition.defaultGroupIndex &&
        currentTruncatedPartition.valueGroups?.[
          currentTruncatedPartition.defaultGroupIndex
        ]?.values;
      const nodeDetails: TreeNodeModel | undefined =
        this.dimensionsDatas.dimensionsClusters[dimIndex]?.find(
          (e) => e.cluster === nodeName,
        );
      if (nodeDetails?.childrenList) {
        nodeChildren = nodeDetails.childrenList;

        let cancatValueGroup;
        const nodeChildrenLength = nodeChildren.length;
        for (let j = 0; j < nodeChildrenLength; j++) {
          if (currentTruncatedPartition) {
            if (currentTruncatedPartition.valueGroups) {
              if (nodeChildren[j] !== nodeName) {
                // Do not remove current collapsed node
                const nodeIndex =
                  currentTruncatedPartition.valueGroups.findIndex(
                    (e) => e.cluster === nodeChildren[j],
                  );
                const node = currentTruncatedPartition.valueGroups[nodeIndex];
                if (node) {
                  // Because nodes are not present into partition values
                  if (!cancatValueGroup) {
                    cancatValueGroup = node;
                  } else {
                    cancatValueGroup = UtilsService.concat2ObjectsValues(
                      cancatValueGroup,
                      node,
                    );
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
        currentTruncatedPartition.defaultGroupIndex =
          currentTruncatedPartition.valueGroups?.findIndex((e) =>
            e.values.includes(currentDefaultGroup[0]!),
          );
      }
    }
    return currentTruncatedPartition;
  }

  /**
   * Computes the numerical partition for the given nodes and updates the current truncated partition.
   * This method processes each node, retrieves its children, and updates the intervals in the partition
   * by removing the intervals corresponding to the children nodes and adding the interval for the parent node.
   * It also ensures that the intervals are sorted and removes any included intervals.
   *
   * @param {string[]} nodes - The list of node names to process.
   * @param {number} dimIndex - The index of the dimension in the dimensionsClusters array.
   * @param {any} currentTruncatedPartition - The current truncated partition to update.
   * @returns {any} - The updated truncated partition with the computed numerical intervals.
   */
  computeNumPartition(
    nodes: string[],
    dimIndex: number,
    currentTruncatedPartition: DimensionPartition,
  ): DimensionPartition {
    const nodesLength = nodes.length;
    for (let i = 0; i < nodesLength; i++) {
      const nodeName = nodes[i];
      let nodeChildren: string[] = [];

      const nodeDetails: TreeNodeModel | undefined =
        this.dimensionsDatas.dimensionsClusters[dimIndex]?.find(
          (e) => e.cluster === nodeName,
        );
      if (nodeDetails?.childrenList) {
        nodeChildren = nodeDetails.childrenList;
        const nodeChildrenLength = nodeChildren.length;
        for (let j = 0; j < nodeChildrenLength; j++) {
          if (currentTruncatedPartition) {
            if (currentTruncatedPartition.intervals) {
              if (nodeChildren[j] !== nodeName) {
                // Do not remove current collapsed node
                const intervalIndex =
                  currentTruncatedPartition.intervals.findIndex(
                    (e) => e.cluster === nodeChildren[j],
                  );
                const currentInterval =
                  currentTruncatedPartition.intervals[intervalIndex];
                if (currentInterval) {
                  // Because nodes are not present into partition values
                  currentTruncatedPartition.intervals.splice(intervalIndex, 1);
                }
              }
            }
          }
        }

        if (
          currentTruncatedPartition.intervals
            ?.map((e) => e.cluster)
            .includes(nodeDetails.parentCluster)
        ) {
          // #142 Error in the description of dimensionPartitions during numerical variable folding
          // Do not add current interval if it's parent is already added
        } else {
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
          currentTruncatedPartition.intervals?.push({
            cluster: nodeDetails.cluster,
            bounds: currentNodeBound,
          });
        }
        // Sort intervals
        currentTruncatedPartition.intervals?.sort(function (a, b) {
          // @ts-ignore
          return a.bounds[0] - b.bounds[0];
        });
      }
    }

    const includedIntervals = UtilsService.findIncludedIntervals(
      currentTruncatedPartition.intervals?.map((e) => e.bounds),
    );
    if (includedIntervals.length > 0) {
      for (let k = includedIntervals.length - 1; k >= 0; k--) {
        currentTruncatedPartition.intervals?.splice(includedIntervals[k]!, 1);
      }
    }

    return currentTruncatedPartition;
  }

  /**
   * Updates the "parts" field in the "dimensionSummaries" section of the given data object.
   * The "parts" field should contain the number of leaf clusters for each dimension.
   * This is achieved by filtering the clusters in the "dimensionHierarchies" section
   * to count only those that are marked as leaves.
   *
   * @param {CovisualizationDatas} datas - The data object containing the coclustering report.
   * @returns {CovisualizationDatas} - The updated data object with the correct number of leaf clusters.
   */
  updateSummariesParts(datas: CovisualizationDatas): CovisualizationDatas {
    for (
      let i = 0;
      i < datas.coclusteringReport.dimensionSummaries.length;
      i++
    ) {
      const dimIndex = this.dimensionsDatas.selectedDimensions.findIndex(
        (e) => e.name === datas.coclusteringReport.dimensionSummaries[i]?.name,
      );
      datas.coclusteringReport.dimensionSummaries[dimIndex]!.parts =
        datas.coclusteringReport.dimensionHierarchies[
          dimIndex
        ]!.clusters.filter((e) => e.isLeaf === true).length;
    }

    return datas;
  }

  /**
   * Updates the "cells" field in the "summary" section of the given data object.
   * The "cells" field should contain the number of non-empty cells, which can be
   * less than the theoretical number of cells. This is achieved by counting the
   * number of elements in the "cellPartIndexes" or "cellFrequencies" lists.
   *
   * @param {CovisualizationDatas} datas - The data object containing the coclustering report.
   * @returns {CovisualizationDatas} - The updated data object with the correct number of non-empty cells.
   */
  updateSummariesCells(datas: CovisualizationDatas): CovisualizationDatas {
    // the "cells" field in "summary" must contain the number of non-empty cells,
    // which can be less than the theoretical number of cells.
    // It is obtained by counting the number of elements in the list "cellPartIndexes" or in "cellFrequencies"
    datas.coclusteringReport.summary.cells =
      datas.coclusteringReport.cellFrequencies.length;

    return datas;
  }

  /**
   * Truncates the cells in the given coclustering report (CC) based on the initial data (CI).
   * This method builds a transition matrix to map part indices from the initial coclustering (CI)
   * to the current coclustering (CC). It then constructs the list of cells in the current coclustering
   * by calculating the indexes of these cells and their frequencies.
   *
   * @param {CovisualizationDatas} CC - The current coclustering report to be truncated.
   * @returns {CovisualizationDatas} - The truncated coclustering report with updated cell frequencies and part indexes.
   */
  truncateJsonCells(CC: CovisualizationDatas): CovisualizationDatas {
    const CI = {
      ...this.appService.initialDatas,
    };
    const transitionMatrix: any[] = [];

    // Step 1: we build the transition matrix which makes it possible to pass from the part
    // indices of the CI to the part indices of the CC
    for (
      let k = 0;
      k < CI.coclusteringReport!.dimensionHierarchies.length;
      k++
    ) {
      let initialVariable: any;
      let currentVariable: any;
      if (
        CC.coclusteringReport.dimensionPartitions[k]?.type === TYPES.NUMERICAL
      ) {
        initialVariable = CI.coclusteringReport?.dimensionPartitions[
          k
        ]?.intervals?.map((e) => e.bounds);
        currentVariable = CC.coclusteringReport?.dimensionPartitions[
          k
        ]?.intervals?.map((e) => e.bounds);
      } else {
        initialVariable = CI.coclusteringReport?.dimensionPartitions[
          k
        ]?.valueGroups?.map((e) => e.values);
        currentVariable = CC.coclusteringReport?.dimensionPartitions[
          k
        ]?.valueGroups?.map((e) => e.values);
      }

      // Loop the parts of the CI variable: for each part, we try to associate its index in
      // the partition of the initial coclustering with its index in the partition of the final coclustering.
      // We use the fact that the partitions are nested and that their order does not change:
      // an "initial" part is either kept as it is in the current coclustering or included in
      // a folded part in the current coclustering
      let currentP = 0; // initialize the index of the part of the current variable
      let currentPart: any = currentVariable?.[currentP]; // we initialize the current part

      // parcours des parties initiales
      if (initialVariable && currentVariable) {
        for (let initialP = 0; initialP < initialVariable.length; initialP++) {
          let initialPart: any = initialVariable[initialP];
          if (!transitionMatrix[k]) {
            transitionMatrix[k] = [];
          }

          if (
            CC.coclusteringReport.dimensionPartitions[k]!.type ===
            TYPES.NUMERICAL
          ) {
            if (initialPart?.length !== 0) {
              // #73
              try {
                while (
                  !(
                    initialPart[0] >= currentVariable[currentP][0] &&
                    initialPart[1] <= currentVariable[currentP][1]
                  )
                ) {
                  currentPart = currentVariable[++currentP];
                }
              } catch (e) {
                console.log('truncateJsonCells ~ e:', e);
              }
            }
          } else {
            // The inclusion test consists of going through the modalities of the initial part
            // and check that they are all in the list of modalities of the current part.
            if (!currentPart?.includes(initialPart[0])) {
              currentPart = currentVariable[++currentP];
            }
          }

          transitionMatrix[k][initialP] = currentP;
        }
      }
    }

    // Step 2: build the list of cells in the current coclustering by calculating the indexes
    // of these cells and their resGroup
    let resGroup: any[] = [];

    const { cellPartIndexes, dimensionHierarchies, cellFrequencies }: any =
      CI.coclusteringReport || {};
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
          resGroupMap.get(currentIndexesString) + cellFrequencies[i],
        );
      } else {
        resGroupMap.set(currentIndexesString, cellFrequencies[i]);
      }
    }

    // Sort map by frequency
    resGroupMap = new Map(
      [...resGroupMap.entries()].sort((a, b) => b[1] - a[1]),
    );

    // Convert the map back to an array of objects if needed
    resGroup = Array.from(resGroupMap, ([key, value]) => ({
      key,
      value,
    }));

    CC.coclusteringReport.cellFrequencies = resGroup.map((e) => e.value);
    // Convert cellPartIndexes strings to integers
    CC.coclusteringReport.cellPartIndexes = resGroup.map((e) =>
      e.key.split(/\s*,\s*/).map(Number),
    );

    return CC;
  }
}
