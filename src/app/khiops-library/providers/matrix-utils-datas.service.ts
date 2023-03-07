import {
	Injectable
} from '@angular/core';
import {
	UtilsService
} from '../providers/utils.service';
import {
	CellVO
} from '../model/cell-vo';

@Injectable({
	providedIn: 'root'
})
export class MatrixUtilsDatasService {

	constructor() {}

	static getStandardAxisValues(xDimension, yDimension) {

		let xValues: any[];
		let yValues: any[];
		if (xDimension.type === 'Categorical') {
			let currentXAxisFullPart;
			if (xDimension.valueGroups) {
				currentXAxisFullPart = xDimension.valueGroups.map(e => e.values); // KC use case
			} else {
				currentXAxisFullPart = xDimension.partition; // KV use case
			}
			const axisPartTotal = UtilsService.getArrayOfArrayLength(currentXAxisFullPart);
			xValues = UtilsService.generateArrayPercentsFromArrayLength(currentXAxisFullPart, axisPartTotal);

		} else if (xDimension.type === 'Numerical') {
			let currentXAxisFullPart;
			if (xDimension.intervals) {
				currentXAxisFullPart = xDimension.intervals.map(e => e.bounds); // KC use case
			} else {
				currentXAxisFullPart = xDimension.partition; // KV use case
			}
			// Give an interval of 5% if missing
			currentXAxisFullPart[0] = UtilsService.generateMissingInterval(currentXAxisFullPart);
			const axisPartTotal = UtilsService.getArrayMatrixInterval(currentXAxisFullPart);
			xValues = UtilsService.generateArrayPercentsFromArrayIntervalsAndTotalCount(currentXAxisFullPart, axisPartTotal);
		}
		if (yDimension.type === 'Categorical') {
			let currentYAxisFullPart;
			if (yDimension.valueGroups) {
				currentYAxisFullPart = yDimension.valueGroups.map(e => e.values); // KC use case
			} else {
				currentYAxisFullPart = yDimension.partition; // KV use case
			}
			const axisPartTotal = UtilsService.getArrayOfArrayLength(currentYAxisFullPart);
			yValues = UtilsService.generateArrayPercentsFromArrayLength(currentYAxisFullPart, axisPartTotal);
		} else if (yDimension.type === 'Numerical') {
			let currentYAxisFullPart;
			if (yDimension.intervals) {
				currentYAxisFullPart = yDimension.intervals.map(e => e.bounds); // KC use case
			} else {
				currentYAxisFullPart = yDimension.partition; // KV use case
			}
			// Give an interval of 5% if missing
			currentYAxisFullPart[0] = UtilsService.generateMissingInterval(currentYAxisFullPart);
			const axisPartTotal = UtilsService.getArrayMatrixInterval(currentYAxisFullPart);
			yValues = UtilsService.generateArrayPercentsFromArrayIntervalsAndTotalCount(currentYAxisFullPart, axisPartTotal);
		}

		// console.log("TCL: MatrixUtilsDatasService -> getStandardAxisValues -> [xValues, yValues]", [xValues, yValues])
		return [xValues, yValues];
	}

	static getFrequencyAxisValues(xDimension, yDimension, cellFrequencies) {

		let xValues: any[];
		let yValues: any[];

		if (xDimension.type === 'Categorical') {
			const currentLineVal = UtilsService.getLinesTotals(xDimension.parts, yDimension.parts, cellFrequencies);
			xValues = UtilsService.generateArrayPercentsFromArrayValues(currentLineVal);
		} else if (xDimension.type === 'Numerical') {
			// Same behavior on KC and KV
			xValues = UtilsService.generateArrayPercentsFromArrayIntervals(xDimension.parts);
		}
		if (yDimension.type === 'Categorical') {
			const currentColVal = UtilsService.getColumnsTotals(xDimension.parts, yDimension.parts, cellFrequencies);
			yValues = UtilsService.generateArrayPercentsFromArrayValues(currentColVal);
		} else if (yDimension.type === 'Numerical') {
			// Same behavior on KC and KV
			yValues = UtilsService.generateArrayPercentsFromArrayIntervals(yDimension.parts);
		}

		return [xValues, yValues];
	}

	static formatAxisDisplayText(axisPartShortDescription, iter, dimension) {
		let displayaxisPart;
		if (typeof axisPartShortDescription[iter] !== 'string') {
			// In KV we get an unformated array
			// We must format datas with opened or closed brackets
			if (dimension.type === 'Numerical') {
				displayaxisPart = '[' + axisPartShortDescription[iter].toString() + ']';
				// replace [ by ] for all indexes excepting 0
				if (iter !== 0) {
					// Closed bracket for the non 0 iters
					displayaxisPart = displayaxisPart.replace('[', ']');
				}
			} else {
				displayaxisPart = Array.isArray(axisPartShortDescription[iter]) ? axisPartShortDescription[iter].join(', ') : axisPartShortDescription[iter].toString();
			}
		} else {
			// In KC we get a formated array
			// Do nothing
			displayaxisPart = axisPartShortDescription[iter];
		}
		return displayaxisPart;
	}

	static getCellDatas(
		xDimension, yDimension, zDimension,
		xAxisPartNames, yAxisPartNames,
		xAxisPartShortDescription, yAxisPartShortDescription,
		cellFrequencies, cellInterests, cellTargetFrequencies,
		xValues, yValues) {

		// var t0 = performance.now();
		const cells = [];

		const xLength = xDimension.parts;
		const yLength = yDimension.parts;

		let currentLineVal = [];
		let currentColVal = [0];

		if (Array.isArray(cellFrequencies[0]) && cellFrequencies[0].length > 1) {
			currentLineVal = UtilsService.getMultiDimColumnsTotals(xDimension.parts, yDimension.parts, cellFrequencies);
			currentColVal = UtilsService.getMultiDimLinesTotals(xDimension.parts, yDimension.parts, cellFrequencies);
		} else {
			currentLineVal = UtilsService.getColumnsTotals(xDimension.parts, yDimension.parts, cellFrequencies);
			currentColVal = UtilsService.getLinesTotals(xDimension.parts, yDimension.parts, cellFrequencies);
		}

		for (let i = 0; i < xLength; i++) {
			for (let j = 0; j < yLength; j++) {

				// cell definition
				const cell: CellVO = new CellVO();

				cell.xaxisPartValues = xAxisPartNames[i];
				cell.xaxisPart = xAxisPartNames[i].toString();
				cell.xDisplayaxisPart = this.formatAxisDisplayText(xAxisPartShortDescription, i, xDimension);
				cell.xnamePart = xDimension.name;

				cell.yaxisPartValues = yAxisPartNames[j];
				cell.yaxisPart = yAxisPartNames[j].toString();
				cell.yDisplayaxisPart = this.formatAxisDisplayText(yAxisPartShortDescription, j, yDimension);
				cell.ynamePart = yDimension.name;

				cell.setCoordValues(i, j, xValues, yValues);

				let currentIndex = 0;
				currentIndex = j * xLength + i;
				cell.setIndex(currentIndex);

				// Compute freqs
				if (zDimension.length > 0) {
					// Get dimensions parts
					// zDimension may be an array
					const dimensionParts = zDimension.map(e => e.parts);
					const maxParts = UtilsService.generateMaxParts(dimensionParts);
					const cellPartsCombinations = UtilsService.generateMatrixCombinations(maxParts.reverse());
					cell.cellFreqHash = UtilsService.generateHashFromArray(cellPartsCombinations);
				}

				if (cellInterests && cellInterests[currentIndex]) {
					cell.cellInterest = cellInterests[currentIndex];
				}
				if (cellTargetFrequencies && cellTargetFrequencies[currentIndex]) {
					// If target freq, cellFreq already computed into cellFrequencies
					cell.cellFreq = cellFrequencies[currentIndex];
				} else {
					if (Array.isArray(cellFrequencies[currentIndex])) {
						cell.cellFreq = UtilsService.arraySum(cellFrequencies[currentIndex]);
					} else {
						// if not an array (irisU for instance)
						cell.cellFreq = cellFrequencies[currentIndex];
					}
				}

				let matrixTotal = 0;

				let currentFrequencies;
				if (cellTargetFrequencies) {
					currentFrequencies = cellTargetFrequencies;
					cell.cellFreqs = currentFrequencies[currentIndex] || new Array(cellTargetFrequencies[0].length).fill(0);
				} else {
					currentFrequencies = cellFrequencies;
					if (Array.isArray(cellFrequencies[currentIndex])) {
						cell.cellFreqs = currentFrequencies[currentIndex] || [0];
					} else {
						// if not an array (irisU)
						cell.cellFreqs = [currentFrequencies[currentIndex]] || [0];
					}
				}

				// Get Cell freqs length
				let cellFreqsLength = 1; // 1 by default if not an array (irisU)
				if (Array.isArray(cell.cellFreqs)) {
					cellFreqsLength = cell.cellFreqs.length;
				}

				// Compute Frequencies
				if (cellFreqsLength === 1) {
					// KV or KC when no context
					matrixTotal = UtilsService.arraySum(currentLineVal);
					cell.matrixTotal.push(matrixTotal);

					// Compute mutual information
					const [MIij, MIijExtra] = UtilsService.computeMutualInfo(cell.cellFreq, matrixTotal, currentColVal[i], currentLineVal[j]);
					cell.infosMutValue.push(MIij);
					cell.infosMutExtra.push(MIijExtra);

					// Compute Prob values
					const cellProb = cell.cellFreq / currentColVal[i];
					cell.cellProbs.push(cellProb || 0);

					const cellProbRev = cell.cellFreq / currentLineVal[j];
					cell.cellProbsRev.push(cellProbRev || 0);

					cell.freqColVals.push(currentColVal[i] || 0);
					cell.freqLineVals.push(currentLineVal[j] || 0);

					// Compute Hellinger value
					const HIij = Math.sqrt(cell.cellFreq / matrixTotal) -
						Math.sqrt(currentColVal[i] / matrixTotal * currentLineVal[j] / matrixTotal);
					cell.cellHellingerValue.push(HIij || 0);
					cell.cellHellingerAbsoluteValue.push(Math.pow(HIij, 2) || 0);

				} else {
					// KC when context or KV with target case (iris2d for example)

					matrixTotal = UtilsService.sumArrayOfArray(currentFrequencies);
					const matrixTotalsByIndex = UtilsService.sumArrayItemsByIndex(currentFrequencies);
					cell.matrixTotal = matrixTotalsByIndex;
					const matrixMultiDimTotal = UtilsService.sumArrayItems(currentFrequencies);

					// Compute coverage from total
					cell.coverage = cell.cellFreq / matrixTotal;

					const cellsFreqsLength = cell.cellFreqs.length;
					for (let k = 0; k < cellsFreqsLength; k++) {

						// Compute mutual information
						const [MIij, MIijExtra] = UtilsService.computeMutualInfo(cell.cellFreqs[k], matrixMultiDimTotal[k], currentColVal[i][k], currentLineVal[j][k]);
						cell.infosMutValue.push(MIij);
						cell.infosMutExtra.push(MIijExtra);

						if (!Array.isArray(currentColVal[i])) {
							// KV with targets iris2d case
							const cellProb = cell.cellFreqs[k] / matrixTotalsByIndex[k];
							cell.cellProbs.push(cellProb || 0);

							const cellProbRev = cell.cellFreqs[k] / UtilsService.arraySum(currentFrequencies[currentIndex]);
							cell.cellProbsRev.push(cellProbRev || 0);

							cell.freqColVals.push(matrixTotalsByIndex[k] || 0);
							cell.freqLineVals.push(UtilsService.arraySum(currentFrequencies[currentIndex]) || 0);
						} else {
							// KC with context

							// Compute Hellinger value
							const HIij = Math.sqrt(cell.cellFreqs[k] / matrixMultiDimTotal[k]) -
								Math.sqrt(currentColVal[i][k] / matrixMultiDimTotal[k] * currentLineVal[j][k] / matrixMultiDimTotal[k]);
							cell.cellHellingerValue.push(HIij || 0);
							cell.cellHellingerAbsoluteValue.push(Math.pow(HIij, 2) || 0);

							// Compute Prob values
							const cellProb = cell.cellFreqs[k] / currentColVal[i][k];
							cell.cellProbs.push(cellProb || 0);
							const cellProbRev = cell.cellFreqs[k] / currentLineVal[j][k];
							cell.cellProbsRev.push(cellProbRev || 0);

							cell.freqColVals.push(currentColVal[i][k] || 0);
							cell.freqLineVals.push(currentLineVal[j][k] || 0);
						}

					}
				}

				cell.formatValues();

				// Add cell to array
				cells.push(cell);
			}
		}
		// var t1 = performance.now();
		// console.log("getCellDatas " + (t1 - t0) + " milliseconds.");
		// console.log("TCL: MatrixUtilsDatasService -> constructor -> cells", cells)
		return cells;
	}

	/**
	 * Get full frequency list sorted into n dimension array according to number of context
	 * @param zDimension An array of n contexts
	 */
	static getCellFrequencies(dimensionsParts, cellPartIndexes, inputCellFrequencies, zDimension = []) {

		// var t0 = performance.now();
		let res;

		// Construct hash from cellPartIndexes array
		const cellFreqHash = UtilsService.generateHashFromArray(cellPartIndexes);

		zDimension = Object.assign([], zDimension);

		// Generate array of array correpsonding to max parts of each dimension
		// Ex : 3,5,3 => [0, 1, 2],[0, 1, 2, 3, 4], [0, 1, 2]
		const maxParts = UtilsService.generateMaxParts(dimensionsParts);

		// Generate all possible combinations
		const cellPartsCombinations = UtilsService.generateMatrixCombinations(maxParts.reverse());

		// Get corresponding freq for each matrix cell
		const cellFrequencies: any[] = [];

		const cellPartsCombinationsLength = cellPartsCombinations.length;
		for (let i = 0; i < cellPartsCombinationsLength; i++) {
			const currentCellPartPosition = UtilsService.findArrayIntoHash(cellPartsCombinations[i], cellFreqHash);
			if (Array.isArray(inputCellFrequencies[0])) {
				// KV bivariate case
				cellFrequencies[i] = new Array(inputCellFrequencies[0].length).fill(0);
			} else {
				cellFrequencies[i] = 0;
			}
			if (currentCellPartPosition !== -1) {
				cellFrequencies[i] = inputCellFrequencies[currentCellPartPosition];
			}
		}
		res = cellFrequencies;

		// KC use case
		if (zDimension.length > 0) {
			// Get cell length according to all context parts
			let dimLength = 1;
			for (let i = 0; i < zDimension.length; i++) {
				dimLength = dimLength * zDimension[i].parts;
			}
			const cellsLength = cellFrequencies.length / dimLength;

			// Reconstruc the cells to have an array of array of freq
			const fullFreq: any[] = [];
			for (let i = 0; i < cellsLength; i++) {
				fullFreq[i] = [];
				for (let j = 0; j < dimLength; j++) {
					fullFreq[i].push(cellFrequencies[i + j * cellsLength]);
				}
			}
			res = fullFreq;
		}

		// var t1 = performance.now();
		// console.log("getCellFrequencies " + (t1 - t0) + " milliseconds.");
		// console.log("TCL: MatrixUtilsDatasService -> getCellFrequencies -> fullFreq", res)
		return res;
	}

}
