import { UtilsService } from "../providers/utils.service";

export class CellVO {
	/*
		WARNING
		Do not make nested objects here
		to allow Object.assign()
		and optimize performances
	*/

	_id: any;
	cellFreq: number;
	cellFreqHash: {};
	displayedFreqValue: number;
	displayedValue: {
		type: string;
		value: number;
		extra: 0;
		ef: number;
	};
	targetCellFreq: number;
	index: number;
	id: number; // KV for row identification (regression table case)
	cellInterest: number;
	cellTargetProb: number;
	xCanvas: number;
	yCanvas: number;
	wCanvas: number;
	hCanvas: number;
	x: {
		standard: number;
		frequency: number;
	};
	y: {
		standard: number;
		frequency: number;
	};
	w: {
		standard: number;
		frequency: number;
	};
	h: {
		standard: number;
		frequency: number;
	};
	concatName: string[];
	xaxisPart: string;
	yaxisPart: string;
	xaxisPartValues: string[];
	yaxisPartValues: string[];
	xDisplayaxisPart: string;
	yDisplayaxisPart: string;
	xnamePart: string;
	ynamePart: string;
	coverage;

	// Important to init those variables needed at construction
	cellProbs: any[] = [];
	cellProbsRev: any[] = [];
	freqColVals: any[] = [];
	freqLineVals: any[] = [];
	cellFreqs: any[] = [];
	infosMutValue: any[] = [];
	infosMutExtra: any[] = [];
	cellHellingerValue: any[] = [];
	cellHellingerAbsoluteValue: any[] = [];
	matrixTotal: number[] = [];

	constructor() {}

	setIndex(currentIndex: number) {
		this.index = currentIndex;
		this.id = currentIndex + 1; // cells begin from 0 and rows from 1 ...
		this._id = currentIndex;
	}

	formatValues() {
		this.cellTargetProb = UtilsService.initNumberIfNan(this.cellTargetProb);
		this.cellFreq = UtilsService.initNumberIfNan(this.cellFreq);
		this.targetCellFreq = UtilsService.initNumberIfNan(this.targetCellFreq);
	}

	addConcatName(name: string) {
		if (!this.concatName.includes(name)) {
			this.concatName.push(name);
		}
	}

	setCoordValues(i, j, xValues: any, yValues: any) {
		this.x = {
			standard: xValues.standard[i],
			frequency: xValues.frequency[i],
		};
		this.y = {
			standard: yValues.standard[j],
			frequency: yValues.frequency[j],
		};
		this.w = {
			standard: xValues.standard[i + 1] - this.x.standard,
			frequency: xValues.frequency[i + 1] - this.x.frequency,
		};
		this.h = {
			standard: yValues.standard[j + 1] - this.y.standard,
			frequency: yValues.frequency[j + 1] - this.y.frequency,
		};
	}

	merge(obj, way, nodeVO) {
		if (obj.x.standard < this.x.standard) {
			this.x.standard = obj.x.standard;
		}
		if (obj.x.frequency < this.x.frequency) {
			this.x.frequency = obj.x.frequency;
		}
		if (obj.y.standard < this.y.standard) {
			this.y.standard = obj.y.standard;
		}
		if (obj.y.frequency < this.y.frequency) {
			this.y.frequency = obj.y.frequency;
		}

		if (way === 0) {
			// x node
			this.w.standard = this.w.standard + obj.w.standard;
			this.w.frequency = this.w.frequency + obj.w.frequency;
			this.xaxisPart = nodeVO.name;
			this.xDisplayaxisPart = nodeVO.shortDescription;
		}
		if (way === 1) {
			// y node
			this.h.standard = this.h.standard + obj.h.standard;
			this.h.frequency = this.h.frequency + obj.h.frequency;
			this.yaxisPart = nodeVO.name;
			this.yDisplayaxisPart = nodeVO.shortDescription;
		}

		this.cellFreq = this.cellFreq + obj.cellFreq;
		this.cellFreqs = UtilsService.sumArrayItems([
			this.cellFreqs,
			obj.cellFreqs,
		]);

		if (way === 0) {
			// x node
			this.freqColVals = UtilsService.sumArrayItems([
				this.freqColVals,
				obj.freqColVals,
			]);
		}
		if (way === 1) {
			// y node
			this.freqLineVals = UtilsService.sumArrayItems([
				this.freqLineVals,
				obj.freqLineVals,
			]);
		}

		// Reinit zero exceptions informations on merge
		this.infosMutExtra = [];
	}
}
