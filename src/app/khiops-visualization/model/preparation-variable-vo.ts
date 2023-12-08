import { TYPES } from "@khiops-library/enum/types";

export class PreparationVariableVO {

	_id: string;
	mode: string;
	name: string;
	name1: string;
	name2: string;
	nameX: string;
	nameY: string;

	rank: string;
	variableType: string;
	type: string;
	preparedName: string;
	derivationRule: string;

	isCategorical: boolean;
	isNumerical: boolean;

	weight: number;
	values: number;
	parts: number;
	modeFrequency: number;
	constructionCost: number;
	preparationCost: number;
	dataCost: number;
	level: number;

	is2dVariable = false;

	constructor(object, id) {

		// Generate id for grid
		this._id = id;

		this.variableType = 'preparation';

		this.mode = object.mode;
		this.name = object.name;
		this.name1 = object.name1;
		this.name2 = object.name2;
		this.nameX = object.nameX;
		this.nameY = object.nameY;
		this.rank = object.rank;
		this.type = object.type;

		this.isNumerical = this.type === TYPES.NUMERICAL;
		this.isCategorical = this.type === TYPES.CATEGORICAL;

		this.preparedName = object.preparedName;
		this.derivationRule = object.derivationRule;

		this.weight = object.weight;
		this.values = object.values;
		this.parts = object.parts;
		this.modeFrequency = object.modeFrequency;
		this.constructionCost = object.constructionCost;
		this.preparationCost = object.preparationCost;
		this.dataCost = object.dataCost;
		this.level = object.level;

		if (object.name1 && object.name2) {
			this.is2dVariable = true;
			this.variableType = 'preparation-2d';
		}

		// for regression matrix
		if (this.name1) {
			this.nameX = this.name1;
		}
		if (this.name2) {
			this.nameY = this.name2;
		}
		if (!this.name && this.name1 && this.name2) {
			this.name = this.name1 + '`' + this.name2;
		}
	}

}
