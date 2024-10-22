import { TestBed } from '@angular/core/testing';
import { AppService } from '@khiops-visualization/providers/app.service';
import { HttpClientModule } from '@angular/common/http';
import { MatrixService } from '@khiops-library/components/matrix/matrix.service';
import { TranslateModule } from '@ngstack/translate';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
let appService: AppService;

let cells;
let matrixFreqsValues, matrixValues, matrixExtras;

describe('Visualization', () => {
  describe('Matrix Datas : [iris2d file] check matrix values', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      appService = TestBed.inject(AppService);
    });

    it('matrixFreqsValues should return valid datas 2D FREQUENCY', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'FREQUENCY',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, -1);
      expect(matrixFreqsValues).toEqual([37, 21, 29, 12]);
    });

    it('matrixValues should return valid datas 2D FREQUENCY', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'FREQUENCY',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, -1);
      expect(matrixValues).toEqual([37, 21, 29, 12]);
    });

    it('matrixValues should return valid datas, 2D FREQUENCY_CELL index 0', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'FREQUENCY_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, 0);
      expect(matrixValues).toEqual([6, 0, 25, 0]);
    });

    it('matrixFreqsValues should return valid datas, 2D FREQUENCY_CELL index 0', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'FREQUENCY_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, 0);
      expect(matrixFreqsValues).toEqual([6, 0, 25, 0]);
    });

    it('matrixValues should return valid datas, 2D FREQUENCY_CELL index 2', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'FREQUENCY_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, 2);
      expect(matrixValues).toEqual([2, 20, 0, 9]);
    });

    it('matrixFreqsValues should return valid datas, 2D FREQUENCY_CELL index 2', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'FREQUENCY_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, 2);
      expect(matrixFreqsValues).toEqual([2, 20, 0, 9]);
    });

    it('matrixValues should return valid datas, 2D PROB_TARGET_WITH_CELL index 2', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'PROB_TARGET_WITH_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, 2);
      expect(matrixValues).toEqual([
        0.05405405405405406, 0.9523809523809523, 0, 0.75,
      ]);
    });

    it('matrixValues should return valid datas, 2D PROB_TARGET_WITH_CELL index 2', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'PROB_TARGET_WITH_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, 2);
      expect(matrixValues).toEqual([
        0.05405405405405406, 0.9523809523809523, 0, 0.75,
      ]);
    });

    it('matrixValues should return valid datas, 2D PROB_CELL_WITH_TARGET index 2', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'PROB_CELL_WITH_TARGET',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, 2);
      expect(matrixValues).toEqual([
        0.06451612903225806, 0.6451612903225806, 0, 0.2903225806451613,
      ]);
    });

    it('matrixValues should return valid datas, 2D CELL_INTEREST index 2', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/iris2d-R10.json');
      const graphMode = {
        mode: 'CELL_INTEREST',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, 2);
      expect(matrixValues).toEqual([0.225374, 0.324608, 0.343006, 0.107012]);
    });

    it('matrixFreqsValues should return valid datas Regression FREQUENCY', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/irisR-R3.json');
      const graphMode = {
        mode: 'FREQUENCY',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, -1);
      expect(matrixFreqsValues).toEqual([31, 0, 0, 0, 32, 5, 0, 0, 31]);
    });

    it('matrixValues should return valid datas Regression FREQUENCY', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/irisR-R3.json');
      const graphMode = {
        mode: 'FREQUENCY',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, -1);
      expect(matrixValues).toEqual([31, 0, 0, 0, 32, 5, 0, 0, 31]);
    });

    it('matrixValues should return valid datas Regression PROB_CELL', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/irisR-R3.json');
      const graphMode = {
        mode: 'PROB_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, -1);
      expect(matrixValues).toEqual([
        1, 0, 0, 0, 0.8648648648648649, 0.13513513513513514, 0, 0, 1,
      ]);
    });

    it('matrixValues should return valid datas Regression PROB_CELL_REVERSE', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/irisR-R3.json');
      const graphMode = {
        mode: 'PROB_CELL_REVERSE',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, -1);
      expect(matrixValues).toEqual([
        1, 0, 0, 0, 1, 0.1388888888888889, 0, 0, 0.8611111111111112,
      ]);
    });

    it('matrixValues should return valid datas Regression MUTUAL_INFO', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/irisR-R3.json');
      const graphMode = {
        mode: MATRIX_MODES.MUTUAL_INFO,
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, -1);
      expect(matrixValues).toEqual([
        0.36358699005184597, 0, 0, 0, 0.31812587878476467, -0.04999389336018405,
        0, 0, 0.31676392183871593,
      ]);
    });

    it('matrixExtras should return valid datas Regression MUTUAL_INFO', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/irisR-R3.json');
      const graphMode = {
        mode: MATRIX_MODES.MUTUAL_INFO,
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, -1);
      expect(matrixExtras).toEqual([
        false,
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        false,
      ]);
    });

    it('matrixFreqsValues should return valid datas Regression MUTUAL_INFO', () => {
      const inputDatas = require('../mocks/visualization/matrix-inputs/irisR-R3.json');
      const graphMode = {
        mode: MATRIX_MODES.MUTUAL_INFO,
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, undefined, -1);
      expect(matrixFreqsValues).toEqual([31, 0, 0, 0, 32, 5, 0, 0, 31]);
    });
  });
});
