/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../utils/utils';
import { UtilsService } from '../../src/app/khiops-library/providers/utils.service';

export function setupEvaluationTests(datas, testsValues) {
  testsValues.Evaluation.push('Evaluation type');
  testsValues.Evaluation.push('Filter curves');
  testsValues.Evaluation.push('Predictor evaluations');

  if (datas.trainEvaluationReport?.summary?.instances) {
    testsValues.Evaluation.push(
      UtilsService.getPrecisionNumber(datas.trainEvaluationReport?.summary?.instances),
    );
  }

  // Test some grid datas
  if (datas.trainEvaluationReport?.predictorsPerformance?.accuracy) {
    testsValues.Evaluation.push(
      datas.trainEvaluationReport?.predictorsPerformance?.accuracy,
    );
  }
  if (datas.testEvaluationReport?.predictorsPerformance?.auc) {
    testsValues.Evaluation.push(
      datas.testEvaluationReport?.predictorsPerformance?.auc,
    );
  }

  if (
    (datas.trainEvaluationReport?.predictorsDetailedPerformance &&
      datas.trainEvaluationReport?.liftCurves) ||
    (datas.testEvaluationReport?.predictorsDetailedPerformance &&
      datas.testEvaluationReport?.liftCurves) ||
    (datas.evaluationReport?.predictorsDetailedPerformance &&
      datas.evaluationReport?.liftCurves)
  ) {
    testsValues.Evaluation.push('Cumulative gain chart');
    testsValues.Evaluation.push('Confusion matrix');
    testsValues.Evaluation.push('Population');
    testsValues.Evaluation.push('Frequency');
    testsValues.Evaluation.push('gini');
    testsValues.Evaluation.push('accuracy');
  } else {
    testsValues.Evaluation.push('REC Curves');
    testsValues.Evaluation.push('rmse');
  }
}
