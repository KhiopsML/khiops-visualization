/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { AppConfig } from '../../../environments/environment';
import { EvaluationTypeModel } from '../model/evaluation-type.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { EvaluationPredictorModel } from '../model/evaluation-predictor.model';
import { TYPES } from '@khiops-library/enum/types';
import { TASKS } from '@khiops-library/enum/tasks';
import { PREDICTOR_TYPES } from '@khiops-library/enum/predictor-types';
import { EvaluationDatasModel } from '@khiops-visualization/model/evaluation-datas.model';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { TargetLiftValuesI } from '@khiops-visualization/interfaces/target-lift-values';
import { LiftCurveValuesI } from '@khiops-visualization/interfaces/lift-curve-values';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { LiftCurveSerieI } from '../interfaces/lift-curve-serie';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';
import { TestEvaluationReport } from '@khiops-visualization/interfaces/test-evaluation-report';
import { TrainEvaluationReport } from '@khiops-visualization/interfaces/train-evaluation-report';
import { EvaluationReport } from '@khiops-visualization/interfaces/evaluation-report';
import { DynamicI } from '@khiops-library/interfaces/globals';
import cloneDeep from 'lodash-es/cloneDeep';
import { LS } from '@khiops-library/enum/ls';

@Injectable({
  providedIn: 'root',
})
export class EvaluationDatasService {
  private evaluationDatas: EvaluationDatasModel = new EvaluationDatasModel();

  constructor(
    private translate: TranslateService,
    private appService: AppService,
  ) {}

  /**
   * Initializes the evaluation data model.
   */
  initialize() {
    this.evaluationDatas = new EvaluationDatasModel();
  }

  /**
   * Retrieves the evaluation data model.
   * @returns The evaluation data model.
   */
  getDatas(): EvaluationDatasModel {
    return this.evaluationDatas;
  }

  /**
   * Sets the selected evaluation type variable.
   * @param object - The evaluation type model to set.
   */
  setSelectedEvaluationTypeVariable(object: EvaluationTypeModel | undefined) {
    this.evaluationDatas.selectedEvaluationTypeVariable = object;
  }

  /**
   * Sets the selected predictor evaluation variable.
   * @param object - The evaluation predictor model to set.
   */
  setSelectedPredictorEvaluationVariable(object: EvaluationPredictorModel) {
    this.evaluationDatas.selectedPredictorEvaluationVariable = object;
  }

  /**
   * Retrieves the predictor evaluation variable for the specified evaluation type.
   * @param type - The evaluation type.
   * @returns The corresponding EvaluationPredictorModel.
   */
  getPredictorEvaluationVariableFromEvaluationType(
    type: string,
  ): EvaluationPredictorModel {
    return this.evaluationDatas.predictorEvaluations?.values?.find(
      (e: any) =>
        e.type === type &&
        e.rank ===
          this.evaluationDatas?.selectedPredictorEvaluationVariable?.rank,
    );
  }

  /**
   * Retrieves the evaluation variable for the specified predictor evaluation type.
   * @param type - The predictor evaluation type.
   * @returns The corresponding EvaluationTypeModel.
   */
  getEvaluationVariableFromPredictorEvaluationType(
    type: string,
  ): EvaluationTypeModel {
    return this.evaluationDatas.evaluationTypesSummary?.values?.find(
      (e: any) => e.type === type,
    );
  }

  /**
   * Retrieves the list of evaluation types from the application data.
   * @returns An array of evaluation types.
   */
  getEvaluationTypes():
    | EvaluationReport[]
    | TestEvaluationReport[]
    | TrainEvaluationReport[] {
    this.evaluationDatas.evaluationTypes = [];

    // @ts-ignore
    Object.keys(this.appService.appDatas).forEach((value: any) => {
      // @ts-ignore
      const currentReport = this.appService.appDatas[value];
      if (currentReport.reportType === 'Evaluation') {
        this.evaluationDatas?.evaluationTypes?.push(currentReport);
      }
    });
    return this.evaluationDatas.evaluationTypes;
  }

  /**
   * Retrieves the confusion matrix for the specified type.
   * @param type - The type of confusion matrix (optional).
   * @returns The confusion matrix as a GridDatasI object.
   */
  getConfusionMatrix(type?: string): GridDatasI | undefined {
    this.evaluationDatas.confusionMatrixType =
      type ?? AppService.Ls.get(LS.AG_GRID_GRAPH_OPTION);

    if (this.evaluationDatas.selectedPredictorEvaluationVariable) {
      const datas: DynamicI[] = [];

      let currentReport: any;
      // get the correct report : train or test
      if (
        this.evaluationDatas?.selectedEvaluationTypeVariable?.type ===
        PREDICTOR_TYPES.TRAIN
      ) {
        currentReport = this.appService.appDatas?.trainEvaluationReport;
      } else if (
        this.evaluationDatas?.selectedEvaluationTypeVariable?.type ===
        PREDICTOR_TYPES.TEST
      ) {
        currentReport = this.appService.appDatas?.testEvaluationReport;
      } else {
        currentReport = this.appService.appDatas?.evaluationReport;
      }
      if (
        currentReport.predictorsDetailedPerformance &&
        currentReport.liftCurves
      ) {
        // init the object
        this.evaluationDatas.confusionMatrix = {
          title: this.translate.get('GLOBAL.CONFUSION_MATRIX_OF', {
            type: this.evaluationDatas.selectedPredictorEvaluationVariable.name,
          }),
          values: undefined,
          displayedColumns: [
            {
              headerName: this.translate.get('GLOBAL.TARGET'),
              field: 'target',
              tooltip: this.translate.get(
                'TOOLTIPS.EVALUATION.CONFUSION_MATRIX.TARGET',
              ),
            },
          ],
        };

        const targetsLift: GridColumnsI[] = [];
        let currentConfMat = currentReport.liftCurves.map(
          (e: any) => e.targetValue,
        ); // For optimal
        if (
          currentReport.predictorsDetailedPerformance[
            this.evaluationDatas.selectedPredictorEvaluationVariable.rank
          ]
        ) {
          currentConfMat =
            currentReport.predictorsDetailedPerformance[
              this.evaluationDatas.selectedPredictorEvaluationVariable.rank
            ].confusionMatrix.values;
        }
        for (let i = 0; i < currentConfMat.length; i++) {
          let targetValueName = currentConfMat[i];
          if (targetValueName === '') {
            // set value to - if empty to work with ag grids
            targetValueName = '-';
          }
          targetsLift.push({
            headerName: targetValueName,
            field: i.toString(),
          });
        }
        this.evaluationDatas.confusionMatrix.displayedColumns =
          this.evaluationDatas.confusionMatrix.displayedColumns?.concat(
            targetsLift,
          );

        let currentPerformance: any = {};
        if (
          currentReport.predictorsDetailedPerformance[
            this.evaluationDatas.selectedPredictorEvaluationVariable.rank
          ]
        ) {
          currentPerformance =
            currentReport.predictorsDetailedPerformance[
              this.evaluationDatas.selectedPredictorEvaluationVariable.rank
            ].confusionMatrix;
        } else {
          // it is optimal row
          currentPerformance.values =
            currentReport.predictorsDetailedPerformance.R1.confusionMatrix.values; // Get the first
          currentPerformance.matrix = [];

          // compute optimal values
          const currentConfusionMatrix =
            currentReport.predictorsDetailedPerformance.R1.confusionMatrix;
          for (let i = 0; i < currentConfusionMatrix.values.length; i++) {
            currentPerformance.matrix[i] = [];
            for (let j = 0; j < currentConfusionMatrix.matrix[i].length; j++) {
              if (!currentPerformance.matrix[i][j]) {
                currentPerformance.matrix[i][j] = 0;
              }
              if (i === j) {
                for (
                  let k = 0;
                  k < currentConfusionMatrix.matrix[i].length;
                  k++
                ) {
                  currentPerformance.matrix[i][j] +=
                    currentConfusionMatrix.matrix[k][i];
                }
              }
            }
          }
        }

        if (this.evaluationDatas.confusionMatrixType === TYPES.COVERAGE) {
          if (this.evaluationDatas.confusionMatrix.displayedColumns) {
            for (
              let j = 0;
              j < this.evaluationDatas.confusionMatrix.displayedColumns.length;
              j++
            ) {
              if (
                this.evaluationDatas.confusionMatrix.displayedColumns?.[j]
                  ?.field !== 'target'
              ) {
                // Add % before each title
                const column =
                  this.evaluationDatas.confusionMatrix.displayedColumns[j];
                if (column) {
                  column.headerName = '%' + column.headerName;
                }
              }
            }
          }
        }

        // constuct the table
        for (let i = 0; i < currentPerformance.matrix.length; i++) {
          datas[i] = {};
          const currentRow = datas[i] as DynamicI;

          if (this.evaluationDatas.confusionMatrix.displayedColumns) {
            for (
              let j = 0;
              j < this.evaluationDatas.confusionMatrix.displayedColumns.length;
              j++
            ) {
              const column =
                this.evaluationDatas.confusionMatrix.displayedColumns[j];
              if (column?.field === 'target') {
                currentRow[column.field] = '$' + currentPerformance.values[i];
              } else if (column?.field) {
                currentRow[column.field] = currentPerformance.matrix[i][j - 1];

                if (
                  this.evaluationDatas.confusionMatrixType === TYPES.COVERAGE
                ) {
                  let percent =
                    (currentRow[column.field] * 100) /
                    UtilsService.arraySum(currentPerformance.matrix[i]);
                  if (isNaN(percent)) {
                    percent = 0;
                  }
                  currentRow[column.field] = percent;
                }
              }
            }
          }
        }
        this.evaluationDatas.confusionMatrix.values = datas;
      }
    }

    return this.evaluationDatas.confusionMatrix;
  }

  /**
   * Retrieves the summary of evaluation types.
   * @returns The evaluation types summary as a GridDatasI object.
   */
  getEvaluationTypesSummary(): GridDatasI {
    // init the object
    this.evaluationDatas.evaluationTypesSummary = {
      title: this.translate.get('GLOBAL.EVALUATION_TYPE'),
      values: undefined,
      displayedColumns: [
        {
          headerName: this.translate.get('GLOBAL.TYPE'),
          field: 'type',
          tooltip: this.translate.get('TOOLTIPS.EVALUATION.TYPES.TYPE'),
        },
        {
          headerName: this.translate.get('GLOBAL.DICTIONARY'),
          field: 'dictionary',
          tooltip: this.translate.get('TOOLTIPS.EVALUATION.TYPES.NAME'),
        },
        {
          headerName: this.translate.get('GLOBAL.INSTANCES'),
          field: 'instances',
          tooltip: this.translate.get('TOOLTIPS.EVALUATION.TYPES.INSTANCES'),
        },
      ],
    };

    const datas: EvaluationTypeModel[] = [];
    if (
      this.evaluationDatas.evaluationTypes &&
      this.evaluationDatas.evaluationTypes.length > 0
    ) {
      for (let i = 0; i < this.evaluationDatas.evaluationTypes.length; i++) {
        const currentEvaluation = this.evaluationDatas.evaluationTypes[i];
        const evalTypeItem: EvaluationTypeModel = new EvaluationTypeModel();
        evalTypeItem.type =
          currentEvaluation?.evaluationType || currentEvaluation?.reportType; // evaluationType is empty for only evaluation case
        evalTypeItem.dictionary = currentEvaluation?.summary.dictionary;
        evalTypeItem.instances = currentEvaluation?.summary.instances;
        evalTypeItem._id = evalTypeItem.type + i.toString(); // used for unique key
        datas.push(evalTypeItem);
      }
      this.evaluationDatas.evaluationTypesSummary.values = datas;

      // Init selection the first time
      if (!this.evaluationDatas.selectedEvaluationTypeVariable) {
        this.setSelectedEvaluationTypeVariable(datas[0]);
      }
    }

    return this.evaluationDatas.evaluationTypesSummary;
  }

  /**
   * Retrieves the predictor evaluations.
   * @returns The predictor evaluations as a GridDatasI object.
   */
  getPredictorEvaluations(): GridDatasI {
    this.evaluationDatas.predictorEvaluations = {
      title: this.translate.get('GLOBAL.PREDICTOR_EVALUATIONS'),
      values: undefined,
      displayedColumns: undefined,
    };
    const datas: EvaluationPredictorModel[] = [];
    const displayedColumns: GridColumnsI[] = [];

    if (this.evaluationDatas.evaluationTypesSummary?.values) {
      // cant make VO because it is not always the same column names
      for (
        let i = 0;
        i < this.evaluationDatas.evaluationTypesSummary.values.length;
        i++
      ) {
        // get current from json datas
        const currentEvaluationType = this.evaluationDatas.evaluationTypes?.[i];

        if (currentEvaluationType?.predictorsPerformance) {
          // combine all the tables train + test + other ?
          for (
            let j = 0;
            j < currentEvaluationType.predictorsPerformance.length;
            j++
          ) {
            const type =
              currentEvaluationType?.evaluationType ||
              currentEvaluationType?.reportType; // evaluationType is empty for only evaluation case
            const obj = currentEvaluationType?.predictorsPerformance[j];
            if (type && obj) {
              const currentEl = new EvaluationPredictorModel(
                type,
                currentEvaluationType?.evaluationType,
                obj,
              );
              datas.push(currentEl);
            }
          }
        }

        // Now compute robustness for each object
        for (let j = 0; j < datas.length; j++) {
          const currentEl: EvaluationPredictorModel | undefined = datas[j];
          const train: EvaluationPredictorModel | undefined = datas.find(
            (e) =>
              e.evaluationType === PREDICTOR_TYPES.TRAIN &&
              e.name === currentEl?.name,
          ); // find into data train the corresponding AUC train
          if (train) {
            currentEl?.computeRobustness(train);
          }
        }
      }

      // hide some columns and currentEvaluationType
      if (datas.length > 0 && datas[0]) {
        Object.keys(datas[0]).forEach((value) => {
          displayedColumns.push({
            headerName: value,
            field: value,
            show:
              value !== '_id' &&
              value !== 'rank' &&
              value !== 'family' &&
              value !== 'currentEvaluationType' &&
              value !== 'evaluationType',
            tooltip: this.translate.get(
              'TOOLTIPS.EVALUATION.EVALUATIONS.' + value.toUpperCase(),
            ),
          });
        });

        this.evaluationDatas.predictorEvaluations.values = datas;
        this.evaluationDatas.predictorEvaluations.displayedColumns =
          displayedColumns;

        // Init selection the first time
        if (
          !this.evaluationDatas.selectedPredictorEvaluationVariable &&
          datas.length > 0 &&
          datas[0]
        ) {
          this.setSelectedPredictorEvaluationVariable(datas[0]);
        }
      }
    }

    return this.evaluationDatas.predictorEvaluations;
  }

  /**
   * Retrieves the lift graph data for the specified target.
   * @param target - The target value (optional).
   * @returns The lift graph data as a ChartDatasModel.
   */
  getLiftGraphDatas(target?: string | undefined): ChartDatasModel {
    // Generate X axis values
    const xAxis = new Array(1001);
    xAxis[0] = '0';
    for (let i = 1; i < xAxis.length; i++) {
      xAxis[i] = (Number(xAxis[i - 1]) + 0.001).toFixed(3);
    }

    const trainDatas: LiftCurveValuesI[] =
      this.generateLiftCurveValuesForEvaluation(
        xAxis,
        PREDICTOR_TYPES.TRAIN,
        target,
      );
    const testDatas: LiftCurveValuesI[] =
      this.generateLiftCurveValuesForEvaluation(
        xAxis,
        PREDICTOR_TYPES.TEST,
        target,
      );

    let liftGraphDatas: LiftCurveValuesI[] = [];
    if (trainDatas.length > 0 || testDatas.length > 0) {
      let graphDatas: LiftCurveValuesI[] = [];
      if (target) {
        // add population information
        graphDatas = graphDatas.concat(
          this.generateRandomLiftDatas(xAxis, 'GLOBAL.POPULATION'),
        );
      }
      graphDatas = graphDatas.concat(trainDatas);
      graphDatas = graphDatas.concat(testDatas);
      if (target) {
        // Normal case
        graphDatas = graphDatas.concat(
          this.generateRandomLiftDatas(xAxis, 'GLOBAL.RANDOM'),
        );
      }

      // define displayed values for select toggle
      // init to show all values if not already set
      if (!this.evaluationDatas.liftGraphDisplayedValues) {
        this.evaluationDatas.liftGraphDisplayedValues = [];
        for (let j = 0; j < graphDatas.length; j++) {
          this.evaluationDatas.liftGraphDisplayedValues.push({
            name: graphDatas[j]?.name || '',
            show: j < AppConfig.visualizationCommon.GLOBAL.LIFT_CHART_COUNT,
          });
        }
      } else {
        // hide unselected graphs
        for (
          let k = 0;
          k < this.evaluationDatas.liftGraphDisplayedValues.length;
          k++
        ) {
          if (!this.evaluationDatas.liftGraphDisplayedValues[k]?.show) {
            const currentCurveDatas = graphDatas.find(
              (e) =>
                e.name ===
                this.evaluationDatas.liftGraphDisplayedValues?.[k]?.name,
            );
            if (currentCurveDatas) {
              currentCurveDatas.series = [];
            }
          }
        }
      }
      const displayedMap = this.evaluationDatas.liftGraphDisplayedValues.filter(
        (e) => e.show,
      );
      for (let j = 0; j < displayedMap.length; j++) {
        liftGraphDatas.push(
          // @ts-ignore
          graphDatas.find((e) => e.name === displayedMap[j].name),
        );
      }
      liftGraphDatas.filter((e) => {
        return this.evaluationDatas.liftGraphDisplayedValues?.find(
          (el) => e.name === el.name && el.show,
        );
      });
    }

    // format datas for new chartjs lib
    this.evaluationDatas.liftGraphDatas = new ChartDatasModel();
    this.evaluationDatas.liftGraphDatas.labels = xAxis;

    for (let i = 0; i < liftGraphDatas.length; i++) {
      const currentData: ChartDatasetModel = new ChartDatasetModel(
        liftGraphDatas[i]?.name,
        CHART_TYPES.LINE,
      );
      currentData.data = liftGraphDatas[i]?.series.map((e) => e.value);
      currentData.pointRadius = 0;
      currentData.pointHitRadius = 20;
      currentData.pointHoverRadius = 2;
      this.evaluationDatas.liftGraphDatas.datasets.push(currentData);
    }
    // Clone the displayed values
    // Otherwise when filtering Evaluation curves, legend is not updated #259
    this.evaluationDatas.liftGraphDisplayedValues = cloneDeep(
      this.evaluationDatas.liftGraphDisplayedValues,
    );
    return this.evaluationDatas.liftGraphDatas;
  }

  /**
   * Generates lift curve values for the specified evaluation type and target.
   * @param xAxis - The x-axis values.
   * @param type - The evaluation type (TRAIN or TEST).
   * @param target - The target value (optional).
   * @returns An array of LiftCurveValuesI containing the generated lift curve values.
   */
  generateLiftCurveValuesForEvaluation(
    xAxis: number[],
    type: PREDICTOR_TYPES,
    target?: string,
  ): LiftCurveValuesI[] {
    let currentReport: any;
    // get the correct report : train or test
    if (type === PREDICTOR_TYPES.TRAIN) {
      currentReport = this.appService.appDatas?.trainEvaluationReport;
    } else if (type === PREDICTOR_TYPES.TEST) {
      currentReport = this.appService.appDatas?.testEvaluationReport;
    }

    if (!currentReport) {
      // Manage the case when we have only evaluation report
      currentReport = this.appService.appDatas?.evaluationReport;
    }

    const graphDatas: LiftCurveValuesI[] = [];

    if (currentReport) {
      if (target === null || target === undefined) {
        // Regression case
        if (currentReport?.recCurves) {
          for (let j = 0; j < currentReport.recCurves.length; j++) {
            const currentSerie: LiftCurveSerieI[] = [];
            for (let k = 0; k < xAxis.length; k = k + 1) {
              // to smooth curve
              const currentCurveValue = currentReport.recCurves[j].values[k];
              const xValue = xAxis[k];
              currentSerie.push({
                name: Number((xValue || 0) * 100),
                value: Number(currentCurveValue),
              });
            }
            graphDatas.push({
              name: currentReport.recCurves[j].regressor + ': ' + type,
              series: currentSerie,
            });
          }
        }
      } else {
        // Normal case
        const currentLiftCurve: any = currentReport.liftCurves.find(
          (e: any) => e.targetValue === target,
        );

        if (currentLiftCurve?.curves) {
          for (let j = 0; j < currentLiftCurve.curves.length; j++) {
            const currentSerie: LiftCurveSerieI[] = [];
            for (let k = 0; k < xAxis.length; k = k + 1) {
              // to smooth curve
              const currentCurveValue = currentLiftCurve.curves[j].values[k];
              const xValue = xAxis[k];
              currentSerie.push({
                name: Number((xValue || 0) * 100),
                value: Number(currentCurveValue),
              });
            }
            graphDatas.push({
              name: currentLiftCurve.curves[j].classifier + ': ' + type,
              series: currentSerie,
            });
          }
        }
      }
    }

    return graphDatas;
  }

  /**
   * Generates random lift data for the given x-axis values and title.
   * @param xAxis - The x-axis values.
   * @param title - The title for the lift data.
   * @returns An array of LiftCurveValuesI containing the generated lift data.
   */
  generateRandomLiftDatas(xAxis: number[], title: string) {
    const graphDatas: LiftCurveValuesI[] = [];

    const currentSerie: LiftCurveSerieI[] = [];
    for (let k = 0; k < xAxis.length; k = k + 1) {
      // to smooth curve
      const xValue = xAxis[k];
      currentSerie.push({
        name: (xValue || 0) * 100,
        value: (xValue || 0) * 100,
      });
    }
    graphDatas.push({
      name: this.translate.get(title),
      series: currentSerie,
    });

    return graphDatas;
  }

  /**
   * Retrieves the lift targets for the current evaluation report.
   * @param currentTarget - The current target value (optional).
   * @returns An object containing the selected target and the list of targets.
   */
  getLiftTargets(currentTarget?: string): TargetLiftValuesI | undefined {
    let targetLift: TargetLiftValuesI | undefined;

    let currentEvalReport:
      | TestEvaluationReport
      | TrainEvaluationReport
      | EvaluationReport
      | undefined = this.appService.appDatas?.trainEvaluationReport;
    if (!currentEvalReport) {
      currentEvalReport = this.appService.appDatas?.evaluationReport;
    }
    if (!currentEvalReport) {
      currentEvalReport = this.appService.appDatas?.testEvaluationReport;
    }
    if (this.evaluationDatas.selectedPredictorEvaluationVariable) {
      if (
        this.evaluationDatas.selectedPredictorEvaluationVariable.type ===
        PREDICTOR_TYPES.TRAIN
      ) {
        currentEvalReport = this.appService.appDatas?.trainEvaluationReport;
      } else if (
        this.evaluationDatas.selectedPredictorEvaluationVariable.type ===
        PREDICTOR_TYPES.TEST
      ) {
        currentEvalReport = this.appService.appDatas?.testEvaluationReport;
      }
    }

    if (
      currentEvalReport?.predictorsDetailedPerformance &&
      currentEvalReport.liftCurves
    ) {
      targetLift = {
        selected: undefined,
        targets: undefined,
      };

      let targetsLiftList: string[] | undefined = [];
      if (
        currentEvalReport.predictorsDetailedPerformance &&
        this.evaluationDatas.selectedPredictorEvaluationVariable?.rank !==
          undefined &&
        currentEvalReport.predictorsDetailedPerformance[
          this.evaluationDatas.selectedPredictorEvaluationVariable.rank
        ]
      ) {
        targetsLiftList =
          currentEvalReport.predictorsDetailedPerformance[
            this.evaluationDatas.selectedPredictorEvaluationVariable.rank
          ]?.confusionMatrix.values;
      } else {
        // For optimal
        for (let i = 0; i < currentEvalReport.liftCurves.length; i++) {
          const targetValue = currentEvalReport.liftCurves[i]?.targetValue;
          if (targetValue) {
            targetsLiftList.push(targetValue);
          }
        }
      }

      targetLift.targets = targetsLiftList;

      if (currentTarget) {
        targetLift.selected = currentTarget;
      } else {
        // Check if mainTargetValue is set and is consistent
        const mainTargetValue: string =
          currentEvalReport?.summary?.mainTargetValue;
        const isConsistentTarget =
          mainTargetValue &&
          targetLift.targets &&
          targetLift.targets.indexOf(mainTargetValue) > -1;
        if (isConsistentTarget) {
          targetLift.selected = mainTargetValue;
        } else {
          // Else set the first value
          targetLift.selected = targetLift.targets?.[0];
        }
      }
    }

    return targetLift;
  }

  /**
   * Determines if the current analysis is a regression analysis.
   * @returns A boolean indicating whether the analysis is a regression analysis.
   */
  isRegressionAnalysis(): boolean {
    if (
      this.appService.appDatas?.trainEvaluationReport?.summary?.learningTask ===
      TASKS.REGRESSION
    ) {
      return true;
    } else if (
      this.appService.appDatas?.preparationReport?.summary?.learningTask ===
      TASKS.REGRESSION
    ) {
      return true;
    } else {
      return false;
    }
  }
}
