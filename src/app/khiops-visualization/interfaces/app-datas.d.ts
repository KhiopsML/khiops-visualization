/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { DynamicI } from '@khiops-library/interfaces/globals';
import { ModelingReport } from './modeling-report';
import { TrainEvaluationReport } from './train-evaluation-report';
import { TestEvaluationReport } from './test-evaluation-report';
import { ModlHistograms, PreparationReport } from './preparation-report';
import { TreePreparationReport } from './tree-preparation-report';
import { BivariatePreparationReport } from './bivariate-preparation-report';
import { TextPreparationReport } from './text-preparation-report';
import { EvaluationReport } from './evaluation-report';

export interface AppDatasI {
  datas?: VisualizationDatas;
}

export interface VisualizationDatas {
  tool: string;
  version: string;
  shortDescription: string;
  modelingReport: ModelingReport;
  trainEvaluationReport: TrainEvaluationReport;
  testEvaluationReport: TestEvaluationReport;
  preparationReport: PreparationReport;
  treePreparationReport: TreePreparationReport;
  bivariatePreparationReport: BivariatePreparationReport;
  textPreparationReport: TextPreparationReport;
  evaluationReport: EvaluationReport;
  logs: Log[];
  savedDatas: DynamicI;
}

interface Log {
  taskName: string;
  messages: string[];
}

export interface VariableDetail {
  dataGrid: DataGrid;
  inputValues?: InputValues;
  modlHistograms?: ModlHistograms;
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
