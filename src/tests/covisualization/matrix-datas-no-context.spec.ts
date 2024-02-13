import { TestBed } from '@angular/core/testing';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { HttpClientModule } from '@angular/common/http';
import { MatrixCanvasService } from '@khiops-library/components/matrix-canvas/matrix-canvas.service';
let appService: AppService;
let dimensionsDatasService: DimensionsDatasService;

let cells;
let matrixFreqsValues, matrixValues, matrixExtras;

describe('CoVisualization', () => {
  describe('Matrix Datas : NO Context [Co-simple-2vars file]', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/Co-simple-2vars.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      const [initTime, result] = dimensionsDatasService.getMatrixDatas();
      cells = result.matrixCellDatas;
    });

    it('Cell[0] cellFreq should return valid datas', () => {
      expect(cells[0].cellFreq).toEqual(2486);
    });
    it('Cell[0] w.standard should return valid datas', () => {
      expect(cells[0].w.standard).toEqual(7.142857142857143);
    });
    it('Cell[0] w.frequency should return valid datas', () => {
      expect(cells[0].w.frequency).toEqual(18.38786290487695);
    });
    it('Cell[0] cellFreqs should return valid datas', () => {
      expect(cells[0].cellFreqs).toEqual([2486]);
    });
    it('Cell[0] infosMut should return valid datas', () => {
      expect(cells[0].infosMutValue).toEqual([0.026548450553663373]);
    });
    it('Cell[0] infosMut should return valid datas', () => {
      expect(cells[0].infosMutExtra).toEqual([false]);
    });
    it('Cell[0] cellHellinger should return valid datas', () => {
      expect(cells[0].cellHellingerValue).toEqual([0.05179098913828861]);
    });
    it('Cell[0] cellHellinger should return valid datas', () => {
      expect(cells[0].cellHellingerAbsoluteValue).toEqual([
        0.002682306555922329,
      ]);
    });
    it('Cell[0] cellProbs should return valid datas', () => {
      expect(cells[0].cellProbs).toEqual([0.2768065916935753]);
    });
    it('Cell[0] cellProbsRev should return valid datas', () => {
      expect(cells[0].cellProbsRev).toEqual([0.30978193146417443]);
    });
  });

  describe('Matrix Datas : NO Context [mushroom file] check proba values when folding', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/mushroom.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      dimensionsDatasService.getMatrixDatas();

      const inputDatas = require('../mocks/covisualization/input-matrix-datas/mushroom.json');
      const graphMode = {
        mode: 'PROB_CELL',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixCanvasService.computeMatrixValues(graphMode, inputDatas, [], -1);
    });

    it('matrixFreqsValues should return valid datas', () => {
      expect(matrixFreqsValues).toEqual([6824, 1592]);
    });
    it('matrixValues should return valid datas', () => {
      expect(matrixValues).toEqual([0.8108365019011406, 0.18916349809885932]);
    });
  });

  describe('Matrix Datas : NO Context [mushroom file] check rev proba values when folding', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/mushroom.json');
      appService.setFileDatas(fileDatas);

      dimensionsDatasService.initialize();
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.constructDimensionsTrees();
      dimensionsDatasService.getMatrixDatas();

      const inputDatas = require('../mocks/covisualization/input-matrix-datas/mushroom.json');
      const graphMode = {
        mode: 'PROB_CELL_REVERSE',
        title: 'P (GillSize | GillSpacing)',
      };
      [matrixFreqsValues, matrixValues, matrixExtras] =
        MatrixCanvasService.computeMatrixValues(graphMode, inputDatas, [], -1);
    });

    it('matrixFreqsValues should return valid datas', () => {
      expect(matrixFreqsValues).toEqual([6824, 1592]);
    });
    it('matrixValues should return valid datas', () => {
      expect(matrixValues).toEqual([1, 1]);
    });
  });
});
