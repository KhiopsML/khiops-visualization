/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { PreparationDatasService } from './preparation-datas.service';
import { ModelingPredictorModel } from '../model/modeling-predictor.model';
import { SummaryModel } from '../model/summary.model';
import { ModelingDatasModel } from '../model/modeling-datas.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { TrainedPredictorModel } from '@khiops-visualization/model/trained-predictor.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { Preparation2dVariableModel } from '@khiops-visualization/model/preparation2d-variable.model';
import { TreePreparationVariableModel } from '@khiops-visualization/model/tree-preparation-variable.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
import {
  ModelingVariableStatistic,
  TrainedPredictor,
} from '@khiops-visualization/interfaces/modeling-report';
@Injectable({
  providedIn: 'root',
})
export class ModelingDatasService {
  private modelingDatas: ModelingDatasModel | undefined;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private preparationDatasService: PreparationDatasService,
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
    const preparationSelectedVar: PreparationVariableModel | undefined =
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
  getDatas(): ModelingDatasModel | undefined {
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
    if (this.modelingDatas) {
      this.modelingDatas.selectedVariable = undefined;
    } else {
      throw new Error('ModelingDatas not initialized');
    }
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
    return this.modelingDatas?.selectedVariable;
  }

  /**
   * Initializes the selected variable in the modeling data.
   * If the application data contains trained predictor details, the first variable
   * from the details is set as the selected variable. Also updates the preparation
   * selected variable if the JSON data is incomplete.
   */
  initSelectedVariable() {
    if (this.appService.appDatas?.modelingReport?.trainedPredictorsDetails) {
      const variables =
        this.appService.appDatas.modelingReport.trainedPredictorsDetails;
      const key = Object.keys(variables)[0];
      if (key) {
        const variable: ModelingVariableStatistic | undefined =
          variables[key]?.selectedVariables[0];
        if (variable?.name) {
          this.setSelectedVariable(this.getVariableFromName(variable.name));

          // Also set the preparation selected variable if json is incomplete
          const preparationSource =
            this.preparationDatasService.getAvailablePreparationReport();
          this.preparationDatasService.setSelectedVariable(
            variable.name,
            preparationSource,
          );
        }
      }
    }
  }

  /**
   * Retrieves a variable by its name from the application data.
   * @param name - The name of the variable to retrieve.
   * @returns The variable object if found, otherwise undefined.
   */
  getVariableFromName(
    name: string,
  ):
    | Preparation2dVariableModel
    | PreparationVariableModel
    | TreePreparationVariableModel {
    let variable: any;

    if (this.appService.appDatas?.modelingReport?.trainedPredictorsDetails) {
      Object.keys(
        this.appService.appDatas?.modelingReport?.trainedPredictorsDetails,
      ).forEach((key) => {
        variable =
          this.appService.appDatas?.modelingReport?.trainedPredictorsDetails[
            key
          ]?.selectedVariables.find(
            (e: ModelingVariableStatistic) => e.name === name,
          );
        if (variable) {
          return variable;
        }
      });
    }

    return variable;
  }

  /**
   * Retrieves the columns to be displayed for trained predictors.
   * @returns An array of `GridColumnsI` objects representing the columns.
   */
  getTrainedPredictorDisplayedColumns(): GridColumnsI[] {
    const displayedColumns: GridColumnsI[] = [];
    if (this.modelingDatas?.trainedPredictorsListDatas) {
      const typicalData: any = this.modelingDatas.trainedPredictorsListDatas[0];
      Object.keys(typicalData).forEach((key) => {
        // Add columns of available objects (defined into ModelingPredictorModel)
        if (!['_id'].includes(key) && typicalData[key] !== undefined) {
          displayedColumns.push({
            headerName: UtilsService.capitalizeFirstLetter(key),
            field: key,
            hidden: ['isPair', 'name1', 'name2'].includes(key),
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
    const preparationSource =
      this.preparationDatasService.getAvailablePreparationReport();
    if (this.appService.appDatas?.[preparationSource]?.summary) {
      summaryDatas = new SummaryModel(
        this.appService.appDatas[preparationSource].summary,
      );
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
    const trainedPredictorsSummaryDatas: InfosDatasI[] = [];
    if (this.appService.appDatas) {
      for (
        let i = 0;
        i < this.appService.appDatas.modelingReport.trainedPredictors.length;
        i++
      ) {
        trainedPredictorsSummaryDatas.push({
          title:
            this.appService.appDatas.modelingReport.trainedPredictors[i]
              ?.name ?? '',
          value:
            this.appService.appDatas.modelingReport.trainedPredictors[i]
              ?.variables +
            ' ' +
            this.translate.get('GLOBAL.VARIABLES'),
        });
      }
    } else {
      throw new Error('appDatas not initialized');
    }

    return trainedPredictorsSummaryDatas;
  }

  /**
   * Sets the selected predictor in the modeling data.
   * @param predictor - The predictor to be set as selected.
   */
  setSelectedPredictor(predictor: TrainedPredictor) {
    if (this.modelingDatas) {
      this.modelingDatas.selectedPredictor = new ModelingPredictorModel(
        predictor,
      );
    } else {
      throw new Error('ModelingDatas not initialized');
    }
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
    const selectedPredictor = this.getSelectedPredictor();
    if (this.modelingDatas) {
      if (
        selectedPredictor &&
        selectedPredictor.rank !== undefined &&
        this.appService.appDatas?.modelingReport?.trainedPredictorsDetails?.[
          selectedPredictor.rank
        ]
      ) {
        const currentDatas: ModelingVariableStatistic[] | undefined =
          this.appService.appDatas.modelingReport.trainedPredictorsDetails[
            selectedPredictor.rank
          ]?.selectedVariables;
        if (currentDatas) {
          // Get a typical data object
          const availableKeys: string[] =
            currentDatas && currentDatas[0] ? Object.keys(currentDatas[0]) : [];

          this.modelingDatas.trainedPredictorsListDatas = [];

          for (let i = 0; i < currentDatas.length; i++) {
            // Find the corresponding rank of the current variable into preparation, 2d or tree
            const currentVar: ModelingVariableStatistic | undefined =
              currentDatas[i];

            if (currentVar) {
              const varItem: TrainedPredictorModel = new TrainedPredictorModel(
                currentVar,
                availableKeys,
              );
              this.modelingDatas.trainedPredictorsListDatas.push(varItem);
            }
          }
        }
      } else {
        this.modelingDatas.trainedPredictorsListDatas = undefined;
      }
    } else {
      throw new Error('ModelingDatas not initialized');
    }

    return this.modelingDatas.trainedPredictorsListDatas;
  }
}
