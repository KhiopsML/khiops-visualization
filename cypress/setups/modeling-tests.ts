/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../utils/utils';
import { isExplanatoryAnalysis, isRegressionAnalysis } from '../utils/utils';

export function setupModelingTests(datas, testsValues) {
  testsValues.Modeling.push('Summary');
  testsValues.Modeling.push('Trained predictors');
  testsValues.Modeling.push('Select trained predictor');
  testsValues.Modeling.push('Naive Bayes');
  testsValues.Modeling.push(datas.preparationReport.summary.database);
  testsValues.Modeling.push(
    datas.preparationReport.summary.targetValues?.values[0].slice(0, 10), // slice it because it's a legend text
  );
  if (datas.modelingReport.variablesStatistics) {
    testsValues.Modeling.push(
      datas.modelingReport.trainedPredictorsDetails?.R1?.selectedVariables
        .length + ' Variables',
    );
    // test some grid coluns
    testsValues.Modeling.push('name');
    testsValues.Modeling.push('weight');
    // testsValues.Modeling.push("importance");

    // test some grid values
    testsValues.Modeling.push(
      datas.modelingReport.trainedPredictorsDetails?.R1.name,
    );
    testsValues.Modeling.push(
      datas.modelingReport.trainedPredictorsDetails?.R1.level,
    );
  }
  if (
    datas.preparationReport?.variablesDetailedStatistics?.R01 ||
    datas.preparationReport?.variablesDetailedStatistics?.R001
  ) {
    if (isRegressionAnalysis(datas) || isExplanatoryAnalysis(datas)) {
      // regression matrix case or explanatory
      // Check if matrix is displayed
      testsValues.Modeling.push('Target values');
      // check cell stats grid
      if (datas.preparationReport?.variablesDetailedStatistics?.R01) {
        testsValues.Modeling.push(
          datas.preparationReport?.variablesDetailedStatistics?.R01?.dataGrid
            ?.dimensions[0]?.partition[0][0],
        );
      }
      if (datas.preparationReport?.variablesDetailedStatistics?.R001) {
        testsValues.Modeling.push(
          datas.preparationReport?.variablesDetailedStatistics?.R001?.dataGrid
            ?.dimensions[0]?.partition[0][0],
        );
      }
    } else if (
      datas.preparationReport?.variablesDetailedStatistics?.R01?.dataGrid
        ?.dimensions.length > 1 ||
      datas.preparationReport?.variablesDetailedStatistics?.R001?.dataGrid
        ?.dimensions.length > 1
    ) {
      testsValues.Modeling.push('Target distribution'); // normal case
    }
    if (datas.preparationReport?.summary?.targetValues) {
      testsValues.Modeling.push('Global target distribution');
    }
    testsValues.Modeling.push('Frequency');
  }

  if (
    datas.preparationReport?.variablesStatistics &&
    datas.preparationReport?.variablesStatistics[0]?.type === 'Numerical' &&
    (datas.preparationReport?.variablesDetailedStatistics?.R01?.dataGrid
      ?.isSupervised === false ||
      datas.preparationReport?.variablesDetailedStatistics?.R001?.dataGrid
        ?.isSupervised === false)
  ) {
    // histogram case
    testsValues.Modeling.push('Density');
    var index = testsValues.Modeling.indexOf('Coverage');
    if (index !== -1) {
      testsValues.Modeling.splice(index, 1);
    }
    var index = testsValues.Modeling.indexOf('Target Distribution');
    if (index !== -1) {
      testsValues.Modeling.splice(index, 1);
    }
  }
}
