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
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensions-data.model';

let appService: AppService;
let dimensionsDatasService: DimensionsDatasService;

function loadV4Data() {
  const fileDatas = require('../../assets/mocks/kc/v4.json');
  appService.setFileDatas(fileDatas);
  dimensionsDatasService.getDimensions();
  dimensionsDatasService.initSelectedDimensions();
  dimensionsDatasService.saveInitialDimension();
}

describe('coVisualization', () => {
  describe('DimensionsDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient()],
      });

      appService = TestBed.inject(AppService);
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
    });

    it('should be created', () => {
      expect(dimensionsDatasService).toBeTruthy();
    });

    // ===== initialize =====

    describe('initialize', () => {
      it('should return a new DimensionsDatasModel', () => {
        const result = dimensionsDatasService.initialize();
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(DimensionsDatasModel);
      });

      it('should reset dimensionsDatas to a fresh model', () => {
        // Load some data first
        loadV4Data();
        expect(dimensionsDatasService.dimensionsDatas.dimensions.length).toBeGreaterThan(0);

        // Reset
        dimensionsDatasService.initialize();
        expect(dimensionsDatasService.dimensionsDatas.dimensions.length).toBe(0);
      });

      it('should set default values on model', () => {
        const result = dimensionsDatasService.initialize();
        expect(result.isLoading).toBe(false);
        expect(result.isAxisInverted).toBe(true);
        expect(result.conditionalOnContext).toBe(true);
        expect(result.matrixContrast).toBe(0);
        expect(result.dimensions).toEqual([]);
        expect(result.selectedDimensions).toEqual([]);
        expect(result.contextDimensions).toEqual([]);
      });
    });

    // ===== getDatas =====

    describe('getDatas', () => {
      it('should return the dimensionsDatas reference', () => {
        const result = dimensionsDatasService.getDatas();
        expect(result).toBe(dimensionsDatasService.dimensionsDatas);
      });

      it('should return model with data after loading', () => {
        loadV4Data();
        const result = dimensionsDatasService.getDatas();
        expect(result.dimensions.length).toBeGreaterThan(0);
        expect(result.selectedDimensions.length).toBeGreaterThan(0);
      });
    });

    // ===== getDimensionCount =====

    describe('getDimensionCount', () => {
      it('should return 0 when no dimensions loaded', () => {
        dimensionsDatasService.initialize();
        expect(dimensionsDatasService.getDimensionCount()).toBe(0);
      });

      it('should return correct count after loading data', () => {
        loadV4Data();
        // v4.json has 2 dimensions
        expect(dimensionsDatasService.getDimensionCount()).toBe(2);
      });
    });

    // ===== isLargeCocluster =====

    describe('isLargeCocluster', () => {
      it('should return false for small cocluster', () => {
        loadV4Data();
        expect(dimensionsDatasService.isLargeCocluster()).toBe(false);
      });

      it('should return true when dimensions have many parts', () => {
        loadV4Data();
        // Override parts to simulate large cocluster
        dimensionsDatasService.dimensionsDatas.dimensions.forEach((dim) => {
          dim.parts = 10000;
        });
        expect(dimensionsDatasService.isLargeCocluster()).toBe(true);
      });
    });

    // ===== setIsLoading =====

    describe('setIsLoading', () => {
      it('should set isLoading to true when product of parts > 10000', () => {
        loadV4Data();
        dimensionsDatasService.dimensionsDatas.initialDimensions.forEach(
          (dim) => {
            dim.parts = 200;
          },
        );

        dimensionsDatasService.setIsLoading(true);
        expect(dimensionsDatasService.dimensionsDatas.isLoading).toBe(true);
      });

      it('should not set isLoading when product of parts <= 10000', () => {
        loadV4Data();
        // Keep small parts
        dimensionsDatasService.dimensionsDatas.initialDimensions.forEach(
          (dim) => {
            dim.parts = 10;
          },
        );

        dimensionsDatasService.setIsLoading(true);
        expect(dimensionsDatasService.dimensionsDatas.isLoading).toBe(false);
      });

      it('should set isLoading to false when product > 10000', () => {
        loadV4Data();
        dimensionsDatasService.dimensionsDatas.initialDimensions.forEach(
          (dim) => {
            dim.parts = 200;
          },
        );
        dimensionsDatasService.dimensionsDatas.isLoading = true;

        dimensionsDatasService.setIsLoading(false);
        expect(dimensionsDatasService.dimensionsDatas.isLoading).toBe(false);
      });
    });

    // ===== isContextDimensions =====

    describe('isContextDimensions', () => {
      it('should return false when data has 2 dimensions', () => {
        loadV4Data();
        // v4.json typically has 2 dimensions
        expect(dimensionsDatasService.isContextDimensions()).toBe(false);
      });

      it('should return false when no data loaded', () => {
        appService.initialize();
        expect(dimensionsDatasService.isContextDimensions()).toBe(false);
      });
    });

    // ===== isContextDimension =====

    describe('isContextDimension', () => {
      it('should return false for first dimension (position 0)', () => {
        loadV4Data();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        expect(dimensionsDatasService.isContextDimension(dimName)).toBe(false);
      });

      it('should return false for second dimension (position 1)', () => {
        loadV4Data();
        const dimName = dimensionsDatasService.getSelectedDimensions()[1].name;
        expect(dimensionsDatasService.isContextDimension(dimName)).toBe(false);
      });

      it('should return false for unknown dimension name', () => {
        loadV4Data();
        // findIndex returns -1 which is not > 1
        expect(
          dimensionsDatasService.isContextDimension('nonExistent'),
        ).toBe(false);
      });
    });

    // ===== toggleIsAxisInverted =====

    describe('toggleIsAxisInverted', () => {
      it('should toggle from true to false', () => {
        dimensionsDatasService.dimensionsDatas.isAxisInverted = true;
        dimensionsDatasService.toggleIsAxisInverted();
        expect(dimensionsDatasService.dimensionsDatas.isAxisInverted).toBe(
          false,
        );
      });

      it('should toggle from false to true', () => {
        dimensionsDatasService.dimensionsDatas.isAxisInverted = false;
        dimensionsDatasService.toggleIsAxisInverted();
        expect(dimensionsDatasService.dimensionsDatas.isAxisInverted).toBe(
          true,
        );
      });

      it('should toggle back to original after two calls', () => {
        const original = dimensionsDatasService.dimensionsDatas.isAxisInverted;
        dimensionsDatasService.toggleIsAxisInverted();
        dimensionsDatasService.toggleIsAxisInverted();
        expect(dimensionsDatasService.dimensionsDatas.isAxisInverted).toBe(
          original,
        );
      });
    });

    // ===== getDimensionPositionFromName =====

    describe('getDimensionPositionFromName', () => {
      it('should return correct position for existing dimension', () => {
        loadV4Data();
        const dims = dimensionsDatasService.getSelectedDimensions();
        const pos = dimensionsDatasService.getDimensionPositionFromName(
          dims[0].name,
        );
        expect(pos).toBe(0);
      });

      it('should return 1 for second dimension', () => {
        loadV4Data();
        const dims = dimensionsDatasService.getSelectedDimensions();
        const pos = dimensionsDatasService.getDimensionPositionFromName(
          dims[1].name,
        );
        expect(pos).toBe(1);
      });

      it('should return -1 for non-existent dimension', () => {
        loadV4Data();
        const pos = dimensionsDatasService.getDimensionPositionFromName(
          'nonExistentDim',
        );
        expect(pos).toBe(-1);
      });
    });

    // ===== getDimensionsToSave =====

    describe('getDimensionsToSave', () => {
      it('should return empty array when no dimensions selected', () => {
        dimensionsDatasService.initialize();
        const result = dimensionsDatasService.getDimensionsToSave();
        expect(result).toEqual([]);
      });

      it('should return array of {name} objects for selected dimensions', () => {
        loadV4Data();
        const result = dimensionsDatasService.getDimensionsToSave();
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(
          jasmine.objectContaining({ name: jasmine.any(String) }),
        );
        expect(result[1]).toEqual(
          jasmine.objectContaining({ name: jasmine.any(String) }),
        );
      });

      it('should match selected dimension names', () => {
        loadV4Data();
        const selected = dimensionsDatasService.getSelectedDimensions();
        const saved = dimensionsDatasService.getDimensionsToSave();
        expect(saved[0].name).toBe(selected[0].name);
        expect(saved[1].name).toBe(selected[1].name);
      });
    });

    // ===== getSelectedDimensions =====

    describe('getSelectedDimensions', () => {
      it('should return empty array when not initialized', () => {
        dimensionsDatasService.initialize();
        expect(dimensionsDatasService.getSelectedDimensions()).toEqual([]);
      });

      it('should return dimensions after loading data', () => {
        loadV4Data();
        const result = dimensionsDatasService.getSelectedDimensions();
        expect(result.length).toBe(2);
        expect(result[0].name).toBeDefined();
      });
    });

    // ===== getDimensions =====

    describe('getDimensions', () => {
      it('should return empty array when no app data loaded', () => {
        appService.initialize();
        const result = dimensionsDatasService.getDimensions();
        expect(result).toEqual([]);
      });

      it('should return dimensions from app data', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);

        const result = dimensionsDatasService.getDimensions();
        expect(result.length).toBe(2);
        expect(result[0].name).toBeDefined();
        expect(result[0].type).toBeDefined();
      });

      it('should set cellPartIndexes from app data', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);

        dimensionsDatasService.getDimensions();
        expect(
          dimensionsDatasService.dimensionsDatas.cellPartIndexes,
        ).toBeDefined();
      });
    });

    // ===== saveInitialDimension =====

    describe('saveInitialDimension', () => {
      it('should save initial dimensions when not yet saved', () => {
        loadV4Data();
        expect(
          dimensionsDatasService.dimensionsDatas.initialDimensions.length,
        ).toBeGreaterThan(0);
      });

      it('should not overwrite initial dimensions on second call', () => {
        loadV4Data();
        const firstSave = [
          ...dimensionsDatasService.dimensionsDatas.initialDimensions,
        ];

        // Modify selected dimensions
        dimensionsDatasService.dimensionsDatas.selectedDimensions = [];

        // Call again - should not overwrite
        dimensionsDatasService.saveInitialDimension();
        expect(
          dimensionsDatasService.dimensionsDatas.initialDimensions,
        ).toEqual(firstSave);
      });
    });

    // ===== initSelectedDimensions =====

    describe('initSelectedDimensions', () => {
      it('should set selected dimensions from dimensions', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        dimensionsDatasService.getDimensions();

        const result = dimensionsDatasService.initSelectedDimensions();
        expect(result.length).toBe(2);
      });

      it('should initialize context dimensions (empty for 2-dim data)', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        dimensionsDatasService.getDimensions();

        dimensionsDatasService.initSelectedDimensions();
        expect(
          dimensionsDatasService.dimensionsDatas.contextDimensions,
        ).toEqual([]);
      });

      it('should restore saved selected dimensions if available', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        dimensionsDatasService.getDimensions();

        const dims = dimensionsDatasService.dimensionsDatas.dimensions;
        const savedDims = [{ name: dims[1].name }, { name: dims[0].name }];
        spyOn(appService, 'getSavedDatas').and.returnValue(savedDims);

        const result = dimensionsDatasService.initSelectedDimensions();
        // Dimensions should be swapped
        expect(result[0].name).toBe(dims[1].name);
        expect(result[1].name).toBe(dims[0].name);
      });

      it('should not reinitialize context selection when initContextSelection is false', () => {
        const fileDatas = require('../../assets/mocks/kc/v4.json');
        appService.setFileDatas(fileDatas);
        dimensionsDatasService.getDimensions();

        dimensionsDatasService.initSelectedDimensions(true);
        const contextBefore = [
          ...dimensionsDatasService.dimensionsDatas.contextDimensions,
        ];

        dimensionsDatasService.initSelectedDimensions(false);
        // contextDimensions should not have been reinitialized
        expect(
          dimensionsDatasService.dimensionsDatas.contextDimensions,
        ).toEqual(contextBefore);
      });
    });

    // ===== updateSelectedDimension =====

    describe('updateSelectedDimension', () => {
      it('should swap dimensions when updating', () => {
        loadV4Data();
        const dims = dimensionsDatasService.getSelectedDimensions();
        const dim0Name = dims[0].name;
        const dim1Name = dims[1].name;

        dimensionsDatasService.updateSelectedDimension(dims[1], 0);

        const updated = dimensionsDatasService.getSelectedDimensions();
        expect(updated[0].name).toBe(dim1Name);
        expect(updated[1].name).toBe(dim0Name);
      });

      it('should return updated selected dimensions array', () => {
        loadV4Data();
        const dims = dimensionsDatasService.getSelectedDimensions();

        const result = dimensionsDatasService.updateSelectedDimension(
          dims[1],
          0,
        );
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
      });
    });

    // ===== getDimensionIntervals =====

    describe('getDimensionIntervals', () => {
      it('should return 0 when no trees built', () => {
        dimensionsDatasService.initialize();
        const result = dimensionsDatasService.getDimensionIntervals('test');
        expect(result).toBe(0);
      });

      it('should return correct count after building trees', () => {
        loadV4Data();
        dimensionsDatasService.constructDimensionsTrees();
        const dimName =
          dimensionsDatasService.getSelectedDimensions()[0].name;
        const result = dimensionsDatasService.getDimensionIntervals(dimName);
        expect(result).toBeGreaterThan(0);
      });
    });

    // ===== getNodeIntervalsCount =====

    describe('getNodeIntervalsCount', () => {
      it('should return 1 for a leaf node', () => {
        const leafNode = { isLeaf: true, isCollapsed: false, children: [] };
        const result = dimensionsDatasService.getNodeIntervalsCount(leafNode);
        expect(result).toBe(1);
      });

      it('should return 1 for a collapsed non-leaf node', () => {
        const collapsedNode = {
          isLeaf: false,
          isCollapsed: true,
          children: [
            { isLeaf: true, isCollapsed: false, children: [] },
            { isLeaf: true, isCollapsed: false, children: [] },
          ],
        };
        const result =
          dimensionsDatasService.getNodeIntervalsCount(collapsedNode);
        expect(result).toBe(1);
      });

      it('should count all leaf children for expanded node', () => {
        const expandedNode = {
          isLeaf: false,
          isCollapsed: false,
          children: [
            { isLeaf: true, isCollapsed: false, children: [] },
            { isLeaf: true, isCollapsed: false, children: [] },
            { isLeaf: true, isCollapsed: false, children: [] },
          ],
        };
        const result =
          dimensionsDatasService.getNodeIntervalsCount(expandedNode);
        expect(result).toBe(3);
      });

      it('should handle nested expanded nodes', () => {
        const nestedNode = {
          isLeaf: false,
          isCollapsed: false,
          children: [
            {
              isLeaf: false,
              isCollapsed: false,
              children: [
                { isLeaf: true, isCollapsed: false, children: [] },
                { isLeaf: true, isCollapsed: false, children: [] },
              ],
            },
            { isLeaf: true, isCollapsed: false, children: [] },
          ],
        };
        const result =
          dimensionsDatasService.getNodeIntervalsCount(nestedNode);
        expect(result).toBe(3);
      });
    });

    // ===== initSavedDatas =====

    describe('initSavedDatas', () => {
      it('should set conditionalOnContext from saved data', () => {
        loadV4Data();
        spyOn(appService, 'getSavedDatas').and.callFake((type) => {
          if (type === 'conditionalOnContext') return false;
          return undefined;
        });

        dimensionsDatasService.initSavedDatas();
        expect(
          dimensionsDatasService.dimensionsDatas.conditionalOnContext,
        ).toBe(false);
      });

      it('should set matrixContrast from saved data', () => {
        loadV4Data();
        spyOn(appService, 'getSavedDatas').and.callFake((type) => {
          if (type === 'matrixContrast') return 5;
          return undefined;
        });

        dimensionsDatasService.initSavedDatas();
        expect(dimensionsDatasService.dimensionsDatas.matrixContrast).toBe(5);
      });

      it('should set matrixMode from saved data', () => {
        loadV4Data();
        spyOn(appService, 'getSavedDatas').and.callFake((type) => {
          if (type === 'matrixMode') return 2;
          return undefined;
        });

        dimensionsDatasService.initSavedDatas();
        expect(dimensionsDatasService.dimensionsDatas.matrixMode).toBe(2);
      });

      it('should set matrixOption from saved data', () => {
        loadV4Data();
        spyOn(appService, 'getSavedDatas').and.callFake((type) => {
          if (type === 'matrixOption') return 'FREQUENCY';
          return undefined;
        });

        dimensionsDatasService.initSavedDatas();
        expect(dimensionsDatasService.dimensionsDatas.matrixOption).toBe(
          'FREQUENCY',
        );
      });

      it('should set isAxisInverted from saved data', () => {
        loadV4Data();
        spyOn(appService, 'getSavedDatas').and.callFake((type) => {
          if (type === 'isAxisInverted') return false;
          return undefined;
        });

        dimensionsDatasService.initSavedDatas();
        expect(dimensionsDatasService.dimensionsDatas.isAxisInverted).toBe(
          false,
        );
      });

      it('should default conditionalOnContext to false when no context dimensions', () => {
        loadV4Data();
        // v4.json has 2 dims so isContextDimensions returns false
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);

        dimensionsDatasService.initSavedDatas();
        expect(
          dimensionsDatasService.dimensionsDatas.conditionalOnContext,
        ).toBe(false);
      });

      it('should keep default values when no saved data', () => {
        loadV4Data();
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);

        const contrastBefore =
          dimensionsDatasService.dimensionsDatas.matrixContrast;
        dimensionsDatasService.initSavedDatas();
        expect(dimensionsDatasService.dimensionsDatas.matrixContrast).toBe(
          contrastBefore,
        );
      });
    });

    // ===== getMatrixDatas =====

    describe('getMatrixDatas', () => {
      it('should create matrix datas after loading data and building trees', () => {
        loadV4Data();
        dimensionsDatasService.constructDimensionsTrees();
        const result = dimensionsDatasService.getMatrixDatas();

        expect(result).toBeDefined();
        expect(result.matrixCellDatas).toBeDefined();
      });

      it('should set matrix variable names', () => {
        loadV4Data();
        dimensionsDatasService.constructDimensionsTrees();
        const result = dimensionsDatasService.getMatrixDatas();

        expect(result.variable.nameX).toBeDefined();
        expect(result.variable.nameY).toBeDefined();
      });

      it('should set propagateChanges flag', () => {
        loadV4Data();
        dimensionsDatasService.constructDimensionsTrees();

        const result1 = dimensionsDatasService.getMatrixDatas(true);
        expect(result1.propagateChanges).toBe(true);

        const result2 = dimensionsDatasService.getMatrixDatas(false);
        expect(result2.propagateChanges).toBe(false);
      });
    });

    // ===== computeMatrixDataFreqMap =====

    describe('computeMatrixDataFreqMap', () => {
      it('should compute freq map after loading data', () => {
        loadV4Data();
        dimensionsDatasService.constructDimensionsTrees();
        dimensionsDatasService.getMatrixDatas();
        dimensionsDatasService.computeMatrixDataFreqMap();

        expect(
          dimensionsDatasService.dimensionsDatas.matrixCellFreqDataMap,
        ).toBeDefined();
      });
    });

    // ===== recomputeDatasFromNewJson =====

    describe('recomputeDatasFromNewJson', () => {
      it('should recompute dimensions and trees', () => {
        loadV4Data();
        dimensionsDatasService.constructDimensionsTrees();

        spyOn(dimensionsDatasService, 'getDimensions').and.callThrough();
        spyOn(
          dimensionsDatasService,
          'initSelectedDimensions',
        ).and.callThrough();
        spyOn(dimensionsDatasService, 'saveInitialDimension').and.callThrough();
        spyOn(
          dimensionsDatasService,
          'constructDimensionsTrees',
        ).and.callThrough();
        spyOn(dimensionsDatasService, 'getMatrixDatas').and.callThrough();
        spyOn(
          dimensionsDatasService,
          'computeMatrixDataFreqMap',
        ).and.callThrough();

        const dimName =
          dimensionsDatasService.getSelectedDimensions()[0].name;
        dimensionsDatasService.recomputeDatasFromNewJson(dimName);

        expect(dimensionsDatasService.getDimensions).toHaveBeenCalled();
        expect(
          dimensionsDatasService.initSelectedDimensions,
        ).toHaveBeenCalledWith(false);
        expect(dimensionsDatasService.saveInitialDimension).toHaveBeenCalled();
        expect(
          dimensionsDatasService.constructDimensionsTrees,
        ).toHaveBeenCalled();
        expect(dimensionsDatasService.getMatrixDatas).toHaveBeenCalled();
        expect(
          dimensionsDatasService.computeMatrixDataFreqMap,
        ).toHaveBeenCalled();
      });
    });

    // ===== Integration tests with different mock files =====

    describe('Integration with cc.json', () => {
      it('should load and process cc.json data correctly', () => {
        const fileDatas = require('../../assets/mocks/kc/cc.json');
        appService.setFileDatas(fileDatas);
        dimensionsDatasService.getDimensions();
        dimensionsDatasService.initSelectedDimensions();
        dimensionsDatasService.saveInitialDimension();

        expect(dimensionsDatasService.getDimensionCount()).toBeGreaterThan(0);
        expect(
          dimensionsDatasService.getSelectedDimensions().length,
        ).toBeGreaterThan(0);
      });
    });

    describe('Full workflow', () => {
      it('should handle complete lifecycle: init -> load -> build -> matrix', () => {
        dimensionsDatasService.initialize();
        expect(dimensionsDatasService.getDimensionCount()).toBe(0);

        loadV4Data();
        expect(dimensionsDatasService.getDimensionCount()).toBe(2);

        dimensionsDatasService.constructDimensionsTrees();
        const datas = dimensionsDatasService.getDatas();
        expect(datas.dimensionsTrees.length).toBe(2);

        const matrix = dimensionsDatasService.getMatrixDatas();
        expect(matrix).toBeDefined();
        expect(matrix.matrixCellDatas).toBeDefined();
      });

      it('should handle reinitialize and reload', () => {
        loadV4Data();
        dimensionsDatasService.constructDimensionsTrees();
        expect(dimensionsDatasService.getDimensionCount()).toBe(2);

        dimensionsDatasService.initialize();
        expect(dimensionsDatasService.getDimensionCount()).toBe(0);

        loadV4Data();
        expect(dimensionsDatasService.getDimensionCount()).toBe(2);
      });
    });
  });
});
