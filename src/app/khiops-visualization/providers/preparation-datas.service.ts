import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { BarModel } from '../model/bar.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { PreparationVariableModel } from '../model/preparation-variable.model';
import { VariableModel } from '../model/variable.model';
import { VariableDetailsModel } from '../model/variable-details.model';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { SummaryModel } from '../model/summary.model';
import { InformationsModel } from '../model/informations.model';
import { REPORT } from '@khiops-library/enum/report';
import { TASKS } from '@khiops-library/enum/tasks';
import { TYPES } from '@khiops-library/enum/types';
import { PreparationDatasModel } from '@khiops-visualization/model/preparation-datas.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { GridColumnsI } from '../../khiops-library/interfaces/grid-columns';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { TextPreparationVariableStatistic } from '@khiops-visualization/interfaces/text-preparation-report';
import { TrainedPredictorModel } from '@khiops-visualization/model/trained-predictor.model';
import { PreparationVariableStatistic } from '@khiops-visualization/interfaces/preparation-report';
import { TreePreparationVariableStatistic } from '@khiops-visualization/interfaces/tree-preparation-report';
import { VariableDetail } from '@khiops-visualization/interfaces/app-datas';

@Injectable({
  providedIn: 'root',
})
export class PreparationDatasService {
  private preparationDatas!: PreparationDatasModel;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
  ) {}

  /**
   * Initializes the preparation data by setting default selected variables.
   * It selects the first variable from the preparation report and text preparation report by default.
   * If a saved selected variable rank is found, it sets that variable as the selected variable.
   */
  initialize() {
    this.preparationDatas = new PreparationDatasModel();

    // select the first item of the list by default
    if (this.appService.appDatas?.preparationReport?.variablesStatistics?.[0]) {
      let defaultVariable =
        this.appService.appDatas.preparationReport.variablesStatistics[0];

      // Check if there is a saved selected variable into json
      const savedSelectedRank = this.appService.getSavedDatas('selectedRank');
      if (savedSelectedRank) {
        defaultVariable = this.getVariableFromRank(
          savedSelectedRank,
          REPORT.PREPARATION_REPORT,
        );
      }

      this.setSelectedVariable(defaultVariable.name, REPORT.PREPARATION_REPORT);
    }
    // select the first item of the list by default
    if (
      this.appService.appDatas?.textPreparationReport?.variablesStatistics?.[0]
    ) {
      let defaultVariable: TextPreparationVariableStatistic =
        this.appService.appDatas.textPreparationReport.variablesStatistics[0];

      // Check if there is a saved selected variable into json
      const savedSelectedRank = this.appService.getSavedDatas('selectedRank');
      if (savedSelectedRank) {
        defaultVariable = this.getVariableFromRank(
          savedSelectedRank,
          REPORT.TEXT_PREPARATION_REPORT,
        );
      }

      this.setSelectedVariable(
        defaultVariable.name,
        REPORT.TEXT_PREPARATION_REPORT,
      );
    }
  }

  /**
   * Retrieves the data for the specified preparation source.
   * @param {string} preparationSource - The source of the preparation data.
   * @returns {object} An object containing the selected variable and current interval data.
   */
  getDatas(preparationSource: string):
    | {
        selectedVariable: PreparationVariableModel;
        currentIntervalDatas: GridDatasI;
      }
    | undefined {
    return this.preparationDatas[preparationSource];
  }

  /**
   * Sets the selected variable for the specified preparation source.
   * @param {string} preparationSource - The source of the preparation data.
   * @returns {PreparationVariableModel | undefined} The selected variable model or undefined if not found.
   */
  setSelectedVariable(
    name: string,
    preparationSource: string,
  ): PreparationVariableModel | undefined {
    if (name) {
      const variable: PreparationVariableStatistic = this.getVariableFromName(
        name,
        preparationSource,
      );
      if (variable) {
        this.preparationDatas[preparationSource]!.selectedVariable =
          new PreparationVariableModel(variable, variable.name);
        return this.preparationDatas[preparationSource]?.selectedVariable;
      }
    }
    return undefined;
  }

  /**
   * Retrieves the selected variable for the specified preparation source.
   * @param {string} preparationSource - The source of the preparation data.
   * @returns {PreparationVariableModel} The selected variable model.
   */
  getSelectedVariable(
    preparationSource: string,
  ): PreparationVariableModel | undefined {
    return this.preparationDatas[preparationSource]?.selectedVariable;
  }

  /**
   * Retrieves the rank of the selected variable.
   * @returns {string} The rank of the selected variable.
   */
  getSelectedVariableRank(): string | undefined {
    return this.preparationDatas.preparationReport?.selectedVariable?.rank;
  }

  /**
   * Retrieves a variable by its name from the specified preparation source.
   * @param {string} name - The name of the variable.
   * @param {string} preparationSource - The source of the preparation data.
   * @returns {any} The variable with the specified name.
   */
  getVariableFromName(name: string, preparationSource: string): any {
    // @ts-ignore
    return this.appService.appDatas[preparationSource].variablesStatistics.find(
      (e: any) => e.name === name,
    );
  }

  /**
   * Retrieves a variable by its rank from the specified preparation source.
   * @param {string} rank - The rank of the variable.
   * @param {string} preparationSource - The source of the preparation data.
   * @returns {any} The variable with the specified rank.
   */
  getVariableFromRank(rank: string, preparationSource: string): any {
    // @ts-ignore
    return this.appService.appDatas?.[
      preparationSource
    ].variablesStatistics.find((e: any) => e.rank === rank);
  }

  /**
   * Retrieves summary data for the specified preparation source.
   * If no preparation source is provided, it defaults to the available preparation report.
   * @param {string} [preparationSource] - The source of the preparation data.
   * @returns {InfosDatasI[]} The summary data.
   */
  getSummaryDatas(preparationSource?: REPORT): InfosDatasI[] {
    if (!preparationSource) {
      preparationSource = this.getAvailablePreparationReport();
    }
    const summary = new SummaryModel(
      // @ts-ignore
      this.appService.appDatas![preparationSource].summary,
    );
    return summary.displayDatas;
  }

  /**
   * Retrieves information data for the specified preparation source.
   * @param {string} preparationSource - The source of the preparation data.
   * @returns {InfosDatasI[] | undefined} The information data.
   */
  getInformationsDatas(preparationSource: string): InfosDatasI[] | undefined {
    const informationsDatas = new InformationsModel(
      // @ts-ignore
      this.appService.appDatas![preparationSource].summary,
    );
    return informationsDatas.displayDatas;
  }

  /**
   * Retrieves the current interval data for the specified preparation source and index.
   * @param {string} preparationSource - The source of the preparation data.
   * @param {number} [index] - The index of the interval data.
   * @returns {GridDatasI} The current interval data.
   */
  getCurrentIntervalDatas(
    preparationSource: string,
    index?: number,
  ): GridDatasI {
    index = index || 0;

    const datas: DynamicI = [];
    let title = '';
    const displayedColumns: GridColumnsI[] = [];

    // init the object
    this.preparationDatas[preparationSource].currentIntervalDatas = {
      title: title,
      values: datas,
      displayedColumns: displayedColumns,
    };

    if (
      // @ts-ignore
      this.appService.appDatas?.[preparationSource]?.variablesDetailedStatistics
    ) {
      const currentVar: VariableDetail | undefined =
        // @ts-ignore
        this.appService.appDatas[preparationSource].variablesDetailedStatistics[
          this.preparationDatas[preparationSource].selectedVariable.rank
        ];
      const variableDetails: VariableDetailsModel = new VariableDetailsModel(
        currentVar!,
      );

      if (variableDetails?.dataGrid) {
        const currentVariableType =
          variableDetails.dataGrid.dimensions[0]?.type;

        if (currentVariableType === TYPES.NUMERICAL) {
          displayedColumns.push({
            headerName:
              this.translate.get('GLOBAL.INTERVAL_OF') +
              variableDetails.dataGrid.dimensions[0]?.variable,
            field: 'interval',
          });

          // init datas array
          datas[0] = {};
          if (
            variableDetails.dataGrid.dimensions[0]!.partition[index]!.length > 0
          ) {
            let currentPartition = JSON.stringify(
              variableDetails.dataGrid.dimensions[0]!.partition[index],
            );
            if (index !== 0) {
              // replace [ by ] for all indexes excepting 0
              // currentPartition = currentPartition.replace('[', ']');
              // Code scanning alerts #3
              currentPartition = currentPartition.replace(/\[/g, ']');
            }
            datas[0]['interval'] = currentPartition;
          } else {
            datas[0]['interval'] = this.translate.get('GLOBAL.MISSING');
          }

          title = this.translate.get('GLOBAL.CURRENT_INTERVAL');
        } else if (currentVariableType === TYPES.CATEGORICAL) {
          let dimensionLength = 0;
          let startIter = 0;

          const currentVal: string | number | undefined =
            variableDetails.dataGrid.dimensions[0]?.partition[index]?.[0];

          displayedColumns.push({
            headerName:
              this.translate.get('GLOBAL.VALUES_OF') +
              variableDetails.dataGrid.dimensions[0]?.variable,
            field: 'values',
          });
          displayedColumns.push({
            headerName: this.translate.get('GLOBAL.FREQUENCY'),
            field: 'frequency',
          });

          const partValuesLength = UtilsService.flatten(
            variableDetails.dataGrid.dimensions[0]?.partition!,
          ).length;
          const partLength =
            variableDetails.dataGrid.dimensions[0]!.partition.length;
          const isMultiDimPartition = partValuesLength !== partLength;
          const defaultGroupIndex =
            variableDetails.dataGrid.dimensions[0]?.defaultGroupIndex;

          // If multi dimension array, trash cat is managed at the end of treatment
          if (!isMultiDimPartition) {
            startIter = variableDetails.inputValues.values.indexOf(
              currentVal!.toString(),
            );
            if (index === defaultGroupIndex) {
              dimensionLength = variableDetails.inputValues.values.length;
            } else {
              dimensionLength =
                startIter +
                variableDetails.dataGrid.dimensions[0]!.partition[index]!
                  .length;
            }
          } else {
            startIter = 0;
            dimensionLength =
              variableDetails.dataGrid.dimensions[0]!.partition[index]!.length;
          }

          for (let i = startIter; i < dimensionLength; i++) {
            let currentPartitionInput;
            if (isMultiDimPartition) {
              currentPartitionInput =
                variableDetails.dataGrid.dimensions[0]!.partition[index]![i];
            } else {
              currentPartitionInput = variableDetails.inputValues.values[i];
            }

            datas[i - startIter] = {};
            datas[i - startIter]['values'] = currentPartitionInput;
            const currentValueIndex: any =
              variableDetails.inputValues.values.indexOf(
                currentPartitionInput + '',
              );
            datas[i - startIter]['frequency'] =
              variableDetails.inputValues.frequencies[currentValueIndex];
          }

          // trash cat management for multi dim
          if (isMultiDimPartition && index === defaultGroupIndex) {
            const inputValuesLength = variableDetails.inputValues.values.length;
            const unpartitionnedValuesLength =
              inputValuesLength - partValuesLength;
            if (unpartitionnedValuesLength !== 0) {
              for (let i = partValuesLength; i < inputValuesLength; i++) {
                const currentPartitionInput =
                  variableDetails.inputValues.values[i];
                datas.push({
                  values: currentPartitionInput,
                  frequency: variableDetails.inputValues.frequencies[i],
                });
              }
            }
          }

          title = this.translate.get('GLOBAL.CURRENT_GROUP');
        }

        if (variableDetails.isLimitedDatas) {
          title +=
            ' ( * ' +
            this.translate.get('GLOBAL.LIMIT_GRAPH_DATAS_WARNING') +
            ')';
        }
      }
      this.preparationDatas[preparationSource].currentIntervalDatas.title =
        title;
    }

    return this.preparationDatas[preparationSource].currentIntervalDatas;
  }

  /**
   * Retrieves variable data for the specified preparation source.
   * @param {string} preparationSource - The source of the preparation data.
   * @returns {VariableModel[]} The variable data.
   */
  getVariablesDatas(preparationSource: string): VariableModel[] {
    const currentDatas:
      | PreparationVariableStatistic[]
      | TextPreparationVariableStatistic[]
      | TreePreparationVariableStatistic[]
      | undefined =
      // @ts-ignore
      this.appService.appDatas?.[preparationSource].variablesStatistics;
    const currentDetailedDatas =
      // @ts-ignore
      this.appService.appDatas?.[preparationSource].variablesDetailedStatistics;
    const variableDatas: VariableModel[] = [];

    if (currentDatas) {
      for (let i = 0; i < currentDatas.length; i++) {
        const varItem: VariableModel = new VariableModel(
          currentDatas[i]!,
          currentDetailedDatas?.[currentDatas[i]!.rank]!,
        );
        variableDatas.push(varItem);
      }
    }
    return variableDatas;
  }

  /**
   * Retrieves the target variable statistics data for a given preparation source.
   * If no preparation source is provided, it defaults to the available preparation report.
   * @param {string} [preparationSource] - The source of the preparation data.
   * @returns {ChartDatasModel} The target variable statistics data.
   */
  getTargetVariableStatsDatas(
    preparationSource?: REPORT,
  ): ChartDatasModel | undefined {
    let variableStatsDatas: ChartDatasModel | undefined = new ChartDatasModel();
    if (!preparationSource) {
      preparationSource = this.getAvailablePreparationReport();
    }
    // @ts-ignore
    const summary: any = this.appService.appDatas?.[preparationSource].summary;
    if (summary) {
      variableStatsDatas.emptyLabels();
      const currentDatas = summary.targetValues;

      if (currentDatas) {
        for (let i = 0; i < currentDatas.values.length; i++) {
          const currentDataSet = new ChartDatasetModel();

          const graphItem: BarModel = new BarModel();
          graphItem.name = currentDatas.values[i];
          graphItem.value =
            (currentDatas.frequencies[i] * 100) /
            UtilsService.arraySum(currentDatas.frequencies) /
            100;
          graphItem.extra.value = currentDatas.frequencies[i];
          graphItem.extra.percent =
            (currentDatas.frequencies[i] * 100) /
            UtilsService.arraySum(currentDatas.frequencies);

          currentDataSet.label = graphItem.name;
          currentDataSet.data.push(graphItem.value);
          currentDataSet.extra.push(graphItem);
          variableStatsDatas.datasets.push(currentDataSet);
        }
      }
      if (variableStatsDatas.datasets.length === 0) {
        variableStatsDatas = undefined;
      }
    }
    return variableStatsDatas;
  }

  /**
   * Retrieves the target variable statistics information for a given preparation source.
   * If no preparation source is provided, it defaults to the available preparation report.
   * @param {string} [preparationSource] - The source of the preparation data.
   * @returns {InfosDatasI[] | undefined} The target variable statistics information.
   */
  getTargetVariableStatsInformations(
    preparationSource?: REPORT,
  ): InfosDatasI[] | undefined {
    if (!preparationSource) {
      preparationSource = this.getAvailablePreparationReport();
    }

    let informationsDatas: InfosDatasI[] | undefined;

    // @ts-ignore
    const summary: any = this.appService.appDatas?.[preparationSource].summary;
    if (summary && summary.targetDescriptiveStats) {
      informationsDatas = [];
      // @ts-ignore
      for (const item in this.appService.appDatas?.[preparationSource].summary
        .targetDescriptiveStats) {
        if (item) {
          informationsDatas.push({
            title: item,
            value: summary.targetDescriptiveStats[item],
          });
        }
      }
    }
    return informationsDatas;
  }

  /**
   * Retrieves the target variable for a given preparation source.
   * @param {string} preparationSource - The source of the preparation data.
   * @returns {string} The target variable.
   */
  getTargetVariable(preparationSource: string): string | undefined {
    // @ts-ignore
    return this.appService.appDatas?.[preparationSource].summary.targetVariable;
  }

  /**
   * Determines if the analysis is explanatory.
   * Checks the detailed variable statistics and the presence of bivariate preparation report.
   * @returns {boolean} True if the analysis is explanatory, false otherwise.
   */
  isExplanatoryAnalysis(): boolean {
    const preparationSource = this.getAvailablePreparationReport();
    if (
      this.appService.appDatas?.[preparationSource]
        ?.variablesDetailedStatistics &&
      !this.appService.appDatas.bivariatePreparationReport
    ) {
      const detailedVar =
        this.appService.appDatas[preparationSource].variablesDetailedStatistics[
          this.preparationDatas[preparationSource]!.selectedVariable!.rank
        ];
      if (detailedVar?.dataGrid) {
        const detailedVarTypes = detailedVar.dataGrid.dimensions.map(
          (e) => e.partitionType,
        );
        if (
          detailedVar.dataGrid.dimensions.length > 1 &&
          detailedVarTypes.includes('Value groups') &&
          !detailedVarTypes.includes('Values')
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Checks if the variable data includes target parts.
   * @param {VariableModel[]} variableDatas - The variable data to check.
   * @returns {boolean} True if target parts are included, false otherwise.
   */
  includesTargetParts(variableDatas: VariableModel[]): boolean {
    const targetParts = variableDatas.map((e) => e.targetParts);
    return targetParts.every((e) => e === undefined) ? false : true;
  }

  /**
   * Determines if the analysis is supervised.
   * Checks the detailed variable statistics or the summary learning task to determine supervision.
   * @returns {boolean} True if the analysis is supervised, false otherwise.
   */
  isSupervised(): boolean {
    const preparationSource = this.getAvailablePreparationReport();
    if (
      this.appService.appDatas?.[preparationSource]?.variablesDetailedStatistics
    ) {
      const detailedVar =
        this.appService.appDatas[preparationSource].variablesDetailedStatistics[
          this.preparationDatas[preparationSource]!.selectedVariable!.rank
        ];
      if (detailedVar?.dataGrid) {
        return detailedVar.dataGrid.isSupervised;
      }
    } else if (
      this.appService.appDatas?.[preparationSource]?.summary?.learningTask
    ) {
      // "Unsupervised analysis": only non-supervised case (equivalent to isSupervised = False)
      // "Regression analysis": supervised case (equivalent to isSupervised = True)
      // "Classification analysis": (equivalent to isSupervised = True)
      return (
        this.appService.appDatas[preparationSource].summary.learningTask ===
          TASKS.REGRESSION ||
        this.appService.appDatas[preparationSource].summary.learningTask ===
          TASKS.CLASSIFICATION
      );
    }
    return false;
  }

  /**
   * Determines the available preparation report.
   * If the standard preparation report is not available or lacks variable statistics,
   * it defaults to the text preparation report.
   * @returns {string} The available preparation report.
   */
  getAvailablePreparationReport() {
    let preparationSource = REPORT.PREPARATION_REPORT;
    if (
      !this.appService.appDatas?.[preparationSource] ||
      (!this.appService.appDatas?.[preparationSource]?.variablesStatistics &&
        this.appService.appDatas?.[REPORT.TEXT_PREPARATION_REPORT])
    ) {
      preparationSource = REPORT.TEXT_PREPARATION_REPORT;
    }
    return preparationSource;
  }

  /**
   * Determines the preparation source for a given variable.
   * Checks if the variable exists in the standard preparation report or the text preparation report.
   * @param {TrainedPredictorModel} variable - The variable to check.
   * @returns {string} The preparation source for the variable.
   */
  getPreparationSourceFromVariable(variable: TrainedPredictorModel): REPORT {
    // Find the current variable into preparationReport or textPreparationReport
    if (this.appService.appDatas?.preparationReport?.variablesStatistics) {
      const isPreparationReport =
        this.appService.appDatas.preparationReport.variablesStatistics.find(
          (e) => e.name === variable.name,
        );
      if (isPreparationReport) {
        return REPORT.PREPARATION_REPORT;
      } else {
        return REPORT.TEXT_PREPARATION_REPORT;
      }
    } else {
      return this.getAvailablePreparationReport();
    }
  }
}
