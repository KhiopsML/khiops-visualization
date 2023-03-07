export class SummaryVO {

	dictionary: string;
	database: string;
	targetVariable: string;
	instances: string;
	learningTask: string;
	samplePercentage: number;
	samplingMode: string;
	selectionVariable: string;
	selectionValue: string;
	evaluatedVariables: string;

	constructor(object) {

		this.dictionary = object.dictionary || '';
		this.database = object.database || '';
		this.targetVariable = object.targetVariable || '';
		this.instances = object.instances || '';
		this.learningTask = object.learningTask || '';
		this.samplePercentage = object.samplePercentage || '';
		this.samplingMode = object.samplingMode || '';
		this.selectionVariable = object.selectionVariable || '';
		this.selectionValue = object.selectionValue || '';
		this.evaluatedVariables = object.evaluatedVariables || '';
	}

	formatDatas() {

		const summaryDatas = [];
		if (this.dictionary) {
			summaryDatas.push({
				title: 'GLOBAL.DICTIONARY',
				value: this.dictionary
			});
		}
		if (this.database) {
			summaryDatas.push({
				title: 'GLOBAL.DATABASE',
				value: this.database
			});
		}
		if (this.targetVariable) {
			summaryDatas.push({
				title: 'GLOBAL.TARGET_VARIABLE',
				value: this.targetVariable
			});
		}
		if (this.instances) {
			summaryDatas.push({
				title: 'GLOBAL.INSTANCES',
				value: this.instances
			});
		}
		if (this.learningTask) {
			summaryDatas.push({
				title: 'GLOBAL.LEARNING_TASK',
				value: this.learningTask
			});
		}
		if (this.samplePercentage) {
			summaryDatas.push({
				title: 'GLOBAL.SAMPLE_PERCENTAGE',
				value: this.samplePercentage
			});
		}
		if (this.samplingMode) {
			summaryDatas.push({
				title: 'GLOBAL.SAMPLING_MODE',
				value: this.samplingMode
			});
		}
		if (this.selectionVariable) {
			summaryDatas.push({
				title: 'GLOBAL.SELECTION_VARIABLE',
				value: this.selectionVariable
			});
		}
		if (this.selectionValue) {
			summaryDatas.push({
				title: 'GLOBAL.SELECTION_VALUE',
				value: this.selectionValue
			});
		}
		if (this.evaluatedVariables) {
			summaryDatas.push({
				title: 'GLOBAL.EVALUATED_VARIABLES',
				value: this.evaluatedVariables
			});
		}

		return summaryDatas;
	}

}
