import { ModelingPredictorVO } from './modeling-predictor-vo';
import { PreparationVariableVO } from './preparation-variable-vo';
import { Preparation2dVariableVO } from './preparation2d-variable-vo';
import { TrainedPredictorVO } from './trained-predictor-vo copy';
import { TreePreparationVariableVO } from './tree-preparation-variable-vo';

export class ModelingDatasVO {
  selectedVariable:
    | Preparation2dVariableVO
    | PreparationVariableVO
    | TreePreparationVariableVO
    | undefined = undefined;
  selectedPredictor: ModelingPredictorVO | undefined = undefined;
  trainedPredictorsListDatas: TrainedPredictorVO[] | undefined = undefined;
}
