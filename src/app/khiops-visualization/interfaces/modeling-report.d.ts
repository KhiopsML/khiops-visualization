/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { DynamicI } from '@khiops-library/interfaces/globals';

export interface ModelingReport {
  reportType: string;
  summary: ModelingSummary;
  trainedPredictors: TrainedPredictor[];
  trainedPredictorsDetails: TrainedPredictorsDetails;
}

export interface ModelingSummary {
  dictionary: string;
  database: string;
  samplePercentage: number;
  samplingMode: string;
  selectionVariable: string;
  selectionValue: string;
  learningTask: string;
  targetVariable: string;
}

export interface TrainedPredictor {
  rank: string;
  type: string;
  family: string;
  name: string;
  variables: number;
}

export interface TrainedPredictorsDetails {
  [key: string]: {
    selectedVariables: ModelingVariableStatistic[];
  };
}

export interface ModelingVariableStatistic {
  name: string;
  preparedName?: string;
  level?: number;
  weight?: number;
  map?: boolean;
  importance?: number;
}
