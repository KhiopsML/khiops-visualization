/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  DimensionVisualization,
  TargetValues,
  VariableDetail,
} from './app-datas';

export interface BivariatePreparationReport {
  reportType: string;
  summary: BivariatePreparationSummary;
  variablesPairsStatistics: VariablePairStatistics[];
  variablesPairsDetailedStatistics: {
    [rank: string]: VariableDetail;
  };
}

export interface BivariatePreparationSummary {
  dictionary: string; // e.g., "Adult"
  variables: VariablesInfo;
  database: string; // File path as string
  instances: number;
  targetVariable: string;
  mainTargetValue: string;
  targetDescriptiveStats: TargetDescriptiveStats;
  targetValues: TargetValues;
  learningTask: string; // e.g., "Unsupervised analysis"
  samplePercentage?: number;
  samplingMode?: string;
  selectionVariable?: string;
  selectionValue?: string;
  evaluatedVariablePairs?: number;
  informativeVariablePairs?: number;
}

export interface TargetDescriptiveStats {
  values: number;
  mode: string;
  modeFrequency: number;
}

export interface VariablesInfo {
  types: string[]; // e.g., ["Categorical", "Numerical"]
  numbers: number[];
}

export interface VariablePairStatistics {
  rank: string; // e.g., "R001"
  name1: string;
  name2: string;
  level: number;
  variables: number;
  parts1: number;
  parts2: number;
  cells: number;
  constructionCost?: number;
  preparationCost?: number;
  dataCost?: number;
  deltaLevel?: number;
  level1?: number;
  level2?: number;
}

interface DataGrid {
  isSupervised: boolean;
  dimensions: DimensionVisualization[];
  cellIds: string[];
  cellPartIndexes: number[][];
  cellFrequencies: number[];
}
