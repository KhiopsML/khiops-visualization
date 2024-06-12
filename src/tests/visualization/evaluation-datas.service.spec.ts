import { TestBed } from '@angular/core/testing';

import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { HttpClientModule } from '@angular/common/http';
import { AppService } from '@khiops-visualization/providers/app.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { TranslateModule } from '@ngstack/translate';

let evaluationDatasService: EvaluationDatasService;
let appService: AppService;

describe('Visualization', () => {
  describe('EvaluationDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      evaluationDatasService = TestBed.inject(EvaluationDatasService);
      appService = TestBed.inject(AppService);
    });

    it('should be created', () => {
      expect(evaluationDatasService).toBeTruthy();
    });

    it('appService should be created', () => {
      expect(appService).toBeTruthy();
    });

    it('getEvaluationTypesSummary should return valid datas [adult-bivar]', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);

      evaluationDatasService.initialize();
      evaluationDatasService.getDatas();
      evaluationDatasService.getEvaluationTypes();
      const res = evaluationDatasService.getEvaluationTypesSummary();

      const expectedRes = require('../mocks/visualization/evaluation-datas/eval-summary-adult-bivar.json');
      expect(JSON.stringify(res.values)).toEqual(JSON.stringify(expectedRes));
    });

    it('getPredictorEvaluations should return valid datas [adult-bivar]', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);

      evaluationDatasService.initialize();
      evaluationDatasService.getDatas();
      evaluationDatasService.getEvaluationTypes();
      evaluationDatasService.getEvaluationTypesSummary();
      const res = evaluationDatasService.getPredictorEvaluations();

      const expectedRes = require('../mocks/visualization/evaluation-datas/predictor-eval-adult-bivar.json');
      expect(JSON.stringify(res.values)).toEqual(JSON.stringify(expectedRes));
    });

    it('getConfusionMatrix should return valid datas [adult-bivar]', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);

      evaluationDatasService.initialize();
      evaluationDatasService.getDatas();
      evaluationDatasService.getEvaluationTypes();
      evaluationDatasService.getEvaluationTypesSummary();
      evaluationDatasService.getPredictorEvaluations();
      const res = evaluationDatasService.getConfusionMatrix();

      const expectedRes = require('../mocks/visualization/evaluation-datas/conf-matrix-adult-bivar.json');
      expect(JSON.stringify(res)).toEqual(JSON.stringify(expectedRes));
    });
  });
});
