import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { SavedDatasModel } from '../model/saved-datas.model';
import { LayoutService } from '../../khiops-library/providers/layout.service';
import { DynamicI } from '@khiops-library/interfaces/globals';
import {
  CovisualizationDatas,
  DimensionPartition,
} from '@khiops-covisualization/interfaces/app-datas';
import { DimensionsDatasService } from './dimensions-datas.service';
import { ViewManagerService } from './view-manager.service';
import { TreenodesService } from './treenodes.service';
import { AnnotationService } from './annotation.service';
import { ImportExtDatasService } from './import-ext-datas.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { TYPES } from '@khiops-library/enum/types';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  constructor(
    private appService: AppService,
    private layoutService: LayoutService,
    private dimensionsDatasService: DimensionsDatasService,
    private viewManagerService: ViewManagerService,
    private treenodesService: TreenodesService,
    private importExtDatasService: ImportExtDatasService,
    private annotationService: AnnotationService,
  ) {}

  /**
   * Updates the current state based on the given dimension name.
   * This method retrieves the saved collapsed nodes, constructs the saved JSON data,
   * updates the application service with the cropped file data, and reinitializes
   * the dimensions data and selected dimensions.
   *
   * @param {string} dimensionName - The name of the dimension to update.
   * @param {any} [collapsedNodesInput] - input for collapsed nodes.
   */
  updateJSon(dimensionName: string, collapsedNodes: any) {
    let datas = this.constructSavedJson(
      // 877
      collapsedNodes,
    );
    this.appService.setCroppedFileDatas(datas);
    this.dimensionsDatasService.recomputeDatasFromNewJson(dimensionName);
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
    const unfoldHierarchyState = this.treenodesService.getUnfoldHierarchy();
    const splitSizes = this.layoutService.getSplitSizes();
    const viewsLayout = this.viewManagerService.getViewsLayout();

    const nodesNames = this.treenodesService.getNodesNames();
    const annotations = this.annotationService.getAnnotations();

    let selectedNodes = this.treenodesService.getSelectedNodes();
    let selectedNodesMap: string[] = [];
    if (selectedNodes) {
      selectedNodesMap = selectedNodes.map((e) => e.name);
    }
    let collapsedNodes;
    if (collapsedNodesInput) {
      collapsedNodes = collapsedNodesInput;
    } else {
      collapsedNodes = this.treenodesService.getSavedCollapsedNodes();
    }

    const importedDatas = this.importExtDatasService.getImportedDatas();
    const matrixContrast =
      this.dimensionsDatasService.dimensionsDatas.matrixContrast;
    const conditionalOnContext =
      this.dimensionsDatasService.dimensionsDatas.conditionalOnContext;
    const matrixOption =
      this.dimensionsDatasService.dimensionsDatas.matrixOption;
    const matrixMode = this.dimensionsDatasService.dimensionsDatas.matrixMode;
    const isAxisInverted =
      this.dimensionsDatasService.dimensionsDatas.isAxisInverted;

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

      const dimIndex =
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
          (e) => e.name === dim,
        );

      // Check for collapsed node integrity
      if (dimIndex !== -1) {
        const dimVO: DimensionCovisualizationModel | undefined =
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions.find(
            (e) => e.name === dim,
          );
        const dimIndexInitial =
          this.dimensionsDatasService.dimensionsDatas.dimensions.findIndex(
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
        const dimIndex =
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
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
              this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
                dimIndex
              ]?.find((e) => e.cluster === nodeName);

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
      const dimIndex =
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
          (e) =>
            e.name === datas.coclusteringReport.dimensionSummaries[i]?.name,
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
        this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
          dimIndex
        ]?.find((e) => e.cluster === nodeName);
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
        this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
          dimIndex
        ]?.find((e) => e.cluster === nodeName);
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
      currentTruncatedPartition.intervals?.map((e) => e.bounds)!,
    );
    if (includedIntervals.length > 0) {
      for (let k = includedIntervals.length - 1; k >= 0; k--) {
        currentTruncatedPartition.intervals?.splice(includedIntervals[k]!, 1);
      }
    }

    return currentTruncatedPartition;
  }
}
