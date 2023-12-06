import { TYPES } from "@khiops-library/enum/types";
import { ChartDatasVO } from "@khiops-library/model/chart-datas-vo";
import { GridDatasI } from "@khiops-library/interfaces/grid-datas";
import { ChartToggleValuesI } from "@khiops-visualization/interfaces/chart-toggle-values";
import { EvaluationPredictorVO } from "./evaluation-predictor-vo";
import { EvaluationTypeVO } from "./evaluation-type-vo";

export class EvaluationDatasVO {
	selectedEvaluationTypeVariable: EvaluationTypeVO = undefined;
	selectedPredictorEvaluationVariable: EvaluationPredictorVO = undefined;
	evaluationTypes = undefined;
	evaluationTypesSummary: GridDatasI = undefined;
	liftGraphDatas: ChartDatasVO = undefined;
	liftGraphDisplayedValues: ChartToggleValuesI[] = undefined;
	confusionMatrix: GridDatasI = undefined;
	predictorEvaluations: GridDatasI = undefined;
	confusionMatrixType: string = TYPES.FREQUENCY;

	constructor() {}
}
