export class ProjectSummaryVO {

	filename: string;
	database: string;
	shortDescription: string;
	learningTask: string;
	targetVariable: string;
	instances: string;
	variables: number;

	constructor(appDatas) {

		this.filename = appDatas.filename || '';
		this.database = appDatas.preparationReport.summary.database || '';
		this.shortDescription = appDatas.shortDescription || '';
		this.learningTask = appDatas.preparationReport.summary.learningTask || '';
		this.targetVariable = appDatas.preparationReport.summary.targetVariable || '';
		this.instances = appDatas.preparationReport.summary.instances || '';

		this.variables = undefined;
		this.computeVariablesCount(appDatas);

	}

	computeVariablesCount(appDatas) {
		const varDatas = appDatas.preparationReport.summary.variables || undefined;
		if (varDatas) {
			const categoricalVarsCount = varDatas.numbers[varDatas.types.findIndex(e => e === 'Categorical')];
			const numericalVarsCount = varDatas.numbers[varDatas.types.findIndex(e => e === 'Numerical')];
			this.variables = categoricalVarsCount + numericalVarsCount;
			if (appDatas.preparationReport.summary.targetVariable && appDatas.preparationReport.summary.targetVariable !== '') {
				this.variables = this.variables - 1;
			}
		}
	}

	formatDatas() {

		const projectSummaryDatas = [];
		if (this.filename) {
			projectSummaryDatas.push({
				title: 'GLOBAL.PROJECT_FILE',
				value: this.filename
			});
		}
		if (this.database) {
			projectSummaryDatas.push({
				title: 'GLOBAL.DATABASE',
				value: this.database
			});
		}
		if (this.shortDescription) {
			projectSummaryDatas.push({
				title: 'GLOBAL.SHORT_DESCRIPTION',
				value: this.shortDescription
			});
		}
		if (this.learningTask) {
			projectSummaryDatas.push({
				title: 'GLOBAL.LEARNING_TASK',
				value: this.learningTask
			});
		}
		if (this.targetVariable) {
			projectSummaryDatas.push({
				title: 'GLOBAL.TARGET_VARIABLE',
				value: this.targetVariable
			});
		}
		if (this.instances) {
			projectSummaryDatas.push({
				title: 'GLOBAL.INSTANCES',
				value: this.instances
			});
		}
		if (this.variables) {
			projectSummaryDatas.push({
				title: 'GLOBAL.VARIABLES',
				value: this.variables
			});
		}

		return projectSummaryDatas;
	}

}
