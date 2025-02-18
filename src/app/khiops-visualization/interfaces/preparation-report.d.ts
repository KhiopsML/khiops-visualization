/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { VariableDetail } from './app-datas';

export interface PreparationReport {
  reportType: string;
  summary: PreparationSummary;
  variablesStatistics: PreparationVariableStatistic[];
  variablesDetailedStatistics: { [key: string]: VariableDetail };
}

export interface PreparationSummary {
  dictionary: string;
  variables: VariableTypes;
  database: string;
  samplePercentage: number;
  samplingMode: string;
  selectionVariable: string;
  selectionValue: string;
  instances: number;
  learningTask: string;
  targetVariable: string;
  targetDescriptiveStats: TargetDescriptiveStats;
  evaluatedVariables: number;
  informativeVariables: number;
  selectedVariables: number;
  featureEngineering: FeatureEngineering;
  discretization: string;
  valueGrouping: string;
  nullModel: NullModel;
}

export interface VariableTypes {
  types: string[];
  numbers: number[];
}

export interface TargetDescriptiveStats {
  values: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  missingNumber: number;
  sparseMissingNumber: number;
}

export interface FeatureEngineering {
  maxNumberOfConstructedVariables: number;
  maxNumberOfTextFeatures: number;
  maxNumberOfTrees: number;
  maxNumberOfVariablePairs: number;
}

export interface NullModel {
  constructionCost?: number;
  preparationCost?: number;
  dataCost?: number;
}

export interface PreparationVariableStatistic {
  rank: string;
  name: string;
  type: string;
  level: number;
  parts: number;
  values: number;
  mode?: string; // Optional, only present for categorical variables
  modeFrequency?: number; // Optional, only for categorical variables
  constructionCost?: number; // unused var
  preparationCost?: number; // unused var
  dataCost?: number; // unused var
  targetParts?: number;
  missingNumber?: number;
  sparseMissingNumber?: number; // unused var
}

export interface ModlHistograms {
  histogramNumber: number;
  interpretableHistogramNumber: number;
  truncationEpsilon: number;
  removedSingularIntervalNumber: number;
  granularities: number[];
  intervalNumbers: number[];
  peakIntervalNumbers: number[];
  spikeIntervalNumbers: number[];
  emptyIntervalNumbers: number[];
  levels: number[];
  informationRates: number[];
  histograms: Histogram[];
}

export interface Histogram {
  bounds: number[];
  frequencies: number[];
}
