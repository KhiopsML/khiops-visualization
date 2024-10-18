import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { AppConfig } from 'src/environments/environment';
import { EvaluationTypeVO } from '../model/evaluation-type-vo';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { EvaluationPredictorVO } from '../model/evaluation-predictor-vo';
import { TYPES } from '@khiops-library/enum/types';
import { TASKS } from '@khiops-library/enum/tasks';
import { PREDICTOR_TYPES } from '@khiops-library/enum/predictorTypes';
import { EvaluationDatasVO } from '@khiops-visualization/model/evaluation-datas-vo';
import { ChartDatasetModel } from '@khiops-library/model/chartDataset.model';
import { ChartDatasModel } from '@khiops-library/model/chartDatas.model';
import { TargetLiftValuesI } from '@khiops-visualization/interfaces/target-lift-values';
import { LiftCurveValuesI } from '@khiops-visualization/interfaces/lift-curve-values';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { LiftCurveSerieI } from '../interfaces/lift-curve-serie';

@Injectable({
  providedIn: 'root',
})
export class EvaluationDatasService {
  evaluationDatas: EvaluationDatasVO;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
  ) {}

  initialize() {
    this.evaluationDatas = new EvaluationDatasVO();
  }

  getDatas(): EvaluationDatasVO {
    return this.evaluationDatas;
  }

  setLiftGraphDisplayedValues(object: ChartToggleValuesI[]) {
    this.evaluationDatas.liftGraphDisplayedValues = object;
  }

  getLiftGraphDisplayedValues(): ChartToggleValuesI[] | undefined {
    return this.evaluationDatas.liftGraphDisplayedValues;
  }
  setSelectedEvaluationTypeVariable(object: EvaluationTypeVO) {
    this.evaluationDatas.selectedEvaluationTypeVariable = object;
  }

  getSelectedEvaluationTypeVariable(): EvaluationTypeVO | undefined {
    return this.evaluationDatas.selectedEvaluationTypeVariable;
  }

  setSelectedPredictorEvaluationVariable(object: EvaluationPredictorVO) {
    this.evaluationDatas.selectedPredictorEvaluationVariable = object;
  }

  getPredictorEvaluationVariableFromEvaluationType(
    type: string,
  ): EvaluationPredictorVO {
    return this.evaluationDatas.predictorEvaluations.values?.find(
      (e) =>
        e.type === type &&
        e.rank ===
          this.evaluationDatas?.selectedPredictorEvaluationVariable?.rank,
    );
  }

  getEvaluationVariableFromPredictorEvaluationType(
    type: string,
  ): EvaluationTypeVO {
    return this.evaluationDatas.evaluationTypesSummary.values?.find(
      (e) => e.type === type,
    );
  }

  getEvaluationTypes(): any[] {
    const appDatas = this.appService.getDatas().datas;

    this.evaluationDatas.evaluationTypes = [];

    Object.keys(appDatas).forEach((value) => {
      if (appDatas?.[value]?.reportType === 'Evaluation') {
        this.evaluationDatas?.evaluationTypes?.push(appDatas[value]);
      }
    });
    return this.evaluationDatas.evaluationTypes;
  }

  // tslint:disable-next-line:typedef-whitespace
  getConfusionMatrix(type?: string): GridDatasI {
    const appDatas = this.appService.getDatas().datas;

    if (type) {
      this.evaluationDatas.confusionMatrixType = type;
    }

    if (this.evaluationDatas.selectedPredictorEvaluationVariable) {
      const datas: any = [];

      let currentReport: any;
      // get the correct report : train or test
      if (
        this.evaluationDatas?.selectedEvaluationTypeVariable?.type ===
        PREDICTOR_TYPES.TRAIN
      ) {
        currentReport = appDatas.trainEvaluationReport;
      } else if (
        this.evaluationDatas?.selectedEvaluationTypeVariable?.type ===
        PREDICTOR_TYPES.TEST
      ) {
        currentReport = appDatas.testEvaluationReport;
      } else {
        currentReport = appDatas.evaluationReport;
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
        let currentConfMat = currentReport.liftCurves.map((e) => e.targetValue); // For optimal
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
          this.evaluationDatas.confusionMatrix.displayedColumns.concat(
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
          for (
            let j = 0;
            j < this.evaluationDatas.confusionMatrix.displayedColumns.length;
            j++
          ) {
            if (
              this.evaluationDatas.confusionMatrix.displayedColumns[j].field !==
              'target'
            ) {
              // Add % before each title
              this.evaluationDatas.confusionMatrix.displayedColumns[
                j
              ].headerName =
                '%' +
                this.evaluationDatas.confusionMatrix.displayedColumns[j]
                  .headerName;
            }
          }
        }

        // constuct the table
        for (let i = 0; i < currentPerformance.matrix.length; i++) {
          datas[i] = {};

          for (
            let j = 0;
            j < this.evaluationDatas.confusionMatrix.displayedColumns.length;
            j++
          ) {
            if (
              this.evaluationDatas.confusionMatrix.displayedColumns[j].field ===
              'target'
            ) {
              datas[i][
                this.evaluationDatas.confusionMatrix.displayedColumns[j].field
              ] = '$' + currentPerformance.values[i];
            } else {
              datas[i][
                this.evaluationDatas.confusionMatrix.displayedColumns[j].field
              ] = currentPerformance.matrix[i][j - 1];

              if (this.evaluationDatas.confusionMatrixType === TYPES.COVERAGE) {
                let percent =
                  (datas[i][
                    this.evaluationDatas.confusionMatrix.displayedColumns[j]
                      .field
                  ] *
                    100) /
                  UtilsService.arraySum(currentPerformance.matrix[i]);
                if (isNaN(percent)) {
                  percent = 0;
                }
                datas[i][
                  this.evaluationDatas.confusionMatrix.displayedColumns[j].field
                ] = percent;
              }
            }
          }
        }
        this.evaluationDatas.confusionMatrix.values = datas;
      }
    }

    return this.evaluationDatas.confusionMatrix;
  }

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
          tooltip: this.translate.get(
            'TOOLTIPS.EVALUATION.TYPES.INSTANCES',
          ),
        },
      ],
    };

    const datas: EvaluationTypeVO[] = [];
    if (this.evaluationDatas.evaluationTypes.length > 0) {
      for (let i = 0; i < this.evaluationDatas.evaluationTypes.length; i++) {
        const currentEvaluation = this.evaluationDatas.evaluationTypes[i];
        const evalTypeItem: EvaluationTypeVO = new EvaluationTypeVO();
        evalTypeItem.type =
          currentEvaluation.evaluationType || currentEvaluation.reportType; // evaluationType is empty for only evaluation case
        evalTypeItem.dictionary = currentEvaluation.summary.dictionary;
        evalTypeItem.instances = currentEvaluation.summary.instances;
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

  getPredictorEvaluations(): GridDatasI {
    this.evaluationDatas.predictorEvaluations = {
      title: this.translate.get('GLOBAL.PREDICTOR_EVALUATIONS'),
      values: undefined,
      displayedColumns: undefined,
    };
    const datas: EvaluationPredictorVO[] = [];
    const displayedColumns: GridColumnsI[] = [];

    if (this.evaluationDatas.evaluationTypesSummary.values) {
      // cant make VO because it is not always the same column names
      for (
        let i = 0;
        i < this.evaluationDatas.evaluationTypesSummary.values.length;
        i++
      ) {
        // get current from json datas
        const currentEvaluationType = this.evaluationDatas.evaluationTypes[i];

        // combine all the tables train + test + other ?
        for (
          let j = 0;
          j < currentEvaluationType.predictorsPerformance.length;
          j++
        ) {
          const type =
            currentEvaluationType.evaluationType ||
            currentEvaluationType.reportType; // evaluationType is empty for only evaluation case
          const obj = currentEvaluationType.predictorsPerformance[j];
          const currentEl = new EvaluationPredictorVO(
            type,
            currentEvaluationType,
            obj,
          );
          datas.push(currentEl);
        }

        // Now compute robustness for each object
        for (let j = 0; j < datas.length; j++) {
          const currentEl: EvaluationPredictorVO = datas[j];
          const train: EvaluationPredictorVO | undefined = datas.find(
            (e) =>
              e.currentEvaluationType === PREDICTOR_TYPES.TRAIN &&
              e.name === currentEl.name,
          ); // find into data train the corresponding AUC train
          currentEl.computeRobustness(train);
        }
      }

      // hide some columns and currentEvaluationType
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
      if (!this.evaluationDatas.selectedPredictorEvaluationVariable) {
        this.setSelectedPredictorEvaluationVariable(datas[0]);
      }
    }

    return this.evaluationDatas.predictorEvaluations;
  }

  // tslint:disable-next-line:typedef-whitespace
  getLiftGraphDatas(target?: string): ChartDatasModel {
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
            name: graphDatas[j].name,
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
          if (!this.evaluationDatas.liftGraphDisplayedValues[k].show) {
            const currentCurveDatas = graphDatas.find(
              (e) =>
                e.name ===
                this.evaluationDatas.liftGraphDisplayedValues[k].name,
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
          graphDatas.find((e) => e.name === displayedMap[j].name),
        );
      }
      liftGraphDatas.filter((e) => {
        return this.evaluationDatas.liftGraphDisplayedValues.find(
          (el) => e.name === el.name && el.show,
        );
      });
    }

    // format datas for new chartjs lib
    this.evaluationDatas.liftGraphDatas = new ChartDatasModel();
    this.evaluationDatas.liftGraphDatas.labels = xAxis;

    for (let i = 0; i < liftGraphDatas.length; i++) {
      const currentData: ChartDatasetModel = new ChartDatasetModel(
        liftGraphDatas[i].name,
        'line',
      );
      currentData.data = liftGraphDatas[i].series.map((e) => e.value);
      currentData.pointRadius = 0;
      currentData.pointHitRadius = 20;
      currentData.pointHoverRadius = 2;
      this.evaluationDatas.liftGraphDatas.datasets.push(currentData);
    }

    return this.evaluationDatas.liftGraphDatas;
  }

  // tslint:disable-next-line:typedef-whitespace
  generateLiftCurveValuesForEvaluation(
    xAxis,
    type,
    target?: string,
  ): LiftCurveValuesI[] {
    let currentReport: any;
    // get the correct report : train or test
    if (type === PREDICTOR_TYPES.TRAIN) {
      currentReport = this.appService.getDatas().datas.trainEvaluationReport;
    } else if (type === PREDICTOR_TYPES.TEST) {
      currentReport = this.appService.getDatas().datas.testEvaluationReport;
    }

    if (!currentReport) {
      // Manage the case when we have only evaluation report
      currentReport = this.appService.getDatas().datas.evaluationReport;
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
              currentSerie.push({
                name: Number(xAxis[k] * 100),
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
          (e) => e.targetValue === target,
        );

        if (currentLiftCurve?.curves) {
          for (let j = 0; j < currentLiftCurve.curves.length; j++) {
            const currentSerie: LiftCurveSerieI[] = [];
            for (let k = 0; k < xAxis.length; k = k + 1) {
              // to smooth curve
              const currentCurveValue = currentLiftCurve.curves[j].values[k];
              currentSerie.push({
                name: Number(xAxis[k] * 100),
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

  // tslint:disable-next-line:typedef-whitespace
  generateRandomLiftDatas(xAxis, title) {
    const graphDatas: LiftCurveValuesI[] = [];

    const currentSerie: LiftCurveSerieI[] = [];
    for (let k = 0; k < xAxis.length; k = k + 1) {
      // to smooth curve
      currentSerie.push({
        name: xAxis[k] * 100,
        value: xAxis[k] * 100,
      });
    }
    graphDatas.push({
      name: this.translate.get(title),
      series: currentSerie,
    });

    return graphDatas;
  }

  getLiftTargets(currentTarget?): TargetLiftValuesI {
    const appDatas = this.appService.getDatas().datas;
    let targetLift: TargetLiftValuesI;

    let currentEvalReport = appDatas.trainEvaluationReport;
    if (!currentEvalReport) {
      currentEvalReport = appDatas.evaluationReport;
    }
    if (!currentEvalReport) {
      currentEvalReport = appDatas.testEvaluationReport;
    }
    if (this.evaluationDatas.selectedPredictorEvaluationVariable) {
      if (
        this.evaluationDatas.selectedPredictorEvaluationVariable.type ===
        PREDICTOR_TYPES.TRAIN
      ) {
        currentEvalReport = appDatas.trainEvaluationReport;
      } else if (
        this.evaluationDatas.selectedPredictorEvaluationVariable.type ===
        PREDICTOR_TYPES.TEST
      ) {
        currentEvalReport = appDatas.testEvaluationReport;
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

      let targetsLiftList: string[] = [];
      if (
        currentEvalReport.predictorsDetailedPerformance[
          this.evaluationDatas.selectedPredictorEvaluationVariable.rank
        ]
      ) {
        targetsLiftList =
          currentEvalReport.predictorsDetailedPerformance[
            this.evaluationDatas.selectedPredictorEvaluationVariable.rank
          ].confusionMatrix.values;
      } else {
        // For optimal
        for (let i = 0; i < currentEvalReport.liftCurves.length; i++) {
          targetsLiftList.push(currentEvalReport.liftCurves[i].targetValue);
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
          mainTargetValue && targetLift.targets.indexOf(mainTargetValue) > -1;
        if (isConsistentTarget) {
          targetLift.selected = mainTargetValue;
        } else {
          // Else set the first value
          targetLift.selected = targetLift.targets[0];
        }
      }
    }

    return targetLift;
  }

  isRegressionAnalysis(): boolean {
    const appDatas = this.appService.getDatas().datas;
    if (
      appDatas?.trainEvaluationReport?.summary?.learningTask ===
      TASKS.REGRESSION
    ) {
      return true;
    } else if (
      appDatas?.preparationReport?.summary?.learningTask === TASKS.REGRESSION
    ) {
      return true;
    } else {
      return false;
    }
  }
}
