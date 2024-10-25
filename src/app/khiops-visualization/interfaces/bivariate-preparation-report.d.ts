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
  x;
  learningTask: string; // e.g., "Unsupervised analysis"
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
  constructionCost: number;
  preparationCost: number;
  dataCost: number;
}

interface VariablesPairsDetailedStatistics {
  [rank: string]: VariablePairDetailedStats;
}

interface VariablePairDetailedStats {
  dataGrid: DataGrid;
}

interface DataGrid {
  isSupervised: boolean;
  dimensions: Dimension[];
  cellIds: string[];
  cellPartIndexes: number[][];
  cellFrequencies: number[];
}

interface Dimension {
  variable: string;
  type: string;
  partitionType: string;
  partition: string[][];
  defaultGroupIndex: number;
}
