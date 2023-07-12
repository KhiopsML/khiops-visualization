export class InformationsVO {

	evaluatedVariables: number;
	constructedVariables: number;
	informativeVariables: number;
	informativeVariablePairs: any;
	selectedVariables: number;
	selectedVariablePairs: any;
	discretization: string;
	valueGrouping: string;

	constructor(object) {

		this.evaluatedVariables = object.evaluatedVariables || '';
		this.constructedVariables = object.constructedVariables || '';
		this.informativeVariables = object.informativeVariables || '';
		this.informativeVariablePairs = object.informativeVariablePairs || '';
		this.selectedVariables = object.selectedVariables || '';
		this.selectedVariablePairs = object.selectedVariablePairs || '';
		this.discretization = object.discretization || '';
		this.valueGrouping = object.valueGrouping || '';

	}

	formatDatas() {

		const informationsDatas = [];
		if (this.evaluatedVariables) {
			informationsDatas.push({
				title: 'GLOBAL.EVALUATED_VARIABLES',
				value: this.evaluatedVariables
			});
		}
		if (this.constructedVariables) {
			informationsDatas.push({
				title: 'GLOBAL.CONSTRUCTED_VARIABLES',
				value: this.constructedVariables
			});
		}
		if (this.informativeVariables) {
			informationsDatas.push({
				title: 'GLOBAL.INFORMATIVE_VARIABLES',
				value: this.informativeVariables
			});
		}
		if (this.informativeVariablePairs) {
			informationsDatas.push({
				title: 'GLOBAL.INFORMATIVE_VARIABLES_PAIRS',
				value: this.informativeVariablePairs
			});
		}
		if (this.selectedVariables) {
			informationsDatas.push({
				title: 'GLOBAL.SELECTED_VARIABLES',
				value: this.selectedVariables
			});
		}
		if (this.selectedVariablePairs) {
			informationsDatas.push({
				title: 'GLOBAL.SELECTED_VARIABLES_PAIRS',
				value: this.selectedVariablePairs
			});
		}
		if (this.discretization) {
			informationsDatas.push({
				title: 'GLOBAL.DISCRETIZATION',
				value: this.discretization
			});
		}
		if (this.valueGrouping) {
			informationsDatas.push({
				title: 'GLOBAL.VALUE_GROUPING',
				value: this.valueGrouping
			});
		}

		return informationsDatas;
	}

}
