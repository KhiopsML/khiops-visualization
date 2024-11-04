import { VariablesDetailedStatistics } from './app-datas';

export interface TextPreparationReport {
  reportType: string;
  summary: TextPreparationSummary;
  variablesStatistics: TextPreparationVariableStatistic[];
  variablesDetailedStatistics: VariablesDetailedStatistics[];
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
