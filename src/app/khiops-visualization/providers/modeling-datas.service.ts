import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash'; // Important to import lodash in karma
import { PreparationDatasService } from './preparation-datas.service';
import { ModelingPredictorVO } from '../model/modeling-predictor-vo';
import { SummaryVO } from '../model/summary-vo';
import { Preparation2dDatasService } from './preparation2d-datas.service';
import { TreePreparationDatasService } from './tree-preparation-datas.service';
import { ModelingDatasVO } from '../model/modeling-datas-vo';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { TrainedPredictorVO } from '@khiops-visualization/model/trained-predictor-vo copy';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { PreparationVariableVO } from '@khiops-visualization/model/preparation-variable-vo';
import { Preparation2dVariableVO } from '@khiops-visualization/model/preparation2d-variable-vo';
import { TreePreparationVariableVO } from '@khiops-visualization/model/tree-preparation-variable-vo';
import { UtilsService } from '@khiops-library/providers/utils.service';
@Injectable({
  providedIn: 'root',
})
export class ModelingDatasService {
  modelingDatas: ModelingDatasVO;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {}

  initialize() {
    this.modelingDatas = new ModelingDatasVO();

    // at init select the corresponding var
    // get the variable selected into PreparationDatasService
    const preparationSource =
      this.preparationDatasService.getAvailablePreparationReport();
    const preparationSelectedVar =
      this.preparationDatasService.getSelectedVariable(preparationSource);
    // select the first item of the list by default
    if (preparationSelectedVar) {
      this.setSelectedVariable(preparationSelectedVar);
    } else {
      // If json is incomplete, set the modeling variable to the first
      this.initSelectedVariable();
    }
  }

  getDatas(): ModelingDatasVO {
    return this.modelingDatas;
  }

  setSelectedVariable(
    object:
      | Preparation2dVariableVO
      | PreparationVariableVO
      | TreePreparationVariableVO,
  ) {
    if (this.modelingDatas && object) {
      this.modelingDatas.selectedVariable = object;
    } else {
      this.initSelectedVariable();
    }
  }

  removeSelectedVariable() {
    this.modelingDatas.selectedVariable = undefined;
  }

  getSelectedVariable():
    | Preparation2dVariableVO
    | PreparationVariableVO
    | TreePreparationVariableVO
    | undefined {
    return this.modelingDatas.selectedVariable;
  }

  initSelectedVariable() {
    const appDatas = this.appService.getDatas().datas;
    if (
      appDatas &&
      appDatas.modelingReport &&
      appDatas.modelingReport.trainedPredictorsDetails
    ) {
      const variables = appDatas.modelingReport.trainedPredictorsDetails;
      const key = Object.keys(variables)[0];
      if (key) {
        const variable = variables[key].selectedVariables[0];
        this.setSelectedVariable(this.getVariableFromName(variable.name));

        // Also set the preparation selected variable if json is incomplete
        const preparationSource =
          this.preparationDatasService.getAvailablePreparationReport();
        this.preparationDatasService.setSelectedVariable(
          variable,
          preparationSource,
        );
      }
    }
  }

  getVariableFromName(name: string): any {
    let variable: any;
    const appDatas = this.appService.getDatas().datas;

    if (
      appDatas &&
      appDatas.modelingReport &&
      appDatas.modelingReport.trainedPredictorsDetails
    ) {
      Object.keys(appDatas.modelingReport.trainedPredictorsDetails).forEach(
        function (key) {
          variable = appDatas.modelingReport.trainedPredictorsDetails[
            key
          ].selectedVariables.find((e: any) => e.name === name);
          if (variable) {
            return variable;
          }
        },
      );
    }
    return variable;
  }

  getTrainedPredictorDisplayedColumns(): GridColumnsI[] {
    const displayedColumns: GridColumnsI[] = [];
    if (this.modelingDatas.trainedPredictorsListDatas) {
      const typicalData: any = this.modelingDatas.trainedPredictorsListDatas[0];
      Object.keys(typicalData).forEach((key) => {
        // Add columns of available objects (defined into ModelingPredictorVO)
        if (key !== '_id' && typicalData[key] !== undefined) {
          displayedColumns.push({
            headerName: UtilsService.capitalizeFirstLetter(key),
            field: key,
            tooltip: this.translate.instant(
              'TOOLTIPS.MODELING.VARIABLES.' + key.toUpperCase(),
            ),
          });
        }
      });
    }

    return displayedColumns;
  }

  getSummaryDatas(): InfosDatasI[] | undefined {
    let summaryDatas;
    const appDatas = this.appService.getDatas().datas;
    const preparationSource =
      this.preparationDatasService.getAvailablePreparationReport();
    if (appDatas[preparationSource] && appDatas[preparationSource].summary) {
      summaryDatas = new SummaryVO(appDatas[preparationSource].summary);
      return summaryDatas.displayDatas;
    } else {
      return undefined;
    }
  }

  getTrainedPredictorsSummaryDatas(): InfosDatasI[] {
    const appDatas = this.appService.getDatas().datas;
    const trainedPredictorsSummaryDatas: InfosDatasI[] = [];

    for (let i = 0; i < appDatas.modelingReport.trainedPredictors.length; i++) {
      trainedPredictorsSummaryDatas.push({
        title: appDatas.modelingReport.trainedPredictors[i].name,
        value:
          appDatas.modelingReport.trainedPredictors[i].variables +
          ' ' +
          this.translate.instant('GLOBAL.VARIABLES'),
      });
    }
    return trainedPredictorsSummaryDatas;
  }

  setSelectedPredictor(predictor: any) {
    this.modelingDatas.selectedPredictor = new ModelingPredictorVO(predictor);
  }

  getSelectedPredictor(): ModelingPredictorVO | undefined {
    return this.modelingDatas!.selectedPredictor;
  }

  getTrainedPredictorListDatas(): TrainedPredictorVO[] | undefined {
    const appDatas = this.appService.getDatas().datas;
    const selectedPredictor = this.getSelectedPredictor();
    if (
      selectedPredictor &&
      selectedPredictor.rank &&
      appDatas.modelingReport.trainedPredictorsDetails &&
      appDatas.modelingReport.trainedPredictorsDetails[selectedPredictor.rank]
    ) {
      const currentDatas =
        appDatas.modelingReport.trainedPredictorsDetails[selectedPredictor.rank]
          .selectedVariables;

      // Get a typical data object
      const availableKeys = Object.keys(currentDatas[0]);

      this.modelingDatas.trainedPredictorsListDatas = [];
      for (let i = 0; i < currentDatas.length; i++) {
        // Find the corresponding rank of the current variable into preparation, 2d or tree
        const currentVar = currentDatas[i];

        const preparationSource =
          this.preparationDatasService.getPreparationSourceFromVariable(
            currentVar,
          );
        let currentVarDetails =
          this.preparationDatasService.getVariableFromName(
            currentVar.name,
            preparationSource,
          );
        if (!currentVarDetails) {
          currentVarDetails =
            this.treePreparationDatasService.getVariableFromName(
              currentVar.name,
            );
        }
        if (!currentVarDetails) {
          currentVarDetails =
            this.preparation2dDatasService.getVariableFromNames(
              currentVar.name.split('`')[0],
              currentVar.name.split('`')[1],
            );
        }
        const varItem: TrainedPredictorVO = new TrainedPredictorVO(
          currentVar,
          availableKeys,
        );
        this.modelingDatas.trainedPredictorsListDatas.push(varItem);
      }
    } else {
      this.modelingDatas.trainedPredictorsListDatas = undefined;
    }
    return this.modelingDatas.trainedPredictorsListDatas;
  }
}
