import { Injectable } from '@angular/core';
import { UtilsService } from '../../providers/utils.service';
import { CellModel } from '../../model/cell.model';
import { MatrixCoordI } from '@khiops-library/interfaces/matrix-coord';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
import { TYPES } from '@khiops-library/enum/types';
import { DimensionModel } from '@khiops-library/model/dimension.model';

@Injectable({
  providedIn: 'root',
})
export class MatrixUiService {
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
  static formatAxisDisplayText(
    axisPartShortDescription: string[] | number[],
    iter: number,
    dimension: DimensionModel,
  ) {
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
  static getInterestColors(isPositiveValue: boolean) {
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
    keyCode: number,
    matrixCellDatas: CellModel[],
    isAxisInverted: boolean,
    currentCellIndex: number,
  ): CellModel | undefined {
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
    cellDatas: CellModel,
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
        percentColors = MatrixUiService.getInterestColors(isPositiveValue);
        colorValue = Math.abs(colorValue);
      } else {
        percentColors = MatrixUiService.getFrequencyColors();
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

  /**
   * Computes the legend values for the matrix visualization based on the provided min and max values.
   *
   * This method determines the appropriate legend values to be displayed in the matrix visualization.
   * It takes into account the mode of the matrix (e.g., HELLINGER) to adjust the legend values accordingly.
   *
   * @param {number} minVal - The minimum value from the matrix values.
   * @param {number} maxVal - The maximum value from the matrix values.
   * @param {number} minValH - The minimum Hellinger value, used when the mode is HELLINGER.
   * @param {number} maxValH - The maximum Hellinger value, used when the mode is HELLINGER.
   * @param {string} mode - The mode of the matrix visualization (e.g., HELLINGER).
   *
   * @returns {Object} An object containing the computed legend values:
   * - `min`: The minimum value to be displayed in the legend.
   * - `max`: The maximum value to be displayed in the legend.
   */
  static computeLegendValues(
    minVal: number,
    maxVal: number,
    minValH: number,
    maxValH: number,
    mode: string,
  ) {
    let legend: {
      min: number | undefined;
      max: number | undefined;
    } = {
      min: undefined,
      max: undefined,
    };
    if (mode === MATRIX_MODES.HELLINGER) {
      // For KC purpose
      legend.min = minValH;
      legend.max = maxValH;
    } else {
      legend.min = minVal;
      legend.max = maxVal;
    }
    if (legend.min > 0) {
      legend.min = 0;
    }
    return legend;
  }
}
