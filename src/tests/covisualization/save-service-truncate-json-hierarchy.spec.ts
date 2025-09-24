/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { SaveService } from '@khiops-covisualization/providers/save.service';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { ViewManagerService } from '@khiops-covisualization/providers/view-manager.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { AnnotationService } from '@khiops-covisualization/providers/annotation.service';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { CovisualizationDatas } from '@khiops-covisualization/interfaces/app-datas';

/**
 * Unit tests for SaveService.truncateJsonHierarchy method
 */
describe('SaveService - truncateJsonHierarchy', () => {
  let service: SaveService;

  beforeEach(() => {
    const dimensionsDatasServiceSpy = jasmine.createSpyObj(
      'DimensionsDatasService',
      [],
      {
        dimensionsDatas: {
          selectedDimensions: [],
          dimensionsClusters: [],
        },
      },
    );

    const appServiceSpy = jasmine.createSpyObj('AppService', ['initialDatas']);
    const layoutServiceSpy = jasmine.createSpyObj('LayoutService', [
      'getSplitSizes',
    ]);
    const viewManagerServiceSpy = jasmine.createSpyObj('ViewManagerService', [
      'getViewsLayout',
    ]);
    const treenodesServiceSpy = jasmine.createSpyObj('TreenodesService', [
      'getUnfoldHierarchy',
    ]);
    const annotationServiceSpy = jasmine.createSpyObj('AnnotationService', [
      'getAnnotations',
    ]);
    const importExtDatasServiceSpy = jasmine.createSpyObj(
      'ImportExtDatasService',
      ['getImportedDatas'],
    );

    TestBed.configureTestingModule({
      providers: [
        SaveService,
        { provide: AppService, useValue: appServiceSpy },
        { provide: LayoutService, useValue: layoutServiceSpy },
        {
          provide: DimensionsDatasService,
          useValue: dimensionsDatasServiceSpy,
        },
        { provide: ViewManagerService, useValue: viewManagerServiceSpy },
        { provide: TreenodesService, useValue: treenodesServiceSpy },
        { provide: AnnotationService, useValue: annotationServiceSpy },
        { provide: ImportExtDatasService, useValue: importExtDatasServiceSpy },
      ],
    });

    service = TestBed.inject(SaveService);
  });

  /**
   * Creates a mock CovisualizationDatas object for testing
   */
  function createMockData(): CovisualizationDatas {
    return {
      coclusteringReport: {
        dimensionHierarchies: [
          {
            name: 'dimension1',
            clusters: [
              { cluster: 'cluster1', isLeaf: false, rank: 1 },
              { cluster: 'cluster2', isLeaf: true, rank: 2 },
              { cluster: 'cluster3', isLeaf: true, rank: 3 },
            ],
          },
        ],
      },
      savedDatas: {},
    } as CovisualizationDatas;
  }

  it('Test 1: should return original data when no collapsed nodes', () => {
    const mockData = createMockData();
    const result = service.truncateJsonHierarchy(mockData);
    expect(result).toBe(mockData);
  });

  it('Test 2: should process data when collapsedNodes is empty object', () => {
    const mockData = createMockData();
    mockData.savedDatas.collapsedNodes = {};

    const result = service.truncateJsonHierarchy(mockData);
    expect(result.coclusteringReport.dimensionHierarchies).toBeDefined();
  });

  it('Test 3: should create new hierarchy array when processing', () => {
    const mockData = createMockData();
    mockData.savedDatas.collapsedNodes = { dimension1: ['node1'] };

    const originalHierarchy = mockData.coclusteringReport.dimensionHierarchies;
    const result = service.truncateJsonHierarchy(mockData);

    expect(result.coclusteringReport.dimensionHierarchies).not.toBe(
      originalHierarchy,
    );
  });

  it('Test 4: should handle invalid dimension name gracefully', () => {
    const mockData = createMockData();
    mockData.savedDatas.collapsedNodes = { invalid_dimension: ['node1'] };

    const result = service.truncateJsonHierarchy(mockData);
    expect(
      result.coclusteringReport.dimensionHierarchies[0].clusters.length,
    ).toBe(3);
  });

  it('Test 5: should sort clusters by isLeaf and rank', () => {
    const mockData = createMockData();
    mockData.savedDatas.collapsedNodes = { dimension1: [] };

    // Reverse order to test sorting
    mockData.coclusteringReport.dimensionHierarchies[0].clusters = [
      { cluster: 'leaf1', isLeaf: true, rank: 1 },
      { cluster: 'parent1', isLeaf: false, rank: 2 },
      { cluster: 'leaf2', isLeaf: true, rank: 3 },
      { cluster: 'parent2', isLeaf: false, rank: 1 },
    ];

    const result = service.truncateJsonHierarchy(mockData);
    const clusters = result.coclusteringReport.dimensionHierarchies[0].clusters;

    // With lodash sortBy([e => e.isLeaf === false, 'rank']):
    // - Items with isLeaf=true (returns false) come first, sorted by rank
    // - Items with isLeaf=false (returns true) come second, sorted by rank
    expect(clusters[0].isLeaf).toBe(true);
    expect(clusters[0].rank).toBe(1);
    expect(clusters[1].isLeaf).toBe(true);
    expect(clusters[1].rank).toBe(3);
    expect(clusters[2].isLeaf).toBe(false);
    expect(clusters[2].rank).toBe(1);
    expect(clusters[3].isLeaf).toBe(false);
    expect(clusters[3].rank).toBe(2);
  });

  it('Test 6: should handle multiple dimensions', () => {
    const mockData = createMockData();
    mockData.coclusteringReport.dimensionHierarchies.push({
      name: 'dimension2',
      clusters: [{ cluster: 'dim2_cluster1', isLeaf: true, rank: 1 }],
    });
    mockData.savedDatas.collapsedNodes = { dimension1: [], dimension2: [] };

    const result = service.truncateJsonHierarchy(mockData);
    expect(result.coclusteringReport.dimensionHierarchies.length).toBe(2);
  });

  it('Test 7: should preserve cluster properties during sorting', () => {
    const mockData = createMockData();
    mockData.savedDatas.collapsedNodes = { dimension1: [] };

    // Add custom property to test preservation
    mockData.coclusteringReport.dimensionHierarchies[0].clusters[0].customProp =
      'test';

    const result = service.truncateJsonHierarchy(mockData);
    const sortedCluster =
      result.coclusteringReport.dimensionHierarchies[0].clusters.find(
        (c) => c.customProp === 'test',
      );

    expect(sortedCluster).toBeDefined();
    expect(sortedCluster.customProp).toBe('test');
  });

  it('Test 8: should handle large datasets efficiently', () => {
    const mockData = createMockData();

    // Create large dataset
    const largeClusters = Array.from({ length: 1000 }, (_, i) => ({
      cluster: `cluster_${i}`,
      isLeaf: i % 2 === 0,
      rank: i,
    }));

    mockData.coclusteringReport.dimensionHierarchies[0].clusters =
      largeClusters;
    mockData.savedDatas.collapsedNodes = { dimension1: [] };

    const startTime = performance.now();
    const result = service.truncateJsonHierarchy(mockData);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // Performance check
    expect(
      result.coclusteringReport.dimensionHierarchies[0].clusters.length,
    ).toBe(1000);
  });

  it('Test 10: should return same instance when no changes needed', () => {
    const mockData = createMockData();
    // No collapsedNodes property at all

    const result = service.truncateJsonHierarchy(mockData);
    expect(result).toBe(mockData); // Same object reference
  });
});
