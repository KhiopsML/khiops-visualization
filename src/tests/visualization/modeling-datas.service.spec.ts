/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';

import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { provideHttpClient } from '@angular/common/http';
import { AppService } from '@khiops-visualization/providers/app.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import { TranslateModule } from '@ngstack/translate';

let modelingDatasService: ModelingDatasService;
let preparationDatasService: PreparationDatasService;
let appService: AppService;

describe('Visualization', () => {
  describe('ModelingDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
  providers: [provideHttpClient()],
      });

      // Inject services
      modelingDatasService = TestBed.inject(ModelingDatasService);
      preparationDatasService = TestBed.inject(PreparationDatasService);
      appService = TestBed.inject(AppService);
    });

    it('should be created', () => {
      expect(modelingDatasService).toBeTruthy();
    });

    it('appService should be created', () => {
      expect(appService).toBeTruthy();
    });

    it('getVariableFromName should return valid datas [C100_AllReports, Numerical, Mean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5, R6]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      modelingDatasService.initialize();

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[5].name,
        REPORT.PREPARATION_REPORT,
      );
      const res = JSON.stringify(
        modelingDatasService.getVariableFromName(
          'Mean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5',
        ),
      );

      const expectedRes = {
        preparedName: 'PMean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5',
        name: 'Mean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5',
        level: 0.00631521,
        weight: 0.128841,
      };
      expect(res).toEqual(JSON.stringify(expectedRes));
    });

    it('setSelectedPredictor and getTrainedPredictorDisplayedColumns should return valid datas [C100_AllReports, R2]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      modelingDatasService.initialize();

      modelingDatasService.setSelectedPredictor({
        rank: 'R2',
        type: 'Classifier',
        family: 'Selective Naive Bayes',
        name: 'Selective Naive Bayes',
        variables: 100,
      });
      modelingDatasService.getTrainedPredictorListDatas();
      const res = JSON.stringify(
        modelingDatasService.getTrainedPredictorDisplayedColumns(),
      );

      const expectedRes = [
        {
          headerName: 'Name',
          field: 'name',
          hidden: false,
          tooltip: 'TOOLTIPS.MODELING.VARIABLES.NAME',
        },
        {
          headerName: 'Level',
          field: 'level',
          hidden: false,
          tooltip: 'TOOLTIPS.MODELING.VARIABLES.LEVEL',
        },
        {
          headerName: 'Weight',
          field: 'weight',
          hidden: false,
          tooltip: 'TOOLTIPS.MODELING.VARIABLES.WEIGHT',
        },
        {
          headerName: 'Map',
          field: 'map',
          hidden: false,
          tooltip: 'TOOLTIPS.MODELING.VARIABLES.MAP',
        },
      ];
      expect(res).toEqual(JSON.stringify(expectedRes));
    });

    // ===== getDatas =====

    describe('getDatas', () => {
      it('should return undefined before initialize', () => {
        expect(modelingDatasService.getDatas()).toBeUndefined();
      });

      it('should return ModelingDatasModel with selectedVariable after initialize with C100', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();
        const datas = modelingDatasService.getDatas();
        // After init, selectedVariable is the first preparation variable (R001)
        expect(datas.selectedVariable).toBeTruthy();
        expect(datas.selectedVariable.name).toBe('Mean(LLFields.missing energy magnitude)');
      });
    });

    // ===== setSelectedVariable =====

    describe('setSelectedVariable', () => {
      it('should set selected variable', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        const mockVar = { name: 'testVar', rank: 'R1' };
        modelingDatasService.setSelectedVariable(mockVar);
        expect(modelingDatasService.getSelectedVariable()).toBe(mockVar);
      });

      it('should call initSelectedVariable when object is falsy', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        spyOn(modelingDatasService, 'initSelectedVariable');
        modelingDatasService.setSelectedVariable(null);
        expect(modelingDatasService.initSelectedVariable).toHaveBeenCalled();
      });
    });

    // ===== removeSelectedVariable =====

    describe('removeSelectedVariable', () => {
      it('should remove selected variable', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        modelingDatasService.removeSelectedVariable();
        expect(modelingDatasService.getSelectedVariable()).toBeUndefined();
      });

      it('should throw when modelingDatas not initialized', () => {
        expect(() => modelingDatasService.removeSelectedVariable()).toThrow();
      });
    });

    // ===== getSelectedVariable =====

    describe('getSelectedVariable', () => {
      it('should return undefined before initialization', () => {
        expect(modelingDatasService.getSelectedVariable()).toBeUndefined();
      });

      it('should return "Mean(LLFields.missing energy magnitude)" after C100 initialization (first preparation variable)', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();
        const result = modelingDatasService.getSelectedVariable();
        expect(result.name).toBe('Mean(LLFields.missing energy magnitude)');
        expect(result.rank).toBe('R001');
        expect(result.type).toBe('Numerical');
        expect(result.level).toBe(0.0094323);
      });
    });

    // ===== initSelectedVariable =====

    describe('initSelectedVariable', () => {
      it('should select "Mean(LLFields.lepton pT)" from R1 first var in C100', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        // Reset then re-init
        modelingDatasService.removeSelectedVariable();
        expect(modelingDatasService.getSelectedVariable()).toBeUndefined();

        modelingDatasService.initSelectedVariable();
        const selectedVar = modelingDatasService.getSelectedVariable();
        // R1 first var in trainedPredictorsDetails is "Mean(LLFields.lepton pT)"
        expect(selectedVar.name).toBe('Mean(LLFields.lepton pT)');
      });

      it('should select "capital_gain" from R1 first var in AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        modelingDatasService.removeSelectedVariable();
        modelingDatasService.initSelectedVariable();
        const selectedVar = modelingDatasService.getSelectedVariable();
        // AdultAllReports R1 first var is "capital_gain"
        expect(selectedVar.name).toBe('capital_gain');
      });

      it('should not throw when no modelingReport', () => {
        appService.initialize();
        appService.setFileDatas({ tool: 'Khiops', preparationReport: {} });
        preparationDatasService.initialize();
        modelingDatasService.initialize();
        expect(() => modelingDatasService.initSelectedVariable()).not.toThrow();
      });
    });

    // ===== getSummaryDatas =====

    describe('getSummaryDatas', () => {
      it('should return summary with dictionary=RootHIGGSOne, targetVariable=Class, instances=10500000 for C100', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        const summaryDatas = modelingDatasService.getSummaryDatas();
        expect(summaryDatas.length).toBe(6);
        const dictItem = summaryDatas.find(e => e.title === 'GLOBAL.DICTIONARY');
        expect(dictItem.value).toBe('RootHIGGSOne');
        const targetItem = summaryDatas.find(e => e.title === 'GLOBAL.TARGET_VARIABLE');
        expect(targetItem.value).toBe('Class');
        const instancesItem = summaryDatas.find(e => e.title === 'GLOBAL.INSTANCES');
        expect(instancesItem.value).toBe(10500000);
        const dbItem = summaryDatas.find(e => e.title === 'GLOBAL.DATABASE');
        expect(dbItem.value).toBe('MTRootHiggsTrain.txt');
        const taskItem = summaryDatas.find(e => e.title === 'GLOBAL.LEARNING_TASK');
        expect(taskItem.value).toBe('Classification analysis');
      });

      it('should return undefined when no summary in report', () => {
        appService.initialize();
        const result = modelingDatasService.getSummaryDatas();
        expect(result).toBeUndefined();
      });
    });

    // ===== getTrainedPredictorsSummaryDatas =====

    describe('getTrainedPredictorsSummaryDatas', () => {
      it('should return 2 predictors for C100: MAP Naive Bayes (19 vars) and Selective Naive Bayes (100 vars)', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        const result = modelingDatasService.getTrainedPredictorsSummaryDatas();
        expect(result.length).toBe(2);
        expect(result[0].title).toBe('MAP Naive Bayes');
        expect(result[0].value).toBe('19 GLOBAL.VARIABLES');
        expect(result[1].title).toBe('Selective Naive Bayes');
        expect(result[1].value).toBe('100 GLOBAL.VARIABLES');
      });

      it('should return 1 predictor for AdultAllReports: Selective Naive Bayes (13 vars)', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        const result = modelingDatasService.getTrainedPredictorsSummaryDatas();
        expect(result.length).toBe(1);
        expect(result[0].title).toBe('Selective Naive Bayes');
        expect(result[0].value).toBe('13 GLOBAL.VARIABLES');
      });

      it('should throw when appDatas not initialized', () => {
        appService.initialize();
        expect(() => modelingDatasService.getTrainedPredictorsSummaryDatas()).toThrow();
      });
    });

    // ===== setSelectedPredictor =====

    describe('setSelectedPredictor', () => {
      it('should throw when modelingDatas not initialized', () => {
        expect(() => modelingDatasService.setSelectedPredictor({ rank: 'R1' })).toThrow();
      });

      it('should set predictor with exact properties when initialized', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        modelingDatasService.setSelectedPredictor({
          rank: 'R1',
          type: 'Classifier',
          family: 'MAP Naive Bayes',
          name: 'MAP Naive Bayes',
          variables: 19,
        });
        const predictor = modelingDatasService.getSelectedPredictor();
        expect(predictor.rank).toBe('R1');
        expect(predictor.type).toBe('Classifier');
        expect(predictor.family).toBe('MAP Naive Bayes');
        expect(predictor.name).toBe('MAP Naive Bayes');
        expect(predictor.variables).toBe(19);
      });
    });

    // ===== getSelectedPredictor =====

    describe('getSelectedPredictor', () => {
      it('should return undefined before initialization', () => {
        expect(modelingDatasService.getSelectedPredictor()).toBeUndefined();
      });

      it('should return predictor with rank=R2, name=Selective Naive Bayes after set', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        modelingDatasService.setSelectedPredictor({
          rank: 'R2',
          type: 'Classifier',
          family: 'Selective Naive Bayes',
          name: 'Selective Naive Bayes',
          variables: 100,
        });
        const predictor = modelingDatasService.getSelectedPredictor();
        expect(predictor.rank).toBe('R2');
        expect(predictor.name).toBe('Selective Naive Bayes');
        expect(predictor.family).toBe('Selective Naive Bayes');
        expect(predictor.variables).toBe(100);
      });
    });

    // ===== getTrainedPredictorListDatas =====

    describe('getTrainedPredictorListDatas', () => {
      it('should throw when modelingDatas not initialized', () => {
        expect(() => modelingDatasService.getTrainedPredictorListDatas()).toThrow();
      });

      it('should return undefined when no predictor is selected', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        // No predictor set yet via setSelectedPredictor, so trainedPredictorsListDatas is empty
        const result = modelingDatasService.getTrainedPredictorListDatas();
        expect(result).toBeUndefined();
      });

      it('should return 100 vars for R2 predictor, first var = "Mean(LLFields.jet 1 pt) where jet 1 b-tag > 0.5" with weight=0.887891', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        modelingDatasService.setSelectedPredictor({
          rank: 'R2',
          type: 'Classifier',
          family: 'Selective Naive Bayes',
          name: 'Selective Naive Bayes',
          variables: 100,
        });
        const result = modelingDatasService.getTrainedPredictorListDatas();
        expect(result.length).toBe(100);
        expect(result[0].name).toBe('Mean(LLFields.jet 1 pt) where jet 1 b-tag > 0.5');
        expect(result[0].level).toBe(0.00618118);
        expect(result[0].weight).toBe(0.887891);
        expect(result[0].map).toBe(true);
        // Last var should not have map=true
        const lastVar = result[result.length - 1];
        expect(lastVar.name).toBe('Mean(LLFields.jet 3 pt) where jet 4 pt > 0.8681');
        expect(lastVar.weight).toBe(0.00840457);
      });

      it('should return 19 vars for R1 predictor, first var = "Mean(LLFields.lepton pT)" with level=0.00707239', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        modelingDatasService.setSelectedPredictor({
          rank: 'R1',
          type: 'Classifier',
          family: 'MAP Naive Bayes',
          name: 'MAP Naive Bayes',
          variables: 19,
        });
        const result = modelingDatasService.getTrainedPredictorListDatas();
        expect(result.length).toBe(19);
        expect(result[0].name).toBe('Mean(LLFields.lepton pT)');
        expect(result[0].level).toBe(0.00707239);
      });

      it('should return undefined for non-existent predictor rank', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        modelingDatasService.setSelectedPredictor({
          rank: 'R999',
          type: 'Classifier',
          family: 'Unknown',
          name: 'Unknown',
          variables: 0,
        });
        const result = modelingDatasService.getTrainedPredictorListDatas();
        expect(result).toBeUndefined();
      });
    });

    // ===== getTrainedPredictorDisplayedColumns =====

    describe('getTrainedPredictorDisplayedColumns', () => {
      it('should return empty array when no predictor list has been loaded', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        const result = modelingDatasService.getTrainedPredictorDisplayedColumns();
        expect(result.length).toBe(0);
      });

      it('should return [Name, Level] columns for R1 (MAP Naive Bayes, no weight/map)', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        modelingDatasService.setSelectedPredictor({
          rank: 'R1',
          type: 'Classifier',
          family: 'MAP Naive Bayes',
          name: 'MAP Naive Bayes',
          variables: 19,
        });
        modelingDatasService.getTrainedPredictorListDatas();
        const cols = modelingDatasService.getTrainedPredictorDisplayedColumns();
        // R1 vars only have name + level (no weight, no map)
        expect(cols.length).toBe(2);
        expect(cols[0].field).toBe('name');
        expect(cols[0].headerName).toBe('Name');
        expect(cols[1].field).toBe('level');
        expect(cols[1].headerName).toBe('Level');
      });
    });

    // ===== getVariableFromName =====

    describe('getVariableFromName (additional)', () => {
      it('should return undefined for non-existent variable name', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        const result = modelingDatasService.getVariableFromName('NON_EXISTENT');
        expect(result).toBeUndefined();
      });

      it('should return undefined when no modelingReport', () => {
        appService.initialize();
        const result = modelingDatasService.getVariableFromName('test');
        expect(result).toBeUndefined();
      });
    });

    // ===== AdultAllReports integration =====

    describe('with AdultAllReports', () => {
      it('should auto-select "relationship" variable after initialize (first preparation variable)', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        // AdultAllReports first preparation variable is "relationship" (R01)
        const selectedVar = modelingDatasService.getSelectedVariable();
        expect(selectedVar.name).toBe('relationship');
        expect(selectedVar.rank).toBe('R01');
      });

      it('should return summary with dictionary=Adult, targetVariable=class for AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        const result = modelingDatasService.getSummaryDatas();
        const dictItem = result.find(e => e.title === 'GLOBAL.DICTIONARY');
        expect(dictItem.value).toBe('Adult');
        const targetItem = result.find(e => e.title === 'GLOBAL.TARGET_VARIABLE');
        expect(targetItem.value).toBe('class');
        const taskItem = result.find(e => e.title === 'GLOBAL.LEARNING_TASK');
        expect(taskItem.value).toBe('Classification analysis');
      });

      it('should return 13 vars for R1 predictor, first var = "capital_gain" with level=0.134729, weight=0.869419', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        modelingDatasService.setSelectedPredictor({
          rank: 'R1',
          type: 'Classifier',
          family: 'Selective Naive Bayes',
          name: 'Selective Naive Bayes',
          variables: 13,
        });
        const result = modelingDatasService.getTrainedPredictorListDatas();
        expect(result.length).toBe(13);
        expect(result[0].name).toBe('capital_gain');
        expect(result[0].level).toBe(0.134729);
        expect(result[0].weight).toBe(0.869419);
        expect(result[0].map).toBe(true);
      });

      it('should find variable "capital_gain" by name with level=0.134729', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        modelingDatasService.initialize();

        const variable = modelingDatasService.getVariableFromName('capital_gain');
        expect(variable.name).toBe('capital_gain');
        expect(variable.level).toBe(0.134729);
        expect(variable.weight).toBe(0.869419);
        expect(variable.preparedName).toBe('Pcapital_gain');
      });
    });
  });
});
