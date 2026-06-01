/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { Ls } from '@khiops-library/providers/ls.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { ConfigService } from '@khiops-library/providers/config.service';

let appService: AppService;
let configService: ConfigService;

describe('coVisualization', () => {
  describe('AppService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient()],
      });

      appService = TestBed.inject(AppService);
      configService = TestBed.inject(ConfigService);
    });

    it('should be created', () => {
      expect(appService).toBeTruthy();
    });

    // ===== appDatas getter =====

    describe('appDatas getter', () => {
      it('should return undefined when _appDatas is undefined', () => {
        appService.initialize();
        expect(appService.appDatas).toBeUndefined();
      });

      it('should return datas when set via setFileDatas', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        expect(appService.appDatas).toBeDefined();
        expect(appService.appDatas).toEqual(fileDatas);
      });
    });

    // ===== initialDatas getter =====

    describe('initialDatas getter', () => {
      it('should return undefined when no data loaded', () => {
        appService.initialize();
        expect(appService.initialDatas).toBeUndefined();
      });

      it('should return a deep copy of initial data after setFileDatas', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        expect(appService.initialDatas).toBeDefined();
        // Should be a separate object (deep copy)
        expect(appService.initialDatas).not.toBe(appService.appDatas);
      });
    });

    // ===== setActiveTabIndex / getActiveTabIndex =====

    describe('setActiveTabIndex / getActiveTabIndex', () => {
      it('should return 0 by default', () => {
        expect(appService.getActiveTabIndex()).toBe(0);
      });

      it('should set and get active tab index', () => {
        appService.setActiveTabIndex(2);
        expect(appService.getActiveTabIndex()).toBe(2);
      });

      it('should update to a new value', () => {
        appService.setActiveTabIndex(1);
        expect(appService.getActiveTabIndex()).toBe(1);

        appService.setActiveTabIndex(5);
        expect(appService.getActiveTabIndex()).toBe(5);
      });

      it('should handle zero index', () => {
        appService.setActiveTabIndex(3);
        appService.setActiveTabIndex(0);
        expect(appService.getActiveTabIndex()).toBe(0);
      });
    });

    // ===== initialize =====

    describe('initialize', () => {
      it('should reset appDatas to undefined', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        expect(appService.appDatas).toBeDefined();

        appService.initialize();
        expect(appService.appDatas).toBeUndefined();
      });

      it('should reset initialDatas to undefined', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        expect(appService.initialDatas).toBeDefined();

        appService.initialize();
        expect(appService.initialDatas).toBeUndefined();
      });

      it('should preserve data when preserveData is true', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        const dataBefore = appService.appDatas;

        appService.initialize(true);
        expect(appService.appDatas).toBe(dataBefore);
      });

      it('should call resetSearch', () => {
        spyOn(appService, 'resetSearch');
        appService.initialize();
        expect(appService.resetSearch).toHaveBeenCalled();
      });

      it('should call initGlobalConfigVariables', () => {
        spyOn(appService, 'initGlobalConfigVariables');
        appService.initialize();
        expect(appService.initGlobalConfigVariables).toHaveBeenCalled();
      });
    });

    // ===== resetSearch =====

    describe('resetSearch', () => {
      it('should call ls.delStartWith', () => {
        const ls = TestBed.inject(Ls);
        spyOn(ls, 'delStartWith');
        appService.resetSearch();
        expect(ls.delStartWith).toHaveBeenCalledWith('OPTIONS_AG_GRID_SEARCH_');
      });
    });

    // ===== setCroppedFileDatas =====

    describe('setCroppedFileDatas', () => {
      it('should set app datas without affecting initial datas', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        const initialBefore = appService.initialDatas;

        const croppedDatas = { ...fileDatas, cropped: true };
        appService.setCroppedFileDatas(croppedDatas);

        expect(appService.appDatas).toBe(croppedDatas);
        // initialDatas should remain unchanged
        expect(appService.initialDatas).toEqual(initialBefore);
      });

      it('should work when _appDatas is undefined', () => {
        appService.initialize();
        const datas = require('../../assets/mocks/kc/v4.json');

        expect(() => appService.setCroppedFileDatas(datas)).not.toThrow();
        expect(appService.appDatas).toBe(datas);
      });
    });

    // ===== setFileDatas =====

    describe('setFileDatas', () => {
      it('should set both appDatas and initialDatas', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);

        expect(appService.appDatas).toBe(fileDatas);
        expect(appService.initialDatas).toBeDefined();
      });

      it('should deep clone initialDatas so it is independent from appDatas', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);

        // Modifying appDatas should not affect initialDatas
        expect(appService.initialDatas).not.toBe(appService.appDatas);
      });

      it('should handle undefined data', () => {
        appService.setFileDatas(undefined);
        expect(appService.appDatas).toBeUndefined();
      });

      it('should work when _appDatas is initially undefined', () => {
        appService.initialize();
        const fileDatas = require('../../assets/mocks/kc/v4.json');

        expect(() => appService.setFileDatas(fileDatas)).not.toThrow();
        expect(appService.appDatas).toBeDefined();
      });
    });

    // ===== getSavedDatas =====

    describe('getSavedDatas', () => {
      it('should return undefined when no data loaded', () => {
        appService.initialize();
        const result = appService.getSavedDatas('annotations');
        expect(result).toBeUndefined();
      });

      it('should return undefined when savedDatas does not exist', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        const result = appService.getSavedDatas('nonexistentKey');
        expect(result).toBeUndefined();
      });

      it('should return saved data when type exists in savedDatas', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        // Add savedDatas to file
        fileDatas.savedDatas = { annotations: { dim1: { node1: 'test' } } };
        appService.setFileDatas(fileDatas);

        const result = appService.getSavedDatas('annotations');
        expect(result).toEqual({ dim1: { node1: 'test' } });
      });
    });

    // ===== setSavedDatas =====

    describe('setSavedDatas', () => {
      it('should not throw when datas is undefined', () => {
        expect(() => appService.setSavedDatas(undefined)).not.toThrow();
      });

      it('should not throw when datas has no savedDatas', () => {
        expect(() => appService.setSavedDatas({})).not.toThrow();
      });

      it('should update layout split sizes when savedDatas has splitSizes', () => {
        const layoutService = TestBed.inject(LayoutService);
        spyOn(layoutService, 'setSplitSizes');

        const datas = {
          savedDatas: {
            splitSizes: { view1: [50, 50] },
          },
        };

        appService.setSavedDatas(datas);
        expect(layoutService.setSplitSizes).toHaveBeenCalledWith({
          view1: [50, 50],
        });
      });

      it('should not call setSplitSizes when no splitSizes in savedDatas', () => {
        const layoutService = TestBed.inject(LayoutService);
        spyOn(layoutService, 'setSplitSizes');

        const datas = { savedDatas: {} };
        appService.setSavedDatas(datas);

        expect(layoutService.setSplitSizes).not.toHaveBeenCalled();
      });
    });

    // ===== isCompatibleJson =====

    describe('isCompatibleJson', () => {
      it('should return true for valid Khiops Coclustering JSON', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        expect(appService.isCompatibleJson(fileDatas)).toBe(true);
      });

      it('should return false for null data', () => {
        expect(appService.isCompatibleJson(null)).toBe(false);
      });

      it('should return false for undefined data', () => {
        expect(appService.isCompatibleJson(undefined)).toBe(false);
      });

      it('should return false for data with wrong tool name', () => {
        const datas = {
          tool: 'Khiops Visualization',
          coclusteringReport: {},
        };
        expect(appService.isCompatibleJson(datas)).toBe(false);
      });

      it('should return false for data without coclusteringReport', () => {
        const datas = { tool: 'Khiops Coclustering' };
        expect(appService.isCompatibleJson(datas)).toBe(false);
      });

      it('should return false for empty object', () => {
        expect(appService.isCompatibleJson({})).toBe(false);
      });

      it('should return true for minimal valid structure', () => {
        const datas = {
          tool: 'Khiops Coclustering',
          coclusteringReport: { summary: {} },
        };
        expect(appService.isCompatibleJson(datas)).toBe(true);
      });
    });

    // ===== isCollidingJson =====

    describe('isCollidingJson', () => {
      it('should return true when khiops_encoding is colliding_ansi_utf8', () => {
        const datas = { khiops_encoding: 'colliding_ansi_utf8' };
        expect(appService.isCollidingJson(datas)).toBe(true);
      });

      it('should return false when khiops_encoding is different', () => {
        const datas = { khiops_encoding: 'utf8' };
        expect(appService.isCollidingJson(datas)).toBe(false);
      });

      it('should return false when no khiops_encoding', () => {
        const datas = { tool: 'test' };
        expect(appService.isCollidingJson(datas)).toBeFalsy();
      });
    });

    // ===== isBigJsonFile =====

    describe('isBigJsonFile', () => {
      it('should return false when no data loaded', () => {
        appService.initialize();
        expect(appService.isBigJsonFile()).toBe(false);
      });

      it('should return true when cells > 10000', () => {
        const fileDatas = JSON.parse(
          JSON.stringify(require('../../assets/mocks/kc/v4.json')),
        );
        fileDatas.coclusteringReport.summary.cells = 20000;
        appService.setFileDatas(fileDatas);
        expect(appService.isBigJsonFile()).toBe(true);
      });

      it('should return false when cells <= 10000', () => {
        const fileDatas = JSON.parse(
          JSON.stringify(require('../../assets/mocks/kc/v4.json')),
        );
        fileDatas.coclusteringReport.summary.cells = 81;
        appService.setFileDatas(fileDatas);
        expect(appService.isBigJsonFile()).toBe(false);
      });
    });

    // ===== initGlobalConfigVariables =====

    describe('initGlobalConfigVariables', () => {
      it('should call khiopsLibraryService.setAppConfig', () => {
        const khiopsLibraryService = TestBed.inject(KhiopsLibraryService);
        spyOn(khiopsLibraryService, 'setAppConfig');

        appService.initGlobalConfigVariables();

        expect(khiopsLibraryService.setAppConfig).toHaveBeenCalled();
      });

      it('should not throw when called multiple times', () => {
        expect(() => {
          appService.initGlobalConfigVariables();
          appService.initGlobalConfigVariables();
        }).not.toThrow();
      });
    });

    // ===== detectE2ETestingEnvironment =====

    describe('detectE2ETestingEnvironment', () => {
      it('should not throw on call', () => {
        expect(() =>
          appService.detectE2ETestingEnvironment(),
        ).not.toThrow();
      });

      it('should detect Cypress environment', () => {
        // Simulate Cypress
        const originalCypress = (window as any).Cypress;
        (window as any).Cypress = true;

        appService.detectE2ETestingEnvironment();

        expect(configService.isElectron).toBe(true);
        expect(configService.isE2eTesting).toBe(true);

        // Restore
        if (originalCypress !== undefined) {
          (window as any).Cypress = originalCypress;
        } else {
          delete (window as any).Cypress;
        }
      });

      it('should not set flags when not in E2E environment', () => {
        // Ensure Cypress is not present
        const originalCypress = (window as any).Cypress;
        delete (window as any).Cypress;

        const originalIsElectron = configService.isElectron;
        const originalIsE2e = configService.isE2eTesting;
        configService.isElectron = false;
        configService.isE2eTesting = false;

        appService.detectE2ETestingEnvironment();

        expect(configService.isElectron).toBe(false);
        expect(configService.isE2eTesting).toBe(false);

        // Restore
        if (originalCypress !== undefined) {
          (window as any).Cypress = originalCypress;
        }
        configService.isElectron = originalIsElectron;
        configService.isE2eTesting = originalIsE2e;
      });
    });

    // ===== Full workflow integration =====

    describe('Full workflow integration', () => {
      it('should handle complete file loading workflow', () => {
        appService.initialize();
        expect(appService.appDatas).toBeUndefined();

        const fileDatas = require('../../assets/mocks/kc/v4.json');
        expect(appService.isCompatibleJson(fileDatas)).toBe(true);

        appService.setFileDatas(fileDatas);
        expect(appService.appDatas).toBeDefined();
        expect(appService.initialDatas).toBeDefined();

        appService.setActiveTabIndex(1);
        expect(appService.getActiveTabIndex()).toBe(1);
      });

      it('should handle re-initialization after data load', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);

        appService.initialize();
        expect(appService.appDatas).toBeUndefined();

        // Load again
        appService.setFileDatas(fileDatas);
        expect(appService.appDatas).toBeDefined();
      });
    });
  });
});
