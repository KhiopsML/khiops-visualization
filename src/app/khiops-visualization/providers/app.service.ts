import {
	Injectable
} from '@angular/core';
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
	ProjectLogVO
} from '@khiops-library/model/project-log-vo';
import { REPORTS } from '@khiops-library/enum/reports';
import { ProjectSummaryVO } from '@khiops-library/model/project-summary-vo';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';

@Injectable({
	providedIn: 'root'
})
export class AppService {

	splitSizes: any;
	appDatas: any;

	constructor(private khiopsLibraryService: KhiopsLibraryService) {
		this.initialize();
	}

	initialize() {

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

	initGlobalConfigVariables() {
		AppConfig.visualizationCommon.GLOBAL.TO_FIXED = parseInt(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_NUMBER_PRECISION'), 10) || AppConfig.visualizationCommon.GLOBAL.TO_FIXED;
		AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST = parseInt(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST'), 10) || AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;

		AppConfig.common = {
			...AppConfig.visualizationCommon
		};

		this.khiopsLibraryService.setAppConfig(AppConfig);
	}

	initSessionVariables() {
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
	}

	setFileDatas(datas: any) {
		this.initSessionVariables();
		this.appDatas.datas = datas;
		this.appDatas.datas = this.enrichJsonDatas(this.appDatas.datas);

		// #86 Remove missing informations for numerical variables
		this.appDatas.datas = this.ignoreMissingPartitionForNumerical(this.appDatas.datas, REPORTS.PREPARATION_REPORT);
		this.appDatas.datas = this.ignoreMissingPartitionForNumerical(this.appDatas.datas, REPORTS.TEXT_PREPARATION_REPORT);
		this.setSavedDatas(this.appDatas.datas);
	}

	getSavedDatas(type): any {
		if (this.appDatas && this.appDatas.datas && this.appDatas.datas.savedDatas && this.appDatas.datas.savedDatas[type]) {
			return this.appDatas.datas.savedDatas[type];
		}
	}

	setSavedDatas(datas: any) {
		if (datas && datas.savedDatas) {
			if (datas.savedDatas.splitSizes) {
				this.setSplitSizes(datas.savedDatas.splitSizes);
			}
		}
	}

	getDatas(): any {
		return this.appDatas;
	}

	isCompatibleJson(datas): boolean {
		if (datas) {
			if (datas.tool === "Khiops" &&
				(datas.preparationReport ||
					datas.textPreparationReport ||
					datas.treePreparationReport ||
					datas.bivariatePreparationReport ||
					datas.evaluationReport ||
					datas.trainEvaluationReport ||
					datas.testEvaluationReport)) {
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
	ignoreMissingPartitionForNumerical(datas: any, preparationSource: string): any {
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

	getProjectSummaryDatas(): InfosDatasI[] {
		const appDatas = this.appDatas.datas;
		if (appDatas.preparationReport) {
			const projectSummaryDatas = new ProjectSummaryVO(appDatas);
			return projectSummaryDatas.displayDatas;
		} else {
			return undefined;
		}
	}

	getProjectLogsDatas(): ProjectLogVO[] {
		const appDatas = this.appDatas.datas;
		let logs;

		if (appDatas.logs) {
			logs = [];
			for (let i = 0; i < appDatas.logs.length; i++) {
				for (let j = 0; j < appDatas.logs[i].messages.length; j++) {
					const log = new ProjectLogVO(appDatas.logs[i], appDatas.logs[i].messages[j]);
					logs.push(log);
				}
			}
		}

		return logs;
	}

}
