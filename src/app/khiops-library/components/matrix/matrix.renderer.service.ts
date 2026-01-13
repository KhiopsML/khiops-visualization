/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { CellModel } from '../../model/cell.model';
import { MatrixUiService } from './matrix.ui.service';
import { MatrixUtilsService } from './matrix.utils.service';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
import { DynamicI } from '@khiops-library/interfaces/globals';

/**
 * Service responsible for all canvas rendering operations in the matrix component
 */
@Injectable({
  providedIn: 'root',
})
export class MatrixRendererService {
  private canvasPattern: HTMLCanvasElement | undefined;
  private innerVariableFilterPattern: HTMLCanvasElement | undefined;

  constructor() { }

  /**
   * Cleans the main matrix canvas context
   * @param matrixCtx Canvas rendering context
   * @param width Canvas width
   * @param height Canvas height
   */
  cleanDomContext(
    matrixCtx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    matrixCtx.clearRect(0, 0, width, height);
  }

  /**
   * Cleans the selected cells canvas context
   * @param matrixSelectedCtx Selected cells canvas rendering context
   * @param width Canvas width
   * @param height Canvas height
   */
  cleanSelectedDomContext(
    matrixSelectedCtx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    matrixSelectedCtx.clearRect(0, 0, width, height);
  }

  /**
   * Sets the orientation of the matrix elements based on axis inversion
   * @param matrixCtx Main canvas context
   * @param matrixSelectedCtx Selected cells canvas context
   * @param isAxisInverted Whether axes are inverted
   * @param width Canvas width
   * @param height Canvas height
   * @returns Tuple of [xAxisLabel, yAxisLabel] potentially swapped based on inversion
   */
  setMatrixEltsOrientation(
    matrixCtx: CanvasRenderingContext2D,
    matrixSelectedCtx: CanvasRenderingContext2D,
    isAxisInverted: boolean,
    width: number,
    height: number,
    xAxisLabel: string,
    yAxisLabel: string,
  ): [string, string] {
    let resultX = xAxisLabel;
    let resultY = yAxisLabel;

    if (isAxisInverted) {
      [resultX, resultY] = [yAxisLabel, xAxisLabel];
      matrixCtx.translate(0, width);
      matrixCtx.scale(-1, -1);
      matrixCtx.rotate(Math.PI / 2);
      matrixSelectedCtx.translate(0, width);
      matrixSelectedCtx.scale(-1, -1);
      matrixSelectedCtx.rotate(Math.PI / 2);
    } else {
      matrixCtx.translate(0, height);
      matrixCtx.scale(1, -1);
      matrixSelectedCtx.translate(0, height);
      matrixSelectedCtx.scale(1, -1);
    }

    return [resultX, resultY];
  }

  /**
   * Draws a pattern for cells where zero is an exception
   * @param matrixCtx Canvas context to draw on
   * @param cell Cell data to draw
   */
  drawProbExceptionCell(
    matrixCtx: CanvasRenderingContext2D,
    cell: CellModel,
  ): void {
    if (!this.canvasPattern) {
      this.drawZeroExceptionCanvasPattern();
    }
    const pattern = matrixCtx.createPattern(this.canvasPattern!, 'repeat');
    if (pattern) {
      matrixCtx.fillStyle = pattern;
    }
    matrixCtx.fillRect(cell.xCanvas, cell.yCanvas, cell.wCanvas, cell.hCanvas);
  }

  /**
   * Creates a canvas pattern for zero exception cells
   */
  private drawZeroExceptionCanvasPattern(): void {
    this.canvasPattern = document.createElement('canvas');
    this.canvasPattern.width = 16;
    this.canvasPattern.height = 16;
    const pctx: CanvasRenderingContext2D = this.canvasPattern.getContext('2d')!;

    const x0 = 32;
    const x1 = -1;
    const y0 = -1;
    const y1 = 32;
    const offset = 16;

    pctx.strokeStyle = '#000000';
    pctx.lineWidth = 1;
    pctx.beginPath();
    pctx.moveTo(x0, y0);
    pctx.lineTo(x1, y1);
    pctx.moveTo(x0 - offset, y0);
    pctx.lineTo(x1 - offset, y1);
    pctx.moveTo(x0 + offset, y0);
    pctx.lineTo(x1 + offset, y1);
    pctx.stroke();
  }

  /**
   * Draws all matrix cells with appropriate colors and patterns
   * @param matrixCtx Canvas context
   * @param inputDatas Input data containing matrix cell data
   * @param matrixValues Matrix values
   * @param matrixExtras Matrix extra values
   * @param matrixFreqsValues Matrix frequency values
   * @param graphMode Current graph mode
   * @param graphType Graph type
   * @param isKhiopsCovisu Whether this is Khiops Covisu
   * @param width Canvas width
   * @param height Canvas height
   * @param contrast Contrast value
   * @param isZerosToggled Whether zeros are toggled
   * @param legendMax Maximum legend value
   * @param selectedInnerVariables Selected inner variables for filtering
   * @param hasInnerVariables Whether inner variables are available in the data
   */
  drawMatrixCells(
    matrixCtx: CanvasRenderingContext2D,
    inputDatas: any,
    matrixValues: number[] | undefined,
    matrixExtras: (number | boolean)[] | undefined,
    matrixFreqsValues: number[],
    matrixExpectedFreqsValues: number[],
    graphMode: any,
    graphType: string,
    isKhiopsCovisu: boolean,
    width: number,
    height: number,
    contrast: number,
    isZerosToggled: boolean,
    legendMax: number | undefined,
    selectedInnerVariables: string[] = [],
    matrixFilterOption?: string,
    hasInnerVariables: boolean = false,
  ): void {
    const totalMutInfo = MatrixUtilsService.computeTotalMutInfo(
      matrixValues!,
      graphMode.mode,
      isKhiopsCovisu,
    );
    const cellsLength = inputDatas.matrixCellDatas.length;

    matrixCtx.beginPath();
    matrixCtx.strokeStyle = 'rgba(255,255,255,0.3)';
    matrixCtx.lineWidth = 1;

    for (let index = 0; index < cellsLength; index++) {
      if (totalMutInfo) {
        // hide zero exceptions do not work anymore #110
        matrixExtras![index] = totalMutInfo;
      }

      let cellDatas = inputDatas.matrixCellDatas[index];
      this.updateCellData(
        cellDatas,
        width,
        height,
        graphType,
        matrixValues,
        matrixExpectedFreqsValues,
        matrixFreqsValues,
        matrixExtras,
        graphMode.mode,
        index,
        matrixFilterOption,
      );
      this.drawCell(
        matrixCtx,
        cellDatas,
        matrixValues,
        matrixExtras,
        index,
        legendMax,
        contrast,
        graphMode.mode,
        isZerosToggled,
        selectedInnerVariables,
        hasInnerVariables,
      );
    }

    matrixCtx.stroke();
  }

  /**
   * Updates cell data with display values and dimensions
   * @param cellDatas Cell data to update
   * @param width Canvas width
   * @param height Canvas height
   * @param graphType Graph type
   * @param matrixValues Matrix values
   * @param matrixExpectedFreqsValues Expected frequencies
   * @param matrixFreqsValues Frequencies
   * @param matrixExtras Extra values
   * @param graphMode Graph mode
   * @param index Cell index
   */
  private updateCellData(
    cellDatas: CellModel,
    width: number,
    height: number,
    graphType: string,
    matrixValues: number[] | undefined,
    matrixExpectedFreqsValues: number[],
    matrixFreqsValues: number[],
    matrixExtras: (number | boolean)[] | undefined,
    graphMode: string,
    index: number,
    matrixFilterOption?: string,
  ): void {
    const currentVal = matrixValues?.[index];

    // Update cell dimensions based on zoom
    cellDatas = MatrixUiService.adaptCellDimensionsToZoom(
      cellDatas,
      width,
      height,
      graphType,
      matrixFilterOption,
    );

    // Set display values
    cellDatas.displayedValue = {
      type: graphMode,
      value: currentVal ?? 0,
      ef: matrixExpectedFreqsValues[index] ?? 0,
      extra: matrixExtras?.[index] || 0,
    };
    if (graphMode === MATRIX_MODES.TARGET_FREQUENCY) {
      cellDatas.displayedFreqValue = matrixExpectedFreqsValues[index] ?? 0;
    } else {
      cellDatas.displayedFreqValue = matrixFreqsValues[index] ?? 0;
    }
  }

  /**
   * Draws a single cell with the appropriate color and pattern
   * @param matrixCtx Canvas context
   * @param cellDatas Cell data to draw
   * @param matrixValues Matrix values
   * @param matrixExtras Matrix extras
   * @param index Cell index
   * @param legendMax Maximum legend value
   * @param contrast Contrast value
   * @param graphMode Graph mode
   * @param isZerosToggled Whether zeros are toggled
   * @param selectedInnerVariables Selected inner variables for filtering
   * @param hasInnerVariables Whether inner variables are available in the data
   */
  private drawCell(
    matrixCtx: CanvasRenderingContext2D,
    cellDatas: CellModel,
    matrixValues: number[] | undefined,
    matrixExtras: (number | boolean)[] | undefined,
    index: number,
    legendMax: number | undefined,
    contrast: number,
    graphMode: string,
    isZerosToggled: boolean,
    selectedInnerVariables: string[] = [],
    hasInnerVariables: boolean = false,
  ): void {
    const currentVal = matrixValues?.[index];
    const maxVal = legendMax;

    // Check if cell should be filtered based on inner variables
    const shouldHatchCell = this.shouldHatchCellForInnerVariables(
      cellDatas,
      selectedInnerVariables,
      hasInnerVariables,
    );

    if (currentVal && maxVal) {
      // Do not draw empty cells
      const color = MatrixUiService.getColorForPercentage(
        currentVal,
        maxVal,
        contrast,
        graphMode,
      );
      matrixCtx.fillStyle = color;
      const { xCanvas, yCanvas, wCanvas, hCanvas } = cellDatas;
      matrixCtx.fillRect(xCanvas, yCanvas, wCanvas, hCanvas);
    }

    // Draw pattern if 0 is an exception
    if (matrixExtras?.[index] && isZerosToggled) {
      this.drawProbExceptionCell(matrixCtx, cellDatas);
    }

    // Draw hatch pattern if cell should be filtered based on inner variables
    if (shouldHatchCell) {
      this.drawInnerVariableFilterPattern(matrixCtx, cellDatas);
    }
  }

  /**
   * Draws the selected cell border
   * @param matrixSelectedCtx Selected cells canvas context
   * @param cell Cell to highlight
   */
  drawSelectedCell(
    matrixSelectedCtx: CanvasRenderingContext2D,
    cell: CellModel,
  ): void {
    if (cell) {
      matrixSelectedCtx.strokeStyle = '#ffffff';
      matrixSelectedCtx.lineWidth = 4;
      matrixSelectedCtx.shadowBlur = 1;
      matrixSelectedCtx.shadowColor = 'white';
      matrixSelectedCtx.strokeRect(
        cell.xCanvas,
        cell.yCanvas,
        cell.wCanvas,
        cell.hCanvas,
      );

      matrixSelectedCtx.lineWidth = 2;
      matrixSelectedCtx.strokeStyle = '#000000';
      matrixSelectedCtx.strokeRect(
        cell.xCanvas,
        cell.yCanvas,
        cell.wCanvas,
        cell.hCanvas,
      );
    }
  }

  /**
   * Draws a temporary dashed selection rectangle during multi-cell selection drag
   * @param matrixSelectedCtx Selected cells canvas context
   * @param startCell Starting cell of the selection
   * @param endCell Current end cell of the selection
   */
  drawTempSelectionRect(
    matrixSelectedCtx: CanvasRenderingContext2D,
    startCell: CellModel,
    endCell: CellModel,
  ): void {
    if (!startCell || !endCell) return;

    // Calculate bounding rectangle from startCell to endCell
    const x = Math.min(startCell.xCanvas, endCell.xCanvas);
    const y = Math.min(startCell.yCanvas, endCell.yCanvas);
    const w =
      Math.max(
        startCell.xCanvas + startCell.wCanvas,
        endCell.xCanvas + endCell.wCanvas,
      ) - x;
    const h =
      Math.max(
        startCell.yCanvas + startCell.hCanvas,
        endCell.yCanvas + endCell.hCanvas,
      ) - y;

    // Draw dashed rectangle
    matrixSelectedCtx.setLineDash([5, 5]);
    matrixSelectedCtx.strokeStyle = '#000000';
    matrixSelectedCtx.lineWidth = 2;
    matrixSelectedCtx.strokeRect(x, y, w, h);
    matrixSelectedCtx.setLineDash([]); // Reset to solid line
  }

  /**
   * Updates the legend bar background style
   * @param legendBarElement Legend bar HTML element
   * @param graphMode Current graph mode
   */
  updateLegendBar(legendBarElement: HTMLElement, graphMode: any): void {
    if (
      graphMode.mode === MATRIX_MODES.MUTUAL_INFO ||
      graphMode.mode === MATRIX_MODES.HELLINGER ||
      graphMode.mode === MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL
    ) {
      legendBarElement.style.background =
        MatrixUiService.getInterestColorsLegend();
    } else {
      legendBarElement.style.background =
        MatrixUiService.getFrequencyColorsLegend();
    }
  }

  /**
   * Gets dimensions for zoom level
   * @param matrixAreaElement Matrix area element
   * @param containerElement Container element
   * @param zoom Current zoom level
   * @returns [width, height] tuple
   */
  getZoomDimensions(
    matrixAreaElement: HTMLElement,
    containerElement: HTMLElement,
    zoom: number,
  ): [number, number] {
    if (zoom === 1) {
      matrixAreaElement.style.overflow = 'hidden';
    } else {
      matrixAreaElement.style.overflow = 'scroll';
    }
    let width = containerElement.clientWidth || 0;
    let height = containerElement.clientHeight || 0;

    width = width * zoom;
    height = height * zoom;

    width = Number(width.toFixed(0));
    height = Number(height.toFixed(0));

    return [width, height];
  }

  /**
   * Computes legend values based on min/max values
   * @param matrixValues Matrix values
   * @param minMaxValues Min/max values
   * @param graphMode Graph mode
   * @returns Object with min and max legend values
   */
  computeLegendValues(
    matrixValues: number[] | undefined,
    minMaxValues: DynamicI | undefined,
    graphMode: string,
  ): { min: number | undefined; max: number | undefined } {
    let [minVal, maxVal, minValH, maxValH] =
      MatrixUtilsService.getMinAndMaxFromGraphMode(
        matrixValues!,
        minMaxValues!,
        graphMode,
      );

    return MatrixUiService.computeLegendValues(
      minVal!,
      maxVal!,
      minValH!,
      maxValH!,
      graphMode,
    );
  }

  /**
   * Determines if a cell should be hatched based on selected inner variables
   * @param cellData Cell data to check
   * @param selectedInnerVariables Selected inner variables
   * @param hasInnerVariables Whether inner variables are available in the data
   * @returns true if cell should be hatched (filtered)
   */
  private shouldHatchCellForInnerVariables(
    cellData: CellModel,
    selectedInnerVariables: string[],
    hasInnerVariables: boolean = false,
  ): boolean {
    // If no inner variables are available in the data, never hatch
    if (!hasInnerVariables) {
      return false;
    }

    // If inner variables are available but none are selected, hatch ALL cells (filter everything)
    if (!selectedInnerVariables || selectedInnerVariables.length === 0) {
      return true; // HATCH when nothing is selected
    }

    // Check if this cell's cluster contains any of the selected inner variables
    // If cell contains selected variables, DON'T hatch it
    // If cell doesn't contain selected variables, HATCH it
    const cellContainsSelectedVars =
      this.checkCellContainsSelectedInnerVariables(
        cellData,
        selectedInnerVariables,
      );

    // Return the OPPOSITE: hatch cells that DON'T contain selected variables
    return !cellContainsSelectedVars;
  }

  /**
   * Checks if a cell's cluster contains any of the selected inner variables
   * @param cellData Cell data
   * @param selectedInnerVariables Selected inner variables
   * @param inputDatas Input data containing matrix and dimension information
   * @returns true if cell contains selected inner variables, false if it should be filtered
   */
  private checkCellContainsSelectedInnerVariables(
    cellData: CellModel,
    selectedInnerVariables: string[],
  ): boolean {
    if (
      !cellData ||
      !selectedInnerVariables ||
      selectedInnerVariables.length === 0
    ) {
      return false;
    }

    // Ensure yAxisFullPart and xAxisFullPart are treated as arrays of strings
    const yAxisFullPart: string[] = Array.isArray(cellData.yAxisFullPart)
      ? cellData.yAxisFullPart
      : [];
    const xAxisFullPart: string[] = Array.isArray(cellData.xAxisFullPart)
      ? cellData.xAxisFullPart
      : [];

    // Check if any value in selectedInnerVariables is a substring of yAxisFullPart or xAxisFullPart
    const containsInYAxis = yAxisFullPart.some((value: string) =>
      selectedInnerVariables.some((innerVar) => value.includes(innerVar)),
    );

    const containsInXAxis = xAxisFullPart.some((value: string) =>
      selectedInnerVariables.some((innerVar) => value.includes(innerVar)),
    );

    return containsInYAxis || containsInXAxis;
  }

  /**
   * Draws a hatch pattern for cells that should be filtered based on inner variables
   * @param matrixCtx Canvas context
   * @param cell Cell to draw pattern on
   */
  private drawInnerVariableFilterPattern(
    matrixCtx: CanvasRenderingContext2D,
    cell: CellModel,
  ): void {
    // Create a distinct pattern for inner variable filtering
    if (!this.innerVariableFilterPattern) {
      this.createInnerVariableFilterCanvasPattern();
    }
    const pattern = matrixCtx.createPattern(
      this.innerVariableFilterPattern!,
      'repeat',
    );
    if (pattern) {
      matrixCtx.fillStyle = pattern;
    }
    matrixCtx.fillRect(cell.xCanvas, cell.yCanvas, cell.wCanvas, cell.hCanvas);
  }

  /**
   * Creates a canvas pattern for inner variable filtering (diagonal stripes)
   */
  private createInnerVariableFilterCanvasPattern(): void {
    this.innerVariableFilterPattern = document.createElement('canvas');
    this.innerVariableFilterPattern.width = 16;
    this.innerVariableFilterPattern.height = 16;
    const pctx: CanvasRenderingContext2D =
      this.innerVariableFilterPattern.getContext('2d')!;

    const x0 = 32;
    const x1 = -1;
    const y0 = -1;
    const y1 = 32;
    const offset = 16;

    pctx.strokeStyle = '#000000';
    pctx.lineWidth = 1;
    pctx.beginPath();
    pctx.moveTo(x0, y0);
    pctx.lineTo(x1, y1);
    pctx.moveTo(x0 - offset, y0);
    pctx.lineTo(x1 - offset, y1);
    pctx.moveTo(x0 + offset, y0);
    pctx.lineTo(x1 + offset, y1);
    pctx.stroke();
  }
}
