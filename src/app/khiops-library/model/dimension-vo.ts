import _ from 'lodash';

export class DimensionVO {

	name: string;
	type: string;
	description: string;
	parts: number;
	initialParts: number;
	startPosition: number;
	values: number;
	interest: number;
	min: number;
	max: number;
	hierarchyFold: boolean;
	isNumerical: boolean;
	isCategorical: boolean;
	currentHierarchyClusterCount: number;
	intervals: any[];
	valueGroups: any[];
	partition: any[]; // KV
	partitionInputs: any[]; // KV
	partitionType: any[]; // KV
	variable: string; // KV
	defaultGroupIndex: number; // KV

	constructor(object, startPosition = 0) {
		this.startPosition = startPosition;
		this.name = object && object.name || '';
		this.type = object && object.type || '';
		this.description = object && object.description || '';
		this.parts = object && object.parts || undefined;
		this.initialParts = object && object.initialParts || undefined;
		this.values = object && object.values || undefined;
		this.currentHierarchyClusterCount = this.parts;
		this.hierarchyFold = true;

		this.isNumerical = this.type === 'Numerical';
		this.isCategorical = this.type === 'Categorical';

		// KV
		if (object.partition) {
			this.partition = object.partition;

			// Clone partition to keep real datas
			this.partitionInputs = _.clone(object.partition);
			this.setMissingPartition();
			this.parts = this.partition.length;
		}
		if (object.variable) {
			this.name = object.variable;
		}
		this.partitionType = object && object.partitionType || undefined;
		this.variable = object && object.variable || '';
		this.defaultGroupIndex = object && object.defaultGroupIndex || 0;

	}

	setHierarchyFold(state: boolean) {
		this.hierarchyFold = state;
	}

	setCurrentHierarchyClusterCount(count) {
		this.currentHierarchyClusterCount = count;
	}

	setPartition(dimensionPartition: any) {
		if (this.isNumerical) {
			this.intervals = dimensionPartition.intervals;
			this.min = this.intervals[0].bounds[0];
			this.max = this.intervals[this.intervals.length - 1].bounds[1];
		} else {
			this.valueGroups = dimensionPartition.valueGroups;
		}
	}

	setMissingPartition() {
		if (this.partitionInputs[0] && this.partitionInputs[0].length === 0) {
			this.partitionInputs[0] = 'Missing';
		}
	}

}
