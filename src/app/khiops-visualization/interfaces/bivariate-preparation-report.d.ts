import { DimensionVisualization, TargetValues } from './app-datas';

export interface BivariatePreparationReport {
  reportType: string;
  summary: Summary;
  variablesPairsStatistics: VariablePairStatistics[];
  variablesPairsDetailedStatistics: VariablesPairsDetailedStatistics[];
}

export interface Summary {
  dictionary: string; // e.g., "Adult"
  variables: VariablesInfo;
  database: string; // File path as string
  instances: number;
  targetVariable: string;
  mainTargetValue: string;
  targetDescriptiveStats: TargetDescriptiveStats;
  targetValues: TargetValues;
  learningTask: string; // e.g., "Unsupervised analysis"
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
