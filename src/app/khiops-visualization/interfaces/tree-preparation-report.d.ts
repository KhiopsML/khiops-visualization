/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TargetValues, VariableDetail } from './app-datas';

export interface TreePreparationReport {
  reportType: string;
  summary: TreePreparationSummary;
  variablesStatistics: TreePreparationVariableStatistic[];
  variablesDetailedStatistics: { [key: string]: VariableDetail };
  treeDetails: TreeDetails;
}

export interface TreePreparationSummary {
  dictionary: string;
  variables: Variables;
  database: string;
  samplePercentage: number;
  samplingMode: string;
  selectionVariable: string;
  selectionValue: string;
  instances: number;
  learningTask: string;
  targetVariable: string;
  mainTargetValue: string;
  targetDescriptiveStats: TargetDescriptiveStats;
  targetValues: TargetValues;
  evaluatedVariables: number;
  informativeVariables: number;
}

export interface Variables {
  types: string[];
  numbers: number[];
}

export interface TargetDescriptiveStats {
  values: number;
  mode: string;
  modeFrequency: number;
}

export interface TreePreparationVariableStatistic {
  rank: string;
  name: string;
  type: string;
  level: number;
  parts: number;
  values: number;
  mode: string;
  modeFrequency: number;
  constructionCost?: number;
  preparationCost?: number;
  dataCost?: number;
  derivationRule: string;
  missingNumber?: number;
}

interface TreeDetails {
  [key: string]: TreeNode;
}

interface TreeNode {
  name: string;
  variableNumber: number;
  depth: number;
  treeNodes: TreeChildNode;
}

interface TreeChildNode {
  nodeId: string;
  variable?: string; // Optional, as it may not be present in all child nodes
  type?: string; // Optional, as it may not be present in all child nodes
  partition?: number[][]; // Optional, as it may not be present in all child nodes
  targetValues?: TargetValues; // Optional, as it may not be present in all child nodes
  childNodes?: TreeChildNode[]; // Optional, to allow for further nesting
}
