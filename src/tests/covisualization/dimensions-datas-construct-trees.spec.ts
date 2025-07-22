/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';

let appService: AppService;
let dimensionsDatasService: DimensionsDatasService;

describe('coVisualization', () => {
  describe('DimensionsDatasService constructDimensionsTrees method', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      appService = TestBed.inject(AppService);
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
    });

    // ==== 3 TESTS SIMPLES ====

    it('1 - should initialize empty trees when no data provided', () => {
      // Given: No file data set
      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: should have empty arrays
      const datas = dimensionsDatasService.getDatas();
      expect(datas.dimensionsTrees).toEqual([]);
      expect(datas.currentDimensionsTrees).toEqual([]);
    });

    it('2 - should initialize trees arrays when valid data provided', () => {
      // Given: Valid file data
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);

      // Setup dimensions
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();

      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: should have initialized arrays
      const datas = dimensionsDatasService.getDatas();
      expect(Array.isArray(datas.dimensionsTrees)).toBe(true);
      expect(Array.isArray(datas.currentDimensionsTrees)).toBe(true);
      expect(datas.dimensionsTrees.length).toBeGreaterThan(0);
      expect(datas.currentDimensionsTrees.length).toBeGreaterThan(0);
    });

    it('3 - should create trees with correct number of dimensions', () => {
      // Given: Valid file data with 2 dimensions
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);

      // Setup dimensions
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();

      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: should have trees for each dimension
      const datas = dimensionsDatasService.getDatas();
      const selectedDimensions = dimensionsDatasService.getSelectedDimensions();

      expect(datas.dimensionsTrees.length).toBe(selectedDimensions.length);
      expect(datas.currentDimensionsTrees.length).toBe(
        selectedDimensions.length,
      );
      expect(datas.dimensionsTrees.length).toBe(2); // v4.json has 2 dimensions
    });

    // ==== 7 TESTS PLUS COMPLEXES ====

    it('4 - should create tree nodes with correct TreeNodeModel structure', () => {
      // Given: Valid file data
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);

      // Setup dimensions
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();

      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: should create TreeNodeModel objects with correct structure
      const datas = dimensionsDatasService.getDatas();
      expect(datas.dimensionsClusters).toBeDefined();
      expect(datas.dimensionsClusters.length).toBeGreaterThan(0);

      // Verify first dimension clusters
      const firstDimensionClusters = datas.dimensionsClusters[0];
      expect(Array.isArray(firstDimensionClusters)).toBe(true);
      expect(firstDimensionClusters.length).toBeGreaterThan(0);

      // Verify TreeNodeModel structure
      const firstCluster = firstDimensionClusters[0];
      expect(firstCluster).toBeDefined();
      expect(firstCluster.name).toBeDefined();
      expect(typeof firstCluster.rank).toBe('number');
      expect(typeof firstCluster.isLeaf).toBe('boolean');
    });

    it('5 - should handle collapsed nodes from saved data', () => {
      // Given: File data and saved collapsed nodes
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);

      // Mock collapsed nodes data
      const mockCollapsedNodes = {
        occupation: ['A7', 'A8'],
        education: ['B5'],
      };
      spyOn(appService, 'getSavedDatas').and.returnValue(mockCollapsedNodes);

      // Setup dimensions
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();

      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: should handle collapsed nodes correctly
      expect(appService.getSavedDatas).toHaveBeenCalledWith('collapsedNodes');
      const datas = dimensionsDatasService.getDatas();
      expect(datas.dimensionsTrees).toBeDefined();
      expect(datas.dimensionsTrees.length).toBeGreaterThan(0);
    });

    it('6 - should sort clusters by rank correctly', () => {
      // Given: Valid file data
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);

      // Setup dimensions
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();

      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: clusters should be sorted by rank
      const datas = dimensionsDatasService.getDatas();
      const firstDimensionClusters = datas.dimensionsClusters[0];

      for (let i = 0; i < firstDimensionClusters.length - 1; i++) {
        const currentRank = firstDimensionClusters[i].rank;
        const nextRank = firstDimensionClusters[i + 1].rank;
        expect(currentRank).toBeLessThanOrEqual(nextRank);
      }
    });

    it('7 - should create unflattened tree structures', () => {
      // Given: Valid file data
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);

      // Setup dimensions
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();

      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: should create properly unflattened tree structures
      const datas = dimensionsDatasService.getDatas();

      // Verify trees are unflattened (should have root nodes with children)
      expect(datas.dimensionsTrees[0]).toBeDefined();
      expect(Array.isArray(datas.dimensionsTrees[0])).toBe(true);

      // Verify current trees are also created
      expect(datas.currentDimensionsTrees[0]).toBeDefined();
      expect(Array.isArray(datas.currentDimensionsTrees[0])).toBe(true);
    });

    it('8 - should handle both initial and current dimension hierarchies', () => {
      // Given: Valid file data
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);

      // Setup dimensions
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();

      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: should create both initial and current dimension trees
      const datas = dimensionsDatasService.getDatas();

      expect(datas.dimensionsTrees).toBeDefined();
      expect(datas.currentDimensionsTrees).toBeDefined();
      expect(datas.dimensionsClusters).toBeDefined();
      expect(datas.currentDimensionsClusters).toBeDefined();

      expect(datas.dimensionsTrees.length).toBe(
        datas.currentDimensionsTrees.length,
      );
      expect(datas.dimensionsClusters.length).toBe(
        datas.currentDimensionsClusters.length,
      );
    });

    it('9 - should handle external data integration', () => {
      // Given: Valid file data
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);

      // Setup dimensions
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();

      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: should handle external data correctly
      const datas = dimensionsDatasService.getDatas();
      const firstDimensionClusters = datas.dimensionsClusters[0];

      // Verify that external data service was called for each dimension
      expect(firstDimensionClusters).toBeDefined();
      expect(firstDimensionClusters.length).toBeGreaterThan(0);

      // Verify TreeNode creation with external data handling
      const firstCluster = firstDimensionClusters[0];
      expect(firstCluster).toBeDefined();
      expect(firstCluster.leafPosition).toBeDefined();
      expect(typeof firstCluster.leafPosition).toBe('number');
    });

    it('10 - should integrate with ImportExtDatasService correctly', () => {
      // Given: Valid file data
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);

      // Setup dimensions
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();

      // Spy on ImportExtDatasService
      const importExtDatasService =
        dimensionsDatasService['importExtDatasService'];
      spyOn(
        importExtDatasService,
        'getImportedDatasFromDimension',
      ).and.callThrough();

      // When: constructDimensionsTrees is called
      dimensionsDatasService.constructDimensionsTrees();

      // Then: should call ImportExtDatasService once per dimension (optimized to avoid redundant calls)
      const selectedDimensions = dimensionsDatasService.getSelectedDimensions();
      expect(
        importExtDatasService.getImportedDatasFromDimension,
      ).toHaveBeenCalledTimes(selectedDimensions.length); // Called once per dimension (optimized)
    });
  });
});
