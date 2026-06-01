/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { MatrixUiService } from '../../app/khiops-library/components/matrix/matrix.ui.service';
import { CellModel } from '../../app/khiops-library/model/cell.model';
import { MATRIX_MODES } from '../../app/khiops-library/enum/matrix-modes';
import { TYPES } from '../../app/khiops-library/enum/types';

describe('MatrixUiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  // ─── formatAxisDisplayText ───────────────────────────────────────────

  describe('formatAxisDisplayText', () => {
    it('should return string value as-is for KC formatted data', () => {
      const descriptions = ['Part1', 'Part2', 'Part3'];
      expect(MatrixUiService.formatAxisDisplayText(descriptions, 0, TYPES.NUMERICAL)).toBe('Part1');
      expect(MatrixUiService.formatAxisDisplayText(descriptions, 1, TYPES.CATEGORICAL)).toBe('Part2');
      expect(MatrixUiService.formatAxisDisplayText(descriptions, 2, TYPES.NUMERICAL)).toBe('Part3');
    });

    it('should format numerical array with opening bracket at index 0', () => {
      const descriptions: number[][] = [[1, 5], [5, 10], [10, 20]];
      const result = MatrixUiService.formatAxisDisplayText(descriptions, 0, TYPES.NUMERICAL);
      expect(result).toBe('[1,5]');
    });

    it('should format numerical array with closing bracket at index > 0', () => {
      const descriptions: number[][] = [[1, 5], [5, 10], [10, 20]];
      const result = MatrixUiService.formatAxisDisplayText(descriptions, 1, TYPES.NUMERICAL);
      expect(result).toBe(']5,10]');
    });

    it('should format numerical array with closing bracket at last index', () => {
      const descriptions: number[][] = [[1, 5], [5, 10], [10, 20]];
      const result = MatrixUiService.formatAxisDisplayText(descriptions, 2, TYPES.NUMERICAL);
      expect(result).toBe(']10,20]');
    });

    it('should join array for categorical non-string type', () => {
      const descriptions: any[] = [['A', 'B'], ['C', 'D']];
      const result = MatrixUiService.formatAxisDisplayText(descriptions, 0, TYPES.CATEGORICAL);
      expect(result).toBe('A, B');
    });

    it('should handle non-array non-string categorical value', () => {
      const descriptions: any[] = [42, 99];
      const result = MatrixUiService.formatAxisDisplayText(descriptions, 0, TYPES.CATEGORICAL);
      expect(result).toBe(42);
    });
  });

  // ─── getFrequencyColorsLegend ────────────────────────────────────────

  describe('getFrequencyColorsLegend', () => {
    it('should return a linear-gradient string', () => {
      const result = MatrixUiService.getFrequencyColorsLegend();
      expect(result).toContain('linear-gradient');
      expect(result).toContain('to top');
    });

    it('should contain first and last colors from hot array', () => {
      const result = MatrixUiService.getFrequencyColorsLegend();
      expect(result).toContain('#FFFFFF');
      expect(result).toContain('#000000');
    });

    it('should contain correct percentage for first color (0%)', () => {
      const result = MatrixUiService.getFrequencyColorsLegend();
      expect(result).toContain('#FFFFFF 0%');
    });

    it('should not end with a comma before closing parenthesis', () => {
      const result = MatrixUiService.getFrequencyColorsLegend();
      expect(result.trim().endsWith(')')).toBe(true);
      // The last color entry should not have a trailing comma
      const lastPart = result.substring(result.lastIndexOf('#000000'));
      expect(lastPart).not.toContain(',');
    });
  });

  // ─── getInterestColorsLegend ─────────────────────────────────────────

  describe('getInterestColorsLegend', () => {
    it('should return a linear-gradient from red to white to blue', () => {
      const result = MatrixUiService.getInterestColorsLegend();
      expect(result).toContain('linear-gradient');
      expect(result).toContain('to bottom');
      expect(result).toContain('#ff0000 0%');
      expect(result).toContain('#ffffff 50%');
      expect(result).toContain('#0000ff 100%');
    });
  });

  // ─── getFrequencyColors ──────────────────────────────────────────────

  describe('getFrequencyColors', () => {
    it('should return array with same length as hot array', () => {
      const result = MatrixUiService.getFrequencyColors();
      expect(result.length).toBe(11);
    });

    it('should have first entry at pct=0 with white RGB', () => {
      const result = MatrixUiService.getFrequencyColors();
      expect(result[0].pct).toBe(0);
      expect(result[0].color.r).toBe(255);
      expect(result[0].color.g).toBe(255);
      expect(result[0].color.b).toBe(255);
    });

    it('should have last entry at pct=1.0 with black RGB', () => {
      const result = MatrixUiService.getFrequencyColors();
      expect(result[10].pct).toBe(1.0);
      expect(result[10].color.r).toBe(0);
      expect(result[10].color.g).toBe(0);
      expect(result[10].color.b).toBe(0);
    });

    it('should have second entry with orange RGB (#FF8000)', () => {
      const result = MatrixUiService.getFrequencyColors();
      expect(result[1].pct).toBe(0.1);
      expect(result[1].color.r).toBe(255);
      expect(result[1].color.g).toBe(128);
      expect(result[1].color.b).toBe(0);
    });
  });

  // ─── getInterestColors ──────────────────────────────────────────────

  describe('getInterestColors', () => {
    it('should return white-to-red gradient for positive values', () => {
      const result = MatrixUiService.getInterestColors(true);
      expect(result.length).toBe(2);
      expect(result[0].pct).toBe(0);
      expect(result[0].color).toEqual({ r: 255, g: 255, b: 255 });
      expect(result[1].pct).toBe(1.0);
      expect(result[1].color).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should return white-to-blue gradient for negative values', () => {
      const result = MatrixUiService.getInterestColors(false);
      expect(result.length).toBe(2);
      expect(result[0].pct).toBe(0);
      expect(result[0].color).toEqual({ r: 255, g: 255, b: 255 });
      expect(result[1].pct).toBe(1);
      expect(result[1].color).toEqual({ r: 0, g: 0, b: 255 });
    });
  });

  // ─── getNavigationCell ───────────────────────────────────────────────

  describe('getNavigationCell', () => {
    let matrixCellDatas: CellModel[];

    beforeEach(() => {
      // Create a 3x2 matrix (3 columns, 2 rows)
      // Layout after sorting by x then y:
      // col0: (0,0), (0,10)
      // col1: (10,0), (10,10)
      // col2: (20,0), (20,10)
      matrixCellDatas = [];
      let idx = 0;
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 2; y++) {
          const cell = new CellModel();
          cell.xCanvas = x * 10;
          cell.yCanvas = y * 10;
          cell.wCanvas = 10;
          cell.hCanvas = 10;
          cell.index = idx;
          matrixCellDatas.push(cell);
          idx++;
        }
      }
    });

    it('should navigate UP (key 38) in non-inverted mode', () => {
      // Starting at index 0 (x=0, y=0), UP should go to index 1 (x=0, y=10)
      const result = MatrixUiService.getNavigationCell(38, matrixCellDatas, false, 0);
      expect(result).toBe(matrixCellDatas[1]);
    });

    it('should navigate DOWN (key 40) in non-inverted mode', () => {
      // Starting at index 1 (x=0, y=10), DOWN should go to index 0 (x=0, y=0)
      const result = MatrixUiService.getNavigationCell(40, matrixCellDatas, false, 1);
      expect(result).toBe(matrixCellDatas[0]);
    });

    it('should navigate LEFT (key 37) in non-inverted mode', () => {
      // Starting at index 2 (x=10, y=0), LEFT means subtract xPartsLength=2
      const result = MatrixUiService.getNavigationCell(37, matrixCellDatas, false, 2);
      expect(result).toBe(matrixCellDatas[0]);
    });

    it('should navigate RIGHT (key 39) in non-inverted mode', () => {
      // Starting at index 0 (x=0, y=0), RIGHT means add xPartsLength=2
      const result = MatrixUiService.getNavigationCell(39, matrixCellDatas, false, 0);
      expect(result).toBe(matrixCellDatas[2]);
    });

    it('should return undefined for unsupported key in non-inverted mode', () => {
      const result = MatrixUiService.getNavigationCell(13, matrixCellDatas, false, 0);
      expect(result).toBeUndefined();
    });

    it('should navigate DOWN (key 40) in inverted mode (subtracts xPartsLength)', () => {
      // Starting at index 2 (sorted position 2), DOWN subtracts xPartsLength=2
      const result = MatrixUiService.getNavigationCell(40, matrixCellDatas, true, 2);
      expect(result).toBe(matrixCellDatas[0]);
    });

    it('should navigate UP (key 38) in inverted mode (adds xPartsLength)', () => {
      // Starting at index 0, UP adds xPartsLength=2
      const result = MatrixUiService.getNavigationCell(38, matrixCellDatas, true, 0);
      expect(result).toBe(matrixCellDatas[2]);
    });

    it('should return undefined for unsupported key in inverted mode', () => {
      const result = MatrixUiService.getNavigationCell(13, matrixCellDatas, true, 0);
      expect(result).toBeUndefined();
    });
  });

  // ─── adaptCellDimensionsToZoom ───────────────────────────────────────

  describe('adaptCellDimensionsToZoom', () => {
    let cell: CellModel;

    beforeEach(() => {
      cell = new CellModel();
      cell.x = { standard: 10, frequency: 20 };
      cell.y = { standard: 30, frequency: 40 };
      cell.w = { standard: 50, frequency: 60 };
      cell.h = { standard: 70, frequency: 80 };
    });

    it('should compute canvas dimensions using standard coords when graphType is STANDARD', () => {
      const result = MatrixUiService.adaptCellDimensionsToZoom(cell, 200, 300, TYPES.STANDARD);
      expect(result.xCanvas).toBe(10 * 200 * 0.01); // 20
      expect(result.yCanvas).toBe(30 * 300 * 0.01); // 90
      expect(result.wCanvas).toBe(50 * 200 * 0.01); // 100
      expect(result.hCanvas).toBe(70 * 300 * 0.01); // 210
    });

    it('should compute canvas dimensions using frequency coords when graphType is not STANDARD', () => {
      const result = MatrixUiService.adaptCellDimensionsToZoom(cell, 200, 300, TYPES.FREQUENCY);
      expect(result.xCanvas).toBe(20 * 200 * 0.01); // 40
      expect(result.yCanvas).toBe(40 * 300 * 0.01); // 120
      expect(result.wCanvas).toBe(60 * 200 * 0.01); // 120
      expect(result.hCanvas).toBe(80 * 300 * 0.01); // 240
    });

    it('should not modify cell when width is 0', () => {
      cell.xCanvas = 999;
      const result = MatrixUiService.adaptCellDimensionsToZoom(cell, 0, 300, TYPES.STANDARD);
      expect(result.xCanvas).toBe(999);
    });

    it('should not modify cell when height is 0', () => {
      cell.xCanvas = 999;
      const result = MatrixUiService.adaptCellDimensionsToZoom(cell, 200, 0, TYPES.STANDARD);
      expect(result.xCanvas).toBe(999);
    });

    it('should not modify cell when width is undefined', () => {
      cell.xCanvas = 999;
      const result = MatrixUiService.adaptCellDimensionsToZoom(cell, undefined, 300, TYPES.STANDARD);
      expect(result.xCanvas).toBe(999);
    });

    it('should use inner coords when matrixFilterOption is INNER_VARIABLES and coords exist', () => {
      cell.x = { standard: 10, frequency: 20, standardInner: 5, frequencyInner: 15 };
      cell.y = { standard: 30, frequency: 40, standardInner: 25, frequencyInner: 35 };
      cell.w = { standard: 50, frequency: 60, standardInner: 45, frequencyInner: 55 };
      cell.h = { standard: 70, frequency: 80, standardInner: 65, frequencyInner: 75 };

      const result = MatrixUiService.adaptCellDimensionsToZoom(
        cell, 200, 300, TYPES.STANDARD, TYPES.INNER_VARIABLES,
      );
      expect(result.xCanvas).toBe(5 * 200 * 0.01); // 10
      expect(result.yCanvas).toBe(25 * 300 * 0.01); // 75
      expect(result.wCanvas).toBe(45 * 200 * 0.01); // 90
      expect(result.hCanvas).toBe(65 * 300 * 0.01); // 195
    });

    it('should fall back to standard coords when matrixFilterOption is INNER_VARIABLES but inner coords are missing', () => {
      // x has no standardInner/frequencyInner
      const result = MatrixUiService.adaptCellDimensionsToZoom(
        cell, 200, 300, TYPES.STANDARD, TYPES.INNER_VARIABLES,
      );
      expect(result.xCanvas).toBe(10 * 200 * 0.01);
    });
  });

  // ─── getColorForPercentage ───────────────────────────────────────────

  describe('getColorForPercentage', () => {
    it('should return "white" when currentColorVal is 0', () => {
      const result = MatrixUiService.getColorForPercentage(0, 100, 1, MATRIX_MODES.FREQUENCY);
      expect(result).toBe('white');
    });

    it('should return an rgba string for positive frequency value', () => {
      const result = MatrixUiService.getColorForPercentage(50, 100, 1, MATRIX_MODES.FREQUENCY);
      expect(result).toMatch(/^rgba\(\d+,\d+,\d+,1\)$/);
    });

    it('should return an rgba string for positive mutual info value', () => {
      const result = MatrixUiService.getColorForPercentage(50, 100, 1, MATRIX_MODES.MUTUAL_INFO);
      expect(result).toMatch(/^rgba\(\d+,\d+,\d+,1\)$/);
    });

    it('should return rgba for negative mutual info value (blue range)', () => {
      const result = MatrixUiService.getColorForPercentage(-50, 100, 1, MATRIX_MODES.MUTUAL_INFO);
      expect(result).toMatch(/^rgba\(\d+,\d+,\d+,1\)$/);
    });

    it('should return rgba for HELLINGER mode', () => {
      const result = MatrixUiService.getColorForPercentage(30, 100, 1, MATRIX_MODES.HELLINGER);
      expect(result).toMatch(/^rgba\(\d+,\d+,\d+,1\)$/);
    });

    it('should return rgba for MUTUAL_INFO_TARGET_WITH_CELL mode', () => {
      const result = MatrixUiService.getColorForPercentage(
        30, 100, 1, MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL,
      );
      expect(result).toMatch(/^rgba\(\d+,\d+,\d+,1\)$/);
    });

    it('should return different colors for different contrast values', () => {
      const result1 = MatrixUiService.getColorForPercentage(50, 100, 1, MATRIX_MODES.FREQUENCY);
      const result2 = MatrixUiService.getColorForPercentage(50, 100, 50, MATRIX_MODES.FREQUENCY);
      // Different contrast should produce different colors
      expect(result1).not.toBe(result2);
    });

    it('should return max color when value equals maxVal', () => {
      const result = MatrixUiService.getColorForPercentage(100, 100, 1, MATRIX_MODES.FREQUENCY);
      expect(result).toMatch(/^rgba\(\d+,\d+,\d+,1\)$/);
    });
  });

  // ─── computeLegendValues ─────────────────────────────────────────────

  describe('computeLegendValues', () => {
    it('should use standard min/max for non-HELLINGER mode', () => {
      const result = MatrixUiService.computeLegendValues(-5, 10, 0, 0, MATRIX_MODES.FREQUENCY);
      expect(result.min).toBe(-5);
      expect(result.max).toBe(10);
    });

    it('should use Hellinger min/max for HELLINGER mode', () => {
      const result = MatrixUiService.computeLegendValues(-5, 10, -2, 8, MATRIX_MODES.HELLINGER);
      expect(result.min).toBe(-2);
      expect(result.max).toBe(8);
    });

    it('should set min to 0 when min is positive', () => {
      const result = MatrixUiService.computeLegendValues(5, 10, 0, 0, MATRIX_MODES.FREQUENCY);
      expect(result.min).toBe(0);
      expect(result.max).toBe(10);
    });

    it('should keep min negative when min is negative', () => {
      const result = MatrixUiService.computeLegendValues(-3, 10, 0, 0, MATRIX_MODES.MUTUAL_INFO);
      expect(result.min).toBe(-3);
    });

    it('should keep min as 0 when min is exactly 0', () => {
      const result = MatrixUiService.computeLegendValues(0, 10, 0, 0, MATRIX_MODES.FREQUENCY);
      expect(result.min).toBe(0);
      expect(result.max).toBe(10);
    });

    it('should set min to 0 for HELLINGER when hellingerMin is positive', () => {
      const result = MatrixUiService.computeLegendValues(0, 0, 3, 8, MATRIX_MODES.HELLINGER);
      expect(result.min).toBe(0);
      expect(result.max).toBe(8);
    });
  });

  // ─── hot color array ─────────────────────────────────────────────────

  describe('hot color array', () => {
    it('should have 11 entries', () => {
      expect(MatrixUiService.hot.length).toBe(11);
    });

    it('should start with white and end with black', () => {
      expect(MatrixUiService.hot[0]).toBe('#FFFFFF');
      expect(MatrixUiService.hot[10]).toBe('#000000');
    });
  });
});
