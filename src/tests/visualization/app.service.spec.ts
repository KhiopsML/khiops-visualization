/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { AppService } from '@khiops-visualization/providers/app.service';
import { TranslateModule } from '@ngstack/translate';
import { provideHttpClient } from '@angular/common/http';

describe('Visualization', () => {
  let appService: AppService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [AppService, provideHttpClient()],
    }).compileComponents();

    appService = TestBed.inject(AppService);
  });

  describe('AppService', () => {
    it('should be created', () => {
      expect(appService).toBeTruthy();
    });

    // ===== initialize =====

    describe('initialize', () => {
      it('should initialize without preserving data', () => {
        appService.initialize();
        expect(appService.appDatas).toBeUndefined();
      });

      it('should initialize with preserveData=false (default)', () => {
        appService.initialize(false);
        expect(appService.appDatas).toBeUndefined();
      });

      it('should preserve existing data when preserveData=true', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(
            require('src/assets/mocks/kv/AdultAllReports.json'),
          ),
        );
        appService.initialize();
        appService.setFileDatas(mockDatas);
        const datas = appService.appDatas;
        appService.initialize(true);
        expect(appService.appDatas).toBeDefined();
      });

      it('should reset data when preserveData=false after setting data', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(
            require('src/assets/mocks/kv/AdultAllReports.json'),
          ),
        );
        appService.initialize();
        appService.setFileDatas(mockDatas);
        appService.initialize(false);
        expect(appService.appDatas).toBeUndefined();
      });
    });

    // ===== resetSearch =====

    describe('resetSearch', () => {
      it('should call resetSearch without errors', () => {
        expect(() => appService.resetSearch()).not.toThrow();
      });
    });

    // ===== initGlobalConfigVariables =====

    describe('initGlobalConfigVariables', () => {
      it('should call initGlobalConfigVariables without errors', () => {
        expect(() => appService.initGlobalConfigVariables()).not.toThrow();
      });
    });

    // ===== initSessionVariables =====

    describe('initSessionVariables', () => {
      it('should call initSessionVariables without errors', () => {
        expect(() => appService.initSessionVariables()).not.toThrow();
      });
    });

    // ===== appDatas getter =====

    describe('appDatas', () => {
      it('should return undefined before initialization', () => {
        expect(appService.appDatas).toBeUndefined();
      });

      it('should return undefined after initialization with no data set', () => {
        appService.initialize();
        expect(appService.appDatas).toBeUndefined();
      });

      it('should return datas after setFileDatas', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(
            require('src/assets/mocks/kv/AdultAllReports.json'),
          ),
        );
        appService.initialize();
        appService.setFileDatas(mockDatas);
        expect(appService.appDatas).toBeDefined();
      });
    });

    // ===== setFileDatas =====

    describe('setFileDatas', () => {
      it('should set file data from AdultAllReports', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(
            require('src/assets/mocks/kv/AdultAllReports.json'),
          ),
        );
        appService.initialize();
        appService.setFileDatas(mockDatas);
        expect(appService.appDatas).toBeDefined();
        expect(appService.appDatas.tool).toBe('Khiops');
      });

      it('should set file data from C100_AllReports', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(
            require('src/assets/mocks/kv/C100_AllReports.json'),
          ),
        );
        appService.initialize();
        appService.setFileDatas(mockDatas);
        expect(appService.appDatas).toBeDefined();
      });

      it('should handle undefined data', () => {
        appService.initialize();
        appService.setFileDatas(undefined);
        expect(appService.appDatas).toBeUndefined();
      });

      it('should reinitialize session variables on setFileDatas', () => {
        spyOn(appService, 'initSessionVariables');
        appService.setFileDatas(undefined);
        expect(appService.initSessionVariables).toHaveBeenCalled();
      });

      it('should work when _appDatas is not initialized first', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(
            require('src/assets/mocks/kv/AdultAllReports.json'),
          ),
        );
        appService.setFileDatas(mockDatas);
        expect(appService.appDatas).toBeDefined();
      });
    });

    // ===== getSavedDatas =====

    describe('getSavedDatas', () => {
      it('should return undefined when no data set', () => {
        appService.initialize();
        expect(appService.getSavedDatas('selectedRank')).toBeUndefined();
      });

      it('should return undefined for unknown type', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(
            require('src/assets/mocks/kv/AdultAllReports.json'),
          ),
        );
        appService.initialize();
        appService.setFileDatas(mockDatas);
        expect(appService.getSavedDatas('nonExistentType')).toBeUndefined();
      });

      it('should return saved datas when they exist in the file', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(
            require('src/assets/mocks/kv/AdultAllReports.json'),
          ),
        );
        if (mockDatas.savedDatas) {
          mockDatas.savedDatas['testKey'] = 'testValue';
        } else {
          mockDatas.savedDatas = { testKey: 'testValue' };
        }
        appService.initialize();
        appService.setFileDatas(mockDatas);
        expect(appService.getSavedDatas('testKey')).toBe('testValue');
      });
    });

    // ===== setSavedDatas =====

    describe('setSavedDatas', () => {
      it('should not throw when datas have no savedDatas', () => {
        expect(() => appService.setSavedDatas({})).not.toThrow();
      });

      it('should not throw when datas have savedDatas without splitSizes', () => {
        expect(() =>
          appService.setSavedDatas({ savedDatas: {} }),
        ).not.toThrow();
      });

      it('should set split sizes from savedDatas', () => {
        const datas = {
          savedDatas: {
            splitSizes: { some: 'sizes' },
          },
        };
        expect(() => appService.setSavedDatas(datas)).not.toThrow();
      });
    });

    // ===== isCompatibleJson =====

    describe('isCompatibleJson', () => {
      it('should return true for Khiops data with preparationReport', () => {
        const datas = { tool: 'Khiops', preparationReport: {} };
        expect(appService.isCompatibleJson(datas)).toBe(true);
      });

      it('should return true for Khiops data with textPreparationReport', () => {
        const datas = { tool: 'Khiops', textPreparationReport: {} };
        expect(appService.isCompatibleJson(datas)).toBe(true);
      });

      it('should return true for Khiops data with treePreparationReport', () => {
        const datas = { tool: 'Khiops', treePreparationReport: {} };
        expect(appService.isCompatibleJson(datas)).toBe(true);
      });

      it('should return true for Khiops data with bivariatePreparationReport', () => {
        const datas = { tool: 'Khiops', bivariatePreparationReport: {} };
        expect(appService.isCompatibleJson(datas)).toBe(true);
      });

      it('should return true for Khiops data with evaluationReport', () => {
        const datas = { tool: 'Khiops', evaluationReport: {} };
        expect(appService.isCompatibleJson(datas)).toBe(true);
      });

      it('should return true for Khiops data with trainEvaluationReport', () => {
        const datas = { tool: 'Khiops', trainEvaluationReport: {} };
        expect(appService.isCompatibleJson(datas)).toBe(true);
      });

      it('should return true for Khiops data with testEvaluationReport', () => {
        const datas = { tool: 'Khiops', testEvaluationReport: {} };
        expect(appService.isCompatibleJson(datas)).toBe(true);
      });

      it('should return false for non-Khiops tool', () => {
        const datas = { tool: 'OtherTool', preparationReport: {} };
        expect(appService.isCompatibleJson(datas)).toBe(false);
      });

      it('should return false for Khiops tool with no reports', () => {
        const datas = { tool: 'Khiops' };
        expect(appService.isCompatibleJson(datas)).toBe(false);
      });

      it('should return false for undefined data', () => {
        expect(appService.isCompatibleJson(undefined)).toBe(false);
      });

      it('should return false for null data', () => {
        expect(appService.isCompatibleJson(null)).toBe(false);
      });

      it('should return false for empty object', () => {
        expect(appService.isCompatibleJson({})).toBe(false);
      });

      it('should return true for AdultAllReports mock', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(
            require('src/assets/mocks/kv/AdultAllReports.json'),
          ),
        );
        expect(appService.isCompatibleJson(mockDatas)).toBe(true);
      });
    });
  });
});
