export class InformationsVO {

	evaluatedVariables: number;
	constructedVariables: number;
	informativeVariables: number;
	informativeVariablePairs: any;
	selectedVariables: number;
	selectedVariablePairs: any;
	discretization: string;
	valueGrouping: string;
	evaluatedVariablePairs: any;

	constructor(object) {

		this.evaluatedVariables = object.evaluatedVariables
		this.constructedVariables = object.constructedVariables
		this.informativeVariables = object.informativeVariables
		this.informativeVariablePairs = object.informativeVariablePairs
		this.selectedVariables = object.selectedVariables
		this.selectedVariablePairs = object.selectedVariablePairs
		this.discretization = object.discretization
		this.valueGrouping = object.valueGrouping
		this.evaluatedVariablePairs = object.evaluatedVariablePairs

	}

	formatDatas() {

		const informationsDatas = [];
		if (this.evaluatedVariables !== undefined) {
			informationsDatas.push({
				title: 'GLOBAL.EVALUATED_VARIABLES',
				value: this.evaluatedVariables
			});
		}
		if (this.evaluatedVariablePairs !== undefined) {
			informationsDatas.push({
				title: 'GLOBAL.EVALUATED_VARIABLES_PAIRS',
				value: this.evaluatedVariablePairs
			});
		}
		if (this.constructedVariables !== undefined) {
			informationsDatas.push({
				title: 'GLOBAL.CONSTRUCTED_VARIABLES',
				value: this.constructedVariables
			});
		}
		if (this.informativeVariables !== undefined) {
			informationsDatas.push({
				title: 'GLOBAL.INFORMATIVE_VARIABLES',
				value: this.informativeVariables
			});
		}
		if (this.informativeVariablePairs !== undefined) {
			informationsDatas.push({
				title: 'GLOBAL.INFORMATIVE_VARIABLES_PAIRS',
				value: this.informativeVariablePairs
			});
		}
		if (this.selectedVariables !== undefined) {
			informationsDatas.push({
				title: 'GLOBAL.SELECTED_VARIABLES',
				value: this.selectedVariables
			});
		}
		if (this.selectedVariablePairs !== undefined) {
			informationsDatas.push({
				title: 'GLOBAL.SELECTED_VARIABLES_PAIRS',
				value: this.selectedVariablePairs
			});
		}
		if (this.discretization !== undefined) {
			informationsDatas.push({
				title: 'GLOBAL.DISCRETIZATION',
				value: this.discretization
			});
		}
		if (this.valueGrouping !== undefined) {
			informationsDatas.push({
				title: 'GLOBAL.VALUE_GROUPING',
				value: this.valueGrouping
			});
		}

		return informationsDatas;
	}

}
