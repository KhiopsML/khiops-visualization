/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import * as _ from 'lodash'; // Important to import lodash in karma
import { DimensionsDatasService } from './dimensions-datas.service';
import { TreeNodeModel } from '../model/tree-node.model';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { AppService } from './app.service';
import { CompositionModel } from '../model/composition.model';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { ImportExtDatasService } from './import-ext-datas.service';
import { TYPES } from '@khiops-library/enum/types';
import { CompositionUtils } from './composition.utils.service';

@Injectable({
  providedIn: 'root',
})
export class CompositionService {
  public compositionValues: CompositionModel[] = [];

  constructor(
    private appService: AppService,
    private dimensionsDatasService: DimensionsDatasService,
    private importExtDatasService: ImportExtDatasService,
  ) {}

  /**
   * Retrieves the composition clusters for a given hierarchy and node.
   * This method processes the dimension partitions and clusters to generate
   * composition models, which include details about the clusters and their
   * associated data.
   *
   * @param hierarchyName - The name of the hierarchy for which composition clusters are being retrieved.
   * @param node - The node representing the current cluster in the hierarchy.
   * @returns An array of CompositionModel containing details of the composition clusters.
   */
  getCompositionClusters(
    hierarchyName: string,
    node: TreeNodeModel,
  ): CompositionModel[] {
    if (
      this.appService.initialDatas?.coclusteringReport?.dimensionSummaries &&
      this.appService.appDatas?.coclusteringReport?.dimensionPartitions &&
      this.dimensionsDatasService.dimensionsDatas?.selectedDimensions
    ) {
      const currentDimensionDetails: DimensionCovisualizationModel | undefined =
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.find(
          (e) => e.name === hierarchyName,
        );
      if (currentDimensionDetails) {
        const currentIndex: number =
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
            (e) => {
              return hierarchyName === e.name;
            },
          );
        const position = currentDimensionDetails.startPosition;
        const dimSummary =
          this.appService.initialDatas.coclusteringReport.dimensionSummaries[
            position
          ];
        if (!dimSummary) {
          return [];
        }
        const currentInitialDimensionDetails: DimensionCovisualizationModel =
          new DimensionCovisualizationModel(dimSummary, currentIndex);
        const dimensionPartition =
          this.appService.initialDatas.coclusteringReport.dimensionPartitions[
            position
          ];
        // Set dimension partitions from intervals or valueGroup
        if (!dimensionPartition) {
          return [];
        }
        currentInitialDimensionDetails.setPartition(dimensionPartition);

        if (currentDimensionDetails?.isVarPart) {
          // Individuals * Variables case
          return this.getIndiVarCompositionValues(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            node,
            currentIndex,
          );
        } else {
          // Normal case : Variabe * Variable
          return this.getVarVarCompositionValues(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            node,
            currentIndex,
          );
        }
      }
    }
    return [];
  }

  /**
   * Core method to process node compositions without recursive processing.
   * This method contains the shared logic for creating CompositionModel objects.
   */
  private processNodeCompositions(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
    isIndiVarCase: boolean,
    processedCollapsedChildren?: Set<string>,
  ): CompositionModel[] {
    const compositionValues: CompositionModel[] = [];

    if (currentDimensionDetails?.isCategorical) {
      node.getChildrenList();
      if (isIndiVarCase) {
        node.getInnerValueGroups(currentInitialDimensionDetails);
      }

      if (node.childrenLeafList) {
        const currentDimensionClusters: TreeNodeModel[] = Object.assign(
          [],
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
            currentIndex
          ],
        );
        const childrenLeafListLength = node.childrenLeafList.length;

        for (let i = 0; i < childrenLeafListLength; i++) {
          const currentLeafName = node.childrenLeafList[i];

          // Skip if currentLeafName is undefined or if it was already processed as part of a collapsed child
          if (isIndiVarCase && processedCollapsedChildren) {
            if (
              !currentLeafName ||
              processedCollapsedChildren.has(currentLeafName)
            ) {
              continue;
            }
          }

          const currentClusterDetails =
            currentInitialDimensionDetails.valueGroups?.find(
              (e) => e.cluster === currentLeafName,
            );
          if (currentClusterDetails) {
            const parts = isIndiVarCase
              ? node.innerValues?.[i]
              : currentClusterDetails.values;

            let cIndex = -1;
            for (let j = 0; j < (parts?.length ?? 0); j++) {
              // @ts-ignore
              cIndex = cIndex + parts?.[j]?.[1]?.length ?? 0;
              const currentDimensionHierarchyCluster =
                currentDimensionClusters.find(
                  (e) => e.cluster === currentLeafName,
                );
              if (node.isCollapsed && currentDimensionHierarchyCluster) {
                currentDimensionHierarchyCluster.shortDescription =
                  node.shortDescription;
              }
              const externalDatas: ExtDatasModel =
                this.importExtDatasService.getImportedDatasFromDimension(
                  currentDimensionDetails,
                );
              const currentPartIndex =
                currentDimensionDetails.innerVariables?.dimensionSummaries?.findIndex(
                  (e) => e.name === parts?.[j]?.[0],
                );
              if (currentDimensionHierarchyCluster) {
                const composition = new CompositionModel(
                  currentClusterDetails,
                  currentDimensionHierarchyCluster,
                  currentPartIndex ?? -1,
                  cIndex,
                  externalDatas,
                  currentDimensionDetails.innerVariables,
                  parts?.[j],
                );
                compositionValues.push(composition);
              }
            }
          }
        }
      }
    }

    return compositionValues;
  }

  /**
   * Retrieves composition values for a given node and dimension details.
   * Handles both "Individuals * Variables" and "Variable * Variable" cases.
   * Recursively processes collapsed children before processing the current node.
   */
  private getCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
    isIndiVarCase: boolean,
  ): CompositionModel[] {
    let compositionValues: CompositionModel[] = [];
    let processedCollapsedChildren = new Set<string>();

    if (isIndiVarCase) {
      // First, recursively process collapsed children and sub-children
      processedCollapsedChildren = this.processCollapsedChildren(
        currentDimensionDetails,
        currentInitialDimensionDetails,
        node,
        currentIndex,
        isIndiVarCase,
        compositionValues,
      );
    }

    // Then process the current node using the factorized method
    const nodeCompositions = this.processNodeCompositions(
      currentDimensionDetails,
      currentInitialDimensionDetails,
      node,
      currentIndex,
      isIndiVarCase,
      processedCollapsedChildren,
    );
    compositionValues.push(...nodeCompositions);

    if (node.isCollapsed && isIndiVarCase) {
      compositionValues = this.mergeAllContiguousModels(compositionValues);
      compositionValues = this.formatCompositions(node, compositionValues);
    } else if (isIndiVarCase && processedCollapsedChildren.size > 0) {
      // When we have collapsed children, preserve their cluster names
      compositionValues = this.formatCompositions(
        node,
        compositionValues,
        true,
      );
    }

    // Calculate contextual frequencies if conditional on context is enabled
    // but only for axis dimensions (position 0 and 1), never for context dimensions (position >= 2)
    const isContextDimension = currentIndex >= 2;
    if (
      this.dimensionsDatasService.dimensionsDatas.conditionalOnContext &&
      this.dimensionsDatasService.dimensionsDatas.contextDimensionCount > 0 &&
      !isContextDimension
    ) {
      this.calculateContextualCompositionFrequencies(
        compositionValues,
        currentIndex,
      );
    }

    this.compositionValues = compositionValues;
    return compositionValues;
  }

  /**
   * Formats the composition values by setting the rank and adjusting the part
   * representation based on the number of values.
   */
  formatCompositions(
    node: TreeNodeModel,
    compositionValues: CompositionModel[],
    preserveCollapsedClusterNames: boolean = false,
  ): CompositionModel[] {
    // Create deep copies to avoid mutating the original objects
    const formattedCompositions = compositionValues.map((composition) =>
      _.cloneDeep(composition),
    );

    for (const composition of formattedCompositions) {
      // set the rank of all childs to the rank of the parent #206
      composition.rank = node.rank;
      composition.type = composition.innerVariableType;

      // Only update cluster name if we're not preserving collapsed cluster names
      // or if the composition doesn't have a different cluster name (meaning it's not from a collapsed node)
      if (
        !preserveCollapsedClusterNames ||
        composition.cluster === node.cluster
      ) {
        composition.cluster = node.cluster;
      }
      // now sort the composition valueGroups.valueFrequencies and valueGroups.values in the same order
      if (composition.valueGroups) {
        const { values, valueFrequencies } = composition.valueGroups;

        if (values && valueFrequencies) {
          // Combine, sort by frequency, and update in one step
          const sorted = values
            .map((value, index) => ({
              value,
              frequency: valueFrequencies[index],
            }))
            .sort((a, b) => b.frequency! - a.frequency!);

          composition.valueGroups.values = sorted.map((item) => item.value);
          composition.valueGroups.valueFrequencies = sorted
            .map((item) => item.frequency)
            .filter((freq): freq is number => freq !== undefined);
        }

        if (
          composition.valueGroups?.values &&
          composition.valueGroups.values.length > 3
        ) {
          // if valueGroups.values count is greater than 3
          // crop the composition.part and add ellipsis
          const croppedValues = composition.valueGroups.values.slice(0, 3);
          const ellipsis = '...';
          let separator = ', ';
          composition.part = `{${croppedValues.join(separator)}${separator}${ellipsis}}`;
        } else if (
          composition.valueGroups?.values &&
          composition.valueGroups.values.length < 3
        ) {
          // if valueGroups.values count is less than 3
          // concatenate the values surrounded by { and }
          let separator = ', ';
          composition.part = `{${composition.valueGroups.values.join(separator)}}`;
        }
        composition.valueGroups.cluster = node.cluster;
      } else {
        // not necessary for numerical variables
        // because they are sorted by part, not by frequencies
      }
    }
    return formattedCompositions;
  }

  /**
   * Retrieves composition values for the "Individuals * Variables" case.
   */
  getIndiVarCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
  ): CompositionModel[] {
    return this.getCompositionValues(
      currentDimensionDetails,
      currentInitialDimensionDetails,
      node,
      currentIndex,
      true,
    );
  }

  /**
   * Retrieves composition values for the "Variable * Variable" case.
   */
  getVarVarCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
  ): CompositionModel[] {
    return this.getCompositionValues(
      currentDimensionDetails,
      currentInitialDimensionDetails,
      node,
      currentIndex,
      false,
    );
  }

  /**
   * Calculates contextual frequencies for composition values when conditional on context is enabled.
   * This method follows the algorithm described by the user:
   * 1. Find all matrix cells with the selected cluster as xDisplayaxisPart (or yDisplayaxisPart)
   * 2. For each cell, use cellFreqHash to find the frequency for the selected context
   * 3. Group these frequencies by the corresponding composition values
   */
  private calculateContextualCompositionFrequencies(
    compositionValues: CompositionModel[],
    currentIndex: number,
  ): void {
    // Only calculate contextual frequencies if conditional on context is enabled and there are context dimensions
    if (
      !this.dimensionsDatasService.dimensionsDatas.conditionalOnContext ||
      this.dimensionsDatasService.dimensionsDatas.contextDimensionCount === 0
    ) {
      return;
    }

    // Get matrix data
    const matrixCellDatas =
      this.dimensionsDatasService.dimensionsDatas.matrixDatas?.matrixCellDatas;

    if (!matrixCellDatas) {
      return;
    }

    // Build the context key based on the currently selected context dimensions
    const selectedContextValues =
      this.dimensionsDatasService.dimensionsDatas.contextSelection;
    const numContextDimensions =
      this.dimensionsDatasService.dimensionsDatas.contextDimensionCount;

    // Generate all possible context key combinations from selected leaf indices
    // selectedContextValues[i] contains all leaf indices for dimension i (e.g., [1,2,3] if a node contains leaves 1,2,3)
    const contextDimensionIndices: number[][] = [];
    for (let i = 0; i < numContextDimensions; i++) {
      const dimensionIndices = selectedContextValues[i] || [0];
      contextDimensionIndices.push(dimensionIndices);
    }

    // Step 1: Group compositions by their terminalCluster (original leaf cluster)
    // This ensures that compositions from different leaf clusters are calculated separately,
    // even when their parent node is collapsed
    const compositionsByCluster = new Map<string, CompositionModel[]>();
    for (const composition of compositionValues) {
      if (!composition.terminalCluster) continue;

      if (!compositionsByCluster.has(composition.terminalCluster)) {
        compositionsByCluster.set(composition.terminalCluster, []);
      }
      compositionsByCluster.get(composition.terminalCluster)?.push(composition);
    }

    // Step 1.5: Group terminal clusters by their displayClusterName to handle collapsed nodes
    // When collapsed, multiple terminal clusters share the same displayClusterName (e.g., "B10")
    // and need to share the total contextual frequency proportionally
    const terminalClustersByDisplayName = new Map<string, string[]>();
    for (const [
      terminalClusterName,
      clusterCompositions,
    ] of compositionsByCluster) {
      const displayClusterName =
        clusterCompositions[0]?.cluster || terminalClusterName;
      if (!terminalClustersByDisplayName.has(displayClusterName)) {
        terminalClustersByDisplayName.set(displayClusterName, []);
      }
      terminalClustersByDisplayName
        .get(displayClusterName)
        ?.push(terminalClusterName);
    }

    // Step 1.6: Calculate and cache original frequencies for ALL terminal clusters BEFORE any modifications
    // This is crucial because Step 2 will modify composition.frequency values
    const originalFrequencyByTerminalCluster = new Map<string, number>();
    for (const [
      terminalClusterName,
      clusterCompositions,
    ] of compositionsByCluster) {
      let totalOriginalFrequency = 0;
      for (const composition of clusterCompositions) {
        totalOriginalFrequency += composition.frequency || 0;
      }
      originalFrequencyByTerminalCluster.set(
        terminalClusterName,
        totalOriginalFrequency,
      );
    }

    // Step 1.7: For each displayClusterName, calculate total contextual frequency once
    const contextualFrequencyByDisplayName = new Map<string, number>();
    for (const [
      displayClusterName,
      terminalClusterNames,
    ] of terminalClustersByDisplayName) {
      let totalContextualFrequency = 0;
      let matchedCells = 0;

      for (let i = 0; i < matrixCellDatas.length; i++) {
        const cell = matrixCellDatas[i];
        if (!cell) continue;

        const axisPartValues =
          currentIndex === 0 ? cell.xaxisPartValues : cell.yaxisPartValues;
        const axisDisplayPart =
          currentIndex === 0 ? cell.xDisplayaxisPart : cell.yDisplayaxisPart;

        // Check if this cell matches any terminal cluster OR the display cluster name
        const cellMatches =
          terminalClusterNames.some((tcn) => axisPartValues === tcn) ||
          axisDisplayPart === displayClusterName;

        if (cellMatches) {
          matchedCells++;

          if (cell.cellFreqHash && cell.cellFreqs) {
            const contextCombinations = this.generateContextCombinations(
              contextDimensionIndices,
            );

            for (const combination of contextCombinations) {
              const contextKey = combination.join(',');
              const contextPosition = (cell.cellFreqHash as any)[contextKey];
              if (
                contextPosition !== undefined &&
                contextPosition < cell.cellFreqs.length
              ) {
                const contextualFrequency =
                  cell.cellFreqs[contextPosition] || 0;
                totalContextualFrequency += contextualFrequency;
              }
            }
          }
        }
      }

      contextualFrequencyByDisplayName.set(
        displayClusterName,
        totalContextualFrequency,
      );
    }

    // Step 2: For each terminal cluster, calculate its share of the contextual frequency and distribute it among its values
    for (const [
      terminalClusterName,
      clusterCompositions,
    ] of compositionsByCluster) {
      // Get the display cluster name (may be collapsed parent name like "B10")
      const displayClusterName =
        clusterCompositions[0]?.cluster || terminalClusterName;

      // Get the total contextual frequency for this display cluster
      const totalDisplayContextualFrequency =
        contextualFrequencyByDisplayName.get(displayClusterName) || 0;

      // If this display cluster has multiple terminal clusters (collapsed case),
      // calculate this terminal cluster's share of the contextual frequency
      let totalContextualFrequency = 0;

      const terminalClustersInDisplayCluster =
        terminalClustersByDisplayName.get(displayClusterName) || [];
      if (terminalClustersInDisplayCluster.length > 1) {
        // Calculate total original frequency across all terminal clusters in this display cluster
        // IMPORTANT: Use cached original frequencies to avoid using modified values
        let totalOriginalFrequencyAllClusters = 0;
        for (const tcn of terminalClustersInDisplayCluster) {
          totalOriginalFrequencyAllClusters +=
            originalFrequencyByTerminalCluster.get(tcn) || 0;
        }

        // Get this terminal cluster's cached original frequency
        const thisClusterOriginalFrequency =
          originalFrequencyByTerminalCluster.get(terminalClusterName) || 0;

        // Calculate this terminal cluster's share of the contextual frequency
        if (totalOriginalFrequencyAllClusters > 0) {
          const proportion =
            thisClusterOriginalFrequency / totalOriginalFrequencyAllClusters;
          totalContextualFrequency = Math.round(
            totalDisplayContextualFrequency * proportion,
          );
        }
      } else {
        // Expanded case: This terminal cluster gets the full contextual frequency
        totalContextualFrequency = totalDisplayContextualFrequency;
      }

      if (totalContextualFrequency > 0) {
        // Calculate total original frequency for this cluster
        let totalOriginalFrequency = 0;
        for (const composition of clusterCompositions) {
          totalOriginalFrequency += composition.frequency || 0;
        }

        // Step 3: Distribute the contextual frequency among values based on their original proportions
        // Expected Frequency(value) = Total Contextual Frequency × (Original Frequency of value / Total Original Frequency of cluster)
        for (const composition of clusterCompositions) {
          const originalFrequency = composition.frequency || 0;

          if (totalOriginalFrequency > 0) {
            const proportion = originalFrequency / totalOriginalFrequency;
            const expectedFrequency = Math.round(
              totalContextualFrequency * proportion,
            );

            composition.frequency = expectedFrequency;

            // For numerical variables, also update partFrequencies proportionally
            if (composition.partFrequencies && originalFrequency > 0) {
              const scaleFactor = expectedFrequency / originalFrequency;
              composition.partFrequencies = composition.partFrequencies.map(
                (freq) => Math.round(freq * scaleFactor),
              );
            }

            // For categorical variables, also update valueFrequencies proportionally
            if (
              composition.valueGroups?.valueFrequencies &&
              originalFrequency > 0
            ) {
              const scaleFactor = expectedFrequency / originalFrequency;
              composition.valueGroups.valueFrequencies =
                composition.valueGroups.valueFrequencies.map((freq) =>
                  Math.round(freq * scaleFactor),
                );
            }
          } else {
            composition.frequency = 0;
          }
        }
      } else {
        // Set all compositions in this cluster to 0 frequency
        for (const composition of clusterCompositions) {
          composition.frequency = 0;
        }
      }
    }
  }

  /**
   * Generates all possible combinations of context dimension indices.
   * For example, if contextIndices = [[1,2], [3,4]], it returns [[1,3], [1,4], [2,3], [2,4]]
   *
   * @param contextIndices - Array of arrays where each sub-array contains the leaf indices for a context dimension
   * @returns Array of all possible combinations
   */
  private generateContextCombinations(contextIndices: number[][]): number[][] {
    if (contextIndices.length === 0) {
      return [[]];
    }

    if (contextIndices.length === 1) {
      const firstDimension = contextIndices[0];
      return firstDimension ? firstDimension.map((index) => [index]) : [[]];
    }

    const result: number[][] = [];
    const firstDimension = contextIndices[0];
    if (!firstDimension) {
      return [[]];
    }

    const restDimensions = contextIndices.slice(1);
    const restCombinations = this.generateContextCombinations(restDimensions);

    for (const firstIndex of firstDimension) {
      for (const restCombination of restCombinations) {
        result.push([firstIndex, ...restCombination]);
      }
    }

    return result;
  }

  /**
   * Processes a batch of CompositionModel objects to merge those with the same innerVariable
   * @param models Array of CompositionModel objects to analyze
   * @returns Array of merged CompositionModel objects
   */
  mergeAllContiguousModels(models: CompositionModel[]): CompositionModel[] {
    // Group models by innerVariable
    const modelsByVariable: Record<string, CompositionModel[]> = {};

    models.forEach((model) => {
      if (model.innerVariable !== undefined) {
        if (!modelsByVariable[model.innerVariable]) {
          modelsByVariable[model.innerVariable] = [];
        }
        const arr = modelsByVariable[model.innerVariable];
        if (arr) {
          arr.push(model);
        }
      }
    });

    // Process each group separately
    const results: CompositionModel[] = [];

    for (const variable in modelsByVariable) {
      const variableModels = modelsByVariable[variable];

      // Skip if there's only one model for this variable
      if ((variableModels ?? []).length <= 1) {
        results.push(...(variableModels ?? []));
        continue;
      }

      // Get the type of the variable
      const variableType =
        variableModels?.[0] && variableModels[0].innerVariableType;

      if (variableType === TYPES.CATEGORICAL) {
        // For categorical variables, merge all models with the same innerVariable
        const baseModel = variableModels?.[0];

        // Use valueGroups.values instead of part for categorical variables
        const allValues: string[] = [];
        const allValueFrequencies: number[] = [];

        variableModels?.forEach((model) => {
          // Use valueGroups.values which contains the exhaustive list of parts
          if (model.valueGroups?.values) {
            allValues.push(...model.valueGroups.values);

            // Add corresponding frequencies if they exist
            if (model.valueGroups.valueFrequencies) {
              allValueFrequencies.push(...model.valueGroups.valueFrequencies);
            }
          } else if (model.part) {
            // Fallback to part if valueGroups isn't available
            allValues.push(
              ...(Array.isArray(model.part) ? model.part : [model.part]),
            );
          }
        });

        const totalFrequency = variableModels?.reduce(
          (sum, model) => sum + (model.frequency || 0),
          0,
        );

        // Create merged categorical model
        const mergedCategoricalValues = this.mergeCategoricalSets(allValues);
        const mergedCategoricalModel = {
          ...baseModel,
          frequency: totalFrequency,
          part: mergedCategoricalValues,
          _id: variableModels?.map((m) => m._id).join('_') + '_merged',
          value: baseModel?.innerVariable + ' ' + mergedCategoricalValues[0],
        };

        // Update valueGroups in the merged model
        if (baseModel && baseModel.valueGroups) {
          mergedCategoricalModel.valueGroups = {
            ...baseModel.valueGroups,
            values: allValues, // Use the full list of values
            valueFrequencies:
              allValueFrequencies.length > 0
                ? allValueFrequencies
                : baseModel.valueGroups.valueFrequencies,
          };
        }

        // @ts-ignore
        results.push(mergedCategoricalModel);
      } else {
        // For numerical variables, merge all models with the same innerVariable
        // regardless of whether their intervals are contiguous

        // Simply merge all models with the same innerVariable
        const baseModel = variableModels?.[0];
        const allParts: string[] = [];
        const allPartFrequencies: number[] = [];
        const allPartDetails: string[] = [];

        variableModels?.forEach((model) => {
          // Collect all parts
          if (model.part) {
            allParts.push(
              ...(Array.isArray(model.part) ? model.part : [model.part]),
            );
          }

          // Collect all part frequencies for numerical variables
          if (model.partFrequencies) {
            allPartFrequencies.push(...model.partFrequencies);
          }

          // Collect all part details (exhaustive list) for numerical variables
          if (model.partDetails) {
            allPartDetails.push(...model.partDetails);
          } else if (model.part) {
            // Fallback to part if partDetails isn't available
            allPartDetails.push(
              ...(Array.isArray(model.part) ? model.part : [model.part]),
            );
          }
        });

        const totalFrequency = variableModels?.reduce(
          (sum, model) => sum + (model.frequency || 0),
          0,
        );

        // Try to simplify intervals if they are contiguous
        const simplifiedParts = CompositionUtils.simplifyIntervals(allParts);

        const mergedNumericalModel = {
          ...baseModel,
          frequency: totalFrequency,
          part: simplifiedParts,
          partFrequencies:
            allPartFrequencies.length > 0 ? allPartFrequencies : undefined,
          partDetails:
            allPartDetails.length > 0
              ? CompositionUtils.sortIntervals(allPartDetails)
              : undefined,
          _id: variableModels?.map((m) => m._id).join('_') + '_merged',
          value:
            baseModel && baseModel.innerVariable
              ? baseModel.innerVariable + ' ' + allParts.join(', ')
              : allParts.join(', '),
        };

        // @ts-ignore
        results.push(mergedNumericalModel);
      }
    }

    return results;
  }

  /**
   * For categorical values, merges the contents of sets or direct values
   * @param categoricalValues Array of values, either formatted strings or direct values
   * @returns Merged set of values
   */
  mergeCategoricalSets(categoricalValues: string[]): string[] {
    // Helper function to extract values from a set string or direct value
    const extractValues = (value: string): string[] => {
      // Check if the value is in the format "{value1, value2, ...}"
      const match = value.match(/{([^}]*)}/);
      if (match) {
        // Split by comma and trim
        return match[1]?.split(',').map((s) => s.trim()) || [];
      }
      // If not in braces format, return as-is
      return [value.trim()];
    };

    // Collect all unique values
    const allValues = new Set<string>();

    categoricalValues.forEach((value) => {
      if (value) {
        // Check for null/undefined values
        extractValues(value).forEach((v) => {
          allValues.add(v);
        });
      }
    });

    // Create a new set string with all values
    return [`{${Array.from(allValues).join(', ')}}`];
  }

  /**
   * Recursively processes collapsed children and sub-children nodes.
   * For each collapsed child, it processes its compositions and merges them.
   * This method is called before processing the current node to ensure that
   * collapsed children's compositions are properly handled even when the parent is expanded.
   * Returns a Set of collapsed child names that have been processed to avoid double processing.
   */
  private processCollapsedChildren(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
    isIndiVarCase: boolean,
    compositionValues: CompositionModel[],
  ): Set<string> {
    const processedCollapsedChildren = new Set<string>();

    // Check if the node has children
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        // If the child is collapsed, process its compositions
        if (child.isCollapsed) {
          const childCompositions = this.getCompositionValuesForNode(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            child,
            currentIndex,
            isIndiVarCase,
          );
          // Merge the child's compositions and add them to the main composition values
          const mergedChildCompositions =
            this.mergeAllContiguousModels(childCompositions);
          const formattedChildCompositions = this.formatCompositions(
            child,
            mergedChildCompositions,
          );
          // Ensure the collapsed child compositions keep the child's cluster name
          formattedChildCompositions.forEach((composition) => {
            composition.cluster = child.cluster;
          });
          compositionValues.push(...formattedChildCompositions);

          // Mark all children of this collapsed node as processed
          if (child.childrenLeafList) {
            child.childrenLeafList.forEach((leafName) => {
              processedCollapsedChildren.add(leafName);
            });
          }
        } else {
          // If the child is not collapsed, recursively check its children
          const childProcessedCollapsed = this.processCollapsedChildren(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            child,
            currentIndex,
            isIndiVarCase,
            compositionValues,
          );
          // Add the processed collapsed children from the recursive call
          childProcessedCollapsed.forEach((name) =>
            processedCollapsedChildren.add(name),
          );
        }
      }
    }

    return processedCollapsedChildren;
  }

  /**
   * Helper method to get composition values for a specific node without recursive processing.
   * This is used to avoid infinite recursion when processing collapsed children.
   */
  private getCompositionValuesForNode(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
    isIndiVarCase: boolean,
  ): CompositionModel[] {
    return this.processNodeCompositions(
      currentDimensionDetails,
      currentInitialDimensionDetails,
      node,
      currentIndex,
      isIndiVarCase,
    );
  }

  /**
   * Retrieves the detailedParts for a composition based on its _id.
   *
   * @param id - The unique identifier of the composition
   * @returns The detailedParts of the composition, or undefined if not found
   */
  getCompositionDetailedPartsFromId(id: string): CompositionModel | undefined {
    if (!this.compositionValues || this.compositionValues.length === 0) {
      return undefined;
    }

    return this.compositionValues.find((comp) => comp._id === id);
  }
}
