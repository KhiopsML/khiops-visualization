/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { UtilsService } from '../../providers/utils.service';
import { CellModel } from '../../model/cell.model';
import { TYPES } from '@khiops-library/enum/types';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
import { MatrixUiService } from './matrix.ui.service';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { MatrixValuesModel } from '@khiops-library/model/matrix-value.model';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { DimensionVisualizationModel } from '@khiops-library/model/dimension.visualization.model';

@Injectable({
  providedIn: 'root',
})
export class MatrixUtilsService {
  /**
   * Computes various matrix values based on the provided graph mode, input data, context selection, and selected target index.
   *
   * @param {MatrixModeI} graphMode - The mode of the graph which determines the type of computation to perform.
   * @param {any} inputDatas - The input data containing matrix cell data and other relevant information.
   * @param {any} contextSelection - The context selection used to filter or modify the computation.
   * @param {number} selectedTargetIndex - The index of the selected target, used in specific graph modes.
   *
   * @returns {Array<any>} An array containing:
   * - `matrixFreqsValues`: The computed frequency values for the matrix.
   * - `matrixValues`: The computed matrix values based on the graph mode.
   * - `matrixExtras`: Additional computed values for certain graph modes.
   * - `matrixExpectedFreqsValues`: The expected frequency values for the matrix cells.
   */
  static computeMatrixValues(
    graphMode: MatrixModeI,
    matrixCellDatas: CellModel[],
    contextSelection: number[][] | undefined,
    selectedTargetIndex: number,
  ): [
    number[],
    number[] | undefined,
    number[] | boolean[] | undefined,
    number[],
  ] {
    let matrixFreqsValues: number[];
    let matrixValues: number[] | undefined;
    let matrixExtras: number[] | boolean[] | undefined;
    let matrixExpectedFreqsValues: number[];

    if (contextSelection && contextSelection.length > 0) {
      // KC use case

      // Copy context to reverse it without keeping refs
      const currentContext = Object.assign([], contextSelection);

      // Generate combinations for current context selections (selection can be [] when folders are selected)
      const cellCombinations = UtilsService.generateMatrixCombinations(
        currentContext.reverse(),
      );

      // Compute all positions according to combinations
      const partPositions: number[] = [];
      const cellCombinationsLength = cellCombinations.length;
      for (let i = 0; i < cellCombinationsLength; i++) {
        const currentCellPartPosition = UtilsService.findArrayIntoHash(
          cellCombinations[i],
          matrixCellDatas[0]?.cellFreqHash,
        );
        partPositions.push(currentCellPartPosition);
      }

      const partPositionsLength = partPositions.length;
      // Always compute freqs for distribution graph datas
      matrixFreqsValues = matrixCellDatas.map((e) => {
        let res = 0;
        for (let i = 0; i < partPositionsLength; i++) {
          // @ts-ignore
          res = res + e.cellFreqs[partPositions[i]]; // values are added
        }
        return res;
      });

      if (graphMode.mode === MATRIX_MODES.FREQUENCY) {
        matrixValues = matrixFreqsValues;
      } else {
        // Map current matrix datas to freq values correpsonding to current part positions
        let res = 0;
        let matrixTotal: number | undefined = 0;
        let cellFreqs: number | undefined = 0;
        let freqColVals: number | undefined = 0;
        let freqLineVals: number | undefined = 0;
        switch (graphMode.mode) {
          case MATRIX_MODES.MUTUAL_INFO:
            matrixValues = matrixCellDatas.map((e) => {
              [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              let [MIij, _MIijExtra] = UtilsService.computeMutualInfo(
                cellFreqs,
                matrixTotal,
                freqColVals,
                freqLineVals,
              );
              return MIij || 0;
            });
            matrixExtras = matrixCellDatas.map((e: CellModel) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              let [_MIij, MIijExtra] = UtilsService.computeMutualInfo(
                cellFreqs,
                matrixTotal,
                freqColVals,
                freqLineVals,
              );
              return MIijExtra;
            });
            break;
          case MATRIX_MODES.HELLINGER:
            matrixValues = matrixCellDatas.map((e) => {
              [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              const [hellingerValue, _hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  cellFreqs,
                  matrixTotal,
                  freqColVals,
                  freqLineVals,
                );
              res = hellingerValue;
              return res || 0;
            });
            matrixExtras = matrixCellDatas.map((e: CellModel) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              const [_hellingerValue, hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  cellFreqs,
                  matrixTotal,
                  freqColVals,
                  freqLineVals,
                );
              return hellingerAbsoluteValue;
            });
            break;
          case MATRIX_MODES.PROB_CELL:
            matrixValues = matrixCellDatas.map((e) => {
              let [_matrixTotal, cellFreqs, freqColVals, __freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              return isNaN(cellFreqs! / freqColVals!)
                ? 0
                : cellFreqs! / freqColVals!;
            });
            break;
          case MATRIX_MODES.PROB_CELL_REVERSE:
            matrixValues = matrixCellDatas.map((e) => {
              let [_matrixTotal, cellFreqs, _freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              return isNaN(cellFreqs! / freqLineVals!)
                ? 0
                : cellFreqs! / freqLineVals!;
            });
            break;
        }
      }

      // Compute expected cell frequencies
      matrixExpectedFreqsValues = matrixCellDatas.map((e: CellModel) => {
        let [matrixTotal, _cellFreqs, freqColVals, freqLineVals] =
          this.computeValsByContext(e, partPositions, partPositionsLength);
        let ef = UtilsService.computeExpectedFrequency(
          matrixTotal,
          freqColVals,
          freqLineVals,
        );
        return ef;
      });
    } else {
      if (selectedTargetIndex !== -1) {
        matrixFreqsValues = matrixCellDatas.map(
          (e) => e.cellFreqs[selectedTargetIndex] || 0,
        );
      } else {
        const cellFreqs = matrixCellDatas.map((e) => e.cellFreqs);
        matrixFreqsValues = UtilsService.sumArrayItemsOfArray(cellFreqs);
      }

      if (
        graphMode.mode === MATRIX_MODES.FREQUENCY ||
        graphMode.mode === MATRIX_MODES.CONDITIONAL_FREQUENCY
      ) {
        matrixValues = matrixFreqsValues;
      } else {
        // 2 dim without context or with target : iris2d
        switch (graphMode.mode) {
          case MATRIX_MODES.MUTUAL_INFO:
            matrixValues = matrixCellDatas.map((e) => {
              let [MIij, _MIijExtra] = UtilsService.computeMutualInfo(
                e.cellFreqs[0],
                e.matrixTotal![0],
                e.freqColVals[0],
                e.freqLineVals[0],
              );
              return MIij || 0;
            });
            matrixExtras = matrixCellDatas.map((e) => {
              let [_MIij, MIijExtra] = UtilsService.computeMutualInfo(
                e.cellFreqs[0],
                e.matrixTotal![0],
                e.freqColVals[0],
                e.freqLineVals[0],
              );
              return MIijExtra;
            });
            break;
          case MATRIX_MODES.HELLINGER:
            matrixValues = matrixCellDatas.map((e) => {
              const [hellingerValue, _hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  e.cellFreqs[0],
                  e.matrixTotal![0],
                  e.freqColVals[0],
                  e.freqLineVals[0],
                );
              return hellingerValue || 0;
            });
            matrixExtras = matrixCellDatas.map((e) => {
              const [_hellingerValue, hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  e.cellFreqs[0],
                  e.matrixTotal![0],
                  e.freqColVals[0],
                  e.freqLineVals[0],
                );
              return hellingerAbsoluteValue || 0;
            });
            break;
          case MATRIX_MODES.PROB_CELL:
            matrixValues = matrixCellDatas.map((e) => {
              return isNaN(e.cellFreqs[0]! / e.freqColVals[0]!)
                ? 0
                : e.cellFreqs[0]! / e.freqColVals[0]!;
            });
            break;
          case MATRIX_MODES.PROB_CELL_REVERSE:
            matrixValues = matrixCellDatas.map((e) => {
              return isNaN(e.cellFreqs[0]! / e.freqLineVals[0]!)
                ? 0
                : e.cellFreqs[0]! / e.freqLineVals[0]!;
            });
            break;
          case MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL:
            for (let i = 0; i < matrixCellDatas[0]!.cellFreqs.length; i++) {
              const currentMatrixValues = matrixCellDatas.map((e) => {
                const [MIij, _MIijExtra] = UtilsService.computeMutualInfo(
                  e.cellFreqs[i],
                  UtilsService.arraySum(e.matrixTotal),
                  e.freqColVals[i],
                  e.freqLineVals[i],
                );
                return MIij || 0;
              });
              if (i === selectedTargetIndex) {
                matrixValues = currentMatrixValues;
              }
            }
            matrixExtras = matrixCellDatas.map((e) => {
              const [_MIij, MIijExtra] = UtilsService.computeMutualInfo(
                e.cellFreqs[selectedTargetIndex],
                UtilsService.arraySum(e.matrixTotal),
                e.freqColVals[selectedTargetIndex],
                e.freqLineVals[selectedTargetIndex],
              );
              return MIijExtra;
            });
            break;
          case MATRIX_MODES.PROB_TARGET_WITH_CELL:
            // Only on KV do not need to recompute because nodes can not be folded
            if (selectedTargetIndex !== -1) {
              matrixValues = matrixCellDatas.map(
                (e) => e.cellProbsRev[selectedTargetIndex] || 0,
              );
            }
            break;
          case MATRIX_MODES.PROB_CELL_WITH_TARGET:
            // Only on KV do not need to recompute because nodes can not be folded
            if (selectedTargetIndex !== -1) {
              matrixValues = matrixCellDatas.map(
                (e) => e.cellProbs[selectedTargetIndex] || 0,
              );
            }
            break;
        }
      }

      // Compute expected cell frequencies
      matrixExpectedFreqsValues = matrixCellDatas.map((e: CellModel) => {
        let ef;
        let matrixTotal: number | undefined = 0;
        if (Array.isArray(e.matrixTotal)) {
          matrixTotal = e.matrixTotal[0];
        } else {
          matrixTotal = e.matrixTotal;
        }
        ef = UtilsService.computeExpectedFrequency(
          matrixTotal,
          e.freqColVals[0],
          e.freqLineVals[0],
        );

        return ef;
      });
    }

    return [
      matrixFreqsValues,
      matrixValues,
      matrixExtras,
      matrixExpectedFreqsValues,
    ];
  }

  /**
   * Computes the total values for matrix, cell frequencies, column frequencies, and line frequencies
   * based on the provided context and part positions.
   *
   * @param e - The context object containing matrixTotal, cellFreqs, freqColVals, and freqLineVals arrays.
   * @param partPositions - An array of indices representing the positions to be considered in the computation.
   * @param partPositionsLength - The length of the partPositions array.
   * @returns An array containing the computed totals in the following order:
   *          [matrixTotal, cellFreqs, freqColVals, freqLineVals].
   */
  static computeValsByContext(
    e: CellModel,
    partPositions: number[],
    partPositionsLength: number,
  ): number[] {
    let matrixTotal = 0;
    let cellFreqs = 0;
    let freqColVals = 0;
    let freqLineVals = 0;
    for (let i = 0; i < partPositionsLength; i++) {
      matrixTotal = matrixTotal + e.matrixTotal![partPositions[i]!]!;
      cellFreqs = cellFreqs + e.cellFreqs[partPositions[i]!]!;
      freqColVals = freqColVals + e.freqColVals[partPositions[i]!]!;
      freqLineVals = freqLineVals + e.freqLineVals[partPositions[i]!]!;
    }
    return [matrixTotal, cellFreqs, freqColVals, freqLineVals];
  }

  /**
   * Generates standard axis values for covisualization based on the provided dimension.
   *
   * @param {DimensionCovisualizationModel} dimension - The dimension object containing either categorical or numerical data.
   * @returns {number[]} An array of axis values calculated as percentages.
   */
  static getStandardCovisualizationAxisValues(
    dimension: DimensionCovisualizationModel,
  ): number[] {
    let axisValues: number[] = [];
    let currentAxisFullPart: any;
    if (dimension.type === TYPES.CATEGORICAL) {
      currentAxisFullPart = dimension.valueGroups?.map((e) => e.values);
      const axisPartTotal =
        UtilsService.getArrayOfArrayLength(currentAxisFullPart);
      axisValues = UtilsService.generateArrayPercentsFromArrayLength(
        currentAxisFullPart!,
        axisPartTotal,
      );
    } else if (dimension.type === TYPES.NUMERICAL) {
      currentAxisFullPart = dimension.intervals?.map((e) => e.bounds);
      // Give an interval of 5% if missing
      currentAxisFullPart[0] = UtilsService.generateMissingInterval(
        currentAxisFullPart!,
      );
      const axisPartTotal = UtilsService.getArrayMatrixInterval(
        currentAxisFullPart!,
      );
      axisValues =
        UtilsService.generateArrayPercentsFromArrayIntervalsAndTotalCount(
          currentAxisFullPart!,
          axisPartTotal,
        );
    }
    return axisValues;
  }

  /**
   * Generates standard axis values for visualization based on the provided dimension.
   *
   * @param {DimensionVisualizationModel} dimension - The dimension object containing either categorical or numerical data.
   * @returns {number[]} An array of axis values calculated as percentages.
   */
  static getStandardVisualizationAxisValues(
    dimension: DimensionVisualizationModel,
    dimensionValues: number,
  ): number[] {
    let axisValues: number[] = [];
    let currentAxisFullPart: any;
    if (dimension.type === TYPES.CATEGORICAL) {
      currentAxisFullPart = dimension.partition;
      if (dimensionValues) {
        // Regression use case
        axisValues =
          UtilsService.generateArrayPercentsFromArrayLengthAndDefaultGroupIndex(
            currentAxisFullPart,
            dimensionValues,
            dimension?.defaultGroupIndex,
          );
      } else {
        const axisPartTotal =
          UtilsService.getArrayOfArrayLength(currentAxisFullPart);
        // Co-occurence use case
        axisValues = UtilsService.generateArrayPercentsFromArrayLength(
          currentAxisFullPart,
          axisPartTotal,
        );
      }
    } else if (dimension.type === TYPES.NUMERICAL) {
      currentAxisFullPart = dimension.partition;
      // Give an interval of 5% if missing
      currentAxisFullPart[0] =
        UtilsService.generateMissingInterval(currentAxisFullPart);
      const axisPartTotal =
        UtilsService.getArrayMatrixInterval(currentAxisFullPart);
      axisValues =
        UtilsService.generateArrayPercentsFromArrayIntervalsAndTotalCount(
          currentAxisFullPart,
          axisPartTotal,
        );
    }
    return axisValues;
  }

  static getFrequencyAxisValues(
    xDimension: DimensionCovisualizationModel | DimensionVisualizationModel,
    yDimension: DimensionCovisualizationModel | DimensionVisualizationModel,
    cellFrequencies: number[] | number[][],
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
    xDimension: DimensionCovisualizationModel | DimensionVisualizationModel,
    yDimension: DimensionCovisualizationModel | DimensionVisualizationModel,
    zDimension: DimensionCovisualizationModel[],
    xAxisPartNames: string[] | number[][], // KC: string[], KV: number[][]
    yAxisPartNames: string[] | number[][], // KC: string[], KV: number[][]
    xAxisPartShortDescription: string[] | number[][], // KC: string[], KV: number[][]
    yAxisPartShortDescription: string[] | number[][], // KC: string[], KV: number[][]
    cellFrequencies: number[] | number[][],
    cellInterests: number[] | undefined, // KC: undefined
    cellTargetFrequencies: number[][] | undefined, // KC: undefined
    xValues: MatrixValuesModel,
    yValues: MatrixValuesModel,
  ): CellModel[] {
    // var t0 = performance.now();
    const cells: CellModel[] = [];

    const xLength = xDimension.parts;
    const yLength = yDimension.parts;

    let currentLineVal: any[] = [];
    let currentColVal: any[] = [0];

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
    let currentFrequencies: any;
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
        cell.xaxisPart = xAxisPartNames[i]!.toString();
        cell.xDisplayaxisPart = MatrixUiService.formatAxisDisplayText(
          xAxisPartShortDescription,
          i,
          xDimension.type,
        );
        cell.xnamePart = xDimension.name;

        cell.yaxisPartValues = yAxisPartNames[j];
        cell.yaxisPart = yAxisPartNames[j]!.toString();
        cell.yDisplayaxisPart = MatrixUiService.formatAxisDisplayText(
          yAxisPartShortDescription,
          j,
          yDimension.type,
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

        const currentCellFreq = cellFrequencies[currentIndex];
        if (
          cellTargetFrequencies?.[currentIndex] &&
          !Array.isArray(currentCellFreq)
        ) {
          // If target freq, cellFreq already computed into cellFrequencies
          cell.cellFreq = currentCellFreq;
        } else {
          if (Array.isArray(currentCellFreq)) {
            cell.cellFreq = UtilsService.arraySum(
              cellFrequencies[currentIndex],
            );
          } else {
            // if not an array (irisU for instance)
            cell.cellFreq = currentCellFreq;
          }
        }

        if (cellTargetFrequencies) {
          cell.cellFreqs =
            currentFrequencies[currentIndex] ||
            new Array(cellTargetFrequencies[0]!.length).fill(0);
        } else {
          if (Array.isArray(cellFrequencies[currentIndex])) {
            cell.cellFreqs = currentFrequencies[currentIndex] || [0];
          } else {
            // if not an array (irisU)
            cell.cellFreqs = (currentFrequencies[currentIndex] && [
              currentFrequencies[currentIndex],
            ]) || [0];
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
          cell.matrixTotal!.push(matrixTotal);

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
          const cellProb = cell.cellFreq! / currentColVal[i];
          cell.cellProbs.push(cellProb || 0);

          const cellProbRev = cell.cellFreq! / currentLineVal[j];
          cell.cellProbsRev.push(cellProbRev || 0);

          cell.freqColVals.push(currentColVal[i] || 0);
          cell.freqLineVals.push(currentLineVal[j] || 0);

          // Compute Hellinger value
          const HIij =
            Math.sqrt(cell.cellFreq! / matrixTotal) -
            Math.sqrt(
              ((currentColVal[i] / matrixTotal) * currentLineVal[j]) /
                matrixTotal,
            );
          cell.cellHellingerValue.push(HIij || 0);
          cell.cellHellingerAbsoluteValue.push(Math.pow(HIij, 2) || 0);
        } else {
          // KC when context or KV with target case (iris2d for example)

          // @ts-ignore
          cell.matrixTotal = matrixTotalsByIndex;

          // Compute coverage from total
          cell.coverage = cell.cellFreq! / matrixTotal;

          const cellsFreqsLength = cell.cellFreqs.length;
          for (let k = 0; k < cellsFreqsLength; k++) {
            // Compute mutual information
            const [MIij, MIijExtra] = UtilsService.computeMutualInfo(
              cell.cellFreqs[k],
              matrixMultiDimTotal![k],
              currentColVal[i][k],
              currentLineVal[j][k],
            );
            cell.infosMutValue.push(MIij);
            cell.infosMutExtra.push(MIijExtra);

            if (!Array.isArray(currentColVal[i])) {
              // KV with targets iris2d case
              const cellProb = cell.cellFreqs[k]! / matrixTotalsByIndex![k];
              cell.cellProbs.push(cellProb || 0);

              const cellProbRev =
                cell.cellFreqs[k]! /
                UtilsService.arraySum(currentFrequencies[currentIndex]);
              cell.cellProbsRev.push(cellProbRev || 0);

              cell.freqColVals.push(matrixTotalsByIndex![k] || 0);
              cell.freqLineVals.push(
                UtilsService.arraySum(currentFrequencies[currentIndex]) || 0,
              );
            } else {
              // KC with context

              // Compute Hellinger value
              const HIij =
                Math.sqrt(cell.cellFreqs[k]! / matrixMultiDimTotal![k]) -
                Math.sqrt(
                  ((currentColVal[i][k] / matrixMultiDimTotal![k]) *
                    currentLineVal[j][k]) /
                    matrixMultiDimTotal![k],
                );
              cell.cellHellingerValue.push(HIij || 0);
              cell.cellHellingerAbsoluteValue.push(Math.pow(HIij, 2) || 0);

              // Compute Prob values
              const cellProb = cell.cellFreqs[k]! / currentColVal[i][k];
              cell.cellProbs.push(cellProb || 0);
              const cellProbRev = cell.cellFreqs[k]! / currentLineVal[j][k];
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
    // console.log("TCL: MatrixUtilsService -> constructor -> cells", cells)
    // console.log('file: matrix-utils-datas.service.ts:310 ~ MatrixUtilsService ~ cells:', cells);
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
    dimensionsParts: number[],
    cellPartIndexes: number[][],
    inputCellFrequencies: number[] | number[][], // KC: number[], KV: number[][]
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
    // console.log("TCL: MatrixUtilsService -> getCellFrequencies -> fullFreq", res)
    return res;
  }

  /**
   * Retrieves the minimum and maximum values from the provided matrix values based on the specified graph mode.
   * If `minMaxValues` is not provided, it calculates the min and max values from `matrixValues`.
   * Depending on the `mode`, it may adjust these values using specific methods from `UtilsService`.
   *
   * @param matrixValues - The array of values from which to determine the min and max.
   * @param minMaxValues - An optional object containing precomputed min and max values for different modes.
   * @param mode - The mode to determine how to process the min and max values. Can be 'MUTUAL_INFO' or 'HELLINGER'.
   *
   * @returns A tuple containing the min and max values. If the mode is 'HELLINGER', it also returns adjusted min and max values.
   */
  static getMinAndMaxFromGraphMode(
    matrixValues: number[],
    minMaxValues: DynamicI,
    mode: string,
  ) {
    let minVal: number | undefined;
    let maxVal: number | undefined;
    let minValH: number | undefined;
    let maxValH: number | undefined;

    if (!minMaxValues) {
      [minVal, maxVal] = UtilsService.getMinAndMaxFromArray(matrixValues);

      if (mode === MATRIX_MODES.MUTUAL_INFO) {
        [minVal, maxVal] = UtilsService.averageMinAndMaxValues(minVal, maxVal);
      }
      if (mode === MATRIX_MODES.HELLINGER) {
        // For KC purpose
        [minValH, maxValH] = UtilsService.averageMinAndMaxValues(
          minVal!,
          maxVal!,
        );
      }
    } else {
      // For KV purpose
      [minVal, maxVal] = minMaxValues[mode];
    }
    return [minVal, maxVal, minValH, maxValH];
  }

  /**
   * Computes the total mutual information for the given matrix values.
   *
   * This method calculates the sum of the matrix values if the mode is 'MUTUAL_INFO'
   * and the isKhiopsCovisu flag is true. Otherwise, it returns 0.
   *
   * @param {number[]} matrixValues - An array of matrix values to be summed.
   * @param {string} mode - The mode of the computation, expected to be 'MUTUAL_INFO'.
   * @param {boolean} isKhiopsCovisu - A flag indicating whether the computation is for Khiops Covisu.
   *
   * @returns {number} The total mutual information if conditions are met, otherwise 0.
   */
  static computeTotalMutInfo(
    matrixValues: number[],
    mode: string,
    isKhiopsCovisu: boolean,
  ) {
    let totalMutInfo;
    if (mode === MATRIX_MODES.MUTUAL_INFO && isKhiopsCovisu) {
      // Compute total mutual info
      totalMutInfo =
        mode === MATRIX_MODES.MUTUAL_INFO
          ? UtilsService.arraySum(matrixValues)
          : 0;
    }
    return totalMutInfo;
  }
}
