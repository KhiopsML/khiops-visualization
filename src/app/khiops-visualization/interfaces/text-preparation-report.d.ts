/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { VariableDetail } from './shared-interfaces';

export interface TextPreparationReport {
  reportType: string;
  summary: TextPreparationSummary;
  variablesStatistics: TextPreparationVariableStatistic[];
  variablesDetailedStatistics: { [key: string]: VariableDetail };
}

export interface TextPreparationSummary {
  dictionary: string;
  variables: VariablesInfo;
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
}

export interface VariablesInfo {
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

export interface TextPreparationVariableStatistic {
  rank: string;
  name: string;
  type: string;
  level: number;
  targetParts: number;
  parts: number;
  values: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  missingNumber: number;
  sparseMissingNumber: number;
  constructionCost?: number;
  preparationCost?: number;
  dataCost?: number;
  derivationRule: string;
}
