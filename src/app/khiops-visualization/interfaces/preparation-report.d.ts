import { VariablesDetailedStatistics } from './app-datas';

export interface PreparationReport {
  reportType: string;
  summary: PreparationSummary;
  variablesStatistics: VariableStatistic[];
  variablesDetailedStatistics: VariablesDetailedStatistics[];
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

export interface VariableStatistic {
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
}
