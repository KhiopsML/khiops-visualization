import {
	CellVO
} from '@khiops-library/model/cell-vo';
import {
	Preparation2dVariableVO
} from './preparation2d-variable-vo';

export class Preparation2dDatasVO {

	isAxisInverted = false;
	selectedVariable: Preparation2dVariableVO = undefined;
	selectedCellIndex = 0;
	selectedCell: CellVO = undefined;
	matrixDatas: {
		variable: {
			nameX: string,
			nameY: string,
			xParts: number,
			yParts: number
		},
		matrixCellDatas: any[]
	};
	isTargetAvailable = false;
	currentCellDatas: {
		values: any[][],
		displayedColumns: any[][],
	};

	appDatas: any = undefined;
	isSupervised = false;

	constructor(appDatas) {
		this.appDatas = appDatas;
		this.isSupervised = this.isSupervisedVariable();
	}

	/**
	 * Check if current datas are valid
	 */
	isValid(): boolean {
		return this.appDatas &&
			this.appDatas.bivariatePreparationReport &&
			this.appDatas.bivariatePreparationReport.variablesPairsStatistics[0];
	}

	isSupervisedVariable(): any {
		return this.appDatas && this.appDatas.bivariatePreparationReport &&
			this.appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics &&
			this.appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics[Object.keys(this.appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics)[0]] &&
			this.appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics[Object.keys(this.appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics)[0]].dataGrid &&
			this.appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics[Object.keys(this.appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics)[0]].dataGrid.isSupervised;
	}

}
