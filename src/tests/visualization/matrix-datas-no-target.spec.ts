import { TestBed } from '@angular/core/testing';
import { AppService } from '@khiops-visualization/providers/app.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { HttpClientModule } from '@angular/common/http';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { REPORTS } from '@khiops-library/enum/reports';
import { TranslateModule } from '@ngx-translate/core';

let appService: AppService;
let preparation2dDatasService: Preparation2dDatasService;
let preparationDatasService: PreparationDatasService;

let cells;

describe('Visualization', () => {
  describe('Matrix Datas : empty first partition regression case (MISSING) [OI_AllReports file]', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      preparation2dDatasService = TestBed.inject(Preparation2dDatasService);
      preparationDatasService = TestBed.inject(PreparationDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kv/OI_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      preparation2dDatasService.initialize();
      let currentVar = fileDatas.preparationReport.variablesStatistics[0];
      preparationDatasService.setSelectedVariable(
        currentVar,
        REPORTS.PREPARATION_REPORT,
      );
      currentVar.name1 = currentVar.name;
      currentVar.name2 = preparationDatasService.getTargetVariable(
        REPORTS.PREPARATION_REPORT,
      );
      // Set the variable
      preparation2dDatasService.setSelectedRegressionVariable(currentVar);

      const preparation2dDatas = preparation2dDatasService.getDatas();
      const result = preparation2dDatasService.getMatrixCanvasDatas(
        preparation2dDatas.selectedVariable,
      );
      cells = result.matrixCellDatas;
    });

    it('Cell[0] xDisplayaxisPart should return valid datas', () => {
      expect(cells[0].xDisplayaxisPart).toEqual('Missing');
    });

    it('Cell[0] xaxisPart should return valid datas', () => {
      expect(cells[0].xaxisPart).toEqual('-0.5,0');
    });
  });

  describe('Matrix Datas : NO target [bi2 file]', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      preparation2dDatasService = TestBed.inject(Preparation2dDatasService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kv/bi2.json');
      appService.setFileDatas(fileDatas);

      preparation2dDatasService.initialize();
      preparation2dDatasService.setSelectedVariable(
        fileDatas.bivariatePreparationReport.variablesPairsStatistics[11],
      );
      const preparation2dDatas = preparation2dDatasService.getDatas();
      const result = preparation2dDatasService.getMatrixCanvasDatas(
        preparation2dDatas.selectedVariable,
      );
      cells = result.matrixCellDatas;
    });

    it('Cell[0] cellFreq should return valid datas', () => {
      expect(cells[0].cellFreq).toEqual(22732);
    });
    it('Cell[0] w.standard should return valid datas', () => {
      expect(cells[0].w.standard).toEqual(50);
    });
    it('Cell[0] w.frequency should return valid datas', () => {
      expect(cells[0].w.frequency).toEqual(76.07182343065395);
    });
    it('Cell[0] cellFreqs should return valid datas', () => {
      expect(cells[0].cellFreqs).toEqual([22732]);
    });
    it('Cell[0] infosMutValue should return valid datas', () => {
      expect(cells[0].infosMutValue).toEqual([-0.04122635226432712]);
    });
    it('Cell[0] infosMutExtra should return valid datas', () => {
      expect(cells[0].infosMutExtra).toEqual([false]);
    });
    it('Cell[0] cellProbs should return valid datas', () => {
      expect(cells[0].cellProbs).toEqual([0.6118153680527519]);
    });
    it('Cell[0] cellProbsRev should return valid datas', () => {
      expect(cells[0].cellProbsRev).toEqual([0.6962327718223583]);
    });
  });
});
