import { DynamicI } from '@khiops-library/interfaces/globals';

export interface AppDatasI {
  datas: CovisualizationDatas | undefined;
  // savedDatas?: any;
}

export interface CovisualizationDatas {
  tool: string;
  version: string;
  coclusteringReport: CoclusteringReport;
  khiops_encoding: string;
  savedDatas: DynamicI;
}

export interface CoclusteringReport {
  summary: Summary;
  dimensionSummaries: DimensionCovisualization[];
  dimensionPartitions: DimensionPartition[];
  dimensionHierarchies: DimensionHierarchy[];
  cellPartIndexes: number[][];
  cellFrequencies: number[];
}

export interface Summary {
  instances: number;
  cells: number;
  nullCost: number;
  cost: number;
  level: number;
  initialDimensions: number;
  frequencyVariable: string;
  dictionary: string;
  database: string;
}

export interface DimensionCovisualization {
  name: string;
  type: string;
  parts: number;
  initialParts: number;
  values: number;
  interest: number;
  description: string;
  min?: number;
  max?: number;
}

export interface DimensionPartition {
  name: string;
  type: string;
  intervals?: Interval[];
  valueGroups?: ValueGroup[];
  defaultGroupIndex?: number;
}

export interface Interval {
  cluster: string;
  bounds: number[];
}

export interface ValueGroup {
  cluster: string;
  values: string[];
  valueFrequencies: number[];
  valueTypicalities: number[];
}

export interface DimensionHierarchy {
  name: string;
  type: string;
  clusters: Cluster[];
}

export interface Cluster {
  cluster: string;
  parentCluster: string;
  frequency: number;
  interest: number;
  hierarchicalLevel: number;
  rank: number;
  hierarchicalRank: number;
  isLeaf: boolean;
}
