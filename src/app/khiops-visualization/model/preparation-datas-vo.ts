import { GridDatasI } from "@khiops-library/interfaces/grid-datas";
import { PreparationVariableVO } from "./preparation-variable-vo";

export class PreparationDatasVO {
	preparationReport: {
		selectedVariable: PreparationVariableVO;
		currentIntervalDatas: GridDatasI;
	} = {
		selectedVariable: undefined,
		currentIntervalDatas: {
			title: undefined,
			values: undefined,
			displayedColumns: undefined,
		},
	};
	textPreparationReport: {
		selectedVariable: PreparationVariableVO;
		currentIntervalDatas: GridDatasI;
	} = {
		selectedVariable: undefined,
		currentIntervalDatas: {
			title: undefined,
			values: undefined,
			displayedColumns: undefined,
		},
	};

	constructor() {}
}
