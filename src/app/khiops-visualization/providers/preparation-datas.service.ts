import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { TranslateService } from '@ngx-translate/core';
import { BarVO } from '../model/bar-vo';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { PreparationVariableVO } from '../model/preparation-variable-vo';
import { VariableVO } from '../model/variable-vo';
import { VariableDetailsVO } from '../model/variableDetails-vo';
import { ChartDatasetVO } from '@khiops-library/model/chartDataset-vo';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { SummaryVO } from '../model/summary-vo';
import { InformationsVO } from '../model/informations-vo';
import { REPORTS } from '@khiops-library/enum/reports';
import { TASKS } from '@khiops-library/enum/tasks';
import { TYPES } from '@khiops-library/enum/types';
import { PreparationDatasVO } from '@khiops-visualization/model/preparation-datas-vo';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { GridColumnsI } from '../../khiops-library/interfaces/grid-columns';

@Injectable({
  providedIn: 'root',
})
export class PreparationDatasService {
  preparationDatas: PreparationDatasVO;

  constructor(
    private translate: TranslateService,
    private khiopsLibraryService: KhiopsLibraryService,
    private appService: AppService,
  ) {}

  initialize() {
    this.preparationDatas = new PreparationDatasVO();

    const appDatas = this.appService.getDatas().datas;

    // select the first item of the list by default
    if (appDatas?.preparationReport?.variablesStatistics?.[0]) {
      let defaultVariable = appDatas.preparationReport.variablesStatistics[0];

      // Check if there is a saved selected variable into json
      const savedSelectedRank = this.appService.getSavedDatas('selectedRank');
      if (savedSelectedRank) {
        defaultVariable = this.getVariableFromRank(
          savedSelectedRank,
          REPORTS.PREPARATION_REPORT,
        );
      }

      this.setSelectedVariable(defaultVariable, REPORTS.PREPARATION_REPORT);
    }
    // select the first item of the list by default
    if (appDatas?.textPreparationReport?.variablesStatistics?.[0]) {
      let defaultVariable =
        appDatas.textPreparationReport.variablesStatistics[0];

      // Check if there is a saved selected variable into json
      const savedSelectedRank = this.appService.getSavedDatas('selectedRank');
      if (savedSelectedRank) {
        defaultVariable = this.getVariableFromRank(
          savedSelectedRank,
          REPORTS.TEXT_PREPARATION_REPORT,
        );
      }

      this.setSelectedVariable(
        defaultVariable,
        REPORTS.TEXT_PREPARATION_REPORT,
      );
    }
  }

  getDatas(preparationSource: string): {
    selectedVariable: PreparationVariableVO;
    currentIntervalDatas: GridDatasI;
  } {
    return this.preparationDatas[preparationSource];
  }

  setSelectedVariable(
    object: any,
    preparationSource: string,
  ): PreparationVariableVO | undefined {
    if (object) {
      const variable = this.getVariableFromName(object.name, preparationSource);
      if (variable) {
        this.preparationDatas[preparationSource].selectedVariable =
          new PreparationVariableVO(variable, variable.name);
        return this.preparationDatas[preparationSource].selectedVariable;
      }
    }
    return undefined;
  }

  getSelectedVariable(preparationSource: string): PreparationVariableVO {
    return this.preparationDatas[preparationSource].selectedVariable;
  }

  getSelectedVariableRank(): string {
    return this.preparationDatas.preparationReport.selectedVariable.rank;
  }

  getVariableFromName(name: string, preparationSource: string): any {
    let variable: any;
    const appDatas = this.appService.getDatas().datas;
    if (appDatas?.[preparationSource]?.variablesStatistics) {
      variable = appDatas[preparationSource].variablesStatistics.find(
        (e) => e.name === name,
      );
    }

    return variable;
  }

  getVariableFromRank(rank: string, preparationSource: string): any {
    let variable: any;
    const appDatas = this.appService.getDatas().datas;
    variable = appDatas[preparationSource].variablesStatistics.find(
      (e) => e.rank === rank,
    );
    return variable;
  }

  getSummaryDatas(preparationSource?: string): InfosDatasI[] {
    const appDatas = this.appService.getDatas().datas;
    if (!preparationSource) {
      preparationSource = this.getAvailablePreparationReport();
    }
    const summaryVO = new SummaryVO(appDatas[preparationSource].summary);
    return summaryVO.displayDatas;
  }

  getInformationsDatas(preparationSource: string): InfosDatasI[] | undefined {
    const appDatas = this.appService.getDatas().datas;
    const informationsDatas = new InformationsVO(
      appDatas[preparationSource].summary,
    );
    return informationsDatas.displayDatas;
  }

  getCurrentIntervalDatas(preparationSource: string, index?): GridDatasI {
    index = index || 0;

    const datas: any[] = [];
    let title = '';
    const displayedColumns: GridColumnsI[] = [];

    // init the object
    this.preparationDatas[preparationSource].currentIntervalDatas = {
      title: title,
      values: datas,
      displayedColumns: displayedColumns,
    };

    const appDatas = this.appService.getDatas().datas;
    if (appDatas?.[preparationSource]?.variablesDetailedStatistics) {
      const currentVar =
        appDatas[preparationSource].variablesDetailedStatistics[
          this.preparationDatas[preparationSource].selectedVariable.rank
        ];
      const variableDetails: VariableDetailsVO = new VariableDetailsVO(
        currentVar,
        this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE,
      );

      if (variableDetails?.dataGrid) {
        const currentVariableType = variableDetails.dataGrid.dimensions[0].type;

        if (currentVariableType === TYPES.NUMERICAL) {
          displayedColumns.push({
            headerName:
              this.translate.instant('GLOBAL.INTERVAL_OF') +
              variableDetails.dataGrid.dimensions[0].variable,
            field: 'interval',
          });

          // init datas array
          datas[0] = {};
          if (
            variableDetails.dataGrid.dimensions[0].partition[index].length > 0
          ) {
            let currentPartition = JSON.stringify(
              variableDetails.dataGrid.dimensions[0].partition[index],
            );
            if (index !== 0) {
              // replace [ by ] for all indexes excepting 0
              currentPartition = currentPartition.replace('[', ']');
            }
            datas[0]['interval'] = currentPartition;
          } else {
            datas[0]['interval'] = this.translate.instant('GLOBAL.MISSING');
          }

          title = this.translate.instant('GLOBAL.CURRENT_INTERVAL');
        } else if (currentVariableType === TYPES.CATEGORICAL) {
          let dimensionLength = 0;
          let startIter = 0;

          const currentVal: string | number =
            variableDetails.dataGrid.dimensions[0].partition[index][0];

          displayedColumns.push({
            headerName:
              this.translate.instant('GLOBAL.VALUES_OF') +
              variableDetails.dataGrid.dimensions[0].variable,
            field: 'values',
          });
          displayedColumns.push({
            headerName: this.translate.instant('GLOBAL.FREQUENCY'),
            field: 'frequency',
          });

          const partValuesLength = UtilsService.flatten(
            variableDetails.dataGrid.dimensions[0].partition,
          ).length;
          const partLength =
            variableDetails.dataGrid.dimensions[0].partition.length;
          const isMultiDimPartition = partValuesLength !== partLength;
          const defaultGroupIndex =
            variableDetails.dataGrid.dimensions[0].defaultGroupIndex;

          // If multi dimension array, trash cat is managed at the end of treatment
          if (!isMultiDimPartition) {
            startIter = variableDetails.inputValues.values.indexOf(
              currentVal.toString(),
            );
            if (index === defaultGroupIndex) {
              dimensionLength = variableDetails.inputValues.values.length;
            } else {
              dimensionLength =
                startIter +
                variableDetails.dataGrid.dimensions[0].partition[index].length;
            }
          } else {
            startIter = 0;
            dimensionLength =
              variableDetails.dataGrid.dimensions[0].partition[index].length;
          }

          for (let i = startIter; i < dimensionLength; i++) {
            let currentPartitionInput;
            if (isMultiDimPartition) {
              currentPartitionInput =
                variableDetails.dataGrid.dimensions[0].partition[index][i];
            } else {
              currentPartitionInput = variableDetails.inputValues.values[i];
            }

            datas[i - startIter] = {};
            datas[i - startIter]['values'] = currentPartitionInput;
            const currentValueIndex: any =
              variableDetails.inputValues.values.indexOf(currentPartitionInput);
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

          title = this.translate.instant('GLOBAL.CURRENT_GROUP');
        }

        if (variableDetails.isLimitedDatas) {
          title +=
            ' ( * ' +
            this.translate.instant('GLOBAL.LIMIT_GRAPH_DATAS_WARNING') +
            ')';
        }
      }
      this.preparationDatas[preparationSource].currentIntervalDatas.title =
        title;
    }

    return this.preparationDatas[preparationSource].currentIntervalDatas;
  }

  getVariablesDatas(preparationSource: string): VariableVO[] {
    const appDatas = this.appService.getDatas().datas;
    const currentDatas = appDatas[preparationSource].variablesStatistics;
    const currentDetailedDatas =
      appDatas[preparationSource].variablesDetailedStatistics;
    const variableDatas: VariableVO[] = [];

    if (currentDatas) {
      for (let i = 0; i < currentDatas.length; i++) {
        const varItem: VariableVO = new VariableVO(
          currentDatas[i],
          currentDetailedDatas?.[currentDatas?.[i]?.rank],
        );
        variableDatas.push(varItem);
      }
    }
    return variableDatas;
  }

  getTargetVariableStatsDatas(preparationSource?: string): ChartDatasVO {
    let variableStatsDatas = new ChartDatasVO();
    if (!preparationSource) {
      preparationSource = this.getAvailablePreparationReport();
    }

    const appDatas = this.appService.getDatas().datas;
    if (appDatas?.[preparationSource]?.summary) {
      variableStatsDatas.emptyLabels();
      const currentDatas = appDatas[preparationSource].summary.targetValues;

      if (currentDatas) {
        for (let i = 0; i < currentDatas.values.length; i++) {
          const currentDataSet = new ChartDatasetVO();

          const graphItem: BarVO = new BarVO();
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

  getTargetVariableStatsInformations(
    preparationSource?: string,
  ): InfosDatasI[] | undefined {
    const appDatas = this.appService.getDatas().datas;
    if (!preparationSource) {
      preparationSource = this.getAvailablePreparationReport();
    }

    let informationsDatas: InfosDatasI[] | undefined;
    if (appDatas[preparationSource].summary.targetDescriptiveStats) {
      informationsDatas = [];
      for (const item in appDatas[preparationSource].summary
        .targetDescriptiveStats) {
        if (item) {
          informationsDatas.push({
            title: item,
            value:
              appDatas[preparationSource].summary.targetDescriptiveStats[item],
          });
        }
      }
    }
    return informationsDatas;
  }

  getTargetVariable(preparationSource: string): string {
    const appDatas = this.appService.getDatas().datas;
    return appDatas[preparationSource].summary.targetVariable;
  }

  isExplanatoryAnalysis(): boolean {
    const preparationSource = this.getAvailablePreparationReport();
    const appDatas = this.appService.getDatas().datas;
    if (
      appDatas?.[preparationSource]?.variablesDetailedStatistics &&
      !appDatas.bivariatePreparationReport
    ) {
      const detailedVar =
        appDatas[preparationSource].variablesDetailedStatistics[
          this.preparationDatas[preparationSource].selectedVariable.rank
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

  includesTargetParts(variableDatas): boolean {
    const targetParts = variableDatas.map((e) => e.targetParts);
    return targetParts.every((e) => e === undefined) ? false : true;
  }

  isSupervised(): boolean {
    const preparationSource = this.getAvailablePreparationReport();
    const appDatas = this.appService.getDatas().datas;
    if (appDatas?.[preparationSource]?.variablesDetailedStatistics) {
      const detailedVar =
        appDatas[preparationSource].variablesDetailedStatistics[
          this.preparationDatas[preparationSource].selectedVariable.rank
        ];
      if (detailedVar?.dataGrid) {
        return detailedVar.dataGrid.isSupervised;
      }
    } else if (appDatas?.[preparationSource]?.summary?.learningTask) {
      // 	"Unsupervised analysis" : seul cas non supervisé (équivalent de isSupervised = False)
      //   "Regression analysis" : cas supervisé (équivalent de isSupervised = True)
      //   "Classification analysis" : (équivalent de isSupervised = True)
      return (
        appDatas[preparationSource].summary.learningTask === TASKS.REGRESSION ||
        appDatas[preparationSource].summary.learningTask ===
          TASKS.CLASSIFICATION
      );
    }
    return false;
  }

  getAvailablePreparationReport(): string {
    const appDatas = this.appService.getDatas().datas;
    let preparationSource = REPORTS.PREPARATION_REPORT;
    if (
      !appDatas[preparationSource] ||
      (!appDatas[preparationSource].variablesStatistics &&
        appDatas[REPORTS.TEXT_PREPARATION_REPORT])
    ) {
      preparationSource = REPORTS.TEXT_PREPARATION_REPORT;
    }
    return preparationSource;
  }

  getPreparationSourceFromVariable(variable): string {
    const appDatas = this.appService.getDatas().datas;
    // Find the current variable into preparationReport or textPreparationReport
    if (appDatas?.preparationReport?.variablesStatistics) {
      const isPreparationReport =
        appDatas.preparationReport.variablesStatistics.find(
          (e) => e.name === variable.name,
        );
      if (isPreparationReport) {
        return REPORTS.PREPARATION_REPORT;
      } else {
        return REPORTS.TEXT_PREPARATION_REPORT;
      }
    } else {
      return this.getAvailablePreparationReport();
    }
  }
}
