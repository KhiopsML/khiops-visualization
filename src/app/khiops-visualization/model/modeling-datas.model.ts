/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ModelingPredictorModel } from './modeling-predictor.model';
import { PreparationVariableModel } from './preparation-variable.model';
import { Preparation2dVariableModel } from './preparation2d-variable.model';
import { TrainedPredictorModel } from './trained-predictor.model';
import { TreePreparationVariableModel } from './tree-preparation-variable.model';

export class ModelingDatasModel {
  selectedVariable:
    | Preparation2dVariableModel
    | PreparationVariableModel
    | TreePreparationVariableModel
    | undefined = undefined;
  selectedPredictor: ModelingPredictorModel | undefined = undefined;
  trainedPredictorsListDatas: TrainedPredictorModel[] | undefined = undefined;
}
