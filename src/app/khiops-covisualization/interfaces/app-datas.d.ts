/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { DynamicI } from '@khiops-library/interfaces/globals';

export interface AppDatasI {
  datas: CovisualizationDatas | undefined;
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
  isVarPart?: boolean;
}

export interface DimensionPartition {
  name: string;
  type: string;
  intervals?: Interval[];
  valueGroups?: ValueGroup[];
  innerVariables?: {
    dimensionSummaries: DimensionCovisualization[];
    dimensionPartitions: DimensionPartition[];
  };
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
