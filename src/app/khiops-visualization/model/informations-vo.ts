export class InformationsVO {

	evaluatedVariables: number;
	constructedVariables: number;
	informativeVariables: number;
	discretization: string;
	valueGrouping: string;

	constructor(object) {

		this.evaluatedVariables = object.evaluatedVariables || '';
		this.constructedVariables = object.constructedVariables || '';
		this.informativeVariables = object.informativeVariables || '';
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
