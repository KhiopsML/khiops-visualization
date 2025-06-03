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

// Define global constants for interval patterns
const INF_PATTERN = /\]-inf[;,]([\d.]+)\]/;
const RANGE_PATTERN = /\]([\d.]+)[;,]([\d.]+)\]/;
const PLUS_INF_PATTERN = /\]([\d.]+)[;,]\+inf\[/;

@Injectable({
  providedIn: 'root',
})
export class CompositionService {
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
              const composition = new CompositionModel(
                currentClusterDetails,
                currentDimensionHierarchyCluster,
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
   * Checks if two intervals are contiguous
   * Supported interval format: ]-inf;a], ]a;b], ]b;+inf[
   */
  areIntervalsContiguous(interval1: string, interval2: string): boolean {
    // Extract bounds from intervals
    const extractBounds = (
      interval: string,
    ): { lowerBound: number; upperBound: number } => {
      let lowerBound: number, upperBound: number;

      if (INF_PATTERN.test(interval)) {
        const match = interval.match(INF_PATTERN);
        lowerBound = -Infinity;
        upperBound = match ? parseFloat(match[1]!) : NaN;
      } else if (PLUS_INF_PATTERN.test(interval)) {
        const match = interval.match(PLUS_INF_PATTERN);
        lowerBound = match ? parseFloat(match[1]!) : NaN;
        upperBound = Infinity;
      } else if (RANGE_PATTERN.test(interval)) {
        const match = interval.match(RANGE_PATTERN);
        lowerBound = match ? parseFloat(match[1]!) : NaN;
        upperBound = match ? parseFloat(match[2]!) : NaN;
      } else {
        return { lowerBound: NaN, upperBound: NaN };
      }

      return { lowerBound, upperBound };
    };

    const bounds1 = extractBounds(interval1);
    const bounds2 = extractBounds(interval2);

    // Check if intervals are contiguous (one upper bound equals one lower bound)
    return (
      bounds1.upperBound === bounds2.lowerBound ||
      bounds2.upperBound === bounds1.lowerBound
    );
  }

  /**
   * Merges a list of intervals into a simplified form
   * @param intervals Array of interval strings to merge
   * @returns Array of simplified interval strings
   */
  simplifyIntervals(intervals: string[]): string[] {
    if (intervals.length === 0) return [];

    // First, sort the intervals
    const sortedIntervals = this.sortIntervals(intervals);

    // Extract numeric ranges from the intervals
    const ranges: Array<{ lower: number; upper: number }> = [];

    sortedIntervals.forEach((interval) => {
      let lower: number, upper: number;

      if (INF_PATTERN.test(interval)) {
        const match = interval.match(INF_PATTERN);
        lower = -Infinity;
        upper = match ? parseFloat(match[1]!) : NaN;
      } else if (PLUS_INF_PATTERN.test(interval)) {
        const match = interval.match(PLUS_INF_PATTERN);
        lower = match ? parseFloat(match[1]!) : NaN;
        upper = Infinity;
      } else if (RANGE_PATTERN.test(interval)) {
        const match = interval.match(RANGE_PATTERN);
        lower = match ? parseFloat(match[1]!) : NaN;
        upper = match ? parseFloat(match[2]!) : NaN;
      } else {
        // Non-numeric interval, keep as is
        return;
      }

      ranges.push({ lower, upper });
    });

    // No ranges to merge
    if (ranges.length === 0) return sortedIntervals;

    // Merge overlapping or contiguous ranges
    const mergedRanges: Array<{ lower: number; upper: number }> = [];
    let currentRange = ranges[0];

    for (let i = 1; i < ranges.length; i++) {
      const range = ranges[i];

      // Check if current range overlaps or is contiguous with the next one
      if (
        // @ts-ignore
        currentRange.upper >= range.lower ||
        // @ts-ignore
        Math.abs(currentRange.upper - range.lower) < 0.0001
      ) {
        // Merge ranges
        // @ts-ignore
        currentRange.upper = Math.max(currentRange.upper, range.upper);
      } else {
        // No overlap, store current range and start a new one
        mergedRanges.push(currentRange!);
        currentRange = range;
      }
    }

    // Add the last range
    mergedRanges.push(currentRange!);

    // Convert back to interval strings
    const result = mergedRanges.map((range) => {
      const separator = intervals[0]?.includes(',') ? ',' : ';';
      if (range.lower === -Infinity && range.upper === Infinity) {
        return `]-inf${separator}+inf[`;
      } else if (range.lower === -Infinity) {
        return `]-inf${separator}${range.upper}]`;
      } else if (range.upper === Infinity) {
        return `]${range.lower}${separator}+inf[`;
      } else {
        return `]${range.lower}${separator}${range.upper}]`;
      }
    });

    return result;
  }

  /**
   * Determines if two CompositionModel objects have contiguous parts
   */
  haveContiguousParts(
    model1: CompositionModel,
    model2: CompositionModel,
  ): boolean {
    // Check if models concern the same variable
    if (model1.innerVariable !== model2.innerVariable) {
      return false;
    }

    // Early return for categorical variables
    if (model1.innerVariableType === TYPES.CATEGORICAL) {
      return true; // Categorical variables with same innerVariable can always be merged
    }

    // For numerical variables, get parts from model.part
    const parts1 = model1.part || [];
    const parts2 = model2.part || [];

    // Iterate through parts of both models to find contiguous intervals
    for (const part1 of parts1) {
      for (const part2 of parts2) {
        if (this.areIntervalsContiguous(part1, part2)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Sorts interval strings in ascending order
   * @param intervals Array of interval strings to sort
   * @returns Sorted array of interval strings
   */
  sortIntervals(intervals: string[]): string[] {
    return [...intervals].sort((a, b) => {
      // Extract lower bounds for comparison
      const extractLowerBound = (interval: string): number => {
        if (INF_PATTERN.test(interval)) {
          return -Infinity;
        } else if (RANGE_PATTERN.test(interval)) {
          const match = interval.match(RANGE_PATTERN);
          return match ? parseFloat(match[1]!) : NaN;
        } else if (PLUS_INF_PATTERN.test(interval)) {
          const match = interval.match(PLUS_INF_PATTERN);
          return match ? parseFloat(match[1]!) : NaN;
        }
        return NaN;
      };

      const lowerBoundA = extractLowerBound(a);
      const lowerBoundB = extractLowerBound(b);

      return lowerBoundA - lowerBoundB;
    });
  }

  /**
   * Fuses two CompositionModel objects that can be merged
   * @param model1 First CompositionModel
   * @param model2 Second CompositionModel
   * @returns Merged CompositionModel
   */
  mergeCompositionModels(
    model1: CompositionModel,
    model2: CompositionModel,
  ): CompositionModel {
    // Check if models can be merged
    if (!this.canMergeModels(model1, model2)) {
      throw new Error('Models cannot be merged');
    }

    let mergedParts: string[];
    let allValues: string[] = [];

    // Handle categorical variables
    if (model1.innerVariableType === TYPES.CATEGORICAL) {
      // Collect values from both models' valueGroups if available
      if (model1.valueGroups?.values) {
        allValues.push(...model1.valueGroups.values);
      }
      if (model2.valueGroups?.values) {
        allValues.push(...model2.valueGroups.values);
      }

      // Fallback to part if valueGroups isn't available
      if (allValues.length === 0) {
        if (model1.part) {
          allValues.push(
            ...(Array.isArray(model1.part) ? model1.part : [model1.part]),
          );
        }
        if (model2.part) {
          allValues.push(
            ...(Array.isArray(model2.part) ? model2.part : [model2.part]),
          );
        }
      }

      mergedParts = this.mergeCategoricalSets(allValues);
    } else {
      // Handle numerical variables (intervals)
      const parts1 = model1.part || [];
      const parts2 = model2.part || [];

      // Check if intervals are contiguous
      const areContiguous = this.haveContiguousParts(model1, model2);

      if (areContiguous) {
        // If contiguous, merge the intervals
        mergedParts = this.simplifyIntervals([...parts1, ...parts2]);
      } else {
        // If not contiguous, keep all parts separate (don't merge)
        mergedParts = [...parts1, ...parts2];
      }
    }

    // Create the merged model
    const mergedModel: CompositionModel = {
      ...model1,
      frequency: (model1.frequency || 0) + (model2.frequency || 0),
      part: mergedParts,
      _id: `${model1._id}_${model2._id}_merged`, // Temporary ID
      // Update value to reflect the merged parts
      value:
        model1.innerVariable +
        ' ' +
        (mergedParts.length > 1
          ? `[${mergedParts.length} intervals]`
          : mergedParts[0]),
    };

    // Update valueGroups if it's a categorical variable
    if (model1.innerVariableType === TYPES.CATEGORICAL) {
      if (model1.valueGroups) {
        mergedModel.valueGroups = {
          ...model1.valueGroups,
          values: allValues, // Use the comprehensive list of values
        };
      } else if (mergedModel.valueGroups) {
        mergedModel.valueGroups.values = allValues;
      }
    } else {
      // For numerical variables, merge valueGroups appropriately
      if (model1.valueGroups && model2.valueGroups) {
        // Combine values from both models
        const combinedValues = [
          ...(model1.valueGroups.values || []),
          ...(model2.valueGroups.values || []),
        ];

        const combinedFrequencies = [
          ...(model1.valueGroups.valueFrequencies || []),
          ...(model2.valueGroups.valueFrequencies || []),
        ];

        mergedModel.valueGroups = {
          ...model1.valueGroups,
          values: combinedValues,
          valueFrequencies:
            combinedFrequencies.length > 0 ? combinedFrequencies : [],
        };
      }
    }

    return mergedModel;
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
        const allValues: string[] = [];
        const allValueFrequencies: number[] = [];

        variableModels?.forEach((model) => {
          // Collect all parts
          if (model.part) {
            allParts.push(
              ...(Array.isArray(model.part) ? model.part : [model.part]),
            );
          }

          // Collect all values from valueGroups
          if (model.valueGroups?.values) {
            allValues.push(...model.valueGroups.values);

            if (model.valueGroups.valueFrequencies) {
              allValueFrequencies.push(...model.valueGroups.valueFrequencies);
            }
          }
        });

        const totalFrequency = variableModels?.reduce(
          (sum, model) => sum + (model.frequency || 0),
          0,
        );

        // Try to simplify intervals if they are contiguous
        const simplifiedParts = this.simplifyIntervals(allParts);

        const mergedNumericalModel = {
          ...baseModel,
          frequency: totalFrequency,
          part: simplifiedParts,
          _id: variableModels?.map((m) => m._id).join('_') + '_merged',
          value:
            baseModel?.innerVariable +
            ' ' +
            (simplifiedParts.length > 1
              ? `[${simplifiedParts.length} intervals]`
              : simplifiedParts[0]),
        };

        // Update valueGroups for numerical variables
        if (baseModel?.valueGroups) {
          mergedNumericalModel.valueGroups = {
            ...baseModel.valueGroups,
            values: allValues,
            valueFrequencies:
              allValueFrequencies.length > 0
                ? allValueFrequencies
                : baseModel.valueGroups.valueFrequencies,
          };
        }

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
   * Checks if two CompositionModel objects can be merged
   * @param model1 First CompositionModel
   * @param model2 Second CompositionModel
   * @returns Boolean indicating if models can be merged
   */
  canMergeModels(model1: CompositionModel, model2: CompositionModel): boolean {
    // Must have the same innerVariable
    if (model1.innerVariable !== model2.innerVariable) {
      return false;
    }

    // Models with the same innerVariable can always be merged
    // regardless of whether they are categorical or numerical
    return true;
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
              const composition = new CompositionModel(
                currentClusterDetails,
                currentDimensionHierarchyCluster,
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

    return compositionValues;
  }
}
