/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';

import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { provideHttpClient } from '@angular/common/http';
import { AppService } from '@khiops-visualization/providers/app.service';
import { REPORT } from '@khiops-library/enum/report';
import { TranslateModule } from '@ngstack/translate';

let preparationDatasService: PreparationDatasService;
let appService: AppService;

describe('Visualization', () => {
  describe('PreparationDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient()],
      });

      // Inject services
      preparationDatasService = TestBed.inject(PreparationDatasService);
      appService = TestBed.inject(AppService);
    });

    it('preparationDatasService should be created', () => {
      expect(preparationDatasService).toBeTruthy();
    });

    it('appService should be created', () => {
      expect(appService).toBeTruthy();
    });

    it('getTargetVariableStatsDatas should return valid datas [bi2, Categorical]', () => {
      const fileDatas = require('../../assets/mocks/kv/bi2.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const intervalDatas =
        preparationDatasService.getTargetVariableStatsDatas();

      expect(intervalDatas).not.toBeDefined();
    });

    it('getTargetVariableStatsDatas should return valid datas [C100_AllReports, Numerical]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      preparationDatasService.getSummaryDatas();
      preparationDatasService.getInformationsDatas(REPORT.PREPARATION_REPORT);
      const intervalDatas = JSON.stringify(
        preparationDatasService.getTargetVariableStatsDatas(),
      );

      const expectedRes = {
        datasets: [
          {
            label: '0',
            data: [47.00365714285714],
            extra: [
              {
                name: '0',
                value: 47.00365714285714,
                defaultGroupIndex: false,
                extra: {
                  value: 4935384,
                  percent: 47.00365714285714,
                },
              },
            ],
            minBarLength: 3,
            fill: false,
            borderSkipped: false,
            type: 'bar',
          },
          {
            label: '1',
            data: [52.99634285714285],
            extra: [
              {
                name: '1',
                value: 52.99634285714285,
                defaultGroupIndex: false,
                extra: {
                  value: 5564616,
                  percent: 52.99634285714285,
                },
              },
            ],
            minBarLength: 3,
            fill: false,
            borderSkipped: false,
            type: 'bar',
          },
        ],
        labels: [''],
      };
      expect(intervalDatas).toEqual(JSON.stringify(expectedRes));
    });

    it('getTargetVariableStatsDatas should return valid datas [adult-bivar, Numerical]', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      preparationDatasService.getSummaryDatas();
      preparationDatasService.getInformationsDatas(REPORT.PREPARATION_REPORT);
      const intervalDatas = JSON.stringify(
        preparationDatasService.getTargetVariableStatsDatas(),
      );

      const expectedRes = {
        datasets: [
          {
            label: 'less',
            data: [76.16316497922398],
            extra: [
              {
                name: 'less',
                value: 76.16316497922398,
                defaultGroupIndex: false,
                extra: {
                  value: 26028,
                  percent: 76.16316497922398,
                },
              },
            ],
            minBarLength: 3,
            fill: false,
            borderSkipped: false,
            type: 'bar',
          },
          {
            label: 'more',
            data: [23.83683502077603],
            extra: [
              {
                name: 'more',
                value: 23.83683502077603,
                defaultGroupIndex: false,
                extra: {
                  value: 8146,
                  percent: 23.83683502077603,
                },
              },
            ],
            minBarLength: 3,
            fill: false,
            borderSkipped: false,
            type: 'bar',
          },
        ],
        labels: [''],
      };
      expect(intervalDatas).toEqual(JSON.stringify(expectedRes));
    });

    it('getCurrentIntervalDatas should return valid datas [C100_AllReports, Numerical, var = R1, index = undefined]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const intervalDatas = preparationDatasService.getCurrentIntervalDatas(
        REPORT.PREPARATION_REPORT,
      );

      const expectedRes = {
        title: 'GLOBAL.CURRENT_INTERVAL',
        values: [
          {
            interval: '[0.0002370088478,0.3074067]',
            frequency: 799804,
          },
        ],
        displayedColumns: [
          {
            headerName:
              'GLOBAL.INTERVAL_OFMean(LLFields.missing energy magnitude)',
            field: 'interval',
          },
          {
            headerName: 'GLOBAL.FREQUENCY',
            field: 'frequency',
          },
        ],
      };

      expect(intervalDatas).toEqual(expectedRes);
    });

    it('getCurrentIntervalDatas should return valid datas [C100_AllReports, Numerical, var = R2, index = 15]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[1].name,
        REPORT.PREPARATION_REPORT,
      );
      const intervalDatas = preparationDatasService.getCurrentIntervalDatas(
        REPORT.PREPARATION_REPORT,
        15,
      );

      const expectedRes = {
        title: 'GLOBAL.CURRENT_INTERVAL',
        values: [
          {
            interval: ']2.049679,2.23972]',
            frequency: 94851,
          },
        ],
        displayedColumns: [
          {
            headerName:
              'GLOBAL.INTERVAL_OFMean(LLFields.missing energy magnitude) where jet 2 pt > 0.8902',
            field: 'interval',
          },
          {
            headerName: 'GLOBAL.FREQUENCY',
            field: 'frequency',
          },
        ],
      };

      expect(intervalDatas).toEqual(expectedRes);
    });

    it('getCurrentIntervalDatas should return valid datas [adult-bivar, Categorical, var = R1, index = undefined]', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const intervalDatas = preparationDatasService.getCurrentIntervalDatas(
        REPORT.PREPARATION_REPORT,
      );

      const expectedRes = {
        title: 'GLOBAL.CURRENT_GROUP',
        values: [
          {
            values: 'Husband',
            frequency: 13781,
          },
          {
            values: 'Wife',
            frequency: 1648,
          },
        ],
        displayedColumns: [
          {
            headerName: 'GLOBAL.VALUES_OFrelationship',
            field: 'values',
          },
          {
            headerName: 'GLOBAL.FREQUENCY',
            field: 'frequency',
          },
        ],
      };

      expect(intervalDatas).toEqual(jasmine.objectContaining(expectedRes));
    });

    it('getCurrentIntervalDatas should return valid datas [adult-bivar, Categorical, var = R1, index = 1]', () => {
      const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const intervalDatas = preparationDatasService.getCurrentIntervalDatas(
        REPORT.PREPARATION_REPORT,
        1,
      );

      const expectedRes = {
        title: 'GLOBAL.CURRENT_GROUP',
        values: [
          {
            values: 'Not-in-family',
            frequency: 8787,
          },
        ],
        displayedColumns: [
          {
            headerName: 'GLOBAL.VALUES_OFrelationship',
            field: 'values',
          },
          {
            headerName: 'GLOBAL.FREQUENCY',
            field: 'frequency',
          },
        ],
      };

      expect(intervalDatas).toEqual(jasmine.objectContaining(expectedRes));
    });

    it('getCurrentIntervalDatas should return valid datas [bi2, Numerical, var = R2, index = 1]', () => {
      const fileDatas = require('../../assets/mocks/kv/bi2.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[1].name,
        REPORT.PREPARATION_REPORT,
      );
      const intervalDatas = preparationDatasService.getCurrentIntervalDatas(
        REPORT.PREPARATION_REPORT,
        1,
      );

      const expectedRes = {
        title: 'GLOBAL.CURRENT_INTERVAL',
        values: [
          {
            interval: ']24.5,31.5]',
            frequency: 8686,
          },
        ],
        displayedColumns: [
          {
            headerName: 'GLOBAL.INTERVAL_OFage',
            field: 'interval',
          },
          {
            headerName: 'GLOBAL.FREQUENCY',
            field: 'frequency',
          },
        ],
      };

      expect(intervalDatas).toEqual(jasmine.objectContaining(expectedRes));
    });

    it('getCurrentIntervalDatas should return valid datas [bi2, Categorical, var = R6, index = 3]', () => {
      const fileDatas = require('../../assets/mocks/kv/bi2.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[5].name,
        REPORT.PREPARATION_REPORT,
      );
      const intervalDatas = preparationDatasService.getCurrentIntervalDatas(
        REPORT.PREPARATION_REPORT,
        3,
      );

      const expectedRes = {
        title: 'GLOBAL.CURRENT_GROUP',
        values: [
          {
            values: 'Prof-school',
            frequency: 834,
          },
          {
            values: '9th',
            frequency: 756,
          },
          {
            values: '12th',
            frequency: 657,
          },
          {
            values: 'Doctorate',
            frequency: 594,
          },
          {
            values: '5th-6th',
            frequency: 509,
          },
          {
            values: '1st-4th',
            frequency: 247,
          },
          {
            values: 'Preschool',
            frequency: 83,
          },
        ],
        displayedColumns: [
          {
            headerName: 'GLOBAL.VALUES_OFeducation',
            field: 'values',
          },
          {
            headerName: 'GLOBAL.FREQUENCY',
            field: 'frequency',
          },
        ],
      };

      expect(intervalDatas).toEqual(jasmine.objectContaining(expectedRes));
    });

    // Tests for isFilteredVariables method
    it('isFilteredVariables should return false when no preparation report data exists', () => {
      appService.setFileDatas(undefined);
      preparationDatasService.initialize();

      const result =
        preparationDatasService.isFilteredVariables('preparationReport');
      expect(result).toBe(false);
    });

    it('isFilteredVariables should return false when evaluatedVariables is undefined', () => {
      const fileDatas = {
        preparationReport: {
          summary: {
            // evaluatedVariables is undefined
          },
          variablesStatistics: [{ rank: 'R01' }, { rank: 'R02' }],
        },
      };
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const result =
        preparationDatasService.isFilteredVariables('preparationReport');
      expect(result).toBe(false);
    });

    it('isFilteredVariables should return false when evaluatedVariables is 0', () => {
      const fileDatas = {
        preparationReport: {
          summary: {
            evaluatedVariables: 0,
          },
          variablesStatistics: [{ rank: 'R01' }],
        },
      };
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const result =
        preparationDatasService.isFilteredVariables('preparationReport');
      expect(result).toBe(false);
    });

    it('isFilteredVariables should return true when variablesStatistics is missing but evaluatedVariables > 0', () => {
      const fileDatas = {
        preparationReport: {
          summary: {
            evaluatedVariables: 20,
          },
          // variablesStatistics is missing
        },
      };
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const result =
        preparationDatasService.isFilteredVariables('preparationReport');
      expect(result).toBe(true);
    });

    it('isFilteredVariables should return true when evaluatedVariables > variablesStatistics.length', () => {
      const fileDatas = {
        preparationReport: {
          summary: {
            evaluatedVariables: 15,
          },
          variablesStatistics: [{ rank: 'R01' }, { rank: 'R02' }], // length = 2
        },
      };
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const result =
        preparationDatasService.isFilteredVariables('preparationReport');
      expect(result).toBe(true);
    });

    it('isFilteredVariables should return false when evaluatedVariables <= variablesStatistics.length', () => {
      const fileDatas = {
        preparationReport: {
          summary: {
            evaluatedVariables: 2,
          },
          variablesStatistics: [{ rank: 'R01' }, { rank: 'R02' }], // length = 2
        },
      };
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const result =
        preparationDatasService.isFilteredVariables('preparationReport');
      expect(result).toBe(false);
    });

    it('isFilteredVariables should return false when evaluatedVariables < variablesStatistics.length', () => {
      const fileDatas = {
        preparationReport: {
          summary: {
            evaluatedVariables: 1,
          },
          variablesStatistics: [
            { rank: 'R01' },
            { rank: 'R02' },
            { rank: 'R03' },
          ], // length = 3
        },
      };
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const result =
        preparationDatasService.isFilteredVariables('preparationReport');
      expect(result).toBe(false);
    });

    it('isFilteredVariables should handle empty variablesStatistics array', () => {
      const fileDatas = {
        preparationReport: {
          summary: {
            evaluatedVariables: 5,
          },
          variablesStatistics: [], // empty array
        },
      };
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const result =
        preparationDatasService.isFilteredVariables('preparationReport');
      expect(result).toBe(true);
    });

    it('isFilteredVariables should work with textPreparation source', () => {
      const fileDatas = {
        textPreparationReport: {
          summary: {
            evaluatedVariables: 10,
          },
          variablesStatistics: [{ rank: 'R01' }, { rank: 'R02' }], // length = 2
        },
      };
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const result = preparationDatasService.isFilteredVariables(
        'textPreparationReport',
      );
      expect(result).toBe(true);
    });

    it('isFilteredVariables should work with treePreparation source', () => {
      const fileDatas = {
        treePreparationReport: {
          summary: {
            evaluatedVariables: 3,
          },
          variablesStatistics: [
            { rank: 'R01' },
            { rank: 'R02' },
            { rank: 'R03' },
          ], // length = 3
        },
      };
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();

      const result = preparationDatasService.isFilteredVariables(
        'treePreparationReport',
      );
      expect(result).toBe(false);
    });

    // ===== getDatas =====

    describe('getDatas', () => {
      it('should return selectedVariable = "relationship" (first var) after init on AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const result = preparationDatasService.getDatas(REPORT.PREPARATION_REPORT);
        expect(result.selectedVariable.name).toBe('relationship');
        expect(result.selectedVariable.rank).toBe('R01');
        expect(result.selectedVariable.type).toBe('Categorical');
      });
    });

    // ===== getSelectedVariable / setSelectedVariable / getSelectedVariableRank =====

    describe('setSelectedVariable + getSelectedVariable + getSelectedVariableRank', () => {
      it('should auto-select first variable "relationship" R01 after init', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const selectedVar = preparationDatasService.getSelectedVariable(REPORT.PREPARATION_REPORT);
        expect(selectedVar.name).toBe('relationship');
        expect(selectedVar.rank).toBe('R01');
        expect(selectedVar.type).toBe('Categorical');
        expect(preparationDatasService.getSelectedVariableRank()).toBe('R01');
      });

      it('should switch to "capital_gain" R03 Numerical and update rank', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const result = preparationDatasService.setSelectedVariable('capital_gain', REPORT.PREPARATION_REPORT);
        expect(result.name).toBe('capital_gain');
        expect(result.rank).toBe('R03');
        expect(result.type).toBe('Numerical');
        expect(preparationDatasService.getSelectedVariableRank()).toBe('R03');
      });

      it('should return undefined for empty name or non-existent variable', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        expect(preparationDatasService.setSelectedVariable('', REPORT.PREPARATION_REPORT)).toBeUndefined();
        expect(preparationDatasService.setSelectedVariable('NON_EXISTENT', REPORT.PREPARATION_REPORT)).toBeUndefined();
      });
    });

    // ===== getVariableFromName / getVariableFromRank =====

    describe('getVariableFromName + getVariableFromRank', () => {
      it('should find "education" by name with rank R05, type Categorical, level 0.113452', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const byName = preparationDatasService.getVariableFromName('education', REPORT.PREPARATION_REPORT);
        expect(byName.name).toBe('education');
        expect(byName.rank).toBe('R05');
        expect(byName.type).toBe('Categorical');
        expect(byName.level).toBe(0.113452);
      });

      it('should find "marital_status" by rank R02 with type Categorical, level 0.19789', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const byRank = preparationDatasService.getVariableFromRank('R02', REPORT.PREPARATION_REPORT);
        expect(byRank.name).toBe('marital_status');
        expect(byRank.type).toBe('Categorical');
        expect(byRank.level).toBe(0.19789);
      });

      it('should return undefined for non-existent name/rank', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);

        expect(preparationDatasService.getVariableFromName('FAKE', REPORT.PREPARATION_REPORT)).toBeUndefined();
        expect(preparationDatasService.getVariableFromRank('R99', REPORT.PREPARATION_REPORT)).toBeUndefined();
      });
    });

    // ===== getSummaryDatas =====

    describe('getSummaryDatas', () => {
      it('should return summary with instances=34174 and targetVariable=class for AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const result = preparationDatasService.getSummaryDatas(REPORT.PREPARATION_REPORT);
        expect(Array.isArray(result)).toBe(true);
        // SummaryModel uses translated titles (GLOBAL.X keys)
        const instancesItem = result.find(e => e.title === 'GLOBAL.INSTANCES');
        const targetItem = result.find(e => e.title === 'GLOBAL.TARGET_VARIABLE');
        expect(instancesItem.value).toBe(34174);
        expect(targetItem.value).toBe('class');
      });

      it('should return empty array when no data loaded', () => {
        appService.initialize();
        expect(preparationDatasService.getSummaryDatas()).toEqual([]);
      });
    });

    // ===== getInformationsDatas =====

    describe('getInformationsDatas', () => {
      it('should return informations containing evaluatedVariables=15 and informativeVariables=13 for AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const result = preparationDatasService.getInformationsDatas(REPORT.PREPARATION_REPORT);
        expect(Array.isArray(result)).toBe(true);
        // InformationsModel uses translated titles (GLOBAL.X keys)
        const evalItem = result.find(e => e.title === 'GLOBAL.EVALUATED_VARIABLES');
        const infoItem = result.find(e => e.title === 'GLOBAL.INFORMATIVE_VARIABLES');
        expect(evalItem.value).toBe(15);
        expect(infoItem.value).toBe(13);
      });

      it('should return undefined when no summary exists', () => {
        appService.initialize();
        expect(preparationDatasService.getInformationsDatas(REPORT.PREPARATION_REPORT)).toBeUndefined();
      });
    });

    // ===== getVariablesDatas =====

    describe('getVariablesDatas', () => {
      it('should return 15 VariableModel objects for AdultAllReports with correct first/last entries', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const result = preparationDatasService.getVariablesDatas(REPORT.PREPARATION_REPORT);
        expect(result.length).toBe(15);
        // First var: relationship, Categorical, level 0.207419
        expect(result[0].name).toBe('relationship');
        expect(result[0].type).toBe('Categorical');
        expect(result[0].level).toBe(0.207419);
        // Last var: fnlwgt, level 0
        expect(result[14].name).toBe('fnlwgt');
        expect(result[14].level).toBe(0);
      });

      it('should return empty array when no data loaded', () => {
        appService.initialize();
        expect(preparationDatasService.getVariablesDatas(REPORT.PREPARATION_REPORT)).toEqual([]);
      });
    });

    // ===== getTargetVariableStatsInformations =====

    describe('getTargetVariableStatsInformations', () => {
      it('should return descriptive stats with values=2, mode="less", modeFrequency=26028 for AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const result = preparationDatasService.getTargetVariableStatsInformations();
        expect(Array.isArray(result)).toBe(true);
        const valuesItem = result.find(e => e.title === 'values');
        const modeItem = result.find(e => e.title === 'mode');
        const modeFreqItem = result.find(e => e.title === 'modeFrequency');
        expect(valuesItem.value).toBe(2);
        expect(modeItem.value).toBe('less');
        expect(modeFreqItem.value).toBe(26028);
      });

      it('should return regression stats with min=45.51, max=926.0164, mean=175.4992237 for AnalysisRegressionQ99', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AnalysisRegressionQ99.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const result = preparationDatasService.getTargetVariableStatsInformations();
        expect(Array.isArray(result)).toBe(true);
        const minItem = result.find(e => e.title === 'min');
        const maxItem = result.find(e => e.title === 'max');
        const meanItem = result.find(e => e.title === 'mean');
        expect(minItem.value).toBe(45.51);
        expect(maxItem.value).toBe(926.0164);
        expect(meanItem.value).toBe(175.4992237);
      });
    });

    // ===== getTargetVariable =====

    describe('getTargetVariable', () => {
      it('should return "class" for AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        expect(preparationDatasService.getTargetVariable(REPORT.PREPARATION_REPORT)).toBe('class');
      });

      it('should return "duration_p99" for AnalysisRegressionQ99', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AnalysisRegressionQ99.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        expect(preparationDatasService.getTargetVariable(REPORT.PREPARATION_REPORT)).toBe('duration_p99');
      });

      it('should return undefined when no data loaded', () => {
        appService.initialize();
        expect(preparationDatasService.getTargetVariable(REPORT.PREPARATION_REPORT)).toBeUndefined();
      });
    });

    // ===== isExplanatoryAnalysis =====

    describe('isExplanatoryAnalysis', () => {
      it('should return false for AdultAllReports (classification with bivariate)', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        // AdultAllReports has no bivariatePreparationReport, but its dims are not "Value groups" only
        expect(preparationDatasService.isExplanatoryAnalysis()).toBe(false);
      });

      it('should return false when no data', () => {
        appService.initialize();
        expect(preparationDatasService.isExplanatoryAnalysis()).toBe(false);
      });
    });

    // ===== isSupervised =====

    describe('isSupervised', () => {
      it('should return true for AdultAllReports (classification analysis)', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        expect(preparationDatasService.isSupervised()).toBe(true);
      });

      it('should return false for bi2 (unsupervised analysis)', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/bi2.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        // bi2 first var R01 has no detailed stats, select R02 which does
        preparationDatasService.setSelectedVariable('age', REPORT.PREPARATION_REPORT);

        expect(preparationDatasService.isSupervised()).toBe(false);
      });

      it('should return false when no data loaded', () => {
        appService.initialize();
        expect(preparationDatasService.isSupervised()).toBe(false);
      });
    });

    // ===== getAvailablePreparationReport =====

    describe('getAvailablePreparationReport', () => {
      it('should return preparationReport for AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        expect(preparationDatasService.getAvailablePreparationReport()).toBe(REPORT.PREPARATION_REPORT);
      });

      it('should fall back to textPreparationReport when preparationReport has no variablesStatistics', () => {
        appService.setFileDatas({
          preparationReport: { summary: {} },
          textPreparationReport: { summary: {}, variablesStatistics: [{ rank: 'R1', name: 'v1' }] },
        });
        expect(preparationDatasService.getAvailablePreparationReport()).toBe(REPORT.TEXT_PREPARATION_REPORT);
      });
    });

    // ===== getPreparationSourceFromVariable =====

    describe('getPreparationSourceFromVariable', () => {
      it('should return PREPARATION_REPORT for "relationship" which exists in preparationReport', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);

        expect(preparationDatasService.getPreparationSourceFromVariable({ name: 'relationship' })).toBe(REPORT.PREPARATION_REPORT);
      });

      it('should return TEXT_PREPARATION_REPORT for a variable not in preparationReport', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);

        expect(preparationDatasService.getPreparationSourceFromVariable({ name: 'NOT_IN_PREP' })).toBe(REPORT.TEXT_PREPARATION_REPORT);
      });
    });

    // ===== hasDetailedStatistics =====

    describe('hasDetailedStatistics', () => {
      it('should return true for R01 "relationship" which has detailed stats in AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        // Default selected = R01 which has detailed stats
        expect(preparationDatasService.hasDetailedStatistics(REPORT.PREPARATION_REPORT)).toBe(true);
      });

      it('should return false for R15 "fnlwgt" which has no detailed stats (level=0)', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        preparationDatasService.setSelectedVariable('fnlwgt', REPORT.PREPARATION_REPORT);
        expect(preparationDatasService.hasDetailedStatistics(REPORT.PREPARATION_REPORT)).toBe(false);
      });

      it('should return false when no selected variable', () => {
        expect(preparationDatasService.hasDetailedStatistics(REPORT.PREPARATION_REPORT)).toBe(false);
      });
    });

    // ===== includesTargetParts =====

    describe('includesTargetParts', () => {
      it('should return false when all targetParts are undefined', () => {
        expect(preparationDatasService.includesTargetParts([
          { targetParts: undefined },
          { targetParts: undefined },
        ])).toBe(false);
      });

      it('should return true when some targetParts are defined', () => {
        expect(preparationDatasService.includesTargetParts([
          { targetParts: 3 },
          { targetParts: undefined },
        ])).toBe(true);
      });

      it('should return true when all targetParts are defined', () => {
        expect(preparationDatasService.includesTargetParts([
          { targetParts: 3 },
          { targetParts: 5 },
        ])).toBe(true);
      });

      it('should return false for empty array', () => {
        expect(preparationDatasService.includesTargetParts([])).toBe(false);
      });
    });

    // ===== getTargetVariableStatsDatas with real data =====

    describe('getTargetVariableStatsDatas', () => {
      it('should return 2 datasets "less" (76.16%) and "more" (23.84%) for AdultAllReports', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();

        const result = preparationDatasService.getTargetVariableStatsDatas();
        expect(result.datasets.length).toBe(2);
        expect(result.datasets[0].label).toBe('less');
        expect(result.datasets[1].label).toBe('more');
        // less: 26028/(26028+8146)*100 = 76.163...
        expect(result.datasets[0].data[0]).toBeCloseTo(76.163, 1);
        expect(result.datasets[0].extra[0].extra.value).toBe(26028);
        // more: 8146/(26028+8146)*100 = 23.837...
        expect(result.datasets[1].data[0]).toBeCloseTo(23.837, 1);
        expect(result.datasets[1].extra[0].extra.value).toBe(8146);
      });
    });
  });
});
