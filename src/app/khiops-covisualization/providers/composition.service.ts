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

  getIndiVarCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
  ) {
    let compositionValues: CompositionModel[] = [];
    if (currentDimensionDetails?.isCategorical) {
      node.getChildrenList();
      node.getValueGroups(currentInitialDimensionDetails);

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
          // Check if this name has been updated
          const currentClusterDetails =
            currentInitialDimensionDetails.valueGroups?.find(
              (e) => e.cluster === currentLeafName,
            );
          if (currentClusterDetails) {
            const currentParts = node.formatedValues?.[i];

            for (let j = 0; j < (currentParts?.length ?? 0); j++) {
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
                currentParts?.[j],
              );
              compositionValues.push(composition);
            }
          }
        }
      }
    }

    if (node.isCollapsed) {
      // Merge compositionValues elements with contiguous intervals
      compositionValues = this.mergeAllContiguousModels(compositionValues);
    }

    return compositionValues;
  }

  getVarVarCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
  ) {
    const compositionValues: CompositionModel[] = [];
    // Composition only available for categorical Dimensions
    if (currentDimensionDetails?.isCategorical) {
      node.getChildrenList();

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
          // Check if this name has been updated
          const currentClusterDetails =
            currentInitialDimensionDetails.valueGroups?.find(
              (e) => e.cluster === currentLeafName,
            );
          if (currentClusterDetails) {
            const currentClusterDetailsLength =
              currentClusterDetails.values.length;
            for (let j = 0; j < currentClusterDetailsLength; j++) {
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
              );
              compositionValues.push(composition);
            }
          }
        }
      }
    }
    return compositionValues;
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
      // Patterns for different interval formats
      const infPattern = /\]-inf[;,]([\d.]+)\]/;
      const rangePattern = /\]([\d.]+)[;,]([\d.]+)\]/;
      const plusInfPattern = /\]([\d.]+)[;,]\+inf\[/;

      let lowerBound: number, upperBound: number;

      if (infPattern.test(interval)) {
        const match = interval.match(infPattern);
        lowerBound = -Infinity;
        upperBound = match ? parseFloat(match[1]!) : NaN;
      } else if (plusInfPattern.test(interval)) {
        const match = interval.match(plusInfPattern);
        lowerBound = match ? parseFloat(match[1]!) : NaN;
        upperBound = Infinity;
      } else if (rangePattern.test(interval)) {
        const match = interval.match(rangePattern);
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
   * Merges two contiguous intervals into a single one
   */
  mergeIntervals(interval1: string, interval2: string): string {
    const extractBounds = (
      interval: string,
    ): {
      lowerBound: number;
      upperBound: number;
      format: string;
      separator: string;
    } => {
      // Patterns for different interval formats
      const infPattern = /\]-inf([;,])([\d.]+)\]/;
      const rangePattern = /\]([\d.]+)([;,])([\d.]+)\]/;
      const plusInfPattern = /\]([\d.]+)([;,])\+inf\[/;

      let lowerBound: number,
        upperBound: number,
        format: string,
        separator: string;

      if (infPattern.test(interval)) {
        const match = interval.match(infPattern);
        lowerBound = -Infinity;
        upperBound = match ? parseFloat(match[2]!) : NaN;
        separator = match ? match[1]! : ';';
        format = 'inf';
      } else if (plusInfPattern.test(interval)) {
        const match = interval.match(plusInfPattern);
        lowerBound = match ? parseFloat(match[1]!) : NaN;
        upperBound = Infinity;
        separator = match ? match[2]! : ';';
        format = 'plusInf';
      } else if (rangePattern.test(interval)) {
        const match = interval.match(rangePattern);
        lowerBound = match ? parseFloat(match[1]!) : NaN;
        upperBound = match ? parseFloat(match[3]!) : NaN;
        separator = match ? match[2]! : ';';
        format = 'range';
      } else {
        return {
          lowerBound: NaN,
          upperBound: NaN,
          format: 'unknown',
          separator: ';',
        };
      }

      return { lowerBound, upperBound, format, separator };
    };

    const bounds1 = extractBounds(interval1);
    const bounds2 = extractBounds(interval2);

    // Determine new min and max bounds
    const minLowerBound = Math.min(bounds1.lowerBound, bounds2.lowerBound);
    const maxUpperBound = Math.max(bounds1.upperBound, bounds2.upperBound);

    // Use the separator from the first interval
    const separator = bounds1.separator;

    // Format the new interval
    if (minLowerBound === -Infinity && maxUpperBound === Infinity) {
      return `]-inf${separator}+inf[`;
    } else if (minLowerBound === -Infinity) {
      return `]-inf${separator}${maxUpperBound}]`;
    } else if (maxUpperBound === Infinity) {
      return `]${minLowerBound}${separator}+inf[`;
    } else {
      return `]${minLowerBound}${separator}${maxUpperBound}]`;
    }
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
      const infPattern = /\]-inf[;,]([\d.]+)\]/;
      const rangePattern = /\]([\d.]+)[;,]([\d.]+)\]/;
      const plusInfPattern = /\]([\d.]+)[;,]\+inf\[/;

      let lower: number, upper: number;

      if (infPattern.test(interval)) {
        const match = interval.match(infPattern);
        lower = -Infinity;
        upper = match ? parseFloat(match[1]!) : NaN;
      } else if (plusInfPattern.test(interval)) {
        const match = interval.match(plusInfPattern);
        lower = match ? parseFloat(match[1]!) : NaN;
        upper = Infinity;
      } else if (rangePattern.test(interval)) {
        const match = interval.match(rangePattern);
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

    // Iterate through parts of both models to find contiguous intervals
    for (const part1 of model1.part!) {
      for (const part2 of model2.part!) {
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
        const infPattern = /\]-inf[;,]([\d.]+)\]/;
        const rangePattern = /\]([\d.]+)[;,]([\d.]+)\]/;
        const plusInfPattern = /\]([\d.]+)[;,]\+inf\[/;

        if (infPattern.test(interval)) {
          return -Infinity;
        } else if (rangePattern.test(interval)) {
          const match = interval.match(rangePattern);
          return match ? parseFloat(match[1]!) : NaN;
        } else if (plusInfPattern.test(interval)) {
          const match = interval.match(plusInfPattern);
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

    // Handle categorical variables
    if (model1.innerVariableType === TYPES.CATEGORICAL) {
      mergedParts = this.mergeCategoricalSets([
        ...model1.part!,
        ...model2.part!,
      ]);
    } else {
      // Handle numerical variables (intervals)
      mergedParts = this.simplifyIntervals([...model1.part!, ...model2.part!]);
    }

    // Create the merged model
    const mergedModel: CompositionModel = {
      ...model1,
      frequency: model1.frequency! + model2.frequency!,
      part: mergedParts,
      _id: `${model1._id}_${model2._id}_merged`, // Temporary ID
      // Update value to reflect the merged parts
      value: model1.innerVariable + ' ' + mergedParts[0],
    };

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
      // @ts-ignore
      if (variableModels.length <= 1) {
        results.push(...variableModels!);
        continue;
      }

      // Get the type of the variable
      const variableType = variableModels?.[0]!.innerVariableType;

      if (variableType === TYPES.CATEGORICAL) {
        // For categorical variables, merge all models with the same innerVariable
        const baseModel = variableModels?.[0];
        const allParts = variableModels?.flatMap((model) => model.part);
        const totalFrequency = variableModels?.reduce(
          (sum, model) => sum + model.frequency!,
          0,
        );

        const mergedCategoricalModel = {
          ...baseModel,
          frequency: totalFrequency,
          // @ts-ignore
          part: this.mergeCategoricalSets(allParts!),
          _id: variableModels?.map((m) => m._id).join('_') + '_merged',
          value:
            baseModel?.innerVariable +
            ' ' +
            // @ts-ignore
            this.mergeCategoricalSets(allParts)[0],
        };

        // @ts-ignore
        results.push(mergedCategoricalModel);
      } else {
        // For numerical variables, continue with the existing merging logic
        let workingModels = [...variableModels!];
        let mergeOccurred = true;

        // Continue merging until no more merges are possible
        while (mergeOccurred) {
          mergeOccurred = false;

          for (let i = 0; i < workingModels.length; i++) {
            if (mergeOccurred) break;

            for (let j = i + 1; j < workingModels.length; j++) {
              if (this.canMergeModels(workingModels[i]!, workingModels[j]!)) {
                // Merge models
                const mergedModel = this.mergeCompositionModels(
                  workingModels[i]!,
                  workingModels[j]!,
                );

                // Remove original models and add merged model
                workingModels.splice(j, 1);
                workingModels.splice(i, 1);
                workingModels.push(mergedModel);

                mergeOccurred = true;
                break;
              }
            }
          }
        }

        // Check if numeric intervals cover the entire range
        const finalModels = workingModels.map((model) => {
          if (
            // @ts-ignore
            model.part.length === 1 &&
            // @ts-ignore
            (model.part[0] === ']-inf;+inf[' || model.part[0] === ']-inf,+inf[')
          ) {
            // @ts-ignore
            const separator = model.part[0].includes(',') ? ',' : ';';
            return {
              ...model,
              value: model.innerVariable + ` ]-inf${separator}+inf[`,
            };
          }
          return model;
        });

        // Add processed models to results
        results.push(...finalModels);
      }
    }

    return results;
  }

  /**
   * For categorical values, merges the contents of sets in the format "{value1, value2, ...}"
   * @param categoricalSets Array of string sets in the format "{value1, value2, ...}"
   * @returns Merged set of values
   */
  mergeCategoricalSets(categoricalSets: string[]): string[] {
    // Helper function to extract values from a set string
    const extractValues = (setStr: string): string[] => {
      // Match content inside curly braces
      const match = setStr.match(/{([^}]*)}/);
      if (!match) return [];

      // Split by comma and trim
      // @ts-ignore
      return match[1].split(',').map((s) => s.trim());
    };

    // Collect all unique values
    const allValues = new Set<string>();

    categoricalSets.forEach((set) => {
      extractValues(set).forEach((value) => {
        allValues.add(value);
      });
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

    // Categorical variables can always be merged if they have the same innerVariable
    if (
      model1.innerVariableType === TYPES.CATEGORICAL &&
      model2.innerVariableType === TYPES.CATEGORICAL
    ) {
      return true;
    }

    // For numerical variables, check if parts are contiguous
    return this.haveContiguousParts(model1, model2);
  }
}
