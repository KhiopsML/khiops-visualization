/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

export function setupHierarchyTests(datas) {
  const testsValues = [];

  testsValues.push('UNFOLD HIERARCHY');
  testsValues.push('Cells');
  testsValues.push('Information rate');
  testsValues.push('Nb of clusters per dimension');
  // testsValues.push("Total Number of Clusters"); // can't get canvas value
  testsValues.push('Max Number of Cluster');
  testsValues.push('Fold / Unfold');

  for (
    let index = 2;
    index < datas.coclusteringReport?.dimensionSummaries.length;
    index++
  ) {
    testsValues.push(datas.coclusteringReport?.dimensionSummaries[index]?.name);
  }

  return testsValues;
}
