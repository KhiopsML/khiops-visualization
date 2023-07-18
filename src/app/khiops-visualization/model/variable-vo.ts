import {
	UtilsService
} from '@khiops-library/providers/utils.service';

export class VariableVO {

	_id: string;
	rank: string;
	name: string;
	level: number;
	parts: number;
	values: number;
	type: string;
	mode: string;
	modeCoverage: number;
	min: number;
	max: number;
	mean: number;
	stdDev: number;
	missingNumber: number;
	derivationRule: string;
	targetParts: number;

	constructor(object, detailedDatas) {

		// Generate id for grid
		this._id = object.name;

		this.rank = object.rank || undefined;
		this.name = object.name || undefined;
		this.level = object.level || 0;
		this.targetParts = object.targetParts || undefined;

		this.parts = object.parts || 0;
		this.values = object.values || 0;
		this.type = object.type || undefined;
		this.mode = object.mode;
		if (this.type === 'Categorical' && detailedDatas) {
			this.modeCoverage = this.computeModeCoverage(detailedDatas) || undefined;
		} else {
			this.modeCoverage = undefined;
		}
		this.min = object.min;
		this.max = object.max;
		this.mean = object.mean;
		this.stdDev = object.stdDev;
		if (this.type === 'Numerical') {
			this.missingNumber = object.missingNumber || 0;
		} else {
			// Missing number can be 0 or undefined for categorical variables #140
			this.missingNumber = object.missingNumber !== undefined ? object.missingNumber : undefined;
		}
		this.derivationRule = object.derivationRule || undefined;

	}

	computeModeCoverage(detailedDatas) {
		const modeIndex = detailedDatas.inputValues.values.indexOf(this.mode);
		const modeCoverage = detailedDatas.inputValues.frequencies[modeIndex] / UtilsService.arraySum(detailedDatas.inputValues.frequencies);
		return modeCoverage;
	}

}
