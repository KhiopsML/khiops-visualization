import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { EvaluationPredictorModel } from './evaluation-predictor.model';
import { EvaluationTypeModel } from './evaluation-type.model';

export class EvaluationDatasModel {
  selectedEvaluationTypeVariable: EvaluationTypeModel | undefined = undefined;
  selectedPredictorEvaluationVariable: EvaluationPredictorModel | undefined =
    undefined;
  evaluationTypes: any[] | undefined = undefined; // complex values
  evaluationTypesSummary: GridDatasI | undefined = undefined;
  liftGraphDatas: ChartDatasModel | undefined = undefined;
  liftGraphDisplayedValues: ChartToggleValuesI[] | undefined = undefined;
  confusionMatrix: GridDatasI | undefined = undefined;
  predictorEvaluations: GridDatasI | undefined = undefined;
  confusionMatrixType: string = TYPES.FREQUENCY;
}
