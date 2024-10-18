import { Injectable } from '@angular/core';
import { DimensionsDatasService } from './dimensions-datas.service';
import { EventsService } from './events.service';
import { AppService } from './app.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TreeNodeModel } from '../model/tree-node.model';
import { deepEqual } from 'fast-equals';
import _ from 'lodash';
import { DimensionModel } from '@khiops-library/model/dimension.model';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensions-data.model';
import { HierarchyDatasModel } from '@khiops-covisualization/model/hierarchy-datas.model';
import { TYPES } from '@khiops-library/enum/types';
import { SavedDatasModel } from '@khiops-covisualization/model/saved-datas.model';
import { AnnotationService } from './annotation.service';
import { ImportExtDatasService } from './import-ext-datas.service';

@Injectable({
  providedIn: 'root',
})
export class TreenodesService {
  dimensionsDatas: DimensionsDatasModel;
  collapsedNodesToSave: {} = {};

  constructor(
    private annotationService: AnnotationService,
    private appService: AppService,
    private importExtDatasService: ImportExtDatasService,
    private dimensionsDatasService: DimensionsDatasService,
    private eventsService: EventsService,
  ) {
    this.initialize();
  }

  initialize() {
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();
    this.collapsedNodesToSave =
      this.appService.getSavedDatas('collapsedNodes') || {};
  }

  getLeafNodesForARank(rank: number) {
    const collapsedNodes = {};
    for (let i = 0; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      collapsedNodes[this.dimensionsDatas.selectedDimensions[i].name] = [];
      const nodesVO: TreeNodeModel[] = UtilsService.fastFilter(
        this.dimensionsDatas.dimensionsClusters[i],
        (e) => {
          return rank <= e.hierarchicalRank && !e.isLeaf;
        },
      );
      collapsedNodes[this.dimensionsDatas.selectedDimensions[i].name] =
        nodesVO.map((e) => e.cluster);
    }
    return collapsedNodes;
  }

  updateSelectedNodeName(dimensionName, name, newName) {
    if (!this.dimensionsDatas.nodesNames) {
      this.dimensionsDatas.nodesNames = {};
    }
    this.dimensionsDatas.nodesNames[dimensionName] =
      this.dimensionsDatas.nodesNames[dimensionName] || {};
    this.dimensionsDatas.nodesNames[dimensionName][name] = newName;
    this.update(dimensionName);
  }

  initSavedUnfoldRank() {
    //Initialize unfold rank if set into json
    const appDatas = this.appService.getDatas().datas;
    const savedUnfoldRank = appDatas?.savedDatas?.unfoldHierarchyState;
    savedUnfoldRank && this.setSelectedUnfoldHierarchy(savedUnfoldRank);
  }

  initConditionalOnContextNodes() {
    for (let i = 0; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      if (i >= 2) {
        // re init context nodes with conditionalOnContext to false
        this.setSelectedNode(
          this.dimensionsDatas.selectedDimensions[i].name,
          this.dimensionsDatas.selectedNodes[i]._id,
        );
      }
    }
  }

  mergeCollapsedNodes(obj1, obj2): any {
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

  setSelectedNode(
    hierarchyName,
    nodeName,
    stopPropagation = false,
  ): TreeNodeModel {
    let nodeVO: TreeNodeModel;
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
        ].find((e) => {
          return nodeName === e.name || nodeName === e.shortDescription; // TODO ? also check into shortDescription (for distribution graph for instance)
        });
        if (!nodeVO) {
          // if not found take the first (it's maybe an unfoldHierarchy)
          nodeVO =
            this.dimensionsDatas.currentDimensionsClusters[currentIndex][0];
        }
        nodeVO.getChildrenList();

        if (currentIndex !== 0 && currentIndex !== 1) {
          if (this.dimensionsDatas.conditionalOnContext) {
            this.dimensionsDatas.contextSelection[currentIndex - 2] =
              nodeVO.childrenLeafIndexes;
            // for contexts, we must get the real node to get the childrenLeafIndexes
            // const realNodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(e => {
            // 	return nodeVO.name === e.name || nodeVO.shortDescription === e.shortDescription; // also check into shortDescription (for distribution graph for instance)
            // });
            // realNodeVO.getChildrenList();
            // this.dimensionsDatas.contextSelection[currentIndex - 2] = realNodeVO.childrenLeafIndexes;
          } else {
            // conditionalOnContext unset
            // get the parent node
            const parentNodeVO: TreeNodeModel =
              this.dimensionsDatas.currentDimensionsClusters[currentIndex].find(
                (e: TreeNodeModel) => e.isParentCluster,
              );
            parentNodeVO.getChildrenList();
            // and set their chidren leafs to context nodes
            this.dimensionsDatas.contextSelection[currentIndex - 2] =
              parentNodeVO.childrenLeafIndexes;
          }
        }

        this.dimensionsDatas.selectedNodes[currentIndex] = nodeVO;
      }

      // Do not send event changed if only one node selected and if nodes does not changed
      if (
        !deepEqual(previousSelectedNodes, this.dimensionsDatas.selectedNodes)
      ) {
        // search in the complete datas the corresponding node
        const realNodeVO = this.dimensionsDatas.dimensionsClusters[
          currentIndex
        ].find((e) => {
          return (
            nodeVO.name ===
            e.name /*|| nodeVO.shortDescription === e.shortDescription*/
          );
          // do not check into shortDescription (for distribution graph for instance)
          // otherwise it return multiple nodes
        });
        realNodeVO.getChildrenList();
        if (!stopPropagation) {
          this.eventsService.emitTreeSelectedNodeChanged({
            hierarchyName: hierarchyName,
            selectedNode: nodeVO,
            realNodeVO: realNodeVO,
            stopPropagation: stopPropagation,
          });
        }
      }
    }
    return nodeVO;
  }

  updateSelectedNodes(dimension: DimensionModel, position: number) {
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimension.name === e.name;
      });

    if (currentIndex !== -1) {
      // Invert values if already selected
      [
        this.dimensionsDatas.selectedNodes[currentIndex],
        this.dimensionsDatas.selectedNodes[position],
      ] = [
        this.dimensionsDatas.selectedNodes[position],
        this.dimensionsDatas.selectedNodes[currentIndex],
      ];
    }
  }

  getLastVisibleNode(nodes: TreeNodeModel[]) {
    if (nodes[0].isLeaf) {
      return nodes[0];
    } else if (!nodes[0].isCollapsed) {
      return this.getLastVisibleNode(nodes[0].children);
    } else {
      return nodes[0];
    }
  }

  getFirstVisibleNode(nodes, nodeVO: TreeNodeModel, lastVisibleNode?) {
    const parentNode: TreeNodeModel = nodes.find(
      (e) => e.name === nodeVO?.parentCluster,
    );
    if (!nodeVO.isParentCluster) {
      if (parentNode.isCollapsed) {
        lastVisibleNode = parentNode;
      }
      return this.getFirstVisibleNode(nodes, parentNode, lastVisibleNode);
    } else {
      return lastVisibleNode;
    }
  }

  initSelectedNodes() {
    this.dimensionsDatas.selectedNodes = [];
  }

  getSelectedNodes() {
    return this.dimensionsDatas.selectedNodes;
  }

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

  getNodesNames() {
    return this.dimensionsDatas.nodesNames;
  }

  getNodeFromDimensionTree(dimensionName, nodeName): TreeNodeModel {
    let nodeVO: TreeNodeModel;
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
        this.dimensionsDatas.dimensionsTrees[currentIndex],
        nodeName,
      );
    }
    return _.cloneDeep(nodeVO); // important to clone datas to keep origin immmutable
  }

  getNodeFromName(dimensionName, nodeName): TreeNodeModel {
    let nodeVO: TreeNodeModel;
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });

    if (currentIndex !== -1) {
      // get Node VO from name
      nodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(
        (e) => {
          return nodeName === e.name;
        },
      );
      if (!nodeVO) {
        nodeVO = this.dimensionsDatas.dimensionsClusters[currentIndex].find(
          (e) => {
            return nodeName === e.bounds;
          },
        );
      }
    }
    return _.cloneDeep(nodeVO); // important to clone datas to keep origin immmutable
  }

  setSavedCollapsedNodes(collapsedNodesToSave) {
    this.collapsedNodesToSave = collapsedNodesToSave;
  }

  updateCurrentHierarchyClustersCount(rank: number) {
    for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
      const currentIndex: number =
        this.dimensionsDatas.selectedDimensions.findIndex((e) => {
          return this.dimensionsDatas.dimensions[i].name === e.name;
        });
      const nodesVO: TreeNodeModel[] = UtilsService.fastFilter(
        this.dimensionsDatas.dimensionsClusters[currentIndex],
        (e) => {
          return !e.isLeaf && e.hierarchicalRank < rank;
        },
      );
      const dimension: DimensionModel = this.dimensionsDatas.dimensions[i];
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
      maxRank = maxRank - 1;
      currentDimClustersCount = 1;
      for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
        const nodesVO: TreeNodeModel[] = UtilsService.fastFilter(
          this.dimensionsDatas.dimensionsClusters[i],
          (e) => {
            return !e.isLeaf && e.hierarchicalRank < maxRank;
          },
        );
        currentDimClustersCount = currentDimClustersCount * nodesVO.length;
      }
    } while (currentDimClustersCount > nbCells);
    return maxRank;
  }

  getHierarchyDatas(): HierarchyDatasModel {
    const appDatas = this.appService.getInitialDatas().datas;

    if (appDatas?.coclusteringReport?.dimensionSummaries) {
      this.dimensionsDatas.hierarchyDatas.totalClusters = 0;
      const l = appDatas.coclusteringReport.dimensionSummaries.length;
      this.dimensionsDatas.hierarchyDatas.minClusters = l;
      for (let i = 0; i < l; i++) {
        // Concat all dimensions clusters
        this.dimensionsDatas.hierarchyDatas.totalClusters +=
          appDatas.coclusteringReport.dimensionSummaries[i].parts;
        // 150 Also compute totalInitialClusters to generate information rate chart
        this.dimensionsDatas.hierarchyDatas.totalInitialClusters +=
          appDatas.coclusteringReport.dimensionSummaries[i].initialParts;
      }
      // Init with all clusters
      if (this.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy === 0) {
        this.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy =
          this.dimensionsDatas.hierarchyDatas.totalClusters;
      }
    }
    if (appDatas?.coclusteringReport?.summary) {
      // Get the total cell
      this.dimensionsDatas.hierarchyDatas.totalCells +=
        appDatas.coclusteringReport.summary.cells;
    }
    return this.dimensionsDatas.hierarchyDatas;
  }

  getUnfoldHierarchy(): number {
    return this.dimensionsDatas?.hierarchyDatas?.selectedUnfoldHierarchy || 0;
  }

  setSelectedUnfoldHierarchy(selectedUnfoldHierarchy: number) {
    this.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy =
      selectedUnfoldHierarchy;
  }

  updateCollapsedNodesToSave(dimensionName: string, nodeName: string, way) {
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

  getSavedCollapsedNodes() {
    return this.collapsedNodesToSave;
  }

  collapseNode(dimensionName: string, nodeName: string) {
    this.updateCollapsedNodesToSave(dimensionName, nodeName, 1);
    this.setSelectedNode(dimensionName, nodeName, true);
    this.update(dimensionName);
  }

  expandNode(dimensionName: string, nodeName: string) {
    this.updateCollapsedNodesToSave(dimensionName, nodeName, -1);
    this.setSelectedNode(dimensionName, nodeName, true);
    this.update(dimensionName);
  }

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

  constructDatasToSave(collapsedNodesInput?) {
    const initialDatas = JSON.parse(
      JSON.stringify(this.appService.getInitialDatas().datas),
    );

    const selectedDimensions =
      this.dimensionsDatasService.getDimensionsToSave();
    const unfoldHierarchyState = this.getUnfoldHierarchy();
    const splitSizes = this.appService.getSplitSizes();
    const viewsLayout = this.appService.getViewsLayout();

    const nodesNames = this.getNodesNames();
    const annotations = this.annotationService.getAnnotations();

    let selectedNodes = this.getSelectedNodes();
    let selectedNodesMap = [];
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

  isSaveChanged(savedDatas, testedSavedDatas) {
    return !_.isEqual(savedDatas, testedSavedDatas);
  }

  constructSavedJson(collapsedNodesInput?, isReduced = false) {
    let newJson = this.constructDatasToSave(collapsedNodesInput);
    if (collapsedNodesInput) {
      // Transform json if collapsed nodes
      // let t0 = performance.now();
      newJson = this.truncateJsonHierarchy(newJson);
      // let t1 = performance.now();
      // console.log("truncateJsonHierarchy " + (t1 - t0) + " milliseconds.");

      // t0 = performance.now();
      newJson = this.updateSummariesParts(newJson);
      // t1 = performance.now();
      // console.log("updateSummariesParts " + (t1 - t0) + " milliseconds.");

      // t0 = performance.now();
      newJson = this.truncateJsonPartition(newJson);
      // t1 = performance.now();
      // console.log("truncateJsonPartition " + (t1 - t0) + " milliseconds.");

      // t0 = performance.now();
      newJson = this.truncateJsonCells(newJson);
      // t1 = performance.now();
      // console.log("truncateJsonCells " + (t1 - t0) + " milliseconds.");

      // t0 = performance.now();
      newJson = this.updateSummariesCells(newJson);
      // t1 = performance.now();
      // console.log("updateSummariesCells " + (t1 - t0) + " milliseconds.");

      if (!collapsedNodesInput || isReduced) {
        // Remove collapsed nodes and selected nodes because they have been reduced
        delete newJson.savedDatas.collapsedNodes;
      }
    }

    // delete datasToSave.savedDatas.selectedNodes; // do not do that to keep context selection
    // console.log('file: save.service.ts:114 ~ constructSavedJson ~ newJson:', newJson);
    return newJson;
  }

  truncateJsonHierarchy(datas) {
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
            const nodeDetails: TreeNodeModel =
              this.dimensionsDatas.dimensionsClusters[dimIndex].find(
                (e) => e.cluster === nodeName,
              );

            // Get children list
            nodeDetails && nodeDetails.getChildrenList();

            if (nodeDetails?.childrenList) {
              nodeChildren = nodeDetails.childrenList;
              const nodeChildrenLength = nodeChildren.length;
              for (let j = nodeChildrenLength - 1; j >= 0; j--) {
                const nodeIndex = dimHierarchy.clusters.findIndex(
                  (e) => e.cluster === nodeChildren[j],
                );
                if (nodeChildren[j] !== nodeName) {
                  // Do not remove current collapsed node
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
        }
      });

      // Sort clusters by leaf and rank
      for (let k = 0; k < truncatedHierarchy.length; k++) {
        truncatedHierarchy[k].clusters = _.sortBy(
          truncatedHierarchy[k].clusters,
          [(e) => e.isLeaf === false, 'rank'],
        );
      }

      datas.coclusteringReport.dimensionHierarchies = truncatedHierarchy;
    }

    return datas;
  }

  truncateJsonPartition(datas) {
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
        const dimVO: DimensionModel = this.dimensionsDatas.selectedDimensions.find(
          (e) => e.name === dim,
        );
        const dimIndexInitial = this.dimensionsDatas.dimensions.findIndex(
          (e) => e.name === dim,
        );

        if (dimVO.isCategorical) {
          this.computeCatPartition(
            nodes,
            dimIndex,
            truncatedPartition[dimIndexInitial],
          );
        } else {
          this.computeNumPartition(
            nodes,
            dimIndex,
            truncatedPartition[dimIndexInitial],
          );
        }
      }
    });

    datas.coclusteringReport.dimensionPartitions = truncatedPartition;
    return datas;
  }

  computeCatPartition(nodes, dimIndex, currentTruncatedPartition) {
    const nodesLength = nodes.length;
    for (let i = 0; i < nodesLength; i++) {
      const nodeName = nodes[i];
      let nodeChildren: any[] = [];
      const currentDefaultGroup =
        currentTruncatedPartition.defaultGroupIndex &&
        currentTruncatedPartition.valueGroups[
          currentTruncatedPartition.defaultGroupIndex
        ].values;
      const nodeDetails: TreeNodeModel = this.dimensionsDatas.dimensionsClusters[
        dimIndex
      ].find((e) => e.cluster === nodeName);
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
          currentTruncatedPartition.valueGroups.findIndex((e) =>
            e.values.includes(currentDefaultGroup[0]),
          );
      }
    }
    return currentTruncatedPartition;
  }

  computeNumPartition(nodes, dimIndex, currentTruncatedPartition) {
    const nodesLength = nodes.length;
    for (let i = 0; i < nodesLength; i++) {
      const nodeName = nodes[i];
      let nodeChildren: any[] = [];

      const nodeDetails: TreeNodeModel = this.dimensionsDatas.dimensionsClusters[
        dimIndex
      ].find((e) => e.cluster === nodeName);
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
            .map((e) => e.cluster)
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
          currentTruncatedPartition.intervals.push({
            cluster: nodeDetails.cluster,
            bounds: currentNodeBound,
          });
        }
        // Sort intervals
        currentTruncatedPartition.intervals.sort(function (a, b) {
          return a.bounds[0] - b.bounds[0];
        });
      }
    }

    const includedIntervals = this.findIncludedIntervals(
      currentTruncatedPartition.intervals.map((e) => e.bounds),
    );
    if (includedIntervals.length > 0) {
      for (let k = includedIntervals.length - 1; k >= 0; k--) {
        currentTruncatedPartition.intervals.splice(includedIntervals[k], 1);
      }
    }

    return currentTruncatedPartition;
  }

  findIncludedIntervals(intervals) {
    let includedIndices = [];

    for (let i = 0; i < intervals.length; i++) {
      for (let j = 0; j < intervals.length; j++) {
        if (i !== j && this.isIncluded(intervals[i], intervals[j])) {
          includedIndices.push(i);
          break;
        }
      }
    }

    return includedIndices;
  }

  // Fonction pour vérifier si l'intervalle a est inclus dans l'intervalle b
  isIncluded(a, b) {
    return a[0] >= b[0] && a[1] <= b[1];
  }

  updateSummariesParts(datas) {
    for (
      let i = 0;
      i < datas.coclusteringReport.dimensionSummaries.length;
      i++
    ) {
      const dimIndex = this.dimensionsDatas.selectedDimensions.findIndex(
        (e) => e.name === datas.coclusteringReport.dimensionSummaries[i].name,
      );
      datas.coclusteringReport.dimensionSummaries[dimIndex].parts =
        datas.coclusteringReport.dimensionHierarchies[dimIndex].clusters.filter(
          (e) => e.isLeaf === true,
        ).length;
    }

    return datas;
  }

  updateSummariesCells(datas) {
    // the "cells" field in "summary" must contain the number of non-empty cells,
    // which can be less than the theoretical number of cells.
    // It is obtained by counting the number of elements in the list "cellPartIndexes" or in "cellFrequencies"
    datas.coclusteringReport.summary.cells =
      datas.coclusteringReport.cellFrequencies.length;

    return datas;
  }

  truncateJsonCells(CC) {
    const CI = {
      ...this.appService.getInitialDatas().datas,
    };
    const transitionMatrix: any[] = [];

    // Step 1: we build the transition matrix which makes it possible to pass from the part
    // indices of the CI to the part indices of the CC
    for (
      let k = 0;
      k < CI.coclusteringReport.dimensionHierarchies.length;
      k++
    ) {
      let initialVariable;
      let currentVariable;
      if (
        CC.coclusteringReport.dimensionPartitions[k].type === TYPES.NUMERICAL
      ) {
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

      // Loop the parts of the CI variable: for each part, we try to associate its index in
      // the partition of the initial coclustering with its index in the partition of the final coclustering.
      // We use the fact that the partitions are nested and that their order does not change:
      // an "initial" part is either kept as it is in the current coclustering or included in
      // a folded part in the current coclustering
      let currentP = 0; // initialize the index of the part of the current variable
      let currentPart = currentVariable[currentP]; // we initialize the current part

      // parcours des parties initiales
      for (let initialP = 0; initialP < initialVariable.length; initialP++) {
        let initialPart = initialVariable[initialP];
        if (!transitionMatrix[k]) {
          transitionMatrix[k] = [];
        }

        if (
          CC.coclusteringReport.dimensionPartitions[k].type === TYPES.NUMERICAL
        ) {
          if (initialPart.length !== 0) {
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
          if (!currentPart.includes(initialPart[0])) {
            currentPart = currentVariable[++currentP];
          }
        }

        transitionMatrix[k][initialP] = currentP;
      }
    }

    // Step 2: build the list of cells in the current coclustering by calculating the indexes
    // of these cells and their resGroup
    let resGroup: any[] = [];

    // chat GPT optimization
    const { cellPartIndexes, dimensionHierarchies, cellFrequencies } =
      CI.coclusteringReport;
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
