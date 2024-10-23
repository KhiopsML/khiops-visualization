import { Injectable } from '@angular/core';
import { UtilsService } from '../../providers/utils.service';
import { CellModel } from '../../model/cell.model';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { MatrixCoordI } from '@khiops-library/interfaces/matrix-coord';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
import { TYPES } from '@khiops-library/enum/types';

@Injectable({
  providedIn: 'root',
})
export class MatrixService {
  static readonly hot: string[] = [
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
    '#000000',
  ];

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
    inputDatas: any,
    contextSelection: any,
    selectedTargetIndex: number,
  ) {
    let matrixFreqsValues;
    let matrixValues;
    let matrixExtras;
    let matrixExpectedFreqsValues;

    if (contextSelection && contextSelection.length > 0) {
      // KC use case

      // Copy context to reverse it without keeping refs
      const currentContext = Object.assign([], contextSelection);

      // Generate combinations for current context selections (selection can be [] when folders are selected)
      const cellCombinations = UtilsService.generateMatrixCombinations(
        currentContext.reverse(),
      );

      // Compute all positions according to combinations
      const partPositions = [];
      const cellCombinationsLength = cellCombinations.length;
      for (let i = 0; i < cellCombinationsLength; i++) {
        const currentCellPartPosition = UtilsService.findArrayIntoHash(
          cellCombinations[i],
          inputDatas.matrixCellDatas[0].cellFreqHash,
        );
        partPositions.push(currentCellPartPosition);
      }

      const partPositionsLength = partPositions.length;
      // Always compute freqs for distribution graph datas
      matrixFreqsValues = inputDatas.matrixCellDatas.map((e) => {
        let res = 0;
        for (let i = 0; i < partPositionsLength; i++) {
          res = res + e.cellFreqs[partPositions[i]]; // values are added
        }
        return res;
      });

      if (graphMode.mode === MATRIX_MODES.FREQUENCY) {
        matrixValues = matrixFreqsValues;
      } else {
        // Map current matrix datas to freq values correpsonding to current part positions
        let res = 0;
        let matrixTotal = 0;
        let cellFreqs = 0;
        let freqColVals = 0;
        let freqLineVals = 0;
        switch (graphMode.mode) {
          case MATRIX_MODES.MUTUAL_INFO:
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              let [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                cellFreqs,
                matrixTotal,
                freqColVals,
                freqLineVals,
              );
              return MIij || 0;
            });
            matrixExtras = inputDatas.matrixCellDatas.map((e: CellModel) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              let [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                cellFreqs,
                matrixTotal,
                freqColVals,
                freqLineVals,
              );
              return MIijExtra;
            });
            break;
          case MATRIX_MODES.HELLINGER:
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              const [hellingerValue, hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  cellFreqs,
                  matrixTotal,
                  freqColVals,
                  freqLineVals,
                );
              res = hellingerValue;
              return res || 0;
            });
            matrixExtras = inputDatas.matrixCellDatas.map((e: CellModel) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              const [hellingerValue, hellingerAbsoluteValue] =
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
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              return isNaN(cellFreqs / freqColVals)
                ? 0
                : cellFreqs / freqColVals;
            });
            break;
          case MATRIX_MODES.PROB_CELL_REVERSE:
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
                this.computeValsByContext(
                  e,
                  partPositions,
                  partPositionsLength,
                );
              return isNaN(cellFreqs / freqLineVals)
                ? 0
                : cellFreqs / freqLineVals;
            });
            break;
          // Only on KV
          case MATRIX_MODES.CELL_INTEREST:
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              for (let i = 0; i < partPositionsLength; i++) {
                res = res + e.cellInterest[partPositions[i]];
              }
              return res || 0;
            });
            break;
        }
      }

      // Compute expected cell frequencies
      matrixExpectedFreqsValues = inputDatas.matrixCellDatas.map(
        (e: CellModel) => {
          let [matrixTotal, cellFreqs, freqColVals, freqLineVals] =
            this.computeValsByContext(e, partPositions, partPositionsLength);
          let ef = UtilsService.computeExpectedFrequency(
            matrixTotal,
            freqColVals,
            freqLineVals,
          );
          return ef;
        },
      );
    } else {
      // Always compute freqs for distribution graph datas
      matrixFreqsValues = inputDatas.matrixCellDatas.map((e) => e.cellFreqs);
      if (selectedTargetIndex !== -1) {
        matrixFreqsValues = inputDatas.matrixCellDatas.map(
          (e) => e.cellFreqs[selectedTargetIndex] || 0,
        );
      } else {
        matrixFreqsValues =
          UtilsService.sumArrayItemsOfArray(matrixFreqsValues);
      }

      if (
        graphMode.mode === MATRIX_MODES.FREQUENCY ||
        graphMode.mode === MATRIX_MODES.FREQUENCY_CELL
      ) {
        matrixValues = matrixFreqsValues;
      } else {
        // 2 dim without context or with target : iris2d
        switch (graphMode.mode) {
          case MATRIX_MODES.MUTUAL_INFO:
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              let [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                e.cellFreqs[0],
                e.matrixTotal[0],
                e.freqColVals[0],
                e.freqLineVals[0],
              );
              return MIij || 0;
            });
            matrixExtras = inputDatas.matrixCellDatas.map((e) => {
              let [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                e.cellFreqs[0],
                e.matrixTotal[0],
                e.freqColVals[0],
                e.freqLineVals[0],
              );
              return MIijExtra;
            });
            break;
          case MATRIX_MODES.HELLINGER:
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              const [hellingerValue, hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  e.cellFreqs[0],
                  e.matrixTotal[0],
                  e.freqColVals[0],
                  e.freqLineVals[0],
                );
              return hellingerValue || 0;
            });
            matrixExtras = inputDatas.matrixCellDatas.map((e) => {
              const [hellingerValue, hellingerAbsoluteValue] =
                UtilsService.computeHellinger(
                  e.cellFreqs[0],
                  e.matrixTotal[0],
                  e.freqColVals[0],
                  e.freqLineVals[0],
                );
              return hellingerAbsoluteValue || 0;
            });
            break;
          case MATRIX_MODES.PROB_CELL:
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              return isNaN(e.cellFreqs[0] / e.freqColVals[0])
                ? 0
                : e.cellFreqs[0] / e.freqColVals[0];
            });
            break;
          case MATRIX_MODES.PROB_CELL_REVERSE:
            matrixValues = inputDatas.matrixCellDatas.map((e) => {
              return isNaN(e.cellFreqs[0] / e.freqLineVals[0])
                ? 0
                : e.cellFreqs[0] / e.freqLineVals[0];
            });
            break;
          case MATRIX_MODES.CELL_INTEREST:
            // Only on KV do not need to recompute because nodes can not be folded
            matrixValues = inputDatas.matrixCellDatas.map(
              (e) => e.cellInterest,
            );
            break;
          case MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL:
            for (
              let i = 0;
              i < inputDatas.matrixCellDatas[0].cellFreqs.length;
              i++
            ) {
              const currentMatrixValues = inputDatas.matrixCellDatas.map(
                (e) => {
                  const [MIij, MIijExtra] = UtilsService.computeMutualInfo(
                    e.cellFreqs[i],
                    UtilsService.arraySum(e.matrixTotal),
                    e.freqColVals[i],
                    e.freqLineVals[i],
                  );
                  return MIij || 0;
                },
              );
              if (i === selectedTargetIndex) {
                matrixValues = currentMatrixValues;
              }
            }
            matrixExtras = inputDatas.matrixCellDatas.map((e) => {
              const [MIij, MIijExtra] = UtilsService.computeMutualInfo(
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
              matrixValues = inputDatas.matrixCellDatas.map(
                (e) => e.cellProbsRev[selectedTargetIndex] || 0,
              );
            }
            break;
          case MATRIX_MODES.PROB_CELL_WITH_TARGET:
            // Only on KV do not need to recompute because nodes can not be folded
            if (selectedTargetIndex !== -1) {
              matrixValues = inputDatas.matrixCellDatas.map(
                (e) => e.cellProbs[selectedTargetIndex] || 0,
              );
            }
            break;
        }
      }

      // Compute expected cell frequencies
      matrixExpectedFreqsValues = inputDatas.matrixCellDatas.map((e) => {
        let ef;
        if (Array.isArray(e.matrixTotal)) {
          ef = UtilsService.computeExpectedFrequency(
            e.matrixTotal[0],
            e.freqColVals[0],
            e.freqLineVals[0],
          );
        } else {
          ef = UtilsService.computeExpectedFrequency(
            e.matrixTotal,
            e.freqColVals,
            e.freqLineVals,
          );
        }

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
    partPositions,
    partPositionsLength,
  ): number[] {
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

  /**
   * Generates a linear gradient string representing the frequency colors legend.
   *
   * This method constructs a CSS linear gradient string that transitions through
   * the colors defined in the `hot` array. Each color is spaced evenly based on
   * the length of the array.
   *
   * @returns {string} A CSS linear gradient string.
   */
  static getFrequencyColorsLegend(): string {
    let strHex = `linear-gradient(
			to top,`;
    for (let i = 0; i < this.hot.length; i++) {
      strHex += this.hot[i] + ' ' + (i * 100) / this.hot.length + '%';
      if (i !== this.hot.length - 1) {
        strHex += ',';
      }
    }
    strHex += ')';
    return strHex;
  }

  /**
   * Generates a CSS linear gradient string representing a color legend.
   *
   * The gradient transitions from red at the top (0%) to white in the middle (50%),
   * and finally to blue at the bottom (100%).
   *
   * @returns {string} A CSS linear gradient string.
   */
  static getInterestColorsLegend(): string {
    return `linear-gradient(
			to bottom,
			#ff0000 0%,
			#ffffff 50%,
			#0000ff 100%
			)`;
  }

  /**
   * Generates a map of frequency colors based on the `hot` color array.
   * Each color is converted from hex to RGB and associated with a percentage.
   *
   * @returns {Array<{ pct: number, color: { r: number, g: number, b: number } }>}
   * An array of objects where each object contains a percentage (`pct`) and a color in RGB format.
   */
  static getFrequencyColors() {
    const hotLength = this.hot.length;
    const map = new Array(hotLength);
    for (let i = 0; i < hotLength; i++) {
      const rgb = UtilsService.hexToRgb(this.hot[i]);
      map[i] = {
        pct: i / 10,
        color: {
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
        },
      };
    }
    return map;
  }

  /**
   * Returns an array of color objects representing a gradient based on the input value.
   *
   * @param isPositiveValue - A boolean indicating whether the value is positive or not.
   * @returns An array of objects, each containing a percentage (`pct`) and a color (`color`).
   *          The color object includes red (`r`), green (`g`), and blue (`b`) components.
   *          If `isPositiveValue` is true, the gradient ranges from white to red.
   *          If `isPositiveValue` is false, the gradient ranges from white to blue.
   */
  static getInterestColors(isPositiveValue) {
    if (isPositiveValue) {
      return [
        {
          pct: 0,
          color: {
            r: 255,
            g: 255,
            b: 255,
          },
        },
        {
          pct: 1.0,
          color: {
            r: 255,
            g: 0,
            b: 0,
          },
        },
      ];
    } else {
      return [
        {
          pct: 0.0,
          color: {
            r: 255,
            g: 255,
            b: 255,
          },
        },
        {
          pct: 1,
          color: {
            r: 0,
            g: 0,
            b: 255,
          },
        },
      ];
    }
  }

  /**
   * Determines the next cell to navigate to based on the provided key code and current cell index.
   *
   * @param keyCode - The key code representing the navigation direction (e.g., 38 for UP, 40 for DOWN, 37 for LEFT, 39 for RIGHT).
   * @param matrixCellDatas - An array of cell data objects, each containing xCanvas and yCanvas coordinates.
   * @param isAxisInverted - A boolean indicating whether the axis is inverted.
   * @param currentCellIndex - The index of the current cell.
   *
   * @returns The next cell to navigate to as a `CellModel` object, or `undefined` if the navigation is not possible.
   */
  static getNavigationCell(
    keyCode,
    matrixCellDatas,
    isAxisInverted,
    currentCellIndex,
  ): CellModel {
    let changeCell: CellModel;

    let selectedCellIndex;

    // Sort cells by x and y;
    matrixCellDatas.sort(function (a, b) {
      return a.xCanvas - b.xCanvas || a.yCanvas - b.yCanvas;
    });

    // Compute x cell length
    const xPartsLength = matrixCellDatas.filter((e) => e.xCanvas === 0).length;

    selectedCellIndex = matrixCellDatas.findIndex(
      (e) => e.index === currentCellIndex,
    );

    if (!isAxisInverted) {
      if (keyCode === 38) {
        // UP
        if (
          matrixCellDatas[selectedCellIndex + 1].xCanvas ===
          matrixCellDatas[selectedCellIndex].xCanvas
        ) {
          selectedCellIndex = selectedCellIndex + 1;
        }
      } else if (keyCode === 40) {
        // DOWN
        if (
          matrixCellDatas[selectedCellIndex - 1].xCanvas ===
          matrixCellDatas[selectedCellIndex].xCanvas
        ) {
          selectedCellIndex = selectedCellIndex - 1;
        }
      } else if (keyCode === 37) {
        // LEFT
        selectedCellIndex = selectedCellIndex - xPartsLength;
      } else if (keyCode === 39) {
        // RIGHT
        selectedCellIndex = selectedCellIndex + xPartsLength;
      } else {
        return undefined;
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
        if (
          matrixCellDatas[selectedCellIndex - 1].xCanvas ===
          matrixCellDatas[selectedCellIndex].xCanvas
        ) {
          selectedCellIndex = selectedCellIndex - 1;
        }
      } else if (keyCode === 39) {
        // RIGHT
        if (
          matrixCellDatas[selectedCellIndex + 1].xCanvas ===
          matrixCellDatas[selectedCellIndex].xCanvas
        ) {
          selectedCellIndex = selectedCellIndex + 1;
        }
      } else {
        return undefined;
      }
    }
    changeCell = matrixCellDatas[selectedCellIndex];
    return changeCell;
  }

  /**
   * Adjusts the dimensions of a cell based on the zoom level and graph type.
   *
   * @param cellDatas - An object containing the current canvas and matrix coordinates for the cell.
   * @param graphType - The type of graph, which determines how the dimensions are calculated.
   * @param width - The width of the canvas.
   * @param height - The height of the canvas.
   *
   * @returns The updated cell data with adjusted canvas coordinates and dimensions.
   */
  static adaptCellDimensionsToZoom(
    cellDatas: {
      xCanvas: number;
      x: MatrixCoordI;
      yCanvas: number;
      y: MatrixCoordI;
      wCanvas: number;
      w: MatrixCoordI;
      hCanvas: number;
      h: MatrixCoordI;
    },
    width: number | undefined,
    height: number | undefined,
    graphType: string,
  ) {
    if (width && height) {
      cellDatas.xCanvas =
        graphType === TYPES.STANDARD
          ? cellDatas.x.standard * width * 0.01
          : cellDatas.x.frequency * width * 0.01;
      cellDatas.yCanvas =
        graphType === TYPES.STANDARD
          ? cellDatas.y.standard * height * 0.01
          : cellDatas.y.frequency * height * 0.01;
      cellDatas.wCanvas =
        graphType === TYPES.STANDARD
          ? cellDatas.w.standard * width * 0.01
          : cellDatas.w.frequency * width * 0.01;
      cellDatas.hCanvas =
        graphType === TYPES.STANDARD
          ? cellDatas.h.standard * height * 0.01
          : cellDatas.h.frequency * height * 0.01;
    }

    return cellDatas;
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
  static getMinAndMaxFromGraphMode(matrixValues, minMaxValues, mode: string) {
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
          minVal,
          maxVal,
        );
      }
    } else {
      // For KV purpose
      [minVal, maxVal] = minMaxValues[mode];
    }
    return [minVal, maxVal, minValH, maxValH];
  }

  /**
   * Calculates the color for a given percentage value based on the specified mode and contrast.
   *
   * @param currentColorVal - The current value to be converted to a color.
   * @param maxVal - The maximum value used for normalization.
   * @param contrast - The contrast adjustment factor.
   * @param mode - The mode determining the color scheme to use. Possible values are 'MUTUAL_INFO', 'HELLINGER', 'MUTUAL_INFO_TARGET_WITH_CELL', or others.
   * @returns The calculated color in rgba format or 'white' if the currentColorVal is zero.
   */
  static getColorForPercentage(
    currentColorVal: number,
    maxVal: number,
    contrast: number,
    mode: string,
  ) {
    let colorValue = 0;
    const A = contrast;
    const cste = 0.1;
    const P = Math.exp(Math.log(cste) / 100);
    const c = Math.pow(P, A);

    if (currentColorVal >= 0) {
      colorValue = Math.pow(currentColorVal / maxVal, c);
    } else {
      colorValue = -Math.pow(-currentColorVal / maxVal, c);
    }

    if (currentColorVal === 0) {
      return 'white';
    } else {
      let percentColors;
      if (
        mode === MATRIX_MODES.MUTUAL_INFO ||
        mode === MATRIX_MODES.HELLINGER ||
        mode === MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL
      ) {
        const isPositiveValue = colorValue >= 0;
        percentColors = MatrixService.getInterestColors(isPositiveValue);
        colorValue = Math.abs(colorValue);
      } else {
        percentColors = MatrixService.getFrequencyColors();
      }

      let i = 1;
      for (i; i < percentColors.length - 1; i++) {
        if (colorValue < percentColors[i].pct) {
          break;
        }
      }
      const lower = percentColors[i - 1];
      const upper = percentColors[i];
      const range = upper.pct - lower.pct;
      const rangePct = (colorValue - lower.pct) / range;
      const pctLower = 1 - rangePct;
      const pctUpper = rangePct;
      const color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
      };
      const rgba = 'rgba(' + [color.r, color.g, color.b, 1].join(',') + ')';

      return rgba;
    }
  }
}
