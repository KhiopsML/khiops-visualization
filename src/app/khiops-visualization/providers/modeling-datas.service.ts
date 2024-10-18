import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { PreparationDatasService } from './preparation-datas.service';
import { ModelingPredictorModel } from '../model/modeling-predictor.model';
import { SummaryModel } from '../model/summary.model';
import { Preparation2dDatasService } from './preparation2d-datas.service';
import { TreePreparationDatasService } from './tree-preparation-datas.service';
import { ModelingDatasModel } from '../model/modeling-datas.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { TrainedPredictorModel } from '@khiops-visualization/model/trained-predictor.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { Preparation2dVariableModel } from '@khiops-visualization/model/preparation2d-variable.model';
import { TreePreparationVariableModel } from '@khiops-visualization/model/tree-preparation-variable.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
@Injectable({
  providedIn: 'root',
})
export class ModelingDatasService {
  modelingDatas: ModelingDatasModel;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {}

  initialize() {
    this.modelingDatas = new ModelingDatasModel();

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

  getDatas(): ModelingDatasModel {
    return this.modelingDatas;
  }

  setSelectedVariable(
    object:
      | Preparation2dVariableModel
      | PreparationVariableModel
      | TreePreparationVariableModel,
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
    | Preparation2dVariableModel
    | PreparationVariableModel
    | TreePreparationVariableModel
    | undefined {
    return this.modelingDatas.selectedVariable;
  }

  initSelectedVariable() {
    const appDatas = this.appService.getDatas().datas;
    if (appDatas?.modelingReport?.trainedPredictorsDetails) {
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

    if (appDatas?.modelingReport?.trainedPredictorsDetails) {
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
        // Add columns of available objects (defined into ModelingPredictorModel)
        if (key !== '_id' && typicalData[key] !== undefined) {
          displayedColumns.push({
            headerName: UtilsService.capitalizeFirstLetter(key),
            field: key,
            tooltip: this.translate.get(
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
    if (appDatas?.[preparationSource]?.summary) {
      summaryDatas = new SummaryModel(appDatas[preparationSource].summary);
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
          this.translate.get('GLOBAL.VARIABLES'),
      });
    }
    return trainedPredictorsSummaryDatas;
  }

  setSelectedPredictor(predictor: any) {
    this.modelingDatas.selectedPredictor = new ModelingPredictorModel(predictor);
  }

  getSelectedPredictor(): ModelingPredictorModel | undefined {
    return this.modelingDatas?.selectedPredictor;
  }

  getTrainedPredictorListDatas(): TrainedPredictorModel[] | undefined {
    const appDatas = this.appService.getDatas().datas;
    const selectedPredictor = this.getSelectedPredictor();
    if (
      appDatas?.modelingReport?.trainedPredictorsDetails?.[
        selectedPredictor?.rank
      ]
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
          currentVarDetails = this.preparationDatasService.getVariableFromName(
            currentVar.name,
            'treePreparationReport',
          );
        }
        if (!currentVarDetails) {
          currentVarDetails =
            this.preparation2dDatasService.getVariableFromNames(
              currentVar.name.split('`')[0],
              currentVar.name.split('`')[1],
            );
        }
        const varItem: TrainedPredictorModel = new TrainedPredictorModel(
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
