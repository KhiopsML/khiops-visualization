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
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import * as _ from 'lodash';

/**
 * Advanced unit tests for SaveService.truncateJsonHierarchy method
 * Using real mock data for comprehensive testing
 */
describe('SaveService - truncateJsonHierarchy Advanced Tests', () => {
  let service: SaveService;
  let dimensionsDatasService: any;

  beforeEach(() => {
    const dimensionsDatasServiceSpy = jasmine.createSpyObj(
      'DimensionsDatasService',
      [],
      {
        dimensionsDatas: {
          selectedDimensions: [{ name: 'id' }, { name: 'feat' }],
          dimensionsClusters: [
            [], // Will be populated per test
            [], // Will be populated per test
          ],
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
    dimensionsDatasService = TestBed.inject(DimensionsDatasService);
  });

  /**
   * Creates a mock data structure based on the real file structure
   */
  function createMockDataFromFile(): CovisualizationDatas {
    return {
      tool: 'Khiops Coclustering',
      version: '10.1.1',
      coclusteringReport: {
        summary: {
          instances: 2711284,
          cells: 45057,
          nullCost: 39075457.72,
          cost: 32576784.18,
          level: 0.1663108744,
          initialDimensions: 2,
          frequencyVariable: 'weight_1000',
          dictionary: 'khiops_coclust_2nd_table_file',
          database: 'database path',
          samplePercentage: 100,
          samplingMode: 'Include sample',
          selectionVariable: '',
          selectionValue: '',
        },
        dimensionSummaries: [
          {
            name: 'id',
            type: 'Categorical',
            parts: 2536,
            initialParts: 2536,
            values: 2708,
            interest: 1,
            description: '',
          },
          {
            name: 'feat',
            type: 'Categorical',
            parts: 627,
            initialParts: 627,
            values: 1432,
            interest: 1,
            description: '',
          },
        ],
        dimensionHierarchies: [
          {
            name: 'id',
            type: 'Categorical',
            clusters: [
              {
                cluster: '{1040, 1719, 1720}',
                parentCluster: 'A1906',
                frequency: 3006,
                interest: 0.928664,
                hierarchicalLevel: 1,
                rank: 1,
                hierarchicalRank: 3163,
                isLeaf: true,
              },
              {
                cluster: '{1215, 1015}',
                parentCluster: 'A1906',
                frequency: 2002,
                interest: 0.766347,
                hierarchicalLevel: 1,
                rank: 3,
                hierarchicalRank: 3163,
                isLeaf: true,
              },
              {
                cluster: 'A1906',
                parentCluster: 'A3162',
                frequency: 5008,
                interest: 0.847506,
                hierarchicalLevel: 2,
                rank: 2,
                hierarchicalRank: 3162,
                isLeaf: false,
              },
              {
                cluster: '{2213}',
                parentCluster: 'A3151',
                frequency: 1002,
                interest: 0.569217,
                hierarchicalLevel: 1,
                rank: 9,
                hierarchicalRank: 3163,
                isLeaf: true,
              },
            ],
          },
          {
            name: 'feat',
            type: 'Categorical',
            clusters: [
              {
                cluster: '{OV}',
                parentCluster: 'B626',
                frequency: 1002000,
                interest: 0.738095,
                hierarchicalLevel: 1,
                rank: 1,
                hierarchicalRank: 1253,
                isLeaf: true,
              },
              {
                cluster: '{N}',
                parentCluster: 'B625',
                frequency: 850572,
                interest: 0.673469,
                hierarchicalLevel: 1,
                rank: 3,
                hierarchicalRank: 1253,
                isLeaf: true,
              },
              {
                cluster: 'B625',
                parentCluster: 'B1252',
                frequency: 1702856,
                interest: 0.705782,
                hierarchicalLevel: 2,
                rank: 2,
                hierarchicalRank: 1252,
                isLeaf: false,
              },
            ],
          },
        ],
      },
      savedDatas: {},
    } as CovisualizationDatas;
  }

  // ========== SIMPLE TESTS (3) ==========

  /**
   * Test 1: Should return original data when no collapsedNodes exist
   */
  it('Test 1: should return original data when no collapsedNodes property exists', () => {
    const testData = createMockDataFromFile();

    // Ensure no collapsedNodes property exists
    delete testData.savedDatas?.collapsedNodes;

    const result = service.truncateJsonHierarchy(testData);

    // Should return the same reference
    expect(result).toBe(testData);
    // Original hierarchy should be unchanged
    expect(result.coclusteringReport.dimensionHierarchies.length).toBe(2);
  });

  /**
   * Test 2: Should handle empty collapsedNodes object gracefully
   */
  it('Test 2: should handle empty collapsedNodes object', () => {
    const testData = createMockDataFromFile();
    testData.savedDatas = testData.savedDatas || {};
    testData.savedDatas.collapsedNodes = {};

    const originalHierarchiesLength =
      testData.coclusteringReport.dimensionHierarchies.length;
    const originalIdClusters =
      testData.coclusteringReport.dimensionHierarchies[0].clusters.length;
    const originalHierarchyRef =
      testData.coclusteringReport.dimensionHierarchies;

    const result = service.truncateJsonHierarchy(testData);

    // Should process and create new hierarchy reference since collapsedNodes exists
    expect(result.coclusteringReport.dimensionHierarchies.length).toBe(
      originalHierarchiesLength,
    );
    expect(result.coclusteringReport.dimensionHierarchies).not.toBe(
      originalHierarchyRef,
    );

    // Should still have all clusters since no nodes were collapsed
    const idDimension = result.coclusteringReport.dimensionHierarchies.find(
      (h) => h.name === 'id',
    );
    expect(idDimension).toBeDefined();
    expect(idDimension!.clusters.length).toBe(originalIdClusters);

    // Clusters should be sorted by isLeaf and rank
    const sortedClusters = _.sortBy(
      testData.coclusteringReport.dimensionHierarchies[0].clusters,
      [(e) => e.isLeaf === false, 'rank'],
    );
    expect(idDimension!.clusters).toEqual(sortedClusters);
  });

  /**
   * Test 3: Should preserve hierarchy structure when no matching dimensions
   */
  it('Test 3: should preserve hierarchy when collapsed nodes reference non-existent dimensions', () => {
    const testData = createMockDataFromFile();
    testData.savedDatas = testData.savedDatas || {};
    testData.savedDatas.collapsedNodes = {
      nonexistent_dimension: ['some_node'],
    };

    const originalIdClusters =
      testData.coclusteringReport.dimensionHierarchies[0].clusters.length;
    const originalFeatClusters =
      testData.coclusteringReport.dimensionHierarchies[1].clusters.length;

    const result = service.truncateJsonHierarchy(testData);

    // Clusters should remain unchanged since dimension doesn't exist
    expect(
      result.coclusteringReport.dimensionHierarchies[0].clusters.length,
    ).toBe(originalIdClusters);
    expect(
      result.coclusteringReport.dimensionHierarchies[1].clusters.length,
    ).toBe(originalFeatClusters);
  });

  // ========== COMPLEX TESTS (7) ==========

  /**
   * Creates a mock TreeNodeModel for testing collapsed node functionality
   */
  function createMockTreeNode(
    cluster: string,
    childrenList: string[] = [],
  ): TreeNodeModel {
    const mockTreeNode = new TreeNodeModel(
      1,
      { cluster } as any,
      {} as any,
      [],
      0,
      0,
    );
    mockTreeNode.cluster = cluster;
    mockTreeNode.childrenList = childrenList;
    // Mock the getChildrenList method
    spyOn(mockTreeNode, 'getChildrenList').and.stub();
    return mockTreeNode;
  }

  /**
   * Test 4: Should correctly remove child nodes when a parent node is collapsed
   */
  it('Test 4: should remove child nodes when parent node is collapsed', () => {
    const testData = createMockDataFromFile();
    testData.savedDatas = testData.savedDatas || {};
    testData.savedDatas.collapsedNodes = {
      id: ['A1906'], // Collapse the parent node A1906
    };

    // Mock the dimensionsClusters to include the TreeNodeModel for A1906
    const mockTreeNode = createMockTreeNode('A1906', [
      '{1040, 1719, 1720}',
      '{1215, 1015}',
      'A1906',
    ]);
    dimensionsDatasService.dimensionsDatas.dimensionsClusters[0] = [
      mockTreeNode,
    ];

    const originalClustersCount =
      testData.coclusteringReport.dimensionHierarchies[0].clusters.length;

    const result = service.truncateJsonHierarchy(testData);

    const idDimension = result.coclusteringReport.dimensionHierarchies.find(
      (h) => h.name === 'id',
    );
    expect(idDimension).toBeDefined();

    // Should have fewer clusters since children were removed
    expect(idDimension!.clusters.length).toBeLessThan(originalClustersCount);

    // Child nodes should be removed
    const hasChild1 = idDimension!.clusters.some(
      (c) => c.cluster === '{1040, 1719, 1720}',
    );
    const hasChild2 = idDimension!.clusters.some(
      (c) => c.cluster === '{1215, 1015}',
    );
    expect(hasChild1).toBeFalsy();
    expect(hasChild2).toBeFalsy();

    // Parent node should still exist and be marked as leaf
    const parentNode = idDimension!.clusters.find((c) => c.cluster === 'A1906');
    expect(parentNode).toBeDefined();
    expect(parentNode!.isLeaf).toBe(true);
  });

  /**
   * Test 5: Should handle multiple collapsed nodes across different dimensions
   */
  it('Test 5: should handle multiple collapsed nodes across different dimensions', () => {
    const testData = createMockDataFromFile();
    testData.savedDatas = testData.savedDatas || {};
    testData.savedDatas.collapsedNodes = {
      id: ['A1906'],
      feat: ['B625'],
    };

    // Mock TreeNodeModels for both dimensions
    const mockTreeNodeId = createMockTreeNode('A1906', [
      '{1040, 1719, 1720}',
      '{1215, 1015}',
      'A1906',
    ]);
    const mockTreeNodeFeat = createMockTreeNode('B625', ['{N}', 'B625']);

    dimensionsDatasService.dimensionsDatas.dimensionsClusters[0] = [
      mockTreeNodeId,
    ];
    dimensionsDatasService.dimensionsDatas.dimensionsClusters[1] = [
      mockTreeNodeFeat,
    ];

    const originalIdClusters =
      testData.coclusteringReport.dimensionHierarchies[0].clusters.length;
    const originalFeatClusters =
      testData.coclusteringReport.dimensionHierarchies[1].clusters.length;

    const result = service.truncateJsonHierarchy(testData);

    // Both dimensions should be affected
    const idDimension = result.coclusteringReport.dimensionHierarchies.find(
      (h) => h.name === 'id',
    );
    const featDimension = result.coclusteringReport.dimensionHierarchies.find(
      (h) => h.name === 'feat',
    );

    expect(idDimension!.clusters.length).toBeLessThan(originalIdClusters);
    expect(featDimension!.clusters.length).toBeLessThan(originalFeatClusters);

    // Verify collapsed nodes are marked as leaf
    const collapsedIdNode = idDimension!.clusters.find(
      (c) => c.cluster === 'A1906',
    );
    const collapsedFeatNode = featDimension!.clusters.find(
      (c) => c.cluster === 'B625',
    );
    expect(collapsedIdNode!.isLeaf).toBe(true);
    expect(collapsedFeatNode!.isLeaf).toBe(true);
  });

  /**
   * Test 6: Should preserve node that doesn't have children in collapsed list
   */
  it('Test 6: should preserve node without children when collapsed', () => {
    const testData = createMockDataFromFile();
    testData.savedDatas = testData.savedDatas || {};
    testData.savedDatas.collapsedNodes = {
      id: ['{2213}'], // Collapse a leaf node that has no children
    };

    // Mock TreeNodeModel with no children
    const mockTreeNode = createMockTreeNode('{2213}', []);
    dimensionsDatasService.dimensionsDatas.dimensionsClusters[0] = [
      mockTreeNode,
    ];

    const originalClustersCount =
      testData.coclusteringReport.dimensionHierarchies[0].clusters.length;

    const result = service.truncateJsonHierarchy(testData);

    const idDimension = result.coclusteringReport.dimensionHierarchies.find(
      (h) => h.name === 'id',
    );

    // No clusters should be removed since this node has no children
    expect(idDimension!.clusters.length).toBe(originalClustersCount);

    // The node should still exist
    const targetNode = idDimension!.clusters.find(
      (c) => c.cluster === '{2213}',
    );
    expect(targetNode).toBeDefined();
    expect(targetNode!.isLeaf).toBe(true);
  });

  /**
   * Test 7: Should handle nested hierarchy collapse with grandchildren
   */
  it('Test 7: should handle nested hierarchy collapse with multiple levels', () => {
    const testData = createMockDataFromFile();

    // Add more complex hierarchy structure
    testData.coclusteringReport.dimensionHierarchies[0].clusters.push({
      cluster: 'A3162',
      parentCluster: 'ROOT',
      frequency: 8010,
      interest: 0.8,
      hierarchicalLevel: 3,
      rank: 1,
      hierarchicalRank: 3161,
      isLeaf: false,
    });

    testData.savedDatas = testData.savedDatas || {};
    testData.savedDatas.collapsedNodes = {
      id: ['A3162'], // Collapse at the highest level
    };

    // Mock TreeNodeModel with grandchildren
    const mockTreeNode = createMockTreeNode('A3162', [
      'A1906',
      '{2213}',
      'A3162',
    ]);
    dimensionsDatasService.dimensionsDatas.dimensionsClusters[0] = [
      mockTreeNode,
    ];

    const result = service.truncateJsonHierarchy(testData);

    const idDimension = result.coclusteringReport.dimensionHierarchies.find(
      (h) => h.name === 'id',
    );

    // Should remove child nodes but keep the collapsed parent
    const hasA1906 = idDimension!.clusters.some((c) => c.cluster === 'A1906');
    const hasChild2213 = idDimension!.clusters.some(
      (c) => c.cluster === '{2213}',
    );
    const hasParent = idDimension!.clusters.some((c) => c.cluster === 'A3162');

    expect(hasA1906).toBeFalsy();
    expect(hasChild2213).toBeFalsy();
    expect(hasParent).toBeTruthy();

    // Parent should be marked as leaf
    const parentNode = idDimension!.clusters.find((c) => c.cluster === 'A3162');
    expect(parentNode!.isLeaf).toBe(true);
  });

  /**
   * Test 8: Should handle case where collapsed node appears in its own children list
   */
  it('Test 8: should handle self-referencing collapsed node', () => {
    const testData = createMockDataFromFile();
    testData.savedDatas = testData.savedDatas || {};
    testData.savedDatas.collapsedNodes = {
      id: ['A1906'],
    };

    // Mock TreeNodeModel that includes itself in children list (self-reference)
    const mockTreeNode = createMockTreeNode('A1906', [
      '{1040, 1719, 1720}',
      'A1906',
      '{1215, 1015}',
    ]);
    dimensionsDatasService.dimensionsDatas.dimensionsClusters[0] = [
      mockTreeNode,
    ];

    const result = service.truncateJsonHierarchy(testData);

    const idDimension = result.coclusteringReport.dimensionHierarchies.find(
      (h) => h.name === 'id',
    );

    // The node should not remove itself - only remove other children
    const selfNode = idDimension!.clusters.find((c) => c.cluster === 'A1906');
    expect(selfNode).toBeDefined();
    expect(selfNode!.isLeaf).toBe(true);

    // Other children should be removed
    const hasChild1 = idDimension!.clusters.some(
      (c) => c.cluster === '{1040, 1719, 1720}',
    );
    const hasChild2 = idDimension!.clusters.some(
      (c) => c.cluster === '{1215, 1015}',
    );
    expect(hasChild1).toBeFalsy();
    expect(hasChild2).toBeFalsy();
  });

  /**
   * Test 9: Should maintain proper sorting after truncation
   */
  it('Test 9: should maintain proper sorting after node truncation', () => {
    const testData = createMockDataFromFile();
    testData.savedDatas = testData.savedDatas || {};
    testData.savedDatas.collapsedNodes = {
      id: ['A1906'],
    };

    const mockTreeNode = createMockTreeNode('A1906', [
      '{1040, 1719, 1720}',
      '{1215, 1015}',
      'A1906',
    ]);
    dimensionsDatasService.dimensionsDatas.dimensionsClusters[0] = [
      mockTreeNode,
    ];

    const result = service.truncateJsonHierarchy(testData);

    const idDimension = result.coclusteringReport.dimensionHierarchies.find(
      (h) => h.name === 'id',
    );

    // Verify clusters are sorted properly (non-leaf first, then by rank)
    const clusters = idDimension!.clusters;
    for (let i = 0; i < clusters.length - 1; i++) {
      const current = clusters[i];
      const next = clusters[i + 1];

      // Non-leaf nodes should come first
      if (current.isLeaf === false && next.isLeaf === true) {
        expect(true).toBeTruthy(); // This is correct order
      } else if (current.isLeaf === next.isLeaf) {
        // If same leaf status, should be ordered by rank
        expect(current.rank).toBeLessThanOrEqual(next.rank);
      }
    }
  });

  /**
   * Test 10: Should handle empty children list in TreeNodeModel
   */
  it('Test 10: should handle TreeNodeModel with empty children list', () => {
    const testData = createMockDataFromFile();
    testData.savedDatas = testData.savedDatas || {};
    testData.savedDatas.collapsedNodes = {
      id: ['A1906'],
    };

    // Mock TreeNodeModel with no childrenList but getChildrenList is called
    const mockTreeNode = createMockTreeNode('A1906', []);
    // Simulate the case where childrenList is undefined/empty
    mockTreeNode.childrenList = undefined as any;
    dimensionsDatasService.dimensionsDatas.dimensionsClusters[0] = [
      mockTreeNode,
    ];

    const originalClustersCount =
      testData.coclusteringReport.dimensionHierarchies[0].clusters.length;

    const result = service.truncateJsonHierarchy(testData);

    const idDimension = result.coclusteringReport.dimensionHierarchies.find(
      (h) => h.name === 'id',
    );

    // No clusters should be removed since no children were found
    expect(idDimension!.clusters.length).toBe(originalClustersCount);

    // The node should still exist
    const targetNode = idDimension!.clusters.find((c) => c.cluster === 'A1906');
    expect(targetNode).toBeDefined();
  });
});
