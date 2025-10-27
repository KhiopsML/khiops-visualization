/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { BarModel } from '../model/bar.model';
import { DistributionDatasService } from './distribution-datas.service';
import { MatrixUtilsService } from '@khiops-library/components/matrix/matrix.utils.service';
import { VariableDetailsModel } from '../model/variable-details.model';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { Preparation2dDatasService } from './preparation2d-datas.service';
import { DistributionDatasModel } from '../model/distribution-datas.model';
import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ModalityCountsModel } from '@khiops-visualization/model/modality-counts.model';

@Injectable({
  providedIn: 'root',
})
export class Distribution2dDatasService {
  private distributionDatas: DistributionDatasModel = new DistributionDatasModel();

  constructor(
    private distributionDatasService: DistributionDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {
    this.initialize();
  }

  /**
   * Initializes the distribution data by fetching the application data
   * and creating a new DistributionDatasModel instance.
   * @returns The initialized DistributionDatasModel instance.
   */
  initialize() {
    this.distributionDatas = new DistributionDatasModel();
    return this.distributionDatas;
  }

  /**
   * Retrieves the current distribution data.
   * @returns The current DistributionDatasModel instance.
   */
  getDatas(): DistributionDatasModel {
    return this.distributionDatas;
  }

  /**
   * Generates the target distribution graph data based on the specified type.
   * @param type Optional parameter to specify the type of distribution (e.g., LIFT).
   * @returns The generated ChartDatasModel instance containing the graph data.
   */
  getTargetDistributionGraphDatas(type?: string): ChartDatasModel | undefined {
    this.distributionDatas.initTargetDistributionGraphDatas();
    this.distributionDatas.setTargetDistributionType(type);

    const selectedVariable =
      this.preparation2dDatasService.getSelectedVariable();
    const preparation2dDatas = this.preparation2dDatasService.getDatas();
    const variablesDetails: VariableDetailsModel | undefined =
      this.preparation2dDatasService.getVariableDetails(
        preparation2dDatas?.selectedVariable,
      );

    if (this.distributionDatas.targetDistributionGraphDatas) {
      this.distributionDatas.targetDistributionGraphDatas.labels = [''];
    }

    if (variablesDetails?.dataGrid?.cellTargetFrequencies) {
      const parts1 = selectedVariable?.parts1;
      const parts2 = selectedVariable?.parts2;
      const cellPartIndexes = variablesDetails.dataGrid.cellPartIndexes;
      const cellTargetFrequencies = variablesDetails.dataGrid.cellTargetFrequencies;
      if (parts1 && parts2 && cellPartIndexes && cellTargetFrequencies) {
        const computedCellTargetFreqs = MatrixUtilsService.getCellFrequencies(
          [parts1, parts2],
          cellPartIndexes,
          cellTargetFrequencies,
        );

        const selectedCellIndex = preparation2dDatas?.selectedCellIndex;
        if (typeof selectedCellIndex === 'number') {
          const currentDatas = computedCellTargetFreqs[selectedCellIndex];
          const targets = this.preparation2dDatasService.getTargetsIfAvailable();
          if (currentDatas && targets) {
            const modalityCounts: ModalityCountsModel =
              this.distributionDatasService.computeModalityCounts(
                computedCellTargetFreqs,
              );

            for (let i = 0; i < currentDatas.length; i++) {
              const el = currentDatas[i];

              const graphItem: BarModel = new BarModel();
              graphItem.name = targets[i]?.toString();

              if (type && type === TYPES.LIFT) {
                // compute lift
                const sumCurrentDatas = UtilsService.arraySum(currentDatas);
                const totalProbability = modalityCounts.totalProbability[i];
                if (sumCurrentDatas && totalProbability) {
                  graphItem.value =
                    el / sumCurrentDatas / totalProbability;
                } else {
                  graphItem.value = 0;
                }
              } else {
                const sumCurrentDatas = UtilsService.arraySum(currentDatas);
                graphItem.value = sumCurrentDatas ? (el * 100) / sumCurrentDatas : 0;
              }

              graphItem.extra.value = el;
              const sumCurrentDatas = UtilsService.arraySum(currentDatas);
              graphItem.extra.percent = sumCurrentDatas ? (el * 100) / sumCurrentDatas : 0;

              const currentDataSet = new ChartDatasetModel(graphItem.name);
              currentDataSet.data.push(graphItem.value);
              currentDataSet.extra.push(graphItem);
              if (this.distributionDatas.targetDistributionGraphDatas) {
                this.distributionDatas.targetDistributionGraphDatas.datasets.push(
                  currentDataSet,
                );
              }
            }
          }
        }
      }
    }

    if (
      this.distributionDatas.targetDistributionGraphDatas &&
      this.distributionDatas.targetDistributionGraphDatas.datasets.length === 0
    ) {
      this.distributionDatas.targetDistributionGraphDatas = undefined;
    }

    return this.distributionDatas.targetDistributionGraphDatas;
  }
}
