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
  });
});
