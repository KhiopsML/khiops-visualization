import {
	Injectable
} from '@angular/core';
// import * as _ from 'lodash'; // Important to import lodash in karma
import {
	AppConfig
} from 'src/environments/environment';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	ProjectSummaryVO
} from '../model/project-summary-vo';
// TODO remove electron
// let ipcRenderer;
// try {
// 	ipcRenderer = require('electron').ipcRenderer;
// } catch (e) {
// 	console.warn('Can not access ipcRenderer', e);
// }

@Injectable({
	providedIn: 'root'
})
export class AppService {

	splitSizes: any;
	appDatas: any;

	constructor(private khiopsLibraryService: KhiopsLibraryService) {
		this.initialize();
	}

	initialize(): any {

		this.initGlobalConfigVariables();
		this.initSessionVariables();

		this.appDatas = {
			datas: undefined
		};

		this.splitSizes = {
			projectView: {
				row: [70, 30]
			},
			preparationView: {
				row: [20, 80],
				row0Col: [20, 60, 20],
				row1Col: [60, 40],
				row1Col0Row: [80, 20],
				row1Col1Row: [80, 20],
				row1Col1Row0Col: [30, 70]
			},
			treePreparationView: {
				col: [70, 30],
				col0Row: [20, 40, 40],
				col0Row0Col: [20, 60, 20],
				col0Row1Col: [60, 40],
				col0Row2Col: [30, 70],
				col0Row2Col1Row: [50, 50],
				row1Col1Row: [80, 20], // for modeling tree view
				row1Col1Row0Col: [30, 70] // for modeling tree view
			},
			preparation2dView: {
				row: [20, 80],
				row0Col: [100],
				row1Col: [60, 40],
				row1Col0Row: [100],
				row1Col1Row: [80, 20],
				row1Col1Row0Col: [80, 20]
			},
			modelingView: {
				row: [20, 80],
				row0Col: [30, 30, 40],
				row1Col: [60, 40],
				row1Col0Row: [80, 20],
				row1Col1Row: [60, 40],
				row1Col1Row0Col: [30, 70]
			},
			evaluationView: {
				col: [50, 50],
				col0Row: [20, 50, 30],
				col1Row: [70, 30]
			}
		};

		const storedSplitValues = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SPLIT_SIZES');

		// Set default split sizes if not into local storage
		this.splitSizes = UtilsService.setDefaultLSValues(storedSplitValues, this.splitSizes);

	}

	initGlobalConfigVariables(): any {
		AppConfig.visualizationCommon.GLOBAL.FONT_SIZE = parseInt(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE'), 10) || AppConfig.visualizationCommon.GLOBAL.FONT_SIZE;
		AppConfig.visualizationCommon.GLOBAL.TO_FIXED = parseInt(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_NUMBER_PRECISION'), 10) || AppConfig.visualizationCommon.GLOBAL.TO_FIXED;
		AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = parseInt(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST'), 10) || AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;
		// AppConfig.common.LIFT_CURVE.LIFT_CURVE_SMOOTH = parseInt(localStorage.getItem(AppConfig.common.GLOBAL.LS_ID + 'LIFT_CURVE_SMOOTH'), 10) || AppConfig.common.LIFT_CURVE.LIFT_CURVE_SMOOTH;
		AppConfig.visualizationCommon.LIFT_CURVE.LIFT_CURVE_SMOOTH = AppConfig.visualizationCommon.LIFT_CURVE.LIFT_CURVE_SMOOTH;

		AppConfig.common = {
			...AppConfig.visualizationCommon
		};

		this.khiopsLibraryService.setAppConfig(AppConfig);
	}

	initSessionVariables(): any {
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_MODE_OPTION_INDEX');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_TYPE_OPTION');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'TARGET_DISTRIBUTION_GRAPH_OPTION');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_MODE_OPTION');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'TARGET_LIFT_VALUES');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_TARGET_OPTION');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'TARGET_LIFT_VALUES');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'TARGET_LIFT');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SELECTED_TRAIN_PREDICTOR');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'DISTRIBUTION_GRAPH_OPTION');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'DISTRIBUTION_GRAPH_OPTION_X');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'DISTRIBUTION_GRAPH_OPTION_Y');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'OPTIONS_AG_GRID_SEARCH_MODELING-VARIABLES-LIST');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'OPTIONS_AG_GRID_SEARCH_PREPARATION-2D-VARIABLES-LIST');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'OPTIONS_AG_GRID_SEARCH_PREPARATION-VARIABLES-LIST');
		localStorage.removeItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'OPTIONS_AG_GRID_SEARCH_TREE-PREPARATION-VARIABLES-LIST');
	}

	setFileDatas(datas: any): any {
		this.initSessionVariables();
		this.appDatas.datas = datas;
		this.appDatas.datas = this.enrichJsonDatas(this.appDatas.datas);

		// #86 Remove missing informations for numerical variables
		this.appDatas.datas = this.ignoreMissingPartitionForNumerical(this.appDatas.datas, 'preparationReport');
		this.appDatas.datas = this.ignoreMissingPartitionForNumerical(this.appDatas.datas, 'textPreparationReport');
		this.setSavedDatas(this.appDatas.datas);

		// TODO remove electron
		// Set the filename to the title bar
		// if (datas) {
		// 	(async () => {
		// 		try {
		// 			await ipcRenderer.invoke('set-title-bar-name', {
		// 				title: 'Khiops Visualization ' + datas.filename
		// 			});
		// 		} catch (error) {
		// 			console.log('error', error);
		// 		}
		// 	})();
		// }
	}

	getSavedDatas(type): any {
		if (this.appDatas && this.appDatas.datas && this.appDatas.datas.savedDatas && this.appDatas.datas.savedDatas[type]) {
			return this.appDatas.datas.savedDatas[type];
		}
	}

	setSavedDatas(datas: any): any {
		if (datas && datas.savedDatas) {
			if (datas.savedDatas.splitSizes) {
				this.setSplitSizes(datas.savedDatas.splitSizes);
			}
		}
	}

	getDatas(): any {
		return this.appDatas;
	}

	isCompatibleJson(): boolean {
		if (this.appDatas && this.appDatas.datas) {

			if (this.appDatas.datas.tool === "Khiops" &&
				(this.appDatas.datas.preparationReport ||
					this.appDatas.datas.textPreparationReport ||
					this.appDatas.datas.treePreparationReport ||
					this.appDatas.datas.bivariatePreparationReport ||
					this.appDatas.datas.evaluationReport ||
					this.appDatas.datas.trainEvaluationReport ||
					this.appDatas.datas.testEvaluationReport)) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	}

	getViewSplitSizes(view): any {
		return this.splitSizes[view];
	}

	getSplitSizes(): any {
		return this.splitSizes;
	}

	setViewSplitSizes(view, sizes) {
		this.splitSizes[view] = sizes;
		this.setSplitSizes(this.splitSizes);
	}

	setSplitSizes(splitSizes) {
		this.splitSizes = splitSizes;
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SPLIT_SIZES', JSON.stringify(this.splitSizes));
	}

	resizeAndSetSplitSizes(item, sizes, itemSize, view) {
		window.dispatchEvent(new Event('resize'));
		if (item) {
			sizes[item] = itemSize;
			this.setViewSplitSizes(view, sizes);
		}
	}

	/**
	 * Enrich json file with missing informations
	 */
	enrichJsonDatas(datas: any): any {
		if (datas) {
			// For evaluation, we need optimal information
			Object.keys(datas).forEach((value) => {
				// do not add optimal if not liftcurve (regression)
				if (datas[value].reportType && datas[value].reportType === 'Evaluation' && datas[value].liftCurves) {

					const isOptimalAdded: any = datas[value].predictorsPerformance.find(function (el) {
						return el.name && el.name === 'Optimal';
					});
					if (!isOptimalAdded) {
						// First add optimal datas into global datas
						datas[value].predictorsPerformance.push({
							accuracy: 1,
							auc: 1,
							compression: 1,
							family: datas[value].evaluationType,
							rank: 'R' + parseInt(datas[value].predictorsPerformance.length + 1, 10),
							name: 'Optimal',
							type: datas[value].evaluationType
						});
					}
				}
			});
		}
		return datas;
	}

	/**
	 * #86 Remove missing informations for numerical variables
	 */
	ignoreMissingPartitionForNumerical(datas: any, preparationSource): any {
		if (datas && datas[preparationSource]) {
			for (const rank in datas[preparationSource].variablesDetailedStatistics) {
				const variable = datas[preparationSource].variablesDetailedStatistics[rank];
				if (!variable.dataGrid.isSupervised && variable.dataGrid.dimensions[0].partition[0].length === 0) {
					variable.dataGrid.dimensions[0].partition.shift();
					variable.dataGrid.frequencies.shift();
				}
			};
		}
		return datas;
	}

	getProjectSummaryDatas(): any {
		const appDatas = this.appDatas.datas;
		if (appDatas.preparationReport) {
			const projectSummaryDatas = new ProjectSummaryVO(appDatas);
			return projectSummaryDatas.formatDatas();
		} else {
			return undefined;
		}
	}

	getProjectLogsDatas(): any {
		const appDatas = this.appDatas.datas;
		let logs;

		if (appDatas.logs) {
			logs = [];
			for (let i = 0; i < appDatas.logs.length; i++) {
				for (let j = 0; j < appDatas.logs[i].messages.length; j++) {
					logs.push({
						task: appDatas.logs[i].taskName,
						message: appDatas.logs[i].messages[j]
					});
				}
			}
		}

		return logs;
	}

	getProjectInformationsDatas(): any {
		const appDatas = this.appDatas.datas;
		const informationsDatas = [];
		if (appDatas.preparationReport) {
			informationsDatas.push({
				title: appDatas.preparationReport.reportType,
				value: appDatas.preparationReport.summary.learningTask + ' ' + appDatas.preparationReport.summary.targetVariable
			});
		}
		if (appDatas.textPreparationReport) {
			informationsDatas.push({
				title: appDatas.textPreparationReport.reportType,
				value: appDatas.textPreparationReport.summary.learningTask + ' ' + appDatas.textPreparationReport.summary.targetVariable
			});
		}
		if (appDatas.modelingReport) {
			informationsDatas.push({
				title: appDatas.modelingReport.reportType,
				value: appDatas.modelingReport.summary.learningTask + ' ' + appDatas.modelingReport.summary.targetVariable
			});
		}
		if (appDatas.trainEvaluationReport) {
			informationsDatas.push({
				title: appDatas.trainEvaluationReport.reportType + ' ' + appDatas.trainEvaluationReport.evaluationType,
				value: appDatas.trainEvaluationReport.summary.learningTask + ' ' + appDatas.trainEvaluationReport.summary.targetVariable
			});
		}
		if (appDatas.testEvaluationReport) {
			informationsDatas.push({
				title: appDatas.testEvaluationReport.reportType + ' ' + appDatas.testEvaluationReport.evaluationType,
				value: appDatas.testEvaluationReport.summary.learningTask + ' ' + appDatas.testEvaluationReport.summary.targetVariable
			});
		}
		if (appDatas.evaluationReport) {
			informationsDatas.push({
				title: appDatas.evaluationReport.reportType + ' ' + appDatas.evaluationReport.evaluationType,
				value: appDatas.evaluationReport.summary.learningTask + ' ' + appDatas.evaluationReport.summary.targetVariable
			});
		}
		return informationsDatas;
	}

}
