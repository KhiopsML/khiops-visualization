import {
	Injectable
} from '@angular/core';
import {
	UtilsService
} from '../../providers/utils.service';
import {
	CellVO
} from '../../model/cell-vo';

@Injectable({
	providedIn: 'root'
})
export class MatrixCanvasService {

	static hot: string[] = [
		'#FFFFFF',
		'#FF8000',
		'#FF5200',
		'#FF2900',
		'#FF0000',
		'#D60000',
		'#AD0000',
		'#840000',
		'#520000',
		'#290000',
		'#000000'
	];

	constructor() {

	}

	static computeMatrixValues(graphMode, inputDatas, contextSelection, selectedTargetIndex): any {

		let globalMatrixValues;
		let globalMatrixFreqsValues;
		let matrixFreqsValues;
		let matrixValues;
		let matrixExtras;
		let matrixExpectedFreqsValues;

		if (contextSelection && contextSelection.length > 0) {
			// KC use case

			// Copy context to reverse it without keeping refs
			const currentContext = Object.assign([], contextSelection);

			// Generate combinations for current context selections (selection can be [] when folders are selected)
			const cellCombinations = UtilsService.generateMatrixCombinations(currentContext.reverse());

			// Compute all positions according to combinations
			const partPositions = [];
			const cellCombinationsLength = cellCombinations.length;
			for (let i = 0; i < cellCombinationsLength; i++) {
				const currentCellPartPosition = UtilsService.findArrayIntoHash(cellCombinations[i], inputDatas.matrixCellDatas[0].cellFreqHash);
				partPositions.push(currentCellPartPosition);
			}

			const partPositionsLength = partPositions.length;
			// Always compute freqs for distribution graph datas
			matrixFreqsValues = inputDatas.matrixCellDatas.map(e => {
				let res = 0;
				for (let i = 0; i < partPositionsLength; i++) {
					res = res + e.cellFreqs[partPositions[i]]; // values are added
				}
				return res;
			});
			globalMatrixFreqsValues = inputDatas.matrixCellDatas.map(e => e.cellFreqs);
			globalMatrixFreqsValues = UtilsService.sumArrayItemsOfArray(globalMatrixFreqsValues);

			if (graphMode.mode === 'FREQUENCY') {
				matrixValues = matrixFreqsValues;
				globalMatrixValues = globalMatrixFreqsValues;
			} else {

				// Map current matrix datas to freq values correpsonding to current part positions
				let res = 0;
				let matrixTotal = 0;
				let cellFreqs = 0;
				let freqColVals = 0;
				let freqLineVals = 0;
				switch (graphMode.mode) {
					case 'MUTUAL_INFO':
						matrixValues = inputDatas.matrixCellDatas.map(e => {
							[matrixTotal, cellFreqs, freqColVals, freqLineVals] = this.computeValsByContext(e, partPositions, partPositionsLength);
							let [MIij, MIijExtra] = UtilsService.computeMutualInfo(cellFreqs, matrixTotal, freqColVals, freqLineVals);
							return MIij || 0;
						});
						matrixExtras = inputDatas.matrixCellDatas.map((e: CellVO) => {
							let [matrixTotal, cellFreqs, freqColVals, freqLineVals] = this.computeValsByContext(e, partPositions, partPositionsLength);
							let [MIij, MIijExtra] = UtilsService.computeMutualInfo(cellFreqs, matrixTotal, freqColVals, freqLineVals);
							return MIijExtra;
						});
						globalMatrixValues = inputDatas.matrixCellDatas.map(e => e.infosMutValue);
						break;
					case 'HELLINGER':
						matrixValues = inputDatas.matrixCellDatas.map(e => {
							[matrixTotal, cellFreqs, freqColVals, freqLineVals] = this.computeValsByContext(e, partPositions, partPositionsLength);
							const [hellingerValue, hellingerAbsoluteValue] =
							UtilsService.computeHellinger(cellFreqs, matrixTotal, freqColVals, freqLineVals);
							res = hellingerValue;
							return res || 0;
						});
						matrixExtras = inputDatas.matrixCellDatas.map((e: CellVO) => {
							let [matrixTotal, cellFreqs, freqColVals, freqLineVals] = this.computeValsByContext(e, partPositions, partPositionsLength);
							const [hellingerValue, hellingerAbsoluteValue] =
							UtilsService.computeHellinger(cellFreqs, matrixTotal, freqColVals, freqLineVals);
							return hellingerAbsoluteValue;
						});
						globalMatrixValues = inputDatas.matrixCellDatas.map(e => e.cellHellingerValue);
						break;
					case 'PROB_CELL':
						matrixValues = inputDatas.matrixCellDatas.map(e => {
							let [matrixTotal, cellFreqs, freqColVals, freqLineVals] = this.computeValsByContext(e, partPositions, partPositionsLength);
							return isNaN(cellFreqs / freqColVals) ? 0 : cellFreqs / freqColVals;
						});
						globalMatrixValues = inputDatas.matrixCellDatas.map(e => e.cellProbs);
						break;
					case 'PROB_CELL_REVERSE':
						matrixValues = inputDatas.matrixCellDatas.map(e => {
							let [matrixTotal, cellFreqs, freqColVals, freqLineVals] = this.computeValsByContext(e, partPositions, partPositionsLength);
							return isNaN(cellFreqs / freqLineVals) ? 0 : cellFreqs / freqLineVals;
						});
						globalMatrixValues = inputDatas.matrixCellDatas.map(e => e.cellProbsRev);
						break;
						// Only on KV
					case 'CELL_INTEREST':
						matrixValues = inputDatas.matrixCellDatas.map(e => {
							for (let i = 0; i < partPositionsLength; i++) {
								res = res + e.cellInterest[partPositions[i]];
							}
							return res || 0;
						});
						globalMatrixValues = inputDatas.matrixCellDatas.map(e => e.cellInterest);
						break;
				}

				globalMatrixValues = UtilsService.sumArrayItemsOfArray(globalMatrixValues);

			}

			// Compute expected cell frequencies
			matrixExpectedFreqsValues = inputDatas.matrixCellDatas.map((e: CellVO) => {
				let [matrixTotal, cellFreqs, freqColVals, freqLineVals] = this.computeValsByContext(e, partPositions, partPositionsLength);
				let ef = UtilsService.computeExpectedFrequency(matrixTotal, freqColVals, freqLineVals);
				return ef;
			});

		} else {
			// Always compute freqs for distribution graph datas
			matrixFreqsValues = inputDatas.matrixCellDatas.map(e => e.cellFreqs);
			if (selectedTargetIndex !== -1) {
				matrixFreqsValues = inputDatas.matrixCellDatas.map(e => e.cellFreqs[selectedTargetIndex] || 0);
			} else {
				matrixFreqsValues = UtilsService.sumArrayItemsOfArray(matrixFreqsValues);
			}

			if (graphMode.mode === 'FREQUENCY' || graphMode.mode === 'FREQUENCY_CELL') {
				matrixValues = matrixFreqsValues;
			} else {

				// 2 dim without context or with target : iris2d
				switch (graphMode.mode) {
					case 'MUTUAL_INFO':
						matrixValues = inputDatas.matrixCellDatas.map(e => {
							let [MIij, MIijExtra] = UtilsService.computeMutualInfo(e.cellFreqs[0], e.matrixTotal[0], e.freqColVals[0], e.freqLineVals[0]);
							return MIij || 0;
						});
						matrixExtras = inputDatas.matrixCellDatas.map(e => {
							let [MIij, MIijExtra] = UtilsService.computeMutualInfo(e.cellFreqs[0], e.matrixTotal[0], e.freqColVals[0], e.freqLineVals[0]);
							return MIijExtra;
						});
						break;
					case 'HELLINGER':
						matrixValues = inputDatas.matrixCellDatas.map(e => {
							const [hellingerValue, hellingerAbsoluteValue] =
							UtilsService.computeHellinger(e.cellFreqs[0], e.matrixTotal[0], e.freqColVals[0], e.freqLineVals[0]);
							return hellingerValue || 0;
						});
						matrixExtras = inputDatas.matrixCellDatas.map(e => {
							const [hellingerValue, hellingerAbsoluteValue] =
							UtilsService.computeHellinger(e.cellFreqs[0], e.matrixTotal[0], e.freqColVals[0], e.freqLineVals[0]);
							return hellingerAbsoluteValue || 0;
						});
						break;
					case 'PROB_CELL':
						matrixValues = inputDatas.matrixCellDatas.map(e => {
							return isNaN(e.cellFreqs[0] / e.freqColVals[0]) ? 0 : e.cellFreqs[0] / e.freqColVals[0];
						});
						break;
					case 'PROB_CELL_REVERSE':
						matrixValues = inputDatas.matrixCellDatas.map(e => {
							return isNaN(e.cellFreqs[0] / e.freqLineVals[0]) ? 0 : e.cellFreqs[0] / e.freqLineVals[0];
						});
						break;
					case 'CELL_INTEREST':
						// Only on KV do not need to recompute because nodes can not be folded
						matrixValues = inputDatas.matrixCellDatas.map(e => e.cellInterest);
						break;
					case 'MUTUAL_INFO_TARGET_WITH_CELL':
						globalMatrixValues = [];
						for (let i = 0; i < inputDatas.matrixCellDatas[0].cellFreqs.length; i++) {
							const currentMatrixValues = inputDatas.matrixCellDatas.map(e => {
								const [MIij, MIijExtra] = UtilsService.computeMutualInfo(e.cellFreqs[i], UtilsService.arraySum(e.matrixTotal),
									e.freqColVals[i], e.freqLineVals[i]);
								return MIij || 0;
							});
							globalMatrixValues.push(currentMatrixValues);
							if (i === selectedTargetIndex) {
								matrixValues = currentMatrixValues;
							}
						}
						matrixExtras = inputDatas.matrixCellDatas.map(e => {
							const [MIij, MIijExtra] = UtilsService.computeMutualInfo(e.cellFreqs[selectedTargetIndex], UtilsService.arraySum(e.matrixTotal),
								e.freqColVals[selectedTargetIndex], e.freqLineVals[selectedTargetIndex]);
							return MIijExtra;
						});
						break;
					case 'PROB_TARGET_WITH_CELL':
						// Only on KV do not need to recompute because nodes can not be folded
						if (selectedTargetIndex !== -1) {
							matrixValues = inputDatas.matrixCellDatas.map(e => e.cellProbsRev[selectedTargetIndex] || 0);
						}
						break;
					case 'PROB_CELL_WITH_TARGET':
						// Only on KV do not need to recompute because nodes can not be folded
						if (selectedTargetIndex !== -1) {
							matrixValues = inputDatas.matrixCellDatas.map(e => e.cellProbs[selectedTargetIndex] || 0);
						}
						break;
				}
			}

			// Compute expected cell frequencies
			matrixExpectedFreqsValues = inputDatas.matrixCellDatas.map(e => {
				let ef =
					UtilsService.computeExpectedFrequency(e.matrixTotal, e.freqColVals, e.freqLineVals);
				return ef;
			});

		}

		return [matrixFreqsValues, matrixValues, globalMatrixValues, matrixExtras, matrixExpectedFreqsValues];

	}

	static computeValsByContext(e, partPositions, partPositionsLength): any {
		let matrixTotal = 0;
		let cellFreqs = 0;
		let freqColVals = 0;
		let freqLineVals = 0;
		for (let i = 0; i < partPositionsLength; i++) {
			matrixTotal = matrixTotal + e.matrixTotal[partPositions[i]];
			cellFreqs = cellFreqs + e.cellFreqs[partPositions[i]];
			freqColVals = freqColVals + e.freqColVals[partPositions[i]];
			freqLineVals = freqLineVals + e.freqLineVals[partPositions[i]];
		}
		return [matrixTotal, cellFreqs, freqColVals, freqLineVals];
	}

	static getFrequencyColorsLegend(): any {
		let strHex = `linear-gradient(
			to top,`;
		for (let i = 0; i < this.hot.length; i++) {
			strHex += this.hot[i] + ' ' + i * 100 / this.hot.length + '%';
			if (i !== this.hot.length - 1) {
				strHex += ',';
			}
		}
		strHex += ')';
		return strHex;
	}

	static getInterestColorsLegend(): any {
		return `linear-gradient(
			to bottom,
			#ff0000 0%,
			#ffffff 50%,
			#0000ff 100%
			)`;
	}

	static hexToRgb(hex): any {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	static getFrequencyColors(): any {

		const map = [];
		for (let i = 0; i < this.hot.length; i++) {
			const rgb = this.hexToRgb(this.hot[i]);
			map.push({
				pct: i / 10,
				color: {
					r: parseInt(rgb.r, 10),
					g: parseInt(rgb.g, 10),
					b: parseInt(rgb.b, 10)
				}
			});
		}
		return map;

	}

	static getInterestColors(isPositiveValue): any {

		if (isPositiveValue) {
			return [{
					pct: 0,
					color: {
						r: 255,
						g: 255,
						b: 255

					}
				},
				{
					pct: 1.0,
					color: {
						r: 255,
						g: 0,
						b: 0
					}
				}
			];
		} else {
			return [{
					pct: 0.0,
					color: {
						r: 255,
						g: 255,
						b: 255

					}
				},
				{
					pct: 1,
					color: {
						r: 0,
						g: 0,
						b: 255
					}

				}
			];
		}

	}

	static getNavigationCell(keyCode, matrixCellDatas, isAxisInverted, currentCellIndex, currentVariable): any {
		let changeCell;

		let selectedCellIndex;

		// Sort cells by x and y;
		matrixCellDatas.sort(function (a, b) {
			return a.xCanvas - b.xCanvas || a.yCanvas - b.yCanvas;
		});

		// Compute x cell length
		const xPartsLength = matrixCellDatas.filter(e => e.xCanvas === 0).length;

		selectedCellIndex = matrixCellDatas.findIndex(e => e.index === currentCellIndex);

		if (!isAxisInverted) {
			if (keyCode === 38) {
				// UP
				if (matrixCellDatas[selectedCellIndex + 1].xCanvas === matrixCellDatas[selectedCellIndex].xCanvas) {
					selectedCellIndex = selectedCellIndex + 1;
				}
			} else if (keyCode === 40) {
				// DOWN
				if (matrixCellDatas[selectedCellIndex - 1].xCanvas === matrixCellDatas[selectedCellIndex].xCanvas) {
					selectedCellIndex = selectedCellIndex - 1;
				}
			} else if (keyCode === 37) {
				// LEFT
				selectedCellIndex = selectedCellIndex - xPartsLength;
			} else if (keyCode === 39) {
				// RIGHT
				selectedCellIndex = selectedCellIndex + xPartsLength;
			} else {
				return;
			}
		} else {
			if (keyCode === 40) {
				// DOWN
				selectedCellIndex = selectedCellIndex - xPartsLength;
			} else if (keyCode === 38) {
				// UP
				selectedCellIndex = selectedCellIndex + xPartsLength;
			} else if (keyCode === 37) {
				// LEFT
				if (matrixCellDatas[selectedCellIndex - 1].xCanvas === matrixCellDatas[selectedCellIndex].xCanvas) {
					selectedCellIndex = selectedCellIndex - 1;
				}
			} else if (keyCode === 39) {
				// RIGHT
				if (matrixCellDatas[selectedCellIndex + 1].xCanvas === matrixCellDatas[selectedCellIndex].xCanvas) {
					selectedCellIndex = selectedCellIndex + 1;
				}
			} else {
				return;
			}
		}
		changeCell = matrixCellDatas[selectedCellIndex];

		return changeCell;
	}

}
