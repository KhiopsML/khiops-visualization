import { TestBed } from '@angular/core/testing';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { HttpClientModule } from '@angular/common/http';
import { MatrixService } from '@khiops-library/components/matrix/matrix.service';
import { TranslateModule } from '@ngstack/translate';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';

let appService: AppService;
let dimensionsDatasService: DimensionsDatasService;

let cells;
let matrixFreqsValues, matrixValues, matrixExtras;

describe('CoVisualization', () => {
  describe('Matrix Datas : One Context [zero-except file]', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/zero-except.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      const result = dimensionsDatasService.getMatrixDatas();
      cells = result.matrixCellDatas;
    });

    it('Cell[0] cellFreqshould return valid datas', () => {
      expect(cells[0].cellFreq).toEqual(2000);
    });
    it('Cell[0] w.standard should return valid datas', () => {
      expect(cells[0].w.standard).toEqual(25);
    });
    it('Cell[0] w.frequency should return valid datas', () => {
      expect(cells[0].w.frequency).toEqual(33.333333333333336);
    });
    it('Cell[0] cellFreqs should return valid datas', () => {
      expect(cells[0].cellFreqs).toEqual([2000, 0]);
    });
    it('Cell[0] infosMut should return valid datas', () => {
      expect(cells[0].infosMutValue).toEqual([0.08552129353453972, 0]);
    });
    it('Cell[0] infosMut should return valid datas', () => {
      expect(cells[0].infosMutExtra).toEqual([false, true]);
    });
    it('Cell[0] cellHellinger should return valid datas', () => {
      expect(cells[0].cellHellingerValue).toEqual([
        0.08251563190214278, -0.2721655269759087,
      ]);
    });
    it('Cell[0] cellHellinger should return valid datas', () => {
      expect(cells[0].cellHellingerAbsoluteValue).toEqual([
        0.0068088295082099235, 0.07407407407407407,
      ]);
    });
    it('Cell[0] cellProbs should return valid datas', () => {
      expect(cells[0].cellProbs).toEqual([0.5714285714285714, 0]);
    });
    it('Cell[0] cellProbsRev should return valid datas', () => {
      expect(cells[0].cellProbsRev).toEqual([0.5714285714285714, 0]);
    });

    it('Cell[1] infosMut should return valid datas', () => {
      expect(cells[1].infosMutValue).toEqual([0.041885738046817694, 0]);
    });
    it('Cell[1] cellHellinger should return valid datas', () => {
      expect(cells[1].cellHellingerValue).toEqual([
        0.048207140552315175, -0.31426968052735443,
      ]);
    });
    it('Cell[1] cellHellinger should return valid datas', () => {
      expect(cells[1].cellHellingerAbsoluteValue).toEqual([
        0.00232392840023067, 0.09876543209876541,
      ]);
    });
    it('Cell[1] cellProbs should return valid datas', () => {
      expect(cells[1].cellProbs).toEqual([0.42857142857142855, 0]);
    });
    it('Cell[1] cellProbsRev should return valid datas', () => {
      expect(cells[1].cellProbsRev).toEqual([0.5, 0]);
    });

    it('Cell[3] cellProbs should return valid datas', () => {
      expect(cells[3].cellProbs).toEqual([0.16666666666666666, 0]);
    });
    it('Cell[3] cellProbsRev should return valid datas', () => {
      expect(cells[3].cellProbsRev).toEqual([0.14285714285714285, 0]);
    });
  });

  describe('Matrix Datas : one Context [zero-except file] check proba values without folding', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/zero-except.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      dimensionsDatasService.getMatrixDatas();

      const inputDatas = require('../mocks/covisualization/input-matrix-datas/zero-except.json');
      const graphMode = {
        mode: 'PROB_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, [[0]], -1);
    });

    it('matrixValues should return valid datas', () => {
      expect(matrixValues).toEqual([
        0.5714285714285714, 0.42857142857142855, 0, 0.16666666666666666,
        0.3333333333333333, 0.5, 0.4, 0.2, 0.4,
      ]);
    });
  });

  describe('Matrix Datas : one Context [zero-except file] check proba values with folding', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/zero-except.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      dimensionsDatasService.getMatrixDatas();

      const inputDatas = require('../mocks/covisualization/input-matrix-datas/zero-except-folding.json');
      const graphMode = {
        mode: 'PROB_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, [[0, 1]], -1);
    });

    it('matrixValues should return valid datas', () => {
      expect(matrixValues).toEqual([
        0.36363636363636365, 0.2, 0.6363636363636364, 0.8,
      ]);
    });
  });

  describe('Matrix Datas : one Context [adultmissing file] check rev proba values with complex folding', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/adultmissing.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      dimensionsDatasService.getMatrixDatas();

      const inputDatas = require('../mocks/covisualization/input-matrix-datas/adultmissing-complex-folding.json');
      const graphMode = {
        mode: 'PROB_CELL_REVERSE',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, [[0, 1]], -1);
    });

    it('matrixValues should return valid datas', () => {
      expect(matrixValues).toEqual([
        0.339662447257384, 0.011421041071820778, 0.14737793851717904,
        0.18075993850208655, 0.3297166968053044, 0.10806061937184275,
        0.015030530765617662, 0.15594175669328322, 0.09581963363081258,
        0.15702230259192285, 0.520755545793982, 0.5246594645373415,
        0.026220614828209764, 0.17900285526026796, 0.20854861437294506,
      ]);
    });
  });

  describe('Matrix Datas : one Context [adultmissing file] 4 cells folding check Hellinger "C3" values with complex folding', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/adultmissing.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      dimensionsDatasService.getMatrixDatas();

      const inputDatas = require('../mocks/covisualization/input-matrix-datas/adultmissing-4-cells-folding.json');
      const graphMode = {
        mode: 'HELLINGER',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, [[0, 1]], -1);
    });

    it('matrixFreqsValues should return valid datas', () => {
      expect(matrixFreqsValues).toEqual([1097, 2221, 5902, 780]);
    });
    it('matrixValues should return valid datas', () => {
      expect(matrixValues).toEqual([
        -0.15068927709358787, 0.15572268402859757, 0.08437840607554925,
        -0.16851740992756037,
      ]);
    });
    it('matrixExtras should return valid datas', () => {
      expect(matrixExtras).toEqual([
        0.022707258230988105, 0.024249554321070437, 0.007119715411850287,
        0.028398117448693423,
      ]);
    });
  });

  describe('Matrix Datas : one Context [adultmissing file] 4 cells folding check Hellinger "Less" values with complex folding', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/adultmissing.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      dimensionsDatasService.getMatrixDatas();

      const inputDatas = require('../mocks/covisualization/input-matrix-datas/adultmissing-4-cells-folding.json');
      const graphMode = {
        mode: 'HELLINGER',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, [[0]], -1);
    });

    it('matrixFreqsValues should return valid datas', () => {
      expect(matrixFreqsValues).toEqual([966, 2199, 3791, 665]);
    });
    it('matrixValues should return valid datas', () => {
      expect(matrixValues).toEqual([
        -0.1531182749055528, 0.1421051792149562, 0.10116962045338274,
        -0.1733601625664079,
      ]);
    });
    it('matrixExtras should return valid datas', () => {
      expect(matrixExtras).toEqual([
        0.02344520611005244, 0.02019388195971482, 0.010235292102681518,
        0.030053745965051375,
      ]);
    });
  });

  describe('Matrix Datas : one Context [adultmissing file] 4 cells folding check Mutual information "Less" values with complex folding', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/adultmissing.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      dimensionsDatasService.getMatrixDatas();

      const inputDatas = require('../mocks/covisualization/input-matrix-datas/adultmissing-4-cells-folding.json');
      const graphMode = {
        mode: MATRIX_MODES.MUTUAL_INFO,
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixService.computeMatrixValues(graphMode, inputDatas, [[0]], -1);
    });

    it('matrixFreqsValues should return valid datas', () => {
      expect(matrixFreqsValues).toEqual([966, 2199, 3791, 665]);
    });
    it('matrixValues should return valid datas', () => {
      expect(matrixValues).toEqual([
        -0.09068740099008493, 0.177321751139612, 0.15404200025499357,
        -0.0805863243561449,
      ]);
    });
    it('matrixExtras should return valid datas', () => {
      expect(matrixExtras).toEqual([false, false, false, false]);
    });
  });
});
