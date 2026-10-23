/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { UtilsService } from '../../src/app/khiops-library/providers/utils.service';
import '../utils/utils';

export function setupTreePreparationTests(datas, testsValues) {
  testsValues.TreePreparation.push('Summary');
  testsValues.TreePreparation.push(
    datas.treePreparationReport?.summary?.database,
  );
  testsValues.TreePreparation.push(
    UtilsService.getPrecisionNumber(
      datas.treePreparationReport?.summary?.instances,
    ),
  );
  testsValues.TreePreparation.push('Evaluated variables');
  if (datas.treePreparationReport?.dimensionTree) {
    testsValues.TreeAnalysis.push('Hyper tree visualization');

    testsValues.TreePreparation.push(
      datas.treePreparationReport?.variablesStatistics.length + ' Variables',
    );
    testsValues.TreePreparation.push(
      datas.treePreparationReport?.variablesStatistics[0]?.level,
    );
    testsValues.TreePreparation.push(
      datas.treePreparationReport?.variablesStatistics[0]?.name,
    );
    testsValues.TreeAnalysis.push('Decision tree');

    testsValues.TreeAnalysis.push(
      datas.treePreparationReport?.treeDetails?.R01?.treeNodes?.nodeId,
    );
    testsValues.TreeAnalysis.push(
      datas.treePreparationReport?.treeDetails?.R01?.treeNodes?.variable,
    );
    testsValues.TreeAnalysis.push(
      datas.treePreparationReport?.treeDetails?.R001?.treeNodes?.nodeId,
    );
    testsValues.TreeAnalysis.push(
      datas.treePreparationReport?.treeDetails?.R001?.treeNodes?.variable,
    );
    testsValues.TreeAnalysis.push('Selection details');
    testsValues.TreeAnalysis.push('Leaf infos');
    testsValues.TreeAnalysis.push('Leaf rules');
    testsValues.TreePreparation.push('Target distribution');
  }

  // testsValues.TreePreparation.push("Purity");
}
