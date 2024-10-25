import { VariablesDetailedStatistics } from './app-datas';

export interface TreePreparationReport {
  reportType: string;
  summary: Summary;
  variablesStatistics: VariableStatistic[];
  variablesDetailedStatistics: VariablesDetailedStatistics[];
  treeDetails: TreeDetails;
}

export interface Summary {
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

export interface TargetValues {
  values: string[];
  frequencies: number[];
}

export interface VariableStatistic {
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
}

interface TreeDetails {
  [key: string]: TreeNode;
}

interface TreeNode {
  name: string;
  variableNumber: number;
  depth: number;
  treeNodes: NodeElt;
}

export interface NodeElt {
  nodeId: string;
  variable: string;
  type: string; // e.g., "Numerical"
  partition: number[][];
  childNodes: ChildNode[];
}

interface ChildNode {
  nodeId: string;
  variable?: string; // Optional, as it may not be present in all child nodes
  type?: string; // Optional, as it may not be present in all child nodes
  partition?: number[][]; // Optional, as it may not be present in all child nodes
  targetValues?: TargetValues; // Optional, as it may not be present in all child nodes
  childNodes?: ChildNode[]; // Optional, to allow for further nesting
}

interface TargetValues {
  values: string[];
  frequencies: number[];
}
