/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export interface VariableDetail {
  dataGrid: DataGrid;
  inputValues?: InputValues;
  modlHistograms?: ModlHistograms;
}

export interface ModlHistograms {
  histogramNumber: number;
  interpretableHistogramNumber: number;
  truncationEpsilon: number;
  removedSingularIntervalNumber: number;
  granularities: number[];
  intervalNumbers: number[];
  peakIntervalNumbers: number[];
  spikeIntervalNumbers: number[];
  emptyIntervalNumbers: number[];
  levels: number[];
  informationRates: number[];
  histograms: Histogram[];
}

export interface Histogram {
  bounds: number[];
  frequencies: number[];
}

export interface DataGrid {
  isSupervised: boolean;
  dimensions: DimensionVisualization[];
  partTargetFrequencies: number[][];
  partInterests: number[];
  frequencies?: number[];
}

export interface InputValues {
  values: string[];
  frequencies: number[];
}

export interface DimensionVisualization {
  variable: string;
  type: string;
  partitionType: string;
  partition: number[][] | string[];
  defaultGroupIndex?: number;
}

export interface RecCurve {
  regressor: string;
  values: number[];
}

export interface LiftCurve {
  targetValue: string;
  curves: Curve[];
}

export interface Curve {
  classifier: string;
  values: number[];
}

export interface TargetValues {
  frequencies: number[];
  values: string[];
}