import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { PreparationDatasService } from './preparation-datas.service';
import { ModelingPredictorModel } from '../model/modeling-predictor.model';
import { SummaryModel } from '../model/summary.model';
import { Preparation2dDatasService } from './preparation2d-datas.service';
import { ModelingDatasModel } from '../model/modeling-datas.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { TrainedPredictorModel } from '@khiops-visualization/model/trained-predictor.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { Preparation2dVariableModel } from '@khiops-visualization/model/preparation2d-variable.model';
import { TreePreparationVariableModel } from '@khiops-visualization/model/tree-preparation-variable.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { REPORTS } from '@khiops-library/enum/reports';
@Injectable({
  providedIn: 'root',
})
export class ModelingDatasService {
  private modelingDatas: ModelingDatasModel;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private preparationDatasService: PreparationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {}

  /**
   * Initializes the modeling data and sets the selected variable.
   * If a variable is already selected in the preparation data, it is set as the selected variable.
   * Otherwise, the first variable from the trained predictors details is set as the selected variable.
   */
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

  /**
   * Retrieves the modeling data.
   * @returns The current modeling data model.
   */
  getDatas(): ModelingDatasModel {
    return this.modelingDatas;
  }

  /**
   * Sets the selected variable in the modeling data.
   * If the provided variable object is valid, it is set as the selected variable.
   * Otherwise, the first variable from the trained predictors details is set as the selected variable.
   * @param object - The variable object to be set as selected.
   */
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

  /**
   * Removes the currently selected variable from the modeling data.
   */
  removeSelectedVariable() {
    this.modelingDatas.selectedVariable = undefined;
  }

  /**
   * Retrieves the currently selected variable from the modeling data.
   * @returns The selected variable model or undefined if not set.
   */
  getSelectedVariable():
    | Preparation2dVariableModel
    | PreparationVariableModel
    | TreePreparationVariableModel
    | undefined {
    return this.modelingDatas.selectedVariable;
  }

  /**
   * Initializes the selected variable in the modeling data.
   * If the application data contains trained predictor details, the first variable
   * from the details is set as the selected variable. Also updates the preparation
   * selected variable if the JSON data is incomplete.
   */
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

  /**
   * Retrieves a variable by its name from the application data.
   * @param name - The name of the variable to retrieve.
   * @returns The variable object if found, otherwise undefined.
   */
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

  /**
   * Retrieves the columns to be displayed for trained predictors.
   * @returns An array of `GridColumnsI` objects representing the columns.
   */
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

  /**
   * Retrieves summary data for the current preparation source.
   * @returns An array of `InfosDatasI` objects representing the summary data,
   * or undefined if the summary data is not available.
   */
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

  /**
   * Retrieves a summary of trained predictors.
   *
   * This method fetches data from the application service and constructs an array of
   * `InfosDatasI` objects, each representing a trained predictor. The summary includes
   * the name of the predictor and the number of variables it uses, translated into the
   * appropriate language.
   *
   * @returns {InfosDatasI[]} An array of summary data for each trained predictor.
   */
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

  /**
   * Sets the selected predictor in the modeling data.
   * @param predictor - The predictor to be set as selected.
   */
  setSelectedPredictor(predictor: any) {
    this.modelingDatas.selectedPredictor = new ModelingPredictorModel(
      predictor,
    );
  }

  /**
   * Gets the currently selected predictor from the modeling data.
   * @returns The selected predictor model or undefined if not set.
   */
  getSelectedPredictor(): ModelingPredictorModel | undefined {
    return this.modelingDatas?.selectedPredictor;
  }

  /**
   * Retrieves a list of trained predictor data objects.
   *
   * This method fetches the trained predictor details from the application data
   * and processes each predictor to gather its corresponding variable details.
   * The processed data is then stored in `modelingDatas.trainedPredictorsListDatas`.
   *
   * @returns {TrainedPredictorModel[] | undefined} An array of `TrainedPredictorModel` objects
   * if the trained predictor details are available, otherwise `undefined`.
   */
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
            REPORTS.TREE_PREPARATION_REPORT,
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
