import { Injectable } from '@angular/core';
import * as _ from 'lodash'; // Important to import lodash in karma
import { UtilsService } from '@khiops-library/providers/utils.service';
import { BarModel } from '../model/bar.model';
import { DistributionDatasService } from './distribution-datas.service';
import { MatrixUtilsService } from '@khiops-library/components/matrix/matrix.utils.service';
import { VariableDetailsModel } from '../model/variable-details.model';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { Preparation2dDatasService } from './preparation2d-datas.service';
import { AppService } from './app.service';
import { DistributionDatasModel } from '../model/distribution-datas.model';
import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ModalityCountsModel } from '@khiops-visualization/model/modality-counts.model';

@Injectable({
  providedIn: 'root',
})
export class Distribution2dDatasService {
  private distributionDatas: DistributionDatasModel;

  constructor(
    private distributionDatasService: DistributionDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
    private appService: AppService,
  ) {
    this.initialize();
  }

  /**
   * Initializes the distribution data by fetching the application data
   * and creating a new DistributionDatasModel instance.
   * @returns The initialized DistributionDatasModel instance.
   */
  initialize() {
    this.distributionDatas = new DistributionDatasModel(
      this.appService.appDatas,
    );

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
  getTargetDistributionGraphDatas(type?: string): ChartDatasModel {
    this.distributionDatas.initTargetDistributionGraphDatas();
    this.distributionDatas.setTargetDistributionType(type);

    const selectedVariable =
      this.preparation2dDatasService.getSelectedVariable();
    const preparation2dDatas = this.preparation2dDatasService.getDatas();
    const variablesDetails: VariableDetailsModel | undefined =
      this.preparation2dDatasService.getVariableDetails(
        preparation2dDatas?.selectedVariable?.rank,
      );

    this.distributionDatas.targetDistributionGraphDatas.labels = [''];

    if (variablesDetails?.dataGrid?.cellTargetFrequencies) {
      const computedCellTargetFreqs = MatrixUtilsService.getCellFrequencies(
        [selectedVariable?.parts1, selectedVariable?.parts2],
        variablesDetails.dataGrid.cellPartIndexes,
        variablesDetails.dataGrid.cellTargetFrequencies,
      );

      const currentDatas =
        computedCellTargetFreqs[preparation2dDatas.selectedCellIndex];
      const targets = this.preparation2dDatasService.getTargetsIfAvailable();
      if (currentDatas && targets) {
        const modalityCounts: ModalityCountsModel =
          this.distributionDatasService.computeModalityCounts(
            computedCellTargetFreqs,
          );

        for (let i = 0; i < currentDatas.length; i++) {
          const el = currentDatas[i];

          const graphItem: BarModel = new BarModel();
          graphItem.name = targets[i];

          if (type && type === TYPES.LIFT) {
            // compute lift
            graphItem.value =
              el /
              UtilsService.arraySum(currentDatas) /
              modalityCounts.totalProbability[i];
          } else {
            graphItem.value = (el * 100) / UtilsService.arraySum(currentDatas);
          }

          graphItem.extra.value = el;
          graphItem.extra.percent =
            (el * 100) / UtilsService.arraySum(currentDatas);

          const currentDataSet = new ChartDatasetModel(graphItem.name);
          currentDataSet.data.push(graphItem.value);
          currentDataSet.extra.push(graphItem);
          this.distributionDatas.targetDistributionGraphDatas.datasets.push(
            currentDataSet,
          );
        }
      }
    }

    if (
      this.distributionDatas.targetDistributionGraphDatas.datasets.length === 0
    ) {
      this.distributionDatas.targetDistributionGraphDatas = undefined;
    }

    return this.distributionDatas.targetDistributionGraphDatas;
  }
}
