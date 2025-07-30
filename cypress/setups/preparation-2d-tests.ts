/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../utils/utils';

export function setupPreparation2dTests(datas, testsValues) {
  testsValues.Preparation2d.push('Summary');
  testsValues.Preparation2d.push(
    datas.bivariatePreparationReport?.summary?.database,
  );
  testsValues.Preparation2d.push(
    datas.bivariatePreparationReport?.summary?.instances,
  );
  testsValues.Preparation2d.push(
    datas.bivariatePreparationReport?.summary?.learningTask,
  );

  testsValues.Preparation2d.push(
    Object.keys(datas.bivariatePreparationReport?.variablesPairsStatistics)
      .length + ' Pair variables',
  );

  testsValues.Preparation2d.push(
    datas.bivariatePreparationReport?.variablesPairsStatistics[0]?.label,
  );
  if (datas.bivariatePreparationReport?.variablesPairsDetailedStatistics?.R01) {
    testsValues.Preparation2d.push('I ('); // check if matrix component is displayed
    testsValues.Preparation2d.push(
      datas.bivariatePreparationReport?.variablesPairsDetailedStatistics?.R01?.dataGrid?.dimensions[0]?.partition[0][0].toString(),
    );
  }
  if (
    datas.bivariatePreparationReport?.variablesPairsDetailedStatistics?.R001
  ) {
    testsValues.Preparation2d.push('I ('); // check if matrix component is displayed
    testsValues.Preparation2d.push(
      datas.bivariatePreparationReport?.variablesPairsDetailedStatistics?.R001?.dataGrid?.dimensions[0]?.partition[0][0].toString(),
    );
  }
}
