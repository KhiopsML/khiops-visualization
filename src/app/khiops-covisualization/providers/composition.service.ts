/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
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
  public compositionValues!: CompositionModel[];

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
        const currentInitialDimensionDetails: DimensionCovisualizationModel =
          new DimensionCovisualizationModel(
            this.appService.initialDatas.coclusteringReport.dimensionSummaries[
              position
            ]!,
            currentIndex,
          );
        const dimensionPartition =
          this.appService.initialDatas.coclusteringReport.dimensionPartitions[
            position
          ];

        // Set dimension partitions from intervals or valueGroup
        currentInitialDimensionDetails.setPartition(dimensionPartition!);

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

    // Then process the current node
    if (currentDimensionDetails?.isCategorical) {
      node.getChildrenList();
      if (isIndiVarCase) {
        node.getInnerValueGroups(currentInitialDimensionDetails);
      }

      if (node.childrenLeafList) {
        const currentDimensionClusters = Object.assign(
          [],
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
            currentIndex
          ],
        );
        const childrenLeafListLength = node.childrenLeafList.length;
        for (let i = 0; i < childrenLeafListLength; i++) {
          const currentLeafName = node.childrenLeafList[i];

          // Skip if currentLeafName is undefined or if it was already processed as part of a collapsed child
          if (isIndiVarCase) {
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

            for (let j = 0; j < (parts?.length ?? 0); j++) {
              const currentDimensionHierarchyCluster: any =
                currentDimensionClusters.find(
                  (e: any) => e.cluster === currentLeafName,
                );
              if (node.isCollapsed) {
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
              const composition = new CompositionModel(
                currentClusterDetails,
                currentDimensionHierarchyCluster,
                currentPartIndex ?? -1,
                j,
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

    if (node.isCollapsed && isIndiVarCase) {
      compositionValues = this.mergeAllContiguousModels(compositionValues);
      compositionValues = this.formatCompositions(node, compositionValues);
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
  ): CompositionModel[] {
    for (const composition of compositionValues) {
      // set the rank of all childs to the rank of the parent #206
      composition.rank = node.rank;
      // @ts-ignore
      composition.type = composition.innerVariableType;
      composition.cluster = node.cluster;
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
    return compositionValues;
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
   * Processes a batch of CompositionModel objects to merge those with the same innerVariable
   * @param models Array of CompositionModel objects to analyze
   * @returns Array of merged CompositionModel objects
   */
  mergeAllContiguousModels(models: CompositionModel[]): CompositionModel[] {
    // Group models by innerVariable
    const modelsByVariable: Record<string, CompositionModel[]> = {};

    models.forEach((model) => {
      if (!modelsByVariable[model.innerVariable!]) {
        modelsByVariable[model.innerVariable!] = [];
      }
      modelsByVariable[model.innerVariable!]!.push(model);
    });

    // Process each group separately
    const results: CompositionModel[] = [];

    for (const variable in modelsByVariable) {
      const variableModels = modelsByVariable[variable];

      // Skip if there's only one model for this variable
      if ((variableModels ?? []).length <= 1) {
        results.push(...variableModels!);
        continue;
      }

      // Get the type of the variable
      const variableType = variableModels?.[0]!.innerVariableType;

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
        if (baseModel?.valueGroups) {
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
          partFrequencies: allPartFrequencies.length > 0 ? allPartFrequencies : undefined,
          partDetails: allPartDetails.length > 0 ? CompositionUtils.sortIntervals(allPartDetails) : undefined,
          _id: variableModels?.map((m) => m._id).join('_') + '_merged',
          value: baseModel?.innerVariable + ' ' + allParts.join(', '), // Use all parts for the value representation
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
    let compositionValues: CompositionModel[] = [];

    if (currentDimensionDetails?.isCategorical) {
      node.getChildrenList();
      if (isIndiVarCase) {
        node.getInnerValueGroups(currentInitialDimensionDetails);
      }

      if (node.childrenLeafList) {
        const currentDimensionClusters = Object.assign(
          [],
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
            currentIndex
          ],
        );
        const childrenLeafListLength = node.childrenLeafList.length;

        for (let i = 0; i < childrenLeafListLength; i++) {
          const currentLeafName = node.childrenLeafList[i];
          const currentClusterDetails =
            currentInitialDimensionDetails.valueGroups?.find(
              (e) => e.cluster === currentLeafName,
            );
          if (currentClusterDetails) {
            const parts = isIndiVarCase
              ? node.innerValues?.[i]
              : currentClusterDetails.values;

            for (let j = 0; j < (parts?.length ?? 0); j++) {
              const currentDimensionHierarchyCluster: any =
                currentDimensionClusters.find(
                  (e: any) => e.cluster === currentLeafName,
                );
              if (node.isCollapsed) {
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
              const composition = new CompositionModel(
                currentClusterDetails,
                currentDimensionHierarchyCluster,
                currentPartIndex ?? -1,
                j,
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

    console.log(' compositionValues:', compositionValues);
    return compositionValues;
  }

  /**
   * Retrieves the detailedParts for a composition based on its _id.
   *
   * @param id - The unique identifier of the composition
   * @returns The detailedParts of the composition, or undefined if not found
   */
  getCompositionDetailedPartsFromId(id: string): any | undefined {
    if (!this.compositionValues || this.compositionValues.length === 0) {
      return undefined;
    }

    const composition = this.compositionValues.find((comp) => comp._id === id);
    return composition;
  }
}
