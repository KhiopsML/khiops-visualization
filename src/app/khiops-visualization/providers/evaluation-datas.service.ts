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
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { LiftCurveSerieI } from '../interfaces/lift-curve-serie';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';
import { TestEvaluationReport } from '@khiops-visualization/interfaces/test-evaluation-report';
import { TrainEvaluationReport } from '@khiops-visualization/interfaces/train-evaluation-report';
import { EvaluationReport } from '@khiops-visualization/interfaces/evaluation-report';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { BehaviorSubject } from 'rxjs';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class EvaluationDatasService {
  private evaluationDatasSubject = new BehaviorSubject<EvaluationDatasModel>(
    new EvaluationDatasModel(),
  );
  public evaluationDatas$ = this.evaluationDatasSubject.asObservable();

  private liftGraphDisplayedValuesSubject = new BehaviorSubject<
    ChartToggleValuesI[] | undefined
  >(undefined);
  public liftGraphDisplayedValues$ =
    this.liftGraphDisplayedValuesSubject.asObservable();

  private selectedEvaluationTypeVariableSubject = new BehaviorSubject<
    EvaluationTypeModel | undefined
  >(undefined);
  public selectedEvaluationTypeVariable$ =
    this.selectedEvaluationTypeVariableSubject.asObservable();

  private selectedPredictorEvaluationVariableSubject = new BehaviorSubject<
    EvaluationPredictorModel | undefined
  >(undefined);
  public selectedPredictorEvaluationVariable$ =
    this.selectedPredictorEvaluationVariableSubject.asObservable();

  constructor(
    private translate: TranslateService,
    private appService: AppService,
  ) {}

  private get evaluationDatas(): EvaluationDatasModel {
    return this.evaluationDatasSubject.value;
  }

  private set evaluationDatas(val: EvaluationDatasModel) {
    this.evaluationDatasSubject.next(val);
  }

  /**
   * Creates a new immutable copy of the current evaluation data
   */
  private createDatasCopy(): EvaluationDatasModel {
    return Object.assign(new EvaluationDatasModel(), this.evaluationDatas);
  }

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
   * Sets the displayed values for the lift graph.
   * @param object - The chart toggle values to set.
   */
  setLiftGraphDisplayedValues(object: ChartToggleValuesI[]) {
    const newData = this.createDatasCopy();
    newData.liftGraphDisplayedValues = object;
    this.evaluationDatas = newData;
    this.liftGraphDisplayedValuesSubject.next(object);
  }

  /**
   * Retrieves the displayed values for the lift graph.
   * @returns The chart toggle values.
   */
  getLiftGraphDisplayedValues(): ChartToggleValuesI[] | undefined {
    return this.liftGraphDisplayedValuesSubject.value;
  }

  /**
   * Sets the selected evaluation type variable.
   * @param object - The evaluation type model to set.
   */
  setSelectedEvaluationTypeVariable(object: EvaluationTypeModel | undefined) {
    const newData = this.createDatasCopy();
    newData.selectedEvaluationTypeVariable = object;
    this.evaluationDatas = newData;
    this.selectedEvaluationTypeVariableSubject.next(object);
  }

  /**
   * Retrieves the selected evaluation type variable.
   * @returns The selected evaluation type model.
   */
  getSelectedEvaluationTypeVariable(): EvaluationTypeModel | undefined {
    return this.selectedEvaluationTypeVariableSubject.value;
  }

  /**
   * Sets the selected predictor evaluation variable.
   * @param object - The evaluation predictor model to set.
   */
  setSelectedPredictorEvaluationVariable(object: EvaluationPredictorModel) {
    const newData = this.createDatasCopy();
    newData.selectedPredictorEvaluationVariable = object;
    this.evaluationDatas = newData;
    this.selectedPredictorEvaluationVariableSubject.next(object);
  }

  /**
   * Retrieves the predictor evaluation variable for the specified evaluation type.
   * @param type - The evaluation type.
   * @returns The corresponding EvaluationPredictorModel.
   */
  getPredictorEvaluationVariableFromEvaluationType(
    type: string,
  ): EvaluationPredictorModel {
    const currentData = this.evaluationDatas;
    return currentData.predictorEvaluations?.values?.find(
      (e: any) =>
        e.type === type &&
        e.rank === currentData?.selectedPredictorEvaluationVariable?.rank,
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
    const currentData = this.evaluationDatas;
    return currentData.evaluationTypesSummary?.values?.find(
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
    const newData = this.createDatasCopy();
    newData.evaluationTypes = [];
    // @ts-ignore
    Object.keys(this.appService.appDatas).forEach((value: any) => {
      // @ts-ignore
      const currentReport = this.appService.appDatas[value];
      if (currentReport.reportType === 'Evaluation') {
        newData?.evaluationTypes?.push(currentReport);
      }
    });
    this.evaluationDatas = newData;
    return this.evaluationDatas.evaluationTypes || [];
  }

  /**
   * Retrieves the confusion matrix for the specified type.
   * @param type - The type of confusion matrix (optional).
   * @returns The confusion matrix as a GridDatasI object.
   */
  getConfusionMatrix(type?: string): GridDatasI | undefined {
    const currentData = this.evaluationDatas;

    if (type) {
      const newData = this.createDatasCopy();
      newData.confusionMatrixType = type;
      this.evaluationDatas = newData;
    }

    if (currentData.selectedPredictorEvaluationVariable) {
      const confusionMatrix = this.buildConfusionMatrix(currentData);
      const newData = this.createDatasCopy();
      newData.confusionMatrix = confusionMatrix;
      this.evaluationDatas = newData;
      return confusionMatrix;
    }

    return currentData.confusionMatrix;
  }

  /**
   * Builds the confusion matrix data structure
   */
  private buildConfusionMatrix(currentData: EvaluationDatasModel): GridDatasI {
    const datas: DynamicI[] = [];
    const currentReport = this.getCurrentReport(currentData);

    if (
      !currentReport?.predictorsDetailedPerformance ||
      !currentReport.liftCurves
    ) {
      return this.createEmptyConfusionMatrix(currentData);
    }

    const confusionMatrix = this.initializeConfusionMatrix(currentData);
    const { targetsLift, currentPerformance } = this.processConfusionMatrixData(
      currentReport,
      currentData,
    );

    confusionMatrix.displayedColumns =
      confusionMatrix.displayedColumns?.concat(targetsLift);

    this.applyConfusionMatrixType(confusionMatrix, currentData);
    this.constructConfusionMatrixTable(
      datas,
      currentPerformance,
      confusionMatrix,
      currentData,
    );

    confusionMatrix.values = datas;
    return confusionMatrix;
  }

  /**
   * Gets the current report based on selected evaluation type
   */
  private getCurrentReport(currentData: EvaluationDatasModel): any {
    if (
      currentData?.selectedEvaluationTypeVariable?.type ===
      PREDICTOR_TYPES.TRAIN
    ) {
      return this.appService.appDatas?.trainEvaluationReport;
    } else if (
      currentData?.selectedEvaluationTypeVariable?.type === PREDICTOR_TYPES.TEST
    ) {
      return this.appService.appDatas?.testEvaluationReport;
    } else {
      return this.appService.appDatas?.evaluationReport;
    }
  }

  /**
   * Creates an empty confusion matrix structure
   */
  private createEmptyConfusionMatrix(
    currentData: EvaluationDatasModel,
  ): GridDatasI {
    return {
      title: this.translate.get('GLOBAL.CONFUSION_MATRIX_OF', {
        type: currentData.selectedPredictorEvaluationVariable?.name || '',
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
  }

  /**
   * Initializes the confusion matrix structure
   */
  private initializeConfusionMatrix(
    currentData: EvaluationDatasModel,
  ): GridDatasI {
    return {
      title: this.translate.get('GLOBAL.CONFUSION_MATRIX_OF', {
        type: currentData.selectedPredictorEvaluationVariable?.name || '',
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
  }

  /**
   * Processes confusion matrix data and returns targets and performance data
   */
  private processConfusionMatrixData(
    currentReport: any,
    currentData: EvaluationDatasModel,
  ) {
    const targetsLift: GridColumnsI[] = [];
    let currentConfMat = currentReport.liftCurves.map(
      (e: any) => e.targetValue,
    );
    let currentPerformance: any = {};

    if (
      currentReport.predictorsDetailedPerformance[
        currentData.selectedPredictorEvaluationVariable?.rank || 0
      ]
    ) {
      currentConfMat =
        currentReport.predictorsDetailedPerformance[
          currentData.selectedPredictorEvaluationVariable?.rank || 0
        ].confusionMatrix.values;
      currentPerformance =
        currentReport.predictorsDetailedPerformance[
          currentData.selectedPredictorEvaluationVariable?.rank || 0
        ].confusionMatrix;
    } else {
      // Optimal case
      currentPerformance = this.computeOptimalPerformance(currentReport);
    }

    // Build target columns
    for (let i = 0; i < currentConfMat.length; i++) {
      let targetValueName = currentConfMat[i];
      if (targetValueName === '') {
        targetValueName = '-';
      }
      targetsLift.push({
        headerName: targetValueName,
        field: i.toString(),
      });
    }

    return { targetsLift, currentPerformance };
  }

  /**
   * Computes optimal performance for confusion matrix
   */
  private computeOptimalPerformance(currentReport: any) {
    const currentPerformance: any = {};
    currentPerformance.values =
      currentReport.predictorsDetailedPerformance.R1.confusionMatrix.values;
    currentPerformance.matrix = [];

    const currentConfusionMatrix =
      currentReport.predictorsDetailedPerformance.R1.confusionMatrix;
    for (let i = 0; i < currentConfusionMatrix.values.length; i++) {
      currentPerformance.matrix[i] = [];
      for (let j = 0; j < currentConfusionMatrix.matrix[i].length; j++) {
        if (!currentPerformance.matrix[i][j]) {
          currentPerformance.matrix[i][j] = 0;
        }
        if (i === j) {
          for (let k = 0; k < currentConfusionMatrix.matrix[i].length; k++) {
            currentPerformance.matrix[i][j] +=
              currentConfusionMatrix.matrix[k][i];
          }
        }
      }
    }
    return currentPerformance;
  }

  /**
   * Applies confusion matrix type formatting (coverage percentage)
   */
  private applyConfusionMatrixType(
    confusionMatrix: GridDatasI,
    currentData: EvaluationDatasModel,
  ) {
    if (currentData.confusionMatrixType === TYPES.COVERAGE) {
      if (confusionMatrix.displayedColumns) {
        for (let j = 0; j < confusionMatrix.displayedColumns.length; j++) {
          if (confusionMatrix.displayedColumns?.[j]?.field !== 'target') {
            const column = confusionMatrix.displayedColumns[j];
            if (column) {
              column.headerName = '%' + column.headerName;
            }
          }
        }
      }
    }
  }

  /**
   * Constructs the confusion matrix table data
   */
  private constructConfusionMatrixTable(
    datas: DynamicI[],
    currentPerformance: any,
    confusionMatrix: GridDatasI,
    currentData: EvaluationDatasModel,
  ) {
    for (let i = 0; i < currentPerformance.matrix.length; i++) {
      datas[i] = {};
      const currentRow = datas[i] as DynamicI;

      if (confusionMatrix.displayedColumns) {
        for (let j = 0; j < confusionMatrix.displayedColumns.length; j++) {
          const column = confusionMatrix.displayedColumns[j];
          if (column?.field === 'target') {
            currentRow[column.field] = '$' + currentPerformance.values[i];
          } else if (column?.field) {
            currentRow[column.field] = currentPerformance.matrix[i][j - 1];

            if (currentData.confusionMatrixType === TYPES.COVERAGE) {
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
  }

  /**
   * Retrieves the summary of evaluation types.
   * @returns The evaluation types summary as a GridDatasI object.
   */
  getEvaluationTypesSummary(): GridDatasI {
    const currentData = this.evaluationDatas;

    // init the object
    const evaluationTypesSummary: GridDatasI = {
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
    if (currentData.evaluationTypes && currentData.evaluationTypes.length > 0) {
      for (let i = 0; i < currentData.evaluationTypes.length; i++) {
        const currentEvaluation = currentData.evaluationTypes[i];
        const evalTypeItem: EvaluationTypeModel = new EvaluationTypeModel();
        evalTypeItem.type =
          currentEvaluation?.evaluationType || currentEvaluation?.reportType; // evaluationType is empty for only evaluation case
        evalTypeItem.dictionary = currentEvaluation?.summary.dictionary;
        evalTypeItem.instances = currentEvaluation?.summary.instances;
        evalTypeItem._id = evalTypeItem.type + i.toString(); // used for unique key
        datas.push(evalTypeItem);
      }
      evaluationTypesSummary.values = datas;

      // Init selection the first time
      if (!this.getSelectedEvaluationTypeVariable()) {
        this.setSelectedEvaluationTypeVariable(datas[0]);
      }
    }

    const newData = this.createDatasCopy();
    newData.evaluationTypesSummary = evaluationTypesSummary;
    this.evaluationDatas = newData;

    return evaluationTypesSummary;
  }

  /**
   * Retrieves the predictor evaluations.
   * @returns The predictor evaluations as a GridDatasI object.
   */
  getPredictorEvaluations(): GridDatasI {
    const currentData = this.evaluationDatas;

    const predictorEvaluations: GridDatasI = {
      title: this.translate.get('GLOBAL.PREDICTOR_EVALUATIONS'),
      values: undefined,
      displayedColumns: undefined,
    };

    const datas: EvaluationPredictorModel[] = [];
    const displayedColumns: GridColumnsI[] = [];

    if (currentData.evaluationTypesSummary?.values) {
      // cant make VO because it is not always the same column names
      for (
        let i = 0;
        i < currentData.evaluationTypesSummary.values.length;
        i++
      ) {
        // get current from json datas
        const currentEvaluationType = currentData.evaluationTypes?.[i];

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

        predictorEvaluations.values = datas;
        predictorEvaluations.displayedColumns = displayedColumns;

        // Init selection the first time
        if (
          !this.selectedPredictorEvaluationVariableSubject.value &&
          datas.length > 0 &&
          datas[0]
        ) {
          this.setSelectedPredictorEvaluationVariable(datas[0]);
        }
      }
    }

    const newData = this.createDatasCopy();
    newData.predictorEvaluations = predictorEvaluations;
    this.evaluationDatas = newData;

    return predictorEvaluations;
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
      const currentLiftGraphDisplayedValues =
        this.getLiftGraphDisplayedValues();
      if (!currentLiftGraphDisplayedValues) {
        const newDisplayedValues: ChartToggleValuesI[] = [];
        for (let j = 0; j < graphDatas.length; j++) {
          newDisplayedValues.push({
            name: graphDatas[j]?.name || '',
            show: j < AppConfig.visualizationCommon.GLOBAL.LIFT_CHART_COUNT,
          });
        }
        this.setLiftGraphDisplayedValues(newDisplayedValues);
      } else {
        // hide unselected graphs
        for (let k = 0; k < currentLiftGraphDisplayedValues.length; k++) {
          if (!currentLiftGraphDisplayedValues[k]?.show) {
            const currentCurveDatas = graphDatas.find(
              (e) => e.name === currentLiftGraphDisplayedValues?.[k]?.name,
            );
            if (currentCurveDatas) {
              currentCurveDatas.series = [];
            }
          }
        }
      }

      const displayedMap = (this.getLiftGraphDisplayedValues() || []).filter(
        (e: ChartToggleValuesI) => e.show,
      );
      for (let j = 0; j < displayedMap.length; j++) {
        liftGraphDatas.push(
          // @ts-ignore
          graphDatas.find((e) => e.name === displayedMap[j].name),
        );
      }
      liftGraphDatas = liftGraphDatas.filter((e) => {
        return (this.getLiftGraphDisplayedValues() || []).find(
          (el: ChartToggleValuesI) => e.name === el.name && el.show,
        );
      });
    }

    // format datas for new chartjs lib
    const liftGraphDatasModel = new ChartDatasModel();
    liftGraphDatasModel.labels = xAxis;

    for (let i = 0; i < liftGraphDatas.length; i++) {
      const currentData: ChartDatasetModel = new ChartDatasetModel(
        liftGraphDatas[i]?.name,
        CHART_TYPES.LINE,
      );
      currentData.data = liftGraphDatas[i]?.series.map((e) => e.value);
      currentData.pointRadius = 0;
      currentData.pointHitRadius = 20;
      currentData.pointHoverRadius = 2;
      liftGraphDatasModel.datasets.push(currentData);
    }

    // Clone the displayed values
    // Otherwise when filtering Evaluation curves, legend is not updated #259
    const clonedDisplayedValues = _.cloneDeep(
      this.getLiftGraphDisplayedValues(),
    );
    this.setLiftGraphDisplayedValues(clonedDisplayedValues || []);

    // Update the evaluation data
    const newData = this.createDatasCopy();
    newData.liftGraphDatas = liftGraphDatasModel;
    this.evaluationDatas = newData;

    return liftGraphDatasModel;
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
        if (currentReport && currentReport.recCurves) {
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
    const currentData = this.evaluationDatas;

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
    if (currentData.selectedPredictorEvaluationVariable) {
      if (
        currentData.selectedPredictorEvaluationVariable.type ===
        PREDICTOR_TYPES.TRAIN
      ) {
        currentEvalReport = this.appService.appDatas?.trainEvaluationReport;
      } else if (
        currentData.selectedPredictorEvaluationVariable.type ===
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
        currentData.selectedPredictorEvaluationVariable?.rank !== undefined &&
        currentEvalReport.predictorsDetailedPerformance[
          currentData.selectedPredictorEvaluationVariable.rank
        ]
      ) {
        targetsLiftList =
          currentEvalReport.predictorsDetailedPerformance[
            currentData.selectedPredictorEvaluationVariable.rank
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
