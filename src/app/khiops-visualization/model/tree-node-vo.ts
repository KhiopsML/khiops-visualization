import {
	UtilsService
} from '@khiops-library/providers/utils.service';

export class TreeNodeVO {

	id: string;
	nodeId: string;
	_id: string;
	shortDescription: string;
	isLeaf: boolean;
	variable: string;
	partitionType: string;
	type: string;
	childNodes: [];
	partition: [];
	targetValues: any;
	children: any;
	color: string;
	isTrusted: boolean;
	defaultGroupIndex: number;
	valuesProbs: number[];
	purity: number;
	totalFreqs: number;
	isCollapsed: boolean;
	childrenList: any[];

	constructor(object, classesCount, color ? , isTrusted ? ) {

		this.id = object.nodeId || undefined;
		this.nodeId = object.nodeId || undefined;
		this._id = this.id;
		this.childNodes = object.childNodes;
		this.isLeaf = object.childNodes ? false : true;
		this.variable = object.variable || undefined;
		this.color = color || '#999'; // for folders : grey

		this.isTrusted = isTrusted || false;
		this.shortDescription = object.nodeId + ' ';
		this.shortDescription += this.variable ? this.variable : '';

		this.targetValues = object.targetValues || {
			frequencies: [],
			values: []
		};
		this.type = object.type || undefined;
		this.partitionType = object.partitionType || undefined;
		this.partition = object.partition || [];
		this.children = object.childNodes || [];
		this.defaultGroupIndex = object.defaultGroupIndex || undefined;
		if (this.isLeaf) {
			this.totalFreqs = UtilsService.arraySum(this.targetValues && this.targetValues.frequencies);
		} else {
			this.deepGetChildrenModalityTargetValues(this.childNodes);
		}
		this.isCollapsed = object.isCollapsed || false;

		this.purity = this.getPurity(classesCount);

	}

	computeValuesProbs() {
		this.valuesProbs = [];
		for (let i = 0; i < this.targetValues.frequencies.length; i++) {
			this.valuesProbs.push(this.targetValues.frequencies[i] / this.totalFreqs);
		}
		return this.valuesProbs;
	}

	deepGetChildrenModalityTargetValues(childNodes) {

		if (childNodes) {

			for (let i = 0; i < childNodes.length; i++) {
				if (childNodes[i].targetValues) {
					for (let j = 0; j < childNodes[i].targetValues.frequencies.length; j++) {
						const isExistingIndex = this.targetValues.values.length > 0 &&
							this.targetValues.values.indexOf(childNodes[i].targetValues.values[j]);
						if (isExistingIndex === false || isExistingIndex === -1) {
							this.targetValues.values.push(childNodes[i].targetValues.values[j]);
							this.targetValues.frequencies.push(childNodes[i].targetValues.frequencies[j]);
						} else {
							this.targetValues.frequencies[isExistingIndex] = this.targetValues.frequencies[isExistingIndex] + childNodes[i].targetValues.frequencies[j];
						}

					}
				}
				this.deepGetChildrenModalityTargetValues(childNodes[i].childNodes);
			}
		}

	}

	/**
	 * Compute purity of one node
	 * Purity is defined as the entropy S of the distribution of classes
	 * 1 + (p1*log2(p1) + p2*log2(p2) + … + pM*log2(pM)) / log2(M)
	 * Example for [30, 20, 50]
	 * 1 + (0.3*log2(0.3) + 0.2*log2(0.2) + 0.5*log2(0.5)) / log2(3)
	 */
	getPurity(M: number): number {
		if (this.isLeaf) {
			this.computeValuesProbs();

			let pClassLog2 = 0;
			for (let i = 0; i < this.targetValues.frequencies.length; i++) {
				pClassLog2 += this.valuesProbs[i] * Math.log2(this.valuesProbs[i]);
			}
			this.purity = 1 + pClassLog2 / Math.log2(M);

			return this.purity;
		}

	}

}
