import { Injectable } from '@angular/core';
import { UtilsService } from '../providers/utils.service';
import { CellModel } from '../model/cell.model';
import { TYPES } from '@khiops-library/enum/types';

@Injectable({
  providedIn: 'root',
})
export class MatrixUtilsDatasService {
  /**
   * Generates standard axis values for the given x and y dimensions.
   *
   * This method processes the provided x and y dimensions to generate arrays of percentage values
   * based on their types (CATEGORICAL or NUMERICAL). It handles different use cases for each type,
   * including value groups, partitions, and intervals.
   *
   * @param xDimension - The dimension object for the x-axis, containing type and relevant data.
   * @param yDimension - The dimension object for the y-axis, containing type and relevant data.
   * @returns A tuple containing two arrays: the first array represents the x-axis values, and the second array represents the y-axis values.
   */
  static getStandardAxisValues(xDimension, yDimension): [number[], number[]] {
    let xValues: number[] = [];
    let yValues: number[] = [];
    if (xDimension.type === TYPES.CATEGORICAL) {
      let currentXAxisFullPart;
      if (xDimension.valueGroups) {
        currentXAxisFullPart = xDimension.valueGroups.map((e) => e.values); // KC use case
      } else {
        currentXAxisFullPart = xDimension.partition; // KV use case
      }
      const axisPartTotal =
        UtilsService.getArrayOfArrayLength(currentXAxisFullPart);
      xValues = UtilsService.generateArrayPercentsFromArrayLength(
        currentXAxisFullPart,
        axisPartTotal,
      );
    } else if (xDimension.type === TYPES.NUMERICAL) {
      let currentXAxisFullPart;
      if (xDimension.intervals) {
        currentXAxisFullPart = xDimension.intervals.map((e) => e.bounds); // KC use case
      } else {
        currentXAxisFullPart = xDimension.partition; // KV use case
      }
      // Give an interval of 5% if missing
      currentXAxisFullPart[0] =
        UtilsService.generateMissingInterval(currentXAxisFullPart);
      const axisPartTotal =
        UtilsService.getArrayMatrixInterval(currentXAxisFullPart);
      xValues =
        UtilsService.generateArrayPercentsFromArrayIntervalsAndTotalCount(
          currentXAxisFullPart,
          axisPartTotal,
        );
    }
    if (yDimension.type === TYPES.CATEGORICAL) {
      let currentYAxisFullPart;
      if (yDimension.valueGroups) {
        currentYAxisFullPart = yDimension.valueGroups.map((e) => e.values); // KC use case
      } else {
        currentYAxisFullPart = yDimension.partition; // KV use case
      }
      const axisPartTotal =
        UtilsService.getArrayOfArrayLength(currentYAxisFullPart);
      yValues = UtilsService.generateArrayPercentsFromArrayLength(
        currentYAxisFullPart,
        axisPartTotal,
      );
    } else if (yDimension.type === TYPES.NUMERICAL) {
      let currentYAxisFullPart;
      if (yDimension.intervals) {
        currentYAxisFullPart = yDimension.intervals.map((e) => e.bounds); // KC use case
      } else {
        currentYAxisFullPart = yDimension.partition; // KV use case
      }
      // Give an interval of 5% if missing
      currentYAxisFullPart[0] =
        UtilsService.generateMissingInterval(currentYAxisFullPart);
      const axisPartTotal =
        UtilsService.getArrayMatrixInterval(currentYAxisFullPart);
      yValues =
        UtilsService.generateArrayPercentsFromArrayIntervalsAndTotalCount(
          currentYAxisFullPart,
          axisPartTotal,
        );
    }

    // console.log("TCL: MatrixUtilsDatasService -> getStandardAxisValues -> [xValues, yValues]", [xValues, yValues])
    return [xValues, yValues];
  }

  /**
   * Computes the frequency axis values for the given dimensions and cell frequencies.
   *
   * @param xDimension - The x-axis dimension, which can be either categorical or numerical.
   * @param yDimension - The y-axis dimension, which can be either categorical or numerical.
   * @param cellFrequencies - The frequencies of the cells in the matrix.
   * @returns A tuple containing two arrays: the x-axis values and the y-axis values.
   */
  static getFrequencyAxisValues(
    xDimension,
    yDimension,
    cellFrequencies,
  ): [number[], number[]] {
    let xValues: number[] = [];
    let yValues: number[] = [];

    if (xDimension.type === TYPES.CATEGORICAL) {
      const currentLineVal = UtilsService.getLinesTotals(
        xDimension.parts,
        yDimension.parts,
        cellFrequencies,
      );
      xValues =
        UtilsService.generateArrayPercentsFromArrayValues(currentLineVal);
    } else if (xDimension.type === TYPES.NUMERICAL) {
      // Same behavior on KC and KV
      xValues = UtilsService.generateArrayPercentsFromArrayIntervals(
        xDimension.parts,
      );
    }
    if (yDimension.type === TYPES.CATEGORICAL) {
      const currentColVal = UtilsService.getColumnsTotals(
        xDimension.parts,
        yDimension.parts,
        cellFrequencies,
      );
      yValues =
        UtilsService.generateArrayPercentsFromArrayValues(currentColVal);
    } else if (yDimension.type === TYPES.NUMERICAL) {
      // Same behavior on KC and KV
      yValues = UtilsService.generateArrayPercentsFromArrayIntervals(
        yDimension.parts,
      );
    }

    return [xValues, yValues];
  }

  /**
   * Formats the display text for an axis part based on its short description, iteration index, and dimension type.
   *
   * @param axisPartShortDescription - An array containing the short descriptions of the axis parts.
   * @param iter - The current iteration index.
   * @param dimension - The dimension object which contains the type of the dimension.
   * @returns The formatted display text for the axis part.
   *
   * @remarks
   * - If the axis part short description at the given index is not a string:
   *   - For numerical dimensions, the description is enclosed in brackets. For non-zero iterations, the opening bracket is replaced with a closing bracket.
   *   - For other types, the description is joined into a string if it is an array, otherwise it is converted to a string.
   * - If the axis part short description at the given index is a string, it is returned as is.
   */
  static formatAxisDisplayText(axisPartShortDescription, iter, dimension) {
    let displayaxisPart;
    if (typeof axisPartShortDescription[iter] !== 'string') {
      // In KV we get an unformated array
      // We must format datas with opened or closed brackets
      if (dimension.type === TYPES.NUMERICAL) {
        displayaxisPart = '[' + axisPartShortDescription[iter].toString() + ']';
        // replace [ by ] for all indexes excepting 0
        if (iter !== 0) {
          // Closed bracket for the non 0 iters
          // displayaxisPart = displayaxisPart.replace('[', ']');
          // Code scanning alerts #2
          displayaxisPart = displayaxisPart.replace(/\[/g, ']');
        }
      } else {
        displayaxisPart = Array.isArray(axisPartShortDescription[iter])
          ? axisPartShortDescription[iter].join(', ')
          : axisPartShortDescription[iter].toString();
      }
    } else {
      // In KC we get a formated array
      // Do nothing
      displayaxisPart = axisPartShortDescription[iter];
    }
    return displayaxisPart;
  }

  /**
   * Generates cell data for a matrix visualization.
   *
   * @param xDimension - The x-axis dimension object containing parts and name.
   * @param yDimension - The y-axis dimension object containing parts and name.
   * @param zDimension - The z-axis dimension array containing parts and name.
   * @param xAxisPartNames - Array of names for the x-axis parts.
   * @param yAxisPartNames - Array of names for the y-axis parts.
   * @param xAxisPartShortDescription - Short description for the x-axis parts.
   * @param yAxisPartShortDescription - Short description for the y-axis parts.
   * @param cellFrequencies - Array of cell frequencies.
   * @param cellInterests - Array of cell interests.
   * @param cellTargetFrequencies - Array of target frequencies for the cells.
   * @param xValues - Array of x-axis values.
   * @param yValues - Array of y-axis values.
   * @returns An array of CellModel objects representing the cells in the matrix.
   */
  static getCellDatas(
    xDimension,
    yDimension,
    zDimension,
    xAxisPartNames,
    yAxisPartNames,
    xAxisPartShortDescription,
    yAxisPartShortDescription,
    cellFrequencies,
    cellInterests,
    cellTargetFrequencies,
    xValues,
    yValues,
  ) {
    // var t0 = performance.now();
    const cells: CellModel[] = [];

    const xLength = xDimension.parts;
    const yLength = yDimension.parts;

    let currentLineVal = [];
    let currentColVal = [0];

    if (Array.isArray(cellFrequencies[0]) && cellFrequencies[0].length > 1) {
      currentLineVal = UtilsService.getMultiDimColumnsTotals(
        xDimension.parts,
        yDimension.parts,
        cellFrequencies,
      );
      currentColVal = UtilsService.getMultiDimLinesTotals(
        xDimension.parts,
        yDimension.parts,
        cellFrequencies,
      );
    } else {
      currentLineVal = UtilsService.getColumnsTotals(
        xDimension.parts,
        yDimension.parts,
        cellFrequencies,
      );
      currentColVal = UtilsService.getLinesTotals(
        xDimension.parts,
        yDimension.parts,
        cellFrequencies,
      );
    }

    const isContextMatrix = zDimension.length > 0;
    let currentFrequencies;
    let matrixTotal = 0;
    let matrixTotalsByIndex;
    let matrixMultiDimTotal;
    let cellFreqHash;
    if (cellTargetFrequencies) {
      currentFrequencies = cellTargetFrequencies;
    } else {
      currentFrequencies = cellFrequencies;
    }
    if (isContextMatrix || cellTargetFrequencies) {
      matrixTotal = UtilsService.sumArrayOfArray(currentFrequencies);
      matrixTotalsByIndex =
        UtilsService.sumArrayItemsByIndex(currentFrequencies);
      matrixMultiDimTotal = UtilsService.sumArrayItems(currentFrequencies);
    } else {
      matrixTotal = UtilsService.arraySum(currentLineVal);
    }
    if (isContextMatrix) {
      // Get dimensions parts
      // zDimension may be an array
      const dimensionParts = zDimension.map((e) => e.parts);
      const maxParts = UtilsService.generateMaxParts(dimensionParts);
      const cellPartsCombinations = UtilsService.generateMatrixCombinations(
        maxParts.reverse(),
      );
      cellFreqHash = UtilsService.generateHashFromArray(cellPartsCombinations);
    }

    for (let i = 0; i < xLength; i++) {
      for (let j = 0; j < yLength; j++) {
        // cell definition
        const cell: CellModel = new CellModel();

        cell.xaxisPartValues = xAxisPartNames[i];
        cell.xaxisPart = xAxisPartNames[i].toString();
        cell.xDisplayaxisPart = this.formatAxisDisplayText(
          xAxisPartShortDescription,
          i,
          xDimension,
        );
        cell.xnamePart = xDimension.name;

        cell.yaxisPartValues = yAxisPartNames[j];
        cell.yaxisPart = yAxisPartNames[j].toString();
        cell.yDisplayaxisPart = this.formatAxisDisplayText(
          yAxisPartShortDescription,
          j,
          yDimension,
        );
        cell.ynamePart = yDimension.name;

        cell.setCoordValues(i, j, xValues, yValues);

        let currentIndex = 0;
        currentIndex = j * xLength + i;
        cell.setIndex(currentIndex);

        // Compute freqs
        if (isContextMatrix) {
          cell.cellFreqHash = cellFreqHash;
        }

        if (cellInterests?.[currentIndex]) {
          cell.cellInterest = cellInterests[currentIndex];
        }
        if (cellTargetFrequencies?.[currentIndex]) {
          // If target freq, cellFreq already computed into cellFrequencies
          cell.cellFreq = cellFrequencies[currentIndex];
        } else {
          if (Array.isArray(cellFrequencies[currentIndex])) {
            cell.cellFreq = UtilsService.arraySum(
              cellFrequencies[currentIndex],
            );
          } else {
            // if not an array (irisU for instance)
            cell.cellFreq = cellFrequencies[currentIndex];
          }
        }

        if (cellTargetFrequencies) {
          cell.cellFreqs =
            currentFrequencies[currentIndex] ||
            new Array(cellTargetFrequencies[0].length).fill(0);
        } else {
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
          cell.matrixTotal.push(matrixTotal);

          // Compute mutual information
          const [MIij, MIijExtra] = UtilsService.computeMutualInfo(
            cell.cellFreq,
            matrixTotal,
            currentColVal[i],
            currentLineVal[j],
          );
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
          const HIij =
            Math.sqrt(cell.cellFreq / matrixTotal) -
            Math.sqrt(
              ((currentColVal[i] / matrixTotal) * currentLineVal[j]) /
                matrixTotal,
            );
          cell.cellHellingerValue.push(HIij || 0);
          cell.cellHellingerAbsoluteValue.push(Math.pow(HIij, 2) || 0);
        } else {
          // KC when context or KV with target case (iris2d for example)

          cell.matrixTotal = matrixTotalsByIndex;

          // Compute coverage from total
          cell.coverage = cell.cellFreq / matrixTotal;

          const cellsFreqsLength = cell.cellFreqs.length;
          for (let k = 0; k < cellsFreqsLength; k++) {
            // Compute mutual information
            const [MIij, MIijExtra] = UtilsService.computeMutualInfo(
              cell.cellFreqs[k],
              matrixMultiDimTotal[k],
              currentColVal[i][k],
              currentLineVal[j][k],
            );
            cell.infosMutValue.push(MIij);
            cell.infosMutExtra.push(MIijExtra);

            if (!Array.isArray(currentColVal[i])) {
              // KV with targets iris2d case
              const cellProb = cell.cellFreqs[k] / matrixTotalsByIndex[k];
              cell.cellProbs.push(cellProb || 0);

              const cellProbRev =
                cell.cellFreqs[k] /
                UtilsService.arraySum(currentFrequencies[currentIndex]);
              cell.cellProbsRev.push(cellProbRev || 0);

              cell.freqColVals.push(matrixTotalsByIndex[k] || 0);
              cell.freqLineVals.push(
                UtilsService.arraySum(currentFrequencies[currentIndex]) || 0,
              );
            } else {
              // KC with context

              // Compute Hellinger value
              const HIij =
                Math.sqrt(cell.cellFreqs[k] / matrixMultiDimTotal[k]) -
                Math.sqrt(
                  ((currentColVal[i][k] / matrixMultiDimTotal[k]) *
                    currentLineVal[j][k]) /
                    matrixMultiDimTotal[k],
                );
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
    // console.log('file: matrix-utils-datas.service.ts:310 ~ MatrixUtilsDatasService ~ cells:', cells);
    return cells;
  }

  /**
   * Computes the cell frequencies for a given set of dimensions and cell part indexes.
   *
   * @param dimensionsParts - An array representing the parts of each dimension.
   * @param cellPartIndexes - An array of indexes representing the parts of each cell.
   * @param inputCellFrequencies - An array of input frequencies for each cell.
   * @param zDimension - An optional array representing additional dimensions (default is an empty array).
   * @returns An array of cell frequencies. If `zDimension` is provided, returns a nested array of frequencies.
   */
  static getCellFrequencies(
    dimensionsParts,
    cellPartIndexes,
    inputCellFrequencies,
    zDimension: any[] = [],
  ) {
    // var t0 = performance.now();
    let res;

    // Construct hash from cellPartIndexes array
    const cellFreqHash = UtilsService.generateHashFromArray(cellPartIndexes);

    zDimension = Object.assign([], zDimension);

    // Generate array of array correpsonding to max parts of each dimension
    // Ex : 3,5,3 => [0, 1, 2],[0, 1, 2, 3, 4], [0, 1, 2]
    const maxParts = UtilsService.generateMaxParts(dimensionsParts);

    // Generate all possible combinations
    const cellPartsCombinations = UtilsService.generateMatrixCombinations(
      maxParts.reverse(),
    );

    // Get corresponding freq for each matrix cell
    const cellFrequencies: any[] = [];

    const cellPartsCombinationsLength = cellPartsCombinations.length;
    for (let i = 0; i < cellPartsCombinationsLength; i++) {
      const currentCellPartPosition = UtilsService.findArrayIntoHash(
        cellPartsCombinations[i],
        cellFreqHash,
      );
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
