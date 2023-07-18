import {
	Injectable
} from '@angular/core';
import * as _ from 'lodash'; // Important to import lodash in karma
import {
	AppService
} from './app.service';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	TranslateService
} from '@ngstack/translate';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	EvaluationDatasService
} from './evaluation-datas.service';
import {
	Preparation2dVariableVO
} from '../model/preparation2d-variable-vo';
import {
	CellVO
} from '@khiops-library/model/cell-vo';
import {
	MatrixUtilsDatasService
} from '@khiops-library/providers/matrix-utils-datas.service';
import {
	PreparationDatasService
} from './preparation-datas.service';
import {
	VariableDetailsVO
} from '../model/variableDetails-vo';
import {
	Variable2dVO
} from '../model/variable2d-vo';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	CoocurenceCellVO
} from '../model/coocurence-cell-vo';
import {
	MatrixCanvasService
} from '@khiops-library/components/matrix-canvas/matrix-canvas.service';
import {
	Preparation2dDatasVO
} from '../model/preparation2d-datas-vo';
import {
	CoocurenceCellsVO,
} from '../model/coocurence-cells-vo';
import {
	InformationsVO
} from '@khiops-visualization/model/informations-vo';

@Injectable({
	providedIn: 'root'
})
export class Preparation2dDatasService {

	preparation2dDatas: Preparation2dDatasVO;

	constructor(
		private translate: TranslateService,
		private preparationDatasService: PreparationDatasService,
		private appService: AppService,
		private khiopsLibraryService: KhiopsLibraryService,
		private evaluationDatasService: EvaluationDatasService) {

	}

	initialize(): any {

		const appDatas = this.appService.getDatas().datas;
		this.preparation2dDatas = new Preparation2dDatasVO(appDatas)

		// select the first item of the list by default
		if (this.preparation2dDatas.isValid()) {
			let defaultVariable = appDatas.bivariatePreparationReport.variablesPairsStatistics[0];

			// Check if there is a saved selected variable into json
			const savedSelected2dRank = this.appService.getSavedDatas('selected2dRank');
			if (savedSelected2dRank) {
				defaultVariable = this.getVariableFromRank(savedSelected2dRank);
			}

			this.setSelectedVariable(defaultVariable);
		}
	}

	getDatas(): Preparation2dDatasVO {
		return this.preparation2dDatas;
	}

	getInformationsDatas(): any {
		const appDatas = this.appService.getDatas().datas;
		const informationsDatas = new InformationsVO(appDatas.bivariatePreparationReport.summary);
		return informationsDatas.formatDatas();
	}

	toggleIsAxisInverted() {
		this.preparation2dDatas.isAxisInverted = !this.preparation2dDatas.isAxisInverted;
	}

	isAxisInverted() {
		return this.preparation2dDatas.isAxisInverted;
	}

	setSelectedCellIndex(index): void {
		this.preparation2dDatas.selectedCellIndex = index;
		if (this.preparation2dDatas.matrixDatas && this.preparation2dDatas.matrixDatas.matrixCellDatas) {
			const currentCell = this.preparation2dDatas.matrixDatas.matrixCellDatas.find(e => e.index === index);
			if (currentCell) {
				this.setSelectedCell(currentCell);
			}
		}
	}

	setSelectedCell(cell: CellVO): void {
		if (cell) {
			this.preparation2dDatas.selectedCellIndex = cell.index;
			this.preparation2dDatas.selectedCell = cell;
		}
	}

	getSelectedCellIndex(): number {
		return this.preparation2dDatas.selectedCellIndex;
	}

	getSelectedCell(): any {
		return this.preparation2dDatas.selectedCell;
	}

	computeDistributionIndexFromMatrixCellIndex(index) {
		// get distribution bar chart index from selected matrix cell index
		if (this.preparation2dDatas.matrixDatas) {
			let moduloOfCellIndex = 0;
			moduloOfCellIndex = (index / this.preparation2dDatas.selectedVariable.parts % 1) * this.preparation2dDatas.selectedVariable.parts;
			moduloOfCellIndex = Math.round(moduloOfCellIndex);
			return moduloOfCellIndex;
		}
	}

	setSelectedVariable(object: any): Preparation2dVariableVO {
		if (object) {
			const variable = this.getVariableFromNames(object.name1, object.name2);
			if (variable) {
				this.preparation2dDatas.selectedVariable = new Preparation2dVariableVO(variable);
				this.setSelectedCellIndex(0);
				return this.preparation2dDatas.selectedVariable;
			}
		}
	}

	setSelectedRegressionVariable(currentVar: any) {
		// Do not convert it into 2d var, it's a preparation var
		this.preparation2dDatas.selectedVariable = currentVar;
	}

	getSelectedVariable(): Preparation2dVariableVO {
		return this.preparation2dDatas.selectedVariable;
	}

	getSelectedVariableRank(): any {
		return this.preparation2dDatas.selectedVariable.rank;
	}

	isSupervised(): any {
		return this.preparation2dDatas.isSupervisedVariable();
	}

	getVariablesd2Datas(): any {

		const appDatas = this.appService.getDatas().datas;
		const variableDatas = [];
		if (appDatas.bivariatePreparationReport && appDatas.bivariatePreparationReport.variablesPairsStatistics) {
			const currentDatas = appDatas.bivariatePreparationReport.variablesPairsStatistics;
			if (currentDatas) {
				for (let i = 0; i < currentDatas.length; i++) {
					const varItem: Variable2dVO = new Variable2dVO(currentDatas[i]);
					variableDatas.push(varItem);
				}
			}
		}

		return variableDatas;
	}

	getVariableFromNames(name1: string, name2: string): any {
		let preparation2dVariable: any;
		const appDatas = this.appService.getDatas().datas;
		if (appDatas.bivariatePreparationReport && appDatas.bivariatePreparationReport.variablesPairsStatistics) {
			preparation2dVariable = appDatas.bivariatePreparationReport.variablesPairsStatistics.find(e => e.name1 === name1 && e.name2 === name2);
			if (preparation2dVariable) {
				preparation2dVariable = new Preparation2dVariableVO(preparation2dVariable);
			}
		}
		return preparation2dVariable;
	}

	getVariableFromRank(rank: string): any {
		let variable: any;
		const appDatas = this.appService.getDatas().datas;
		variable = appDatas.bivariatePreparationReport.variablesPairsStatistics.find(e => e.rank === rank);

		return variable;
	}

	/**
	 * Format matrix datas to be displayed into table
	 * @param fullFrequencies
	 */
	getMatrixCoocurenceCellsDatas(): any {
		let matrixCells: CoocurenceCellsVO;

		if (this.preparation2dDatas.matrixDatas && this.preparation2dDatas.matrixDatas.matrixCellDatas) {

			const selectedVariable = this.getSelectedVariable();
			matrixCells = new CoocurenceCellsVO(this.translate, selectedVariable.nameX, selectedVariable.nameY);

			const values: CoocurenceCellVO[] = [];

			for (let i = 0; i < this.preparation2dDatas.matrixDatas.matrixCellDatas.length; i++) {
				const cell: CellVO = this.preparation2dDatas.matrixDatas.matrixCellDatas[i];
				const coocurenceCell = new CoocurenceCellVO(cell.index);

				// coocurenceCell has dynamic fields
				coocurenceCell[matrixCells.displayedColumns[1].field] = UtilsService.ellipsis(cell.xDisplayaxisPart, 60);
				coocurenceCell[matrixCells.displayedColumns[2].field] = UtilsService.ellipsis(cell.yDisplayaxisPart, 60);
				coocurenceCell.frequency = cell.cellFreq;
				coocurenceCell.coverage = cell.coverage;
				values.push(coocurenceCell);
			}
			matrixCells.values = values;

		}

		return matrixCells;
	}

	/**
	 * Format cell datas details to be displayed into bottom table
	 */
	getCurrentCellDatas(): any {

		const selectedVariable = this.getSelectedVariable();

		const datasX = [],
			datasY = [],
			displayedColumnsX = [],
			displayedColumnsY = [];

		this.preparation2dDatas.currentCellDatas = {
			values: [datasX, datasY],
			displayedColumns: [displayedColumnsX, displayedColumnsY],
		};

		if (selectedVariable) {

			const variableDetails = this.getVariableDetails(selectedVariable.rank);
			const selectedCell = this.getSelectedCell();

			if (selectedCell && variableDetails && variableDetails.dataGrid) {

				const xName = selectedVariable.nameX;
				const yName = selectedVariable.nameY;
				const xType = variableDetails.dataGrid.dimensions[0].type;
				const yType = variableDetails.dataGrid.dimensions[1].type;

				// Define column titles
				if (xType === 'Numerical') {
					displayedColumnsX.push({
						headerName: this.translate.get('GLOBAL.INTERVAL_OF') + xName,
						field: 'interval'
					});
				} else {
					displayedColumnsX.push({
						headerName: this.translate.get('GLOBAL.VALUES_OF') + xName,
						field: 'values'
					});
					displayedColumnsX.push({
						headerName: this.translate.get('GLOBAL.FREQUENCY'),
						field: 'frequency'
					});
				}
				if (yType === 'Numerical') {
					displayedColumnsY.push({
						headerName: this.translate.get('GLOBAL.INTERVAL_OF') + yName,
						field: 'interval'
					});
				} else {
					displayedColumnsY.push({
						headerName: this.translate.get('GLOBAL.VALUES_OF') + yName,
						field: 'values'
					});
					displayedColumnsY.push({
						headerName: this.translate.get('GLOBAL.FREQUENCY'),
						field: 'frequency'
					});
				}

				this.getCellDatasByAxis(xType, selectedCell.xaxisPartValues, selectedCell.xDisplayaxisPart, datasX, displayedColumnsX, xName);
				this.getCellDatasByAxis(yType, selectedCell.yaxisPartValues, selectedCell.yDisplayaxisPart, datasY, displayedColumnsY, yName);

			}
		}

		return this.preparation2dDatas.currentCellDatas;
	}

	getCellDatasByAxis(type, axisPartValues, displayaxisPart, datasAxis, displayedColumns, variableName) {

		if (axisPartValues) {

			if (type === 'Numerical') {
				axisPartValues = [displayaxisPart]; // join into one array for numerical values (bivar)
			}

			const appDatas = this.appService.getDatas().datas;
			for (let k = 0; k < axisPartValues.length; k++) {
				// get value into global json
				datasAxis[k] = {};
				datasAxis[k][displayedColumns[0].field] = axisPartValues[k];
				if (displayedColumns[1]) {
					const modalityFreq = this.getModalityFrequency(appDatas.preparationReport.variablesDetailedStatistics, variableName, axisPartValues[k]);
					datasAxis[k][displayedColumns[1].field] = modalityFreq;
				}
			}
		}

	}

	getModalityFrequency(source, variable, partition) {

		let currentVar;
		Object.keys(source).forEach((key) => {
			if (source[key].dataGrid.dimensions[0].variable === variable) {
				currentVar = source[key].inputValues;
			}
		});
		if (currentVar) {
			const partitionIndex = currentVar.values.indexOf(partition);
			return currentVar.frequencies[partitionIndex];
		} else {
			return undefined;
		}
	}

	getTargetsIfAvailable() {

		// Initialize
		this.preparation2dDatas.isTargetAvailable = false;
		let targets: any;

		const variablesDetails: VariableDetailsVO = this.getVariableDetails(this.preparation2dDatas.selectedVariable.rank);

		if (variablesDetails && variablesDetails.dataGrid && variablesDetails.dataGrid.cellIds) {
			const isTargetAvailable: any = variablesDetails.dataGrid.dimensions.find(e => e.variable === 'Target');

			if (isTargetAvailable) {
				targets = isTargetAvailable.partition;
			}
			this.preparation2dDatas.isTargetAvailable = isTargetAvailable;
			return targets;
		}
	}

	getVariableDetails(rank): VariableDetailsVO {
		const appDatas = this.appService.getDatas().datas;
		let variableDetails: VariableDetailsVO;
		const isRegressionOrExplanatoryAnalysis = this.preparationDatasService.isExplanatoryAnalysis() || this.evaluationDatasService.isRegressionAnalysis();

		if (!isRegressionOrExplanatoryAnalysis &&
			appDatas.bivariatePreparationReport &&
			appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics &&
			appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics[rank]) {
			// normal case
			const currentVar = appDatas.bivariatePreparationReport.variablesPairsDetailedStatistics[rank];
			variableDetails = new VariableDetailsVO(currentVar, this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE);
		} else if (isRegressionOrExplanatoryAnalysis && appDatas.textPreparationReport && appDatas.textPreparationReport.variablesDetailedStatistics[rank]) {
			// regression or explanatory case: textPreparationReport
			const currentVar = appDatas.textPreparationReport.variablesDetailedStatistics[rank];
			variableDetails = new VariableDetailsVO(currentVar, this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE);
		} else if (isRegressionOrExplanatoryAnalysis && appDatas.preparationReport && appDatas.preparationReport.variablesDetailedStatistics[rank]) {
			// regression or explanatory case: preparationReport
			const currentVar = appDatas.preparationReport.variablesDetailedStatistics[rank];
			variableDetails = new VariableDetailsVO(currentVar, this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE);
		}
		return variableDetails;
	}

	getMatrixCanvasDatas(selectedVariable): any {
		this.preparation2dDatas.matrixDatas = undefined;
		const variablesDetails: VariableDetailsVO = this.getVariableDetails(selectedVariable.rank);

		if (variablesDetails) {

			// const variableDatas = copy(variablesDetails.dataGrid);
			const variableDatas: VariableDetailsVO = _.cloneDeep(variablesDetails);

			if (variableDatas) {
				const xDimension = new DimensionVO(variableDatas.dataGrid.dimensions[0]);
				const yDimension = new DimensionVO(variableDatas.dataGrid.dimensions[1]);

				if (this.preparationDatasService.isExplanatoryAnalysis() || this.evaluationDatasService.isRegressionAnalysis()) {

					// construct array if not present (regression)
					this.getRegressionCellIds(xDimension.parts, yDimension.parts, variableDatas.dataGrid); // Useless ?
					this.getRegressionCellsPartIndexes(xDimension.parts, yDimension.parts, variableDatas.dataGrid);
					this.getRegressionCellFrequencies(xDimension.parts, yDimension.parts, variableDatas.dataGrid);
				} else if (variableDatas.dataGrid.cellFrequencies) {
					// Get the full frequency list
					const computedCellFreqs = MatrixUtilsDatasService.getCellFrequencies(
						[xDimension.parts, yDimension.parts],
						variableDatas.dataGrid.cellPartIndexes,
						variableDatas.dataGrid.cellFrequencies
					);
					variableDatas.setCellFrequencies(computedCellFreqs);
				} else if (variableDatas.dataGrid.cellTargetFrequencies) {
					// Get the full frequency list
					const computedCellTargetFreqs = MatrixUtilsDatasService.getCellFrequencies(
						[xDimension.parts, yDimension.parts],
						variableDatas.dataGrid.cellPartIndexes,
						variableDatas.dataGrid.cellTargetFrequencies
					);
					variableDatas.setTargetCellFrequencies(computedCellTargetFreqs);
					const sum = UtilsService.sumArrayItemsOfArray(computedCellTargetFreqs);
					variableDatas.setCellFrequencies(sum);
				} else {
					// matrix not available for this datas
					// example bivariate case R03
				}

				if (variableDatas.dataGrid.cellFrequencies || variableDatas.dataGrid.cellTargetFrequencies) {

					const xValues = {
						standard: [],
						frequency: []
					};
					const yValues = {
						standard: [],
						frequency: []
					};
					[xValues.frequency, yValues.frequency] = MatrixUtilsDatasService.getFrequencyAxisValues(xDimension, yDimension, variableDatas.dataGrid.cellFrequencies || variableDatas.dataGrid.cellTargetFrequencies);
					[xValues.standard, yValues.standard] = MatrixUtilsDatasService.getStandardAxisValues(xDimension, yDimension);
					const cellDatas = MatrixUtilsDatasService.getCellDatas(
						xDimension,
						yDimension,
						[],
						xDimension.partition,
						yDimension.partition,
						xDimension.partitionInputs,
						yDimension.partitionInputs,
						variableDatas.dataGrid.cellFrequencies,
						variableDatas.dataGrid.cellInterests,
						variableDatas.dataGrid.cellTargetFrequencies,
						xValues,
						yValues);

					// TO display axis names
					// Maybe can be improved and be taken into cell datas ?
					this.preparation2dDatas.matrixDatas = {
						variable: {
							nameX: selectedVariable.name1,
							nameY: selectedVariable.name2,
							xParts: xDimension.parts,
							yParts: yDimension.parts
						},
						matrixCellDatas: cellDatas
					};
				}
			}

		}

		return this.preparation2dDatas.matrixDatas;
	}

	getRegressionCellIds(xLength: any, yLength: any, datas: any): any {
		if (!datas.cellIds) {
			datas.cellIds = [];
			let k = 0;
			// construct array if not present (regression)
			for (let i = 0; i < xLength; i++) {
				for (let j = 0; j < yLength; j++) {
					datas.cellIds.push('C' + k);
					k++;
				}
			}
		}
	}

	getRegressionCellFrequencies(xLength: any, yLength: any, datas: any): any {
		if (!datas.cellFrequencies) {
			datas.cellFrequencies = [];
			// transform array if regression
			// To be compatible with KC files
			// [A, B]
			// [C, D]
			// become [[A],[C],[B],[D]]
			for (let j = 0; j < yLength; j++) {
				for (let i = 0; i < xLength; i++) {
					if (datas.partTargetFrequencies) {
						// Regression case
						datas.cellFrequencies.push([datas.partTargetFrequencies[i][j]]);
					}
				}
			}
		}
	}

	getRegressionCellsPartIndexes(xLength: any, yLength: any, datas: any): any {

		if (!datas.cellPartIndexes) {
			datas.cellPartIndexes = [];
			// construct array if not present (regression)
			for (let i = 0; i < xLength; i++) {
				for (let j = 0; j < yLength; j++) {
					if (!datas.cellPartIndexes[i]) {
						datas.cellPartIndexes[i] = [];

					}
					datas.cellPartIndexes[i].push(j);
				}
			}
		}
	}

	getGlobalMinAndMax2dValues(variablesDatas): any {

		const currentRes: any = {
			'CELL_INTEREST': [],
			'FREQUENCY': [],
			'FREQUENCY_CELL': [],
			'MUTUAL_INFO': [],
			'MUTUAL_INFO_TARGET_WITH_CELL': []
		};
		for (let i = 0; i < variablesDatas.length; i++) {
			const inputDatas = this.getMatrixCanvasDatas(variablesDatas[i]);
			if (inputDatas) {

				let matrixFreqsValues, matrixValues, globalMatrixValues, matrixExtras;
				let graphMode = {
					mode: 'MUTUAL_INFO_TARGET_WITH_CELL'
				};
				[matrixFreqsValues, matrixValues, globalMatrixValues, matrixExtras] = MatrixCanvasService.computeMatrixValues(
					graphMode,
					inputDatas,
					undefined,
					0);
				currentRes['MUTUAL_INFO_TARGET_WITH_CELL'].push(matrixValues);

				graphMode = {
					mode: 'CELL_INTEREST'
				};
				[matrixFreqsValues, matrixValues, globalMatrixValues, matrixExtras] = MatrixCanvasService.computeMatrixValues(
					graphMode,
					inputDatas,
					undefined,
					0);
				currentRes['CELL_INTEREST'].push(matrixValues);

				for (let j = 0; j < inputDatas.matrixCellDatas.length; j++) {
					currentRes['FREQUENCY'].push(UtilsService.arraySum(inputDatas.matrixCellDatas[j].cellFreqs));
					currentRes['FREQUENCY_CELL'].push(inputDatas.matrixCellDatas[j].cellFreqs);
				}

			}
		}

		// Reinit values after computing
		this.preparation2dDatas.matrixDatas = undefined;
		const res: any = {};

		res['MUTUAL_INFO_TARGET_WITH_CELL'] = UtilsService.getMinAndMaxFromArray(currentRes['MUTUAL_INFO_TARGET_WITH_CELL'].flat());
		res['MUTUAL_INFO_TARGET_WITH_CELL'] = UtilsService.averageMinAndMaxValues(res['MUTUAL_INFO_TARGET_WITH_CELL'][0], res['MUTUAL_INFO_TARGET_WITH_CELL'][1]);
		res['MUTUAL_INFO'] = res['MUTUAL_INFO_TARGET_WITH_CELL'];

		res['CELL_INTEREST'] = UtilsService.getMinAndMaxFromArray(currentRes['CELL_INTEREST'].flat());

		res['FREQUENCY'] = UtilsService.getMinAndMaxFromArray(currentRes['FREQUENCY'].flat());
		res['FREQUENCY_CELL'] = UtilsService.getMinAndMaxFromArray(currentRes['FREQUENCY_CELL'].flat());

		res['PROB_CELL'] = [0, 1];
		res['PROB_TARGET_WITH_CELL'] = [0, 1];
		res['PROB_CELL_REVERSE'] = [0, 1];
		res['PROB_CELL_WITH_TARGET'] = [0, 1];

		return res;

	}

}
