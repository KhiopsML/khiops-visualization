/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../utils/utils';

export function setupTreePreparationTests(datas, testsValues) {
  testsValues.TreePreparation.push('Summary');
  testsValues.TreePreparation.push(
    datas.treePreparationReport?.summary?.database,
  );
  testsValues.TreePreparation.push(
    datas.treePreparationReport?.summary?.instances,
  );
  testsValues.TreePreparation.push('Evaluated variables');
  if (datas.treePreparationReport?.dimensionTree) {
    testsValues.TreePreparation.push('Hyper tree visualization');

    testsValues.TreePreparation.push(
      datas.treePreparationReport?.variablesStatistics.length + ' Variables',
    );
    testsValues.TreePreparation.push(
      datas.treePreparationReport?.variablesStatistics[0]?.level,
    );
    testsValues.TreePreparation.push(
      datas.treePreparationReport?.variablesStatistics[0]?.name,
    );
    testsValues.TreePreparation.push('Decision tree');

    testsValues.TreePreparation.push(
      datas.treePreparationReport?.treeDetails?.R01?.treeNodes?.nodeId,
    );
    testsValues.TreePreparation.push(
      datas.treePreparationReport?.treeDetails?.R01?.treeNodes?.variable,
    );
    testsValues.TreePreparation.push(
      datas.treePreparationReport?.treeDetails?.R001?.treeNodes?.nodeId,
    );
    testsValues.TreePreparation.push(
      datas.treePreparationReport?.treeDetails?.R001?.treeNodes?.variable,
    );
    testsValues.TreePreparation.push('Selection details');
    testsValues.TreePreparation.push('Leaf infos');
    testsValues.TreePreparation.push('Leaf rules');
    testsValues.TreePreparation.push('Target distribution');
  }

  // testsValues.TreePreparation.push("Purity");
}
