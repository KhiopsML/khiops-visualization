import { UtilsService } from "../providers/utils.service";

export class CellVO {
	/*
		WARNING
		Do not make nested objects here
		to allow Object.assign()
		and optimize performances
	*/

	_id: string | number;
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
	cellProbs: number[] = [];
	cellProbsRev: number[] = [];
	freqColVals: number[] = [];
	freqLineVals: number[] = [];
	cellFreqs: number[] = [];
	infosMutValue: number[] = [];
	infosMutExtra: any[] = []; // can be complex
	cellHellingerValue: number[] = [];
	cellHellingerAbsoluteValue: number[] = [];
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

	setCoordValues(
		i,
		j,
		xValues: {
			standard: number;
			frequency: number;
		},
		yValues: {
			standard: number;
			frequency: number;
		},
	) {
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
}
