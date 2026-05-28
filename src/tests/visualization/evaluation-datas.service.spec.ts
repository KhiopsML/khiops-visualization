/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';

import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { provideHttpClient } from '@angular/common/http';
import { AppService } from '@khiops-visualization/providers/app.service';
import { TranslateModule } from '@ngstack/translate';
import { EvaluationTypeModel } from '@khiops-visualization/model/evaluation-type.model';
import { EvaluationPredictorModel } from '@khiops-visualization/model/evaluation-predictor.model';
import { TYPES } from '@khiops-library/enum/types';

let evaluationDatasService: EvaluationDatasService;
let appService: AppService;

function initAdultBivar() {
  const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
  appService.setFileDatas(fileDatas);
  evaluationDatasService.initialize();
  evaluationDatasService.getEvaluationTypes();
  evaluationDatasService.getEvaluationTypesSummary();
  evaluationDatasService.getPredictorEvaluations();
}

describe('Visualization', () => {
  describe('EvaluationDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
  providers: [provideHttpClient()],
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

    // ---- initialize ----
    it('initialize should reset the evaluation datas model', () => {
      initAdultBivar();
      const datasBefore = evaluationDatasService.getDatas();
      expect(datasBefore.evaluationTypes).toBeTruthy();

      evaluationDatasService.initialize();
      const datasAfter = evaluationDatasService.getDatas();
      expect(datasAfter.evaluationTypes).toBeUndefined();
      expect(datasAfter.selectedEvaluationTypeVariable).toBeUndefined();
      expect(datasAfter.selectedPredictorEvaluationVariable).toBeUndefined();
    });

    // ---- getDatas ----
    it('getDatas should return the evaluation datas model', () => {
      const datas = evaluationDatasService.getDatas();
      expect(datas).toBeTruthy();
      expect(datas.confusionMatrixType).toBeDefined();
    });

    // ---- setSelectedEvaluationTypeVariable ----
    it('setSelectedEvaluationTypeVariable should update the selection', () => {
      const evalType = new EvaluationTypeModel();
      evalType.type = 'Train';
      evalType.dictionary = 'TestDict';
      evaluationDatasService.setSelectedEvaluationTypeVariable(evalType);
      const datas = evaluationDatasService.getDatas();
      expect(datas.selectedEvaluationTypeVariable).toBe(evalType);
      expect(datas.selectedEvaluationTypeVariable.type).toBe('Train');
    });

    it('setSelectedEvaluationTypeVariable should accept undefined', () => {
      evaluationDatasService.setSelectedEvaluationTypeVariable(undefined);
      const datas = evaluationDatasService.getDatas();
      expect(datas.selectedEvaluationTypeVariable).toBeUndefined();
    });

    // ---- setSelectedPredictorEvaluationVariable ----
    it('setSelectedPredictorEvaluationVariable should update the selection', () => {
      initAdultBivar();
      const predictors = evaluationDatasService.getDatas().predictorEvaluations;
      const predictor = predictors.values[1];
      evaluationDatasService.setSelectedPredictorEvaluationVariable(predictor);
      expect(evaluationDatasService.getDatas().selectedPredictorEvaluationVariable).toBe(predictor);
    });

    // ---- getEvaluationTypes ----
    it('getEvaluationTypes should return evaluation reports [adult-bivar]', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);
      evaluationDatasService.initialize();
      const types = evaluationDatasService.getEvaluationTypes();
      expect(types).toBeTruthy();
      expect(types.length).toBe(2); // trainEvaluationReport + testEvaluationReport
    });

    it('getEvaluationTypes should return empty array when no evaluation reports exist', () => {
      appService.setFileDatas({ preparationReport: { reportType: 'Preparation' } });
      evaluationDatasService.initialize();
      const types = evaluationDatasService.getEvaluationTypes();
      expect(types).toBeTruthy();
      expect(types.length).toBe(0);
    });

    // ---- getEvaluationTypesSummary ----
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

    it('getEvaluationTypesSummary should have correct displayedColumns', () => {
      initAdultBivar();
      const res = evaluationDatasService.getEvaluationTypesSummary();
      expect(res.displayedColumns).toBeTruthy();
      expect(res.displayedColumns.length).toBe(3);
      expect(res.displayedColumns[0].field).toBe('type');
      expect(res.displayedColumns[1].field).toBe('dictionary');
      expect(res.displayedColumns[2].field).toBe('instances');
    });

    it('getEvaluationTypesSummary should auto-select first evaluation type', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);
      evaluationDatasService.initialize();
      evaluationDatasService.getEvaluationTypes();
      evaluationDatasService.getEvaluationTypesSummary();

      const datas = evaluationDatasService.getDatas();
      expect(datas.selectedEvaluationTypeVariable).toBeTruthy();
      expect(datas.selectedEvaluationTypeVariable.type).toBe('Train');
    });

    it('getEvaluationTypesSummary should not override existing selection', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);
      evaluationDatasService.initialize();
      evaluationDatasService.getEvaluationTypes();

      const evalType = new EvaluationTypeModel();
      evalType.type = 'Test';
      evaluationDatasService.setSelectedEvaluationTypeVariable(evalType);

      evaluationDatasService.getEvaluationTypesSummary();
      const datas = evaluationDatasService.getDatas();
      expect(datas.selectedEvaluationTypeVariable.type).toBe('Test');
    });

    it('getEvaluationTypesSummary should return empty values when no evaluation types', () => {
      appService.setFileDatas({ preparationReport: { reportType: 'Preparation' } });
      evaluationDatasService.initialize();
      evaluationDatasService.getEvaluationTypes();
      const res = evaluationDatasService.getEvaluationTypesSummary();
      expect(res.values).toBeUndefined();
    });

    // ---- getPredictorEvaluations ----
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

    it('getPredictorEvaluations should auto-select first predictor', () => {
      initAdultBivar();
      const datas = evaluationDatasService.getDatas();
      expect(datas.selectedPredictorEvaluationVariable).toBeTruthy();
      expect(datas.selectedPredictorEvaluationVariable.name).toBe('MAP Naive Bayes');
    });

    it('getPredictorEvaluations should not override existing predictor selection', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);
      evaluationDatasService.initialize();
      evaluationDatasService.getEvaluationTypes();
      evaluationDatasService.getEvaluationTypesSummary();

      // Manually set a predictor selection before calling getPredictorEvaluations
      const mockPredictor = new EvaluationPredictorModel('Test', 'Test', {
        rank: 'R2', type: 'Classifier', family: 'Selective Naive Bayes',
        name: 'Selective Naive Bayes', accuracy: 0.869035, compression: 0.469923, auc: 0.920437,
      });
      evaluationDatasService.setSelectedPredictorEvaluationVariable(mockPredictor);
      evaluationDatasService.getPredictorEvaluations();

      const datas = evaluationDatasService.getDatas();
      expect(datas.selectedPredictorEvaluationVariable.name).toBe('Selective Naive Bayes');
    });

    it('getPredictorEvaluations should have displayedColumns with hidden fields', () => {
      initAdultBivar();
      const res = evaluationDatasService.getPredictorEvaluations();
      expect(res.displayedColumns).toBeTruthy();
      const hiddenFields = res.displayedColumns.filter(c => !c.show);
      const hiddenFieldNames = hiddenFields.map(c => c.field);
      expect(hiddenFieldNames).toContain('_id');
      expect(hiddenFieldNames).toContain('rank');
      expect(hiddenFieldNames).toContain('family');
      expect(hiddenFieldNames).toContain('evaluationType');
    });

    it('getPredictorEvaluations should compute robustness for Test predictors', () => {
      initAdultBivar();
      const res = evaluationDatasService.getPredictorEvaluations();
      const testPredictors = res.values.filter(v => v.type === 'Test');
      for (const pred of testPredictors) {
        if (pred.name !== 'Optimal') {
          expect(pred.robustness).toBeDefined();
          expect(typeof pred.robustness).toBe('number');
          expect(pred.robustness).toBeGreaterThan(0);
          expect(pred.robustness).toBeLessThanOrEqual(1);
        }
      }
    });

    it('getPredictorEvaluations should return empty when no evaluationTypesSummary values', () => {
      evaluationDatasService.initialize();
      const res = evaluationDatasService.getPredictorEvaluations();
      expect(res.values).toBeUndefined();
      expect(res.displayedColumns).toBeUndefined();
    });

    // ---- getConfusionMatrix ----
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

    it('getConfusionMatrix should return undefined when no predictor selected', () => {
      evaluationDatasService.initialize();
      const res = evaluationDatasService.getConfusionMatrix();
      expect(res).toBeUndefined();
    });

    it('getConfusionMatrix with COVERAGE type should have % in headers', () => {
      initAdultBivar();
      const res = evaluationDatasService.getConfusionMatrix(TYPES.COVERAGE);
      expect(res).toBeTruthy();
      // Non-target columns should have % prefix
      const nonTargetColumns = res.displayedColumns.filter(c => c.field !== 'target');
      for (const col of nonTargetColumns) {
        expect(col.headerName.startsWith('%')).toBe(true);
      }
    });

    it('getConfusionMatrix with COVERAGE type should have percentage values', () => {
      initAdultBivar();
      const res = evaluationDatasService.getConfusionMatrix(TYPES.COVERAGE);
      expect(res.values).toBeTruthy();
      for (const row of res.values) {
        // Each non-target field should be a number between 0 and 100
        for (const key of Object.keys(row)) {
          if (key !== 'target') {
            expect(typeof row[key]).toBe('number');
            expect(row[key]).toBeGreaterThanOrEqual(0);
            expect(row[key]).toBeLessThanOrEqual(100);
          }
        }
      }
    });

    it('getConfusionMatrix should handle Test evaluation type', () => {
      initAdultBivar();
      // Select the Test evaluation type
      const datas = evaluationDatasService.getDatas();
      const testType = datas.evaluationTypesSummary.values.find(v => v.type === 'Test');
      evaluationDatasService.setSelectedEvaluationTypeVariable(testType);

      const res = evaluationDatasService.getConfusionMatrix();
      expect(res).toBeTruthy();
      expect(res.values).toBeTruthy();
      expect(res.values.length).toBe(2);
    });

    it('getConfusionMatrix should handle empty targetValue with dash replacement', () => {
      initAdultBivar();
      const res = evaluationDatasService.getConfusionMatrix();
      // Verify that column headers don't contain empty strings (should be '-' instead)
      for (const col of res.displayedColumns) {
        if (col.field !== 'target') {
          expect(col.headerName).not.toBe('');
        }
      }
    });

    it('getConfusionMatrix target values should be prefixed with $', () => {
      initAdultBivar();
      const res = evaluationDatasService.getConfusionMatrix();
      for (const row of res.values) {
        expect(row.target.startsWith('$')).toBe(true);
      }
    });

    // ---- getPredictorEvaluationVariableFromEvaluationType ----
    it('getPredictorEvaluationVariableFromEvaluationType should find matching predictor', () => {
      initAdultBivar();
      const result = evaluationDatasService.getPredictorEvaluationVariableFromEvaluationType('Train');
      expect(result).toBeTruthy();
      expect(result.type).toBe('Train');
    });

    it('getPredictorEvaluationVariableFromEvaluationType should return undefined for unknown type', () => {
      initAdultBivar();
      const result = evaluationDatasService.getPredictorEvaluationVariableFromEvaluationType('Unknown');
      expect(result).toBeUndefined();
    });

    // ---- getEvaluationVariableFromPredictorEvaluationType ----
    it('getEvaluationVariableFromPredictorEvaluationType should find matching evaluation type', () => {
      initAdultBivar();
      const result = evaluationDatasService.getEvaluationVariableFromPredictorEvaluationType('Train');
      expect(result).toBeTruthy();
      expect(result.type).toBe('Train');
    });

    it('getEvaluationVariableFromPredictorEvaluationType should return undefined for unknown type', () => {
      initAdultBivar();
      const result = evaluationDatasService.getEvaluationVariableFromPredictorEvaluationType('Unknown');
      expect(result).toBeUndefined();
    });

    // ---- getLiftTargets ----
    it('getLiftTargets should return targets [adult-bivar]', () => {
      initAdultBivar();
      const result = evaluationDatasService.getLiftTargets();
      expect(result).toBeTruthy();
      expect(result.targets).toBeTruthy();
      expect(result.targets.length).toBe(2);
      expect(result.targets).toContain('less');
      expect(result.targets).toContain('more');
    });

    it('getLiftTargets should select mainTargetValue when consistent', () => {
      initAdultBivar();
      const result = evaluationDatasService.getLiftTargets();
      expect(result).toBeTruthy();
      // mainTargetValue is "more" in adult-bivar
      expect(result.selected).toBe('more');
    });

    it('getLiftTargets should use currentTarget when provided', () => {
      initAdultBivar();
      const result = evaluationDatasService.getLiftTargets('less');
      expect(result).toBeTruthy();
      expect(result.selected).toBe('less');
    });

    it('getLiftTargets should return undefined when no evaluation report', () => {
      appService.setFileDatas({ preparationReport: { reportType: 'Preparation' } });
      evaluationDatasService.initialize();
      const result = evaluationDatasService.getLiftTargets();
      expect(result).toBeUndefined();
    });

    it('getLiftTargets should handle Test predictor selection', () => {
      initAdultBivar();
      const datas = evaluationDatasService.getDatas();
      const testPredictor = datas.predictorEvaluations.values.find(v => v.type === 'Test');
      evaluationDatasService.setSelectedPredictorEvaluationVariable(testPredictor);
      const result = evaluationDatasService.getLiftTargets();
      expect(result).toBeTruthy();
      expect(result.targets).toBeTruthy();
    });

    // ---- getLiftGraphDatas ----
    it('getLiftGraphDatas should return chart data with target [adult-bivar]', () => {
      initAdultBivar();
      const result = evaluationDatasService.getLiftGraphDatas('more');
      expect(result).toBeTruthy();
      expect(result.labels).toBeTruthy();
      expect(result.labels.length).toBe(1001);
      expect(result.datasets).toBeTruthy();
      expect(result.datasets.length).toBeGreaterThan(0);
    });

    it('getLiftGraphDatas should set correct chart dataset properties', () => {
      initAdultBivar();
      const result = evaluationDatasService.getLiftGraphDatas('more');
      for (const dataset of result.datasets) {
        expect(dataset.pointRadius).toBe(0);
        expect(dataset.pointHitRadius).toBe(20);
        expect(dataset.pointHoverRadius).toBe(2);
      }
    });

    it('getLiftGraphDatas should generate x-axis values from 0 to 100', () => {
      initAdultBivar();
      const result = evaluationDatasService.getLiftGraphDatas('more');
      expect(result.labels[0]).toBe('0');
      expect(result.labels[1]).toBe('0.1');
      expect(result.labels[1000]).toBe('100.0');
    });

    it('getLiftGraphDatas should include random line when target is specified', () => {
      initAdultBivar();
      const result = evaluationDatasService.getLiftGraphDatas('more');
      // When a target is specified, there should be random data among the datasets
      // The random line name comes from translation key 'GLOBAL.RANDOM'
      expect(result.datasets.length).toBeGreaterThanOrEqual(1);
    });

    it('getLiftGraphDatas should initialize liftGraphDisplayedValues', () => {
      initAdultBivar();
      evaluationDatasService.getLiftGraphDatas('more');
      const datas = evaluationDatasService.getDatas();
      expect(datas.liftGraphDisplayedValues).toBeTruthy();
      expect(datas.liftGraphDisplayedValues.length).toBeGreaterThan(0);
    });

    it('getLiftGraphDatas called twice should reuse displayed values', () => {
      initAdultBivar();
      evaluationDatasService.getLiftGraphDatas('more');
      const firstValues = evaluationDatasService.getDatas().liftGraphDisplayedValues;
      const firstLength = firstValues.length;

      evaluationDatasService.getLiftGraphDatas('more');
      const secondValues = evaluationDatasService.getDatas().liftGraphDisplayedValues;
      expect(secondValues.length).toBe(firstLength);
    });

    it('getLiftGraphDatas without target should return empty datasets when no recCurves', () => {
      initAdultBivar();
      const result = evaluationDatasService.getLiftGraphDatas(undefined);
      // adult-bivar is a classification, no recCurves => empty datasets
      expect(result).toBeTruthy();
      expect(result.datasets.length).toBe(0);
    });

    // ---- generateLiftCurveValuesForEvaluation ----
    it('generateLiftCurveValuesForEvaluation should return data for Train type', () => {
      initAdultBivar();
      const xAxis = ['0', '0.1', '0.2'];
      const result = evaluationDatasService.generateLiftCurveValuesForEvaluation(xAxis, 'Train', 'more');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      for (const entry of result) {
        expect(entry.name).toContain('Train');
        expect(entry.series.length).toBe(3);
      }
    });

    it('generateLiftCurveValuesForEvaluation should return data for Test type', () => {
      initAdultBivar();
      const xAxis = ['0', '0.1'];
      const result = evaluationDatasService.generateLiftCurveValuesForEvaluation(xAxis, 'Test', 'less');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      for (const entry of result) {
        expect(entry.name).toContain('Test');
      }
    });

    it('generateLiftCurveValuesForEvaluation should return empty for non-matching target', () => {
      initAdultBivar();
      const xAxis = ['0', '0.1'];
      const result = evaluationDatasService.generateLiftCurveValuesForEvaluation(xAxis, 'Train', 'nonexistent');
      expect(result).toBeTruthy();
      expect(result.length).toBe(0);
    });

    // ---- generateRandomLiftDatas ----
    it('generateRandomLiftDatas should return diagonal data', () => {
      const xAxis = [0, 1, 2, 3];
      const result = evaluationDatasService.generateRandomLiftDatas(xAxis, 'GLOBAL.RANDOM');
      expect(result).toBeTruthy();
      expect(result.length).toBe(1);
      expect(result[0].series.length).toBe(4);
      // Random lift data should have name === value (diagonal)
      for (let i = 0; i < result[0].series.length; i++) {
        expect(result[0].series[i].name).toBe(xAxis[i]);
        expect(result[0].series[i].value).toBe(xAxis[i]);
      }
    });

    // ---- isRegressionAnalysis ----
    it('isRegressionAnalysis should return false for classification [adult-bivar]', () => {
      initAdultBivar();
      expect(evaluationDatasService.isRegressionAnalysis()).toBe(false);
    });

    it('isRegressionAnalysis should return true when trainEvaluationReport has regression task', () => {
      appService.setFileDatas({
        trainEvaluationReport: {
          reportType: 'Evaluation',
          evaluationType: 'Train',
          summary: { learningTask: 'Regression analysis' },
        },
      });
      evaluationDatasService.initialize();
      expect(evaluationDatasService.isRegressionAnalysis()).toBe(true);
    });

    it('isRegressionAnalysis should return true when preparationReport has regression task', () => {
      appService.setFileDatas({
        preparationReport: {
          reportType: 'Preparation',
          summary: { learningTask: 'Regression analysis' },
        },
      });
      evaluationDatasService.initialize();
      expect(evaluationDatasService.isRegressionAnalysis()).toBe(true);
    });

    it('isRegressionAnalysis should return false when no reports', () => {
      appService.setFileDatas({});
      evaluationDatasService.initialize();
      expect(evaluationDatasService.isRegressionAnalysis()).toBe(false);
    });
  });
});
