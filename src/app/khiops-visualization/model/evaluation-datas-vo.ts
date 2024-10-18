import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chartDatas.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { EvaluationPredictorVO } from './evaluation-predictor-vo';
import { EvaluationTypeVO } from './evaluation-type-vo';

export class EvaluationDatasVO {
  selectedEvaluationTypeVariable: EvaluationTypeVO | undefined = undefined;
  selectedPredictorEvaluationVariable: EvaluationPredictorVO | undefined =
    undefined;
  evaluationTypes: any[] | undefined = undefined; // complex values
  evaluationTypesSummary: GridDatasI | undefined = undefined;
  liftGraphDatas: ChartDatasModel | undefined = undefined;
  liftGraphDisplayedValues: ChartToggleValuesI[] | undefined = undefined;
  confusionMatrix: GridDatasI | undefined = undefined;
  predictorEvaluations: GridDatasI | undefined = undefined;
  confusionMatrixType: string = TYPES.FREQUENCY;
}
