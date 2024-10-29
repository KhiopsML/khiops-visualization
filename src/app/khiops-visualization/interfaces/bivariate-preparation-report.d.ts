import { DimensionVisualization, TargetValues } from './app-datas';

export interface BivariatePreparationReport {
  reportType: string;
  summary: BivariatePreparationSummary;
  variablesPairsStatistics: VariablePairStatistics[];
  variablesPairsDetailedStatistics: VariablesPairsDetailedStatistics[];
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

interface VariablesPairsDetailedStatistics {
  [rank: string]: VariablePairDetailedStats;
}

interface VariablePairDetailedStats {
  dataGrid: DataGrid;
}

interface DataGrid {
  isSupervised: boolean;
  dimensions: DimensionVisualization[];
  cellIds: string[];
  cellPartIndexes: number[][];
  cellFrequencies: number[];
}
