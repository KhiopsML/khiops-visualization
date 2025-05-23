/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas';

@Injectable({
  providedIn: 'root',
})
export class EnrichDatasService {
  /**
   * Enriches the provided JSON data with missing information.
   *
   * This method iterates over the keys of the provided data object and checks if the data
   * corresponds to an evaluation report with lift curves. If so, it ensures that an "Optimal"
   * predictor performance entry is added to the data if it does not already exist.
   *
   * @param datas - The JSON data to be enriched.
   * @returns The enriched JSON data.
   */
  static enrichJsonDatas(datas: VisualizationDatas | any): any {
    if (datas) {
      // For evaluation, we need optimal information
      Object.keys(datas).forEach((value) => {
        // do not add optimal if not liftcurve (regression)
        if (
          datas[value].reportType === 'Evaluation' &&
          datas[value].liftCurves
        ) {
          const isOptimalAdded: boolean = datas[
            value
          ].predictorsPerformance.find(function (el: any) {
            return el.name && el.name === 'Optimal';
          });
          if (!isOptimalAdded) {
            // First add optimal datas into global datas
            datas[value].predictorsPerformance.push({
              accuracy: 1,
              auc: 1,
              compression: 1,
              family: datas[value].evaluationType,
              rank:
                'R' +
                parseInt(datas[value].predictorsPerformance.length + 1, 10),
              name: 'Optimal',
              type: datas[value].evaluationType,
            });
          }
        }
      });
    }
    return datas;
  }

  /**
   * Ignores missing partitions for numerical variables in the provided data.
   *
   * see #86
   * This method processes the `datas` object and checks for numerical variables
   * within the specified `preparationSource`. If a variable's data grid is not
   * supervised and its first partition is empty, the method removes the empty
   * partition and its corresponding frequency.
   *
   * @param datas - The data object containing variables and their detailed statistics.
   * @param preparationSource - The source key within the `datas` object to process.
   * @returns The modified `datas` object with empty partitions removed for numerical variables.
   */
  static ignoreMissingPartitionForNumerical(
    datas: VisualizationDatas | any,
    preparationSource: string,
  ): VisualizationDatas {
    if (datas?.[preparationSource]) {
      for (const rank in datas?.[preparationSource]
        ?.variablesDetailedStatistics) {
        const variable =
          datas[preparationSource].variablesDetailedStatistics[rank];
        if (
          !variable.dataGrid.isSupervised &&
          variable.dataGrid.dimensions[0].partition[0].length === 0
        ) {
          variable.dataGrid.dimensions[0].partition.shift();
          variable.dataGrid.frequencies.shift();
        }
      }
    }
    return datas;
  }
}
