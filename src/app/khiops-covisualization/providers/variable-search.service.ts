/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { TYPES } from '@khiops-library/enum/types';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TranslateService } from '@ngstack/translate';
import { CompositionService } from '@khiops-covisualization/providers/composition.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';

export interface VariableSearchData {
  searchResults: GridDatasI;
  clusterMapping: Map<string, { cluster: string; _id: string }>;
}

@Injectable({
  providedIn: 'root',
})
export class VariableSearchService {
  constructor(
    private translate: TranslateService,
    private compositionService: CompositionService,
    private dimensionsDatasService: DimensionsDatasService,
  ) {}

  /**
   * Performs search and data transformation for variable search dialog
   * @param selectedDimension - The selected dimension for search
   * @param selectedInnerVariable - The selected inner variable to search within
   * @returns Processed search data with results and cluster mapping
   */
  performVariableSearch(
    selectedDimension: DimensionCovisualizationModel,
    selectedInnerVariable: string,
  ): VariableSearchData | null {
    if (!selectedInnerVariable) {
      return null;
    }

    // Get the type of the selected inner variable
    const innerVariableIndex =
      selectedDimension?.innerVariables?.dimensionSummaries?.findIndex(
        (dim) => dim.name === selectedInnerVariable,
      );

    if (innerVariableIndex === undefined || innerVariableIndex === -1) {
      return null;
    }

    const innerVariableType =
      selectedDimension?.innerVariables?.dimensionSummaries?.[
        innerVariableIndex
      ]?.type;

    // Get root compositions
    const dimIndex = this.dimensionsDatasService.getDimensionPositionFromName(
      selectedDimension.name,
    );
    const rootNode: TreeNodeModel | undefined =
      this.dimensionsDatasService.dimensionsDatas.dimensionsTrees?.[
        dimIndex
      ]?.[0];

    if (!rootNode) {
      return null;
    }

    // Get composition of highest level node
    const relevantCompositions = this.compositionService.getCompositionClusters(
      selectedDimension.name,
      rootNode,
    );
    if (!relevantCompositions || relevantCompositions.length === 0) {
      return null;
    }

    // Filter compositions by the selected inner variable
    const filteredCompositions = relevantCompositions.filter(
      (comp) => comp.innerVariable === selectedInnerVariable,
    );

    if (filteredCompositions.length === 0) {
      return null;
    }

    const searchResults: GridDatasI = {
      displayedColumns: [],
      values: [],
    };
    const clusterMapping = new Map<string, { cluster: string; _id: string }>();

    if (innerVariableType === TYPES.NUMERICAL) {
      this.processNumericalVariable(
        filteredCompositions,
        searchResults,
        clusterMapping,
      );
    } else {
      this.processCategoricalVariable(
        filteredCompositions,
        searchResults,
        clusterMapping,
      );
    }

    return {
      searchResults,
      clusterMapping,
    };
  }

  /**
   * Processes numerical variable compositions and creates grid data
   * @param filteredCompositions - Compositions filtered by inner variable
   * @param searchResults - Grid data structure to populate
   * @param clusterMapping - Map to store cluster information for each row
   */
  private processNumericalVariable(
    filteredCompositions: any[],
    searchResults: GridDatasI,
    clusterMapping: Map<string, { cluster: string; _id: string }>,
  ): void {
    // Set up columns for numerical variables
    searchResults.displayedColumns = [
      {
        headerName: this.translate.get('GLOBAL.INTERVAL'),
        field: 'interval',
      },
      {
        headerName: this.translate.get('GLOBAL.FREQUENCY'),
        field: 'frequency',
      },
    ];

    // Process each composition
    filteredCompositions.forEach((comp) => {
      if (comp.partDetails && comp.partFrequencies) {
        comp.partDetails.forEach((interval: string, index: number) => {
          const frequency =
            (comp.partFrequencies && comp.partFrequencies[index]) || 0;

          if (searchResults.values) {
            searchResults.values.push({
              interval: interval,
              frequency: frequency,
            });
          }

          // Create a unique key for this row and map it to cluster info
          const rowKey = `${interval}_${frequency}`;
          clusterMapping.set(rowKey, {
            cluster: comp.cluster,
            _id: comp._id,
          });
        });
      }
    });

    // Sort by interval (assuming intervals are strings like '[a, b)')
    if (searchResults.values) {
      searchResults.values = searchResults.values.sort(
        (
          a: { interval: string; frequency: number },
          b: { interval: string; frequency: number },
        ) => {
          return this.compareIntervals(a.interval, b.interval);
        },
      );
    }
  }

  /**
   * Processes categorical variable compositions and creates grid data
   * @param filteredCompositions - Compositions filtered by inner variable
   * @param searchResults - Grid data structure to populate
   * @param clusterMapping - Map to store cluster information for each row
   */
  private processCategoricalVariable(
    filteredCompositions: any[],
    searchResults: GridDatasI,
    clusterMapping: Map<string, { cluster: string; _id: string }>,
  ): void {
    // Set up columns for categorical variables
    searchResults.displayedColumns = [
      {
        headerName: this.translate.get('GLOBAL.MODALITY'),
        field: 'modality',
      },
      {
        headerName: this.translate.get('GLOBAL.FREQUENCY'),
        field: 'frequency',
      },
    ];

    // Process each composition
    filteredCompositions.forEach((comp) => {
      if (comp.valueGroups?.values && comp.valueGroups?.valueFrequencies) {
        comp.valueGroups.values.forEach((modality: string, index: number) => {
          const frequency =
            (comp.valueGroups &&
              comp.valueGroups.valueFrequencies &&
              comp.valueGroups.valueFrequencies[index]) ||
            0;

          if (searchResults.values) {
            searchResults.values.push({
              modality: modality,
              frequency: frequency,
            });
          }

          // Create a unique key for this row and map it to cluster info
          const rowKey = `${modality}_${frequency}`;
          clusterMapping.set(rowKey, {
            cluster: comp.cluster,
            _id: comp._id,
          });
        });
      }
    });

    // Sort by frequency descending
    if (searchResults.values) {
      searchResults.values = searchResults.values.sort(
        (
          a: { modality: string; frequency: number },
          b: { modality: string; frequency: number },
        ) => b.frequency - a.frequency,
      );
    }
  }

  /**
   * Compares two interval strings for sorting purposes
   * @param intervalA - First interval string
   * @param intervalB - Second interval string
   * @returns Comparison result for sorting
   */
  private compareIntervals(intervalA: string, intervalB: string): number {
    // Helper to check if interval is -inf or +inf
    const isMinusInf = (interval: string) =>
      /-inf|−inf|Infinity|−Infinity|\u2212inf/i.test(interval) &&
      interval.trim().startsWith(']');
    const isPlusInf = (interval: string) =>
      /\+inf|\+Infinity|Infinity/i.test(interval) &&
      interval.trim().endsWith('[');

    if (isMinusInf(intervalA)) return -1;
    if (isMinusInf(intervalB)) return 1;
    if (isPlusInf(intervalA)) return 1;
    if (isPlusInf(intervalB)) return -1;

    // Try to extract the lower bound as a number
    const getLower = (interval: string) => {
      const match = interval.match(/[-+]?[0-9]*\.?[0-9]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    return getLower(intervalA) - getLower(intervalB);
  }

  /**
   * Gets cluster information for a selected row
   * @param selectedRow - The selected row data
   * @param clusterMapping - Map containing cluster information
   * @returns Cluster information if found
   */
  getClusterInfoForRow(
    selectedRow: { [key: string]: any },
    clusterMapping: Map<string, { cluster: string; _id: string }>,
  ): { cluster: string; _id: string } | null {
    // Get the selected value (modality for categorical, interval for numerical)
    const selectedValue: string = selectedRow.modality || selectedRow.interval;

    // Create the same key format used when building the map
    const rowKey = `${selectedValue}_${selectedRow.frequency}`;

    // Get cluster info directly from the map
    return clusterMapping.get(rowKey) || null;
  }
}
