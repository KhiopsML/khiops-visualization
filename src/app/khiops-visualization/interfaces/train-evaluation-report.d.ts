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

export interface TrainEvaluationReport {
  reportType: string;
  evaluationType: string;
  summary: TrainEvaluationSummary;
  predictorsPerformance: TrainPredictorPerformance[];
  predictorsDetailedPerformance: Record<string, PredictorDetailedPerformance>;
  recCurves: RecCurve[];
  liftCurves: LiftCurve[];
}

export interface TrainEvaluationSummary {
  dictionary: string;
  database: string;
  instances: number;
  learningTask: string;
  targetVariable: string;
  mainTargetValue: string;
}

export interface TrainPredictorPerformance {
  rank: string;
  type: string;
  family: string;
  name: string;
  rmse: number;
  mae: number;
  nlpd: number;
  rankRmse: number;
  rankMae: number;
  rankNlpd: number;
}

export interface PredictorDetailedPerformance {
  dataGrid: DataGrid;
  confusionMatrix: ConfusionMatrix;
}

export interface ConfusionMatrix {
  values: string[];
  matrix: number[][];
}
