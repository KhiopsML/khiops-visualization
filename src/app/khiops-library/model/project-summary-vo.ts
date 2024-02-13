import { TYPES } from "@khiops-library/enum/types";
import { InfosDatasI } from "@khiops-library/interfaces/infos-datas";

export class ProjectSummaryVO {
	filename: string;
	database: string;
	shortDescription: string;
	learningTask: string;
	targetVariable: string;
	instances: string;
	variables: number;

	displayDatas: InfosDatasI[];

	constructor(appDatas) {
		this.filename = appDatas.filename || "";
		this.database = appDatas.preparationReport.summary.database || "";
		this.shortDescription = appDatas.shortDescription || "";
		this.learningTask =
			appDatas.preparationReport.summary.learningTask || "";
		this.targetVariable =
			appDatas.preparationReport.summary.targetVariable || "";
		this.instances = appDatas.preparationReport.summary.instances || "";

		this.variables = undefined;
		this.computeVariablesCount(appDatas);

		this.formatDatas();
	}

	computeVariablesCount(appDatas) {
		const varDatas =
			appDatas.preparationReport.summary.variables || undefined;
		if (varDatas) {
			const categoricalVarsCount =
				varDatas.numbers[
					varDatas.types.findIndex((e) => e === TYPES.CATEGORICAL)
				];
			const numericalVarsCount =
				varDatas.numbers[
					varDatas.types.findIndex((e) => e === TYPES.NUMERICAL)
				];
			this.variables = categoricalVarsCount + numericalVarsCount;
			if (
				appDatas.preparationReport.summary.targetVariable &&
				appDatas.preparationReport.summary.targetVariable !== ""
			) {
				this.variables = this.variables - 1;
			}
		}
	}

	formatDatas() {
		this.displayDatas = [];
		if (this.filename) {
			this.displayDatas.push({
				title: "GLOBAL.PROJECT_FILE",
				value: this.filename,
			});
		}
		if (this.database) {
			this.displayDatas.push({
				title: "GLOBAL.DATABASE",
				value: this.database,
			});
		}
		if (this.shortDescription) {
			this.displayDatas.push({
				title: "GLOBAL.SHORT_DESCRIPTION",
				value: this.shortDescription,
			});
		}
		if (this.learningTask) {
			this.displayDatas.push({
				title: "GLOBAL.LEARNING_TASK",
				value: this.learningTask,
			});
		}
		if (this.targetVariable) {
			this.displayDatas.push({
				title: "GLOBAL.TARGET_VARIABLE",
				value: this.targetVariable,
			});
		}
		if (this.instances) {
			this.displayDatas.push({
				title: "GLOBAL.INSTANCES",
				value: this.instances,
			});
		}
		if (this.variables) {
			this.displayDatas.push({
				title: "GLOBAL.VARIABLES",
				value: this.variables,
			});
		}
	}
}
