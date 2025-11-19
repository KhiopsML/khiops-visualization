/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  DataGrid,
  LiftCurve,
  RecCurve,
} from './shared-interfaces';

export interface TestEvaluationReport {
  reportType: string;
  evaluationType: string;
  summary: TestEvaluationSummary;
  predictorsPerformance: TestPredictorPerformance[];
  predictorsDetailedPerformance: PredictorsDetailedPerformance;
  recCurves: RecCurve[];
  liftCurves: LiftCurve[];
}

export interface TestEvaluationSummary {
  dictionary: string;
  database: string;
  samplePercentage: number;
  samplingMode: string;
  selectionVariable: string;
  selectionValue: string;
  instances: number;
  learningTask: string;
  targetVariable: string;
  mainTargetValue: string;
}

export interface TestPredictorPerformance {
  rank: string;
  type: string;
  family: string;
  name: string;
  accuracy: number;
  compression: number;
  auc: number;
}

export interface PredictorsDetailedPerformance {
  [key: string]: PredictorDetail;
}

export interface PredictorDetail {
  confusionMatrix: ConfusionMatrix;
  dataGrid?: DataGrid;
}

export interface ConfusionMatrix {
  values: string[];
  matrix: number[][];
}
