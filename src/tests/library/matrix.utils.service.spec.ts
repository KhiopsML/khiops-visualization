/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { MatrixUtilsService } from '../../app/khiops-library/components/matrix/matrix.utils.service';
import { CellModel } from '../../app/khiops-library/model/cell.model';
import { MATRIX_MODES } from '../../app/khiops-library/enum/matrix-modes';
import { UtilsService } from '../../app/khiops-library/providers/utils.service';

describe('MatrixUtilsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  // ─── computeValsByContext ────────────────────────────────────────────

  describe('computeValsByContext', () => {
    it('should sum values from cell at given part positions', () => {
      const cell = new CellModel();
      cell.matrixTotal = [10, 20, 30];
      cell.cellFreqs = [5, 10, 15];
      cell.freqColVals = [2, 4, 6];
      cell.freqLineVals = [3, 6, 9];

      const result = MatrixUtilsService.computeValsByContext(cell, [0, 2], 2);
      // matrixTotal: 10+30=40, cellFreqs: 5+15=20, freqColVals: 2+6=8, freqLineVals: 3+9=12
      expect(result[0]).toBe(40);
      expect(result[1]).toBe(20);
      expect(result[2]).toBe(8);
      expect(result[3]).toBe(12);
    });

    it('should return zeros for empty part positions', () => {
      const cell = new CellModel();
      cell.matrixTotal = [10, 20];
      cell.cellFreqs = [5, 10];
      cell.freqColVals = [2, 4];
      cell.freqLineVals = [3, 6];

      const result = MatrixUtilsService.computeValsByContext(cell, [], 0);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
      expect(result[3]).toBe(0);
    });

    it('should handle single part position', () => {
      const cell = new CellModel();
      cell.matrixTotal = [100];
      cell.cellFreqs = [50];
      cell.freqColVals = [25];
      cell.freqLineVals = [30];

      const result = MatrixUtilsService.computeValsByContext(cell, [0], 1);
      expect(result[0]).toBe(100);
      expect(result[1]).toBe(50);
      expect(result[2]).toBe(25);
      expect(result[3]).toBe(30);
    });
  });

  // ─── computeTotalMutInfo ─────────────────────────────────────────────

  describe('computeTotalMutInfo', () => {
    it('should compute sum of matrix values for MUTUAL_INFO mode with covisu', () => {
      const values = [1, 2, 3, 4, 5];
      const result = MatrixUtilsService.computeTotalMutInfo(values, MATRIX_MODES.MUTUAL_INFO, true);
      expect(result).toBe(15);
    });

    it('should return undefined for MUTUAL_INFO mode without covisu', () => {
      const values = [1, 2, 3];
      const result = MatrixUtilsService.computeTotalMutInfo(values, MATRIX_MODES.MUTUAL_INFO, false);
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-MUTUAL_INFO mode even with covisu', () => {
      const values = [1, 2, 3];
      const result = MatrixUtilsService.computeTotalMutInfo(values, MATRIX_MODES.FREQUENCY, true);
      expect(result).toBeUndefined();
    });

    it('should return undefined for HELLINGER mode', () => {
      const result = MatrixUtilsService.computeTotalMutInfo([10, 20], MATRIX_MODES.HELLINGER, true);
      expect(result).toBeUndefined();
    });

    it('should return 0 for empty array in MUTUAL_INFO covisu mode', () => {
      const result = MatrixUtilsService.computeTotalMutInfo([], MATRIX_MODES.MUTUAL_INFO, true);
      expect(result).toBe(0);
    });
  });

  // ─── getMinAndMaxFromGraphMode ───────────────────────────────────────

  describe('getMinAndMaxFromGraphMode', () => {
    it('should use minMaxValues when provided (KV case)', () => {
      const minMaxValues = {
        [MATRIX_MODES.FREQUENCY]: [0, 100],
      };
      const result = MatrixUtilsService.getMinAndMaxFromGraphMode(
        [10, 20, 30],
        minMaxValues,
        MATRIX_MODES.FREQUENCY,
      );
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(100);
    });

    it('should compute min/max from array when minMaxValues is not provided', () => {
      spyOn(UtilsService, 'getMinAndMaxFromArray').and.returnValue([5, 50]);

      const result = MatrixUtilsService.getMinAndMaxFromGraphMode(
        [5, 10, 50],
        null,
        MATRIX_MODES.FREQUENCY,
      );
      expect(result[0]).toBe(5);
      expect(result[1]).toBe(50);
    });

    it('should average min/max for MUTUAL_INFO mode without minMaxValues', () => {
      spyOn(UtilsService, 'getMinAndMaxFromArray').and.returnValue([-10, 30]);
      spyOn(UtilsService, 'averageMinAndMaxValues').and.returnValue([-20, 20]);

      const result = MatrixUtilsService.getMinAndMaxFromGraphMode(
        [-10, 0, 30],
        null,
        MATRIX_MODES.MUTUAL_INFO,
      );
      expect(result[0]).toBe(-20);
      expect(result[1]).toBe(20);
    });

    it('should compute Hellinger min/max for HELLINGER mode without minMaxValues', () => {
      spyOn(UtilsService, 'getMinAndMaxFromArray').and.returnValue([-5, 15]);
      spyOn(UtilsService, 'averageMinAndMaxValues').and.callFake((min, max) => {
        return [-max, max]; // simplified mock
      });

      const result = MatrixUtilsService.getMinAndMaxFromGraphMode(
        [-5, 0, 15],
        null,
        MATRIX_MODES.HELLINGER,
      );
      // First call: getMinAndMaxFromArray returns [-5, 15]
      // No MUTUAL_INFO averaging
      // HELLINGER averaging: averageMinAndMaxValues(-5, 15) -> [-15, 15]
      expect(result[2]).toBe(-15); // minValH
      expect(result[3]).toBe(15); // maxValH
    });
  });

  // ─── computeMatrixValues ─────────────────────────────────────────────

  describe('computeMatrixValues', () => {
    function createSimpleCell(
      cellFreq: number,
      matrixTotal: number,
      freqColVal: number,
      freqLineVal: number,
    ): CellModel {
      const cell = new CellModel();
      cell.cellFreqs = [cellFreq];
      cell.matrixTotal = [matrixTotal];
      cell.freqColVals = [freqColVal];
      cell.freqLineVals = [freqLineVal];
      cell.cellProbs = [0.5];
      cell.cellProbsRev = [0.3];
      return cell;
    }

    it('should compute frequency values for FREQUENCY mode (no context)', () => {
      const cells = [
        createSimpleCell(10, 100, 50, 20),
        createSimpleCell(20, 100, 50, 30),
      ];
      const graphMode = { mode: MATRIX_MODES.FREQUENCY };

      const [freqs, values, extras, expectedFreqs] =
        MatrixUtilsService.computeMatrixValues(graphMode, cells, undefined, -1);

      expect(freqs).toEqual([10, 20]);
      expect(values).toEqual([10, 20]);
    });

    it('should compute PROB_CELL values (no context)', () => {
      const cells = [
        createSimpleCell(10, 100, 50, 20),
        createSimpleCell(20, 100, 40, 30),
      ];
      const graphMode = { mode: MATRIX_MODES.PROB_CELL };

      const [freqs, values, extras, expectedFreqs] =
        MatrixUtilsService.computeMatrixValues(graphMode, cells, undefined, -1);

      expect(values[0]).toBe(10 / 50);
      expect(values[1]).toBe(20 / 40);
    });

    it('should compute PROB_CELL_REVERSE values (no context)', () => {
      const cells = [
        createSimpleCell(10, 100, 50, 20),
        createSimpleCell(20, 100, 40, 30),
      ];
      const graphMode = { mode: MATRIX_MODES.PROB_CELL_REVERSE };

      const [freqs, values, extras, expectedFreqs] =
        MatrixUtilsService.computeMatrixValues(graphMode, cells, undefined, -1);

      expect(values[0]).toBe(10 / 20);
      expect(values[1]).toBe(20 / 30);
    });

    it('should return 0 for PROB_CELL when division is NaN', () => {
      const cells = [createSimpleCell(0, 100, 0, 20)];
      const graphMode = { mode: MATRIX_MODES.PROB_CELL };

      const [freqs, values] =
        MatrixUtilsService.computeMatrixValues(graphMode, cells, undefined, -1);

      expect(values[0]).toBe(0);
    });

    it('should compute TARGET_FREQUENCY mode values (no context)', () => {
      const cells = [
        createSimpleCell(10, 100, 50, 20),
        createSimpleCell(20, 100, 40, 30),
      ];
      const graphMode = { mode: MATRIX_MODES.TARGET_FREQUENCY };

      const [freqs, values] =
        MatrixUtilsService.computeMatrixValues(graphMode, cells, undefined, -1);

      expect(values).toEqual(freqs);
    });

    it('should use selectedTargetIndex for frequency when set (no context)', () => {
      const cell1 = new CellModel();
      cell1.cellFreqs = [10, 20, 30];
      cell1.matrixTotal = [100];
      cell1.freqColVals = [50];
      cell1.freqLineVals = [40];
      cell1.cellProbs = [0.5];
      cell1.cellProbsRev = [0.3];

      const graphMode = { mode: MATRIX_MODES.FREQUENCY };
      const [freqs] = MatrixUtilsService.computeMatrixValues(graphMode, [cell1], undefined, 1);
      expect(freqs[0]).toBe(20);
    });

    it('should compute PROB_TARGET_WITH_CELL values (no context)', () => {
      const cell = new CellModel();
      cell.cellFreqs = [10];
      cell.matrixTotal = [100];
      cell.freqColVals = [50];
      cell.freqLineVals = [40];
      cell.cellProbs = [0.5];
      cell.cellProbsRev = [0.8];

      const graphMode = { mode: MATRIX_MODES.PROB_TARGET_WITH_CELL };
      const [freqs, values] =
        MatrixUtilsService.computeMatrixValues(graphMode, [cell], undefined, 0);

      expect(values[0]).toBe(0.8);
    });

    it('should compute PROB_CELL_WITH_TARGET values (no context)', () => {
      const cell = new CellModel();
      cell.cellFreqs = [10];
      cell.matrixTotal = [100];
      cell.freqColVals = [50];
      cell.freqLineVals = [40];
      cell.cellProbs = [0.7];
      cell.cellProbsRev = [0.3];

      const graphMode = { mode: MATRIX_MODES.PROB_CELL_WITH_TARGET };
      const [freqs, values] =
        MatrixUtilsService.computeMatrixValues(graphMode, [cell], undefined, 0);

      expect(values[0]).toBe(0.7);
    });

    it('should compute expected frequencies (no context)', () => {
      const cells = [createSimpleCell(10, 100, 50, 20)];
      const graphMode = { mode: MATRIX_MODES.FREQUENCY };

      const [, , , expectedFreqs] =
        MatrixUtilsService.computeMatrixValues(graphMode, cells, undefined, -1);

      // expectedFreq = (freqColVals * freqLineVals) / matrixTotal = (50 * 20) / 100 = 10
      expect(expectedFreqs[0]).toBe(10);
    });
  });

  // ─── getCellFrequencies ──────────────────────────────────────────────

  describe('getCellFrequencies', () => {
    it('should map cell frequencies for a simple 2x2 matrix', () => {
      const dimensionsParts = [2, 2];
      // cellPartIndexes maps: cell[0]=(0,0), cell[1]=(0,1), cell[2]=(1,0), cell[3]=(1,1)
      const cellPartIndexes = [[0, 0], [0, 1], [1, 0], [1, 1]];
      const inputCellFrequencies = [10, 20, 30, 40];

      const result = MatrixUtilsService.getCellFrequencies(
        dimensionsParts,
        cellPartIndexes,
        inputCellFrequencies,
      );

      expect(result.length).toBe(4);
      // All positions should have values
      expect(result).toContain(10);
      expect(result).toContain(20);
      expect(result).toContain(30);
      expect(result).toContain(40);
    });

    it('should handle missing cell frequencies (fill with 0)', () => {
      const dimensionsParts = [2, 2];
      // Only provide partial indexes
      const cellPartIndexes = [[0, 0], [1, 1]];
      const inputCellFrequencies = [10, 40];

      const result = MatrixUtilsService.getCellFrequencies(
        dimensionsParts,
        cellPartIndexes,
        inputCellFrequencies,
      );

      expect(result.length).toBe(4);
      // Missing cells should be 0
      const hasZero = result.some((v) => v === 0);
      expect(hasZero).toBe(true);
    });

    it('should handle multi-dimensional cell frequencies (KV bivariate)', () => {
      const dimensionsParts = [2, 2];
      const cellPartIndexes = [[0, 0], [0, 1], [1, 0], [1, 1]];
      const inputCellFrequencies = [[10, 20], [30, 40], [50, 60], [70, 80]];

      const result = MatrixUtilsService.getCellFrequencies(
        dimensionsParts,
        cellPartIndexes,
        inputCellFrequencies,
      );

      expect(result.length).toBe(4);
      // Each element should be an array
      expect(Array.isArray(result[0])).toBe(true);
    });

    it('should restructure results for KC use case with zDimension', () => {
      const dimensionsParts = [2, 2, 2]; // x, y, z
      const cellPartIndexes: number[][] = [];
      const inputCellFrequencies: number[] = [];

      // Generate all combinations for 2x2x2
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          for (let k = 0; k < 2; k++) {
            cellPartIndexes.push([i, j, k]);
            inputCellFrequencies.push(i * 4 + j * 2 + k + 1);
          }
        }
      }

      const zDimension = [{ parts: 2 }];

      const result = MatrixUtilsService.getCellFrequencies(
        dimensionsParts,
        cellPartIndexes,
        inputCellFrequencies,
        zDimension,
      );

      // For 2x2 matrix with 2 context parts, should have 4 cells
      expect(result.length).toBe(4);
      // Each cell should have 2 context values
      expect(result[0].length).toBe(2);
    });
  });

  // ─── getMinAndMaxFromGraphMode (additional edge cases) ───────────────

  describe('getMinAndMaxFromGraphMode edge cases', () => {
    it('should handle minMaxValues with different modes', () => {
      const minMaxValues = {
        [MATRIX_MODES.MUTUAL_INFO]: [-5, 5],
        [MATRIX_MODES.FREQUENCY]: [0, 100],
      };

      const result1 = MatrixUtilsService.getMinAndMaxFromGraphMode(
        [1, 2, 3],
        minMaxValues,
        MATRIX_MODES.MUTUAL_INFO,
      );
      expect(result1[0]).toBe(-5);
      expect(result1[1]).toBe(5);

      const result2 = MatrixUtilsService.getMinAndMaxFromGraphMode(
        [1, 2, 3],
        minMaxValues,
        MATRIX_MODES.FREQUENCY,
      );
      expect(result2[0]).toBe(0);
      expect(result2[1]).toBe(100);
    });
  });
});
