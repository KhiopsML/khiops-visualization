import { TYPES } from "@khiops-library/enum/types";
import { ChartDatasI } from "@khiops-library/interfaces/chart-datas";
import { GridDatasI } from "@khiops-library/interfaces/grid-datas";
import { ChartToggleValuesI } from "@khiops-visualization/interfaces/chart-toggle-values";
import { EvaluationPredictorVO } from "./evaluation-predictor-vo";
import { EvaluationTypeVO } from "./evaluation-type-vo";

export class EvaluationDatasVO {
	selectedEvaluationTypeVariable: EvaluationTypeVO = undefined;
	selectedPredictorEvaluationVariable: EvaluationPredictorVO = undefined;
	evaluationTypes = undefined;
	evaluationTypesSummary: GridDatasI = undefined;
	liftGraphDatas: ChartDatasI = undefined;
	liftGraphDisplayedValues: ChartToggleValuesI[] = undefined;
	confusionMatrix: GridDatasI = undefined;
	predictorEvaluations: GridDatasI = undefined;
	confusionMatrixType: string = TYPES.FREQUENCY;

	constructor() {}
}
