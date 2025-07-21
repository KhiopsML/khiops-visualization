/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { MatrixRendererService } from '../../app/khiops-library/components/matrix/matrix.renderer.service';
import { MatrixUiService } from '../../app/khiops-library/components/matrix/matrix.ui.service';
import { MatrixUtilsService } from '../../app/khiops-library/components/matrix/matrix.utils.service';
import { CellModel } from '../../app/khiops-library/model/cell.model';
import { MATRIX_MODES } from '../../app/khiops-library/enum/matrix-modes';
import { DynamicI } from '../../app/khiops-library/interfaces/globals';

describe('MatrixRendererService', () => {
  let service: MatrixRendererService;
  let mockCanvasContext: jasmine.SpyObj<CanvasRenderingContext2D>;
  let mockCanvas: jasmine.SpyObj<HTMLCanvasElement>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MatrixRendererService],
    });
    service = TestBed.inject(MatrixRendererService);

    // Create mock canvas context with all necessary methods
    mockCanvasContext = jasmine.createSpyObj('CanvasRenderingContext2D', [
      'clearRect',
      'translate',
      'scale',
      'rotate',
      'fillRect',
      'strokeRect',
      'beginPath',
      'stroke',
      'createPattern',
      'moveTo',
      'lineTo',
    ]);

    // Create mock canvas element
    mockCanvas = jasmine.createSpyObj('HTMLCanvasElement', ['getContext'], {
      width: 100,
      height: 100,
    });
    mockCanvas.getContext.and.returnValue(mockCanvasContext);

    // Mock document.createElement to return our mock canvas
    spyOn(document, 'createElement').and.returnValue(mockCanvas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cleanDomContext', () => {
    it('should clear the canvas context with specified dimensions', () => {
      const width = 800;
      const height = 600;

      service.cleanDomContext(mockCanvasContext, width, height);

      expect(mockCanvasContext.clearRect).toHaveBeenCalledWith(
        0,
        0,
        width,
        height,
      );
    });
  });

  describe('cleanSelectedDomContext', () => {
    it('should clear the selected cells canvas context with specified dimensions', () => {
      const width = 800;
      const height = 600;

      service.cleanSelectedDomContext(mockCanvasContext, width, height);

      expect(mockCanvasContext.clearRect).toHaveBeenCalledWith(
        0,
        0,
        width,
        height,
      );
    });
  });

  describe('setMatrixEltsOrientation', () => {
    const width = 800;
    const height = 600;
    const xAxisLabel = 'X Axis';
    const yAxisLabel = 'Y Axis';

    it('should handle normal orientation (not inverted)', () => {
      const mockSelectedCtx = jasmine.createSpyObj('CanvasRenderingContext2D', [
        'translate',
        'scale',
      ]);

      const [resultX, resultY] = service.setMatrixEltsOrientation(
        mockCanvasContext,
        mockSelectedCtx,
        false,
        width,
        height,
        xAxisLabel,
        yAxisLabel,
      );

      expect(resultX).toBe(xAxisLabel);
      expect(resultY).toBe(yAxisLabel);
      expect(mockCanvasContext.translate).toHaveBeenCalledWith(0, height);
      expect(mockCanvasContext.scale).toHaveBeenCalledWith(1, -1);
      expect(mockSelectedCtx.translate).toHaveBeenCalledWith(0, height);
      expect(mockSelectedCtx.scale).toHaveBeenCalledWith(1, -1);
    });

    it('should handle inverted orientation', () => {
      const mockSelectedCtx = jasmine.createSpyObj('CanvasRenderingContext2D', [
        'translate',
        'scale',
        'rotate',
      ]);

      const [resultX, resultY] = service.setMatrixEltsOrientation(
        mockCanvasContext,
        mockSelectedCtx,
        true,
        width,
        height,
        xAxisLabel,
        yAxisLabel,
      );

      expect(resultX).toBe(yAxisLabel);
      expect(resultY).toBe(xAxisLabel);
      expect(mockCanvasContext.translate).toHaveBeenCalledWith(0, width);
      expect(mockCanvasContext.scale).toHaveBeenCalledWith(-1, -1);
      expect(mockCanvasContext.rotate).toHaveBeenCalledWith(Math.PI / 2);
      expect(mockSelectedCtx.translate).toHaveBeenCalledWith(0, width);
      expect(mockSelectedCtx.scale).toHaveBeenCalledWith(-1, -1);
      expect(mockSelectedCtx.rotate).toHaveBeenCalledWith(Math.PI / 2);
    });
  });

  describe('drawProbExceptionCell', () => {
    it('should create pattern and fill rectangle for exception cell', () => {
      const mockPattern = {} as CanvasPattern;
      mockCanvasContext.createPattern.and.returnValue(mockPattern);

      const cell: CellModel = new CellModel();
      cell.xCanvas = 10;
      cell.yCanvas = 20;
      cell.wCanvas = 50;
      cell.hCanvas = 30;

      service.drawProbExceptionCell(mockCanvasContext, cell);

      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockCanvasContext.createPattern).toHaveBeenCalledWith(
        mockCanvas,
        'repeat',
      );
      expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(10, 20, 50, 30);
    });
  });

  describe('drawMatrixCells', () => {
    let mockInputDatas: any;
    let mockMatrixValues: number[];
    let mockMatrixExtras: (number | boolean)[];
    let mockMatrixFreqsValues: number[];
    let mockMatrixExpectedFreqsValues: number[];
    let mockGraphMode: any;

    beforeEach(() => {
      // Setup mock data
      const mockCell = new CellModel();
      mockCell.xCanvas = 0;
      mockCell.yCanvas = 0;
      mockCell.wCanvas = 10;
      mockCell.hCanvas = 10;

      mockInputDatas = {
        matrixCellDatas: [mockCell],
      };
      mockMatrixValues = [0.5];
      mockMatrixExtras = [1];
      mockMatrixFreqsValues = [10];
      mockMatrixExpectedFreqsValues = [8];
      mockGraphMode = { mode: MATRIX_MODES.MUTUAL_INFO };

      // Mock static methods
      spyOn(MatrixUtilsService, 'computeTotalMutInfo').and.returnValue(1);
      spyOn(MatrixUiService, 'adaptCellDimensionsToZoom').and.returnValue(
        mockCell,
      );
      spyOn(MatrixUiService, 'getColorForPercentage').and.returnValue(
        '#ff0000',
      );
    });

    it('should draw matrix cells correctly', () => {
      service.drawMatrixCells(
        mockCanvasContext,
        mockInputDatas,
        mockMatrixValues,
        mockMatrixExtras,
        mockMatrixFreqsValues,
        mockMatrixExpectedFreqsValues,
        mockGraphMode,
        'scatter',
        false,
        800,
        600,
        1,
        false,
        1,
      );

      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
      expect(MatrixUtilsService.computeTotalMutInfo).toHaveBeenCalled();
      expect(MatrixUiService.adaptCellDimensionsToZoom).toHaveBeenCalled();
    });

    it('should handle empty matrix values', () => {
      service.drawMatrixCells(
        mockCanvasContext,
        mockInputDatas,
        undefined,
        mockMatrixExtras,
        mockMatrixFreqsValues,
        mockMatrixExpectedFreqsValues,
        mockGraphMode,
        'scatter',
        false,
        800,
        600,
        1,
        false,
        1,
      );

      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });
  });

  describe('drawSelectedCell', () => {
    it('should draw selected cell border with proper styling', () => {
      const cell = new CellModel();
      cell.xCanvas = 10;
      cell.yCanvas = 20;
      cell.wCanvas = 50;
      cell.hCanvas = 30;

      service.drawSelectedCell(mockCanvasContext, cell);

      expect(mockCanvasContext.strokeRect).toHaveBeenCalledTimes(2);
      expect(mockCanvasContext.strokeRect).toHaveBeenCalledWith(10, 20, 50, 30);
    });

    it('should not draw if cell is null or undefined', () => {
      service.drawSelectedCell(mockCanvasContext, null as any);
      service.drawSelectedCell(mockCanvasContext, undefined as any);

      expect(mockCanvasContext.strokeRect).not.toHaveBeenCalled();
    });
  });

  describe('updateLegendBar', () => {
    let mockLegendElement: jasmine.SpyObj<HTMLElement>;

    beforeEach(() => {
      mockLegendElement = jasmine.createSpyObj('HTMLElement', [], {
        style: { background: '' },
      });

      spyOn(MatrixUiService, 'getInterestColorsLegend').and.returnValue(
        'linear-gradient(interest)',
      );
      spyOn(MatrixUiService, 'getFrequencyColorsLegend').and.returnValue(
        'linear-gradient(frequency)',
      );
    });

    it('should set interest colors for mutual info mode', () => {
      const graphMode = { mode: MATRIX_MODES.MUTUAL_INFO };

      service.updateLegendBar(mockLegendElement, graphMode);

      expect(MatrixUiService.getInterestColorsLegend).toHaveBeenCalled();
      expect(mockLegendElement.style.background).toBe(
        'linear-gradient(interest)',
      );
    });

    it('should set interest colors for hellinger mode', () => {
      const graphMode = { mode: MATRIX_MODES.HELLINGER };

      service.updateLegendBar(mockLegendElement, graphMode);

      expect(MatrixUiService.getInterestColorsLegend).toHaveBeenCalled();
      expect(mockLegendElement.style.background).toBe(
        'linear-gradient(interest)',
      );
    });

    it('should set interest colors for mutual info target with cell mode', () => {
      const graphMode = { mode: MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL };

      service.updateLegendBar(mockLegendElement, graphMode);

      expect(MatrixUiService.getInterestColorsLegend).toHaveBeenCalled();
      expect(mockLegendElement.style.background).toBe(
        'linear-gradient(interest)',
      );
    });

    it('should set frequency colors for other modes', () => {
      const graphMode = { mode: MATRIX_MODES.FREQUENCY };

      service.updateLegendBar(mockLegendElement, graphMode);

      expect(MatrixUiService.getFrequencyColorsLegend).toHaveBeenCalled();
      expect(mockLegendElement.style.background).toBe(
        'linear-gradient(frequency)',
      );
    });
  });

  describe('getZoomDimensions', () => {
    let mockMatrixAreaElement: jasmine.SpyObj<HTMLElement>;
    let mockContainerElement: jasmine.SpyObj<HTMLElement>;

    beforeEach(() => {
      mockMatrixAreaElement = jasmine.createSpyObj('HTMLElement', [], {
        style: { overflow: '' },
      });
      mockContainerElement = jasmine.createSpyObj('HTMLElement', [], {
        clientWidth: 800,
        clientHeight: 600,
      });
    });

    it('should set overflow hidden and return original dimensions for zoom level 1', () => {
      const [width, height] = service.getZoomDimensions(
        mockMatrixAreaElement,
        mockContainerElement,
        1,
      );

      expect(mockMatrixAreaElement.style.overflow).toBe('hidden');
      expect(width).toBe(800);
      expect(height).toBe(600);
    });

    it('should set overflow scroll and return scaled dimensions for zoom level > 1', () => {
      const [width, height] = service.getZoomDimensions(
        mockMatrixAreaElement,
        mockContainerElement,
        2,
      );

      expect(mockMatrixAreaElement.style.overflow).toBe('scroll');
      expect(width).toBe(1600);
      expect(height).toBe(1200);
    });

    it('should handle zero client dimensions', () => {
      mockContainerElement = jasmine.createSpyObj('HTMLElement', [], {
        clientWidth: 0,
        clientHeight: 0,
      });

      const [width, height] = service.getZoomDimensions(
        mockMatrixAreaElement,
        mockContainerElement,
        1.5,
      );

      expect(width).toBe(0);
      expect(height).toBe(0);
    });

    it('should return fixed precision numbers', () => {
      mockContainerElement = jasmine.createSpyObj('HTMLElement', [], {
        clientWidth: 333,
        clientHeight: 666,
      });

      const [width, height] = service.getZoomDimensions(
        mockMatrixAreaElement,
        mockContainerElement,
        1.5,
      );

      expect(width).toBe(500); // 333 * 1.5 = 499.5 -> 500
      expect(height).toBe(999); // 666 * 1.5 = 999
    });
  });

  describe('computeLegendValues', () => {
    let mockMinMaxValues: DynamicI;
    let mockMatrixValues: number[];

    beforeEach(() => {
      mockMinMaxValues = {
        min: 0,
        max: 100,
        minH: 0,
        maxH: 50,
      };
      mockMatrixValues = [10, 20, 30, 40, 50];

      spyOn(MatrixUtilsService, 'getMinAndMaxFromGraphMode').and.returnValue([
        0, 100, 0, 50,
      ]);
      spyOn(MatrixUiService, 'computeLegendValues').and.returnValue({
        min: 0,
        max: 100,
      });
    });

    it('should compute legend values correctly', () => {
      const result = service.computeLegendValues(
        mockMatrixValues,
        mockMinMaxValues,
        MATRIX_MODES.MUTUAL_INFO,
      );

      expect(MatrixUtilsService.getMinAndMaxFromGraphMode).toHaveBeenCalledWith(
        mockMatrixValues,
        mockMinMaxValues,
        MATRIX_MODES.MUTUAL_INFO,
      );
      expect(MatrixUiService.computeLegendValues).toHaveBeenCalledWith(
        0,
        100,
        0,
        50,
        MATRIX_MODES.MUTUAL_INFO,
      );
      expect(result).toEqual({ min: 0, max: 100 });
    });

    it('should handle undefined matrix values', () => {
      const result = service.computeLegendValues(
        undefined,
        mockMinMaxValues,
        MATRIX_MODES.FREQUENCY,
      );

      expect(MatrixUtilsService.getMinAndMaxFromGraphMode).toHaveBeenCalledWith(
        undefined,
        mockMinMaxValues,
        MATRIX_MODES.FREQUENCY,
      );
      expect(result).toEqual({ min: 0, max: 100 });
    });

    it('should handle undefined minMaxValues', () => {
      const result = service.computeLegendValues(
        mockMatrixValues,
        undefined,
        MATRIX_MODES.HELLINGER,
      );

      expect(MatrixUtilsService.getMinAndMaxFromGraphMode).toHaveBeenCalledWith(
        mockMatrixValues,
        undefined,
        MATRIX_MODES.HELLINGER,
      );
      expect(result).toEqual({ min: 0, max: 100 });
    });
  });

  describe('private methods integration', () => {
    it('should properly integrate updateCellData and drawCell through drawMatrixCells', () => {
      const mockCell = new CellModel();
      mockCell.xCanvas = 0;
      mockCell.yCanvas = 0;
      mockCell.wCanvas = 10;
      mockCell.hCanvas = 10;

      const mockInputDatas = {
        matrixCellDatas: [mockCell],
      };
      const mockMatrixValues = [0.5];
      const mockMatrixExtras = [false];
      const mockMatrixFreqsValues = [10];
      const mockMatrixExpectedFreqsValues = [8];
      const mockGraphMode = { mode: MATRIX_MODES.FREQUENCY };

      spyOn(MatrixUtilsService, 'computeTotalMutInfo').and.returnValue(null);
      spyOn(MatrixUiService, 'adaptCellDimensionsToZoom').and.returnValue(
        mockCell,
      );
      spyOn(MatrixUiService, 'getColorForPercentage').and.returnValue(
        '#ff0000',
      );

      service.drawMatrixCells(
        mockCanvasContext,
        mockInputDatas,
        mockMatrixValues,
        mockMatrixExtras,
        mockMatrixFreqsValues,
        mockMatrixExpectedFreqsValues,
        mockGraphMode,
        'scatter',
        false,
        800,
        600,
        1,
        false,
        1,
      );

      // Verify that the cell's displayedValue was set
      expect(mockCell.displayedValue).toBeDefined();
      expect(mockCell.displayedValue.type).toBe(MATRIX_MODES.FREQUENCY);
      expect(mockCell.displayedValue.value).toBe(0.5);
      expect(mockCell.displayedValue.ef).toBe(8);
      expect(mockCell.displayedFreqValue).toBe(10);

      // Verify canvas operations
      expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(0, 0, 10, 10);
    });
  });
});
