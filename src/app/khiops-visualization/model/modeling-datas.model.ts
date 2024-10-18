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
