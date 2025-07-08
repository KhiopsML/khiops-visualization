// @ts-nocheck
/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TestBed } from '@angular/core/testing';
import { ClustersService } from '../../app/khiops-covisualization/providers/clusters.service';
import { DimensionsDatasService } from '../../app/khiops-covisualization/providers/dimensions-datas.service';
import { TreeNodeModel } from '../../app/khiops-covisualization/model/tree-node.model';
import { TranslateService } from '@ngstack/translate';
import { AppService } from '../../app/khiops-covisualization/providers/app.service';
import { TreenodesService } from '../../app/khiops-covisualization/providers/treenodes.service';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { ClusterDetailsModel } from '@khiops-covisualization/model/cluster-details.model';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';

describe('ClustersService', () => {
  let service: ClustersService;
  let mockDimensionsDatasService: jasmine.SpyObj<DimensionsDatasService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockAppService: jasmine.SpyObj<AppService>;
  let mockTreenodesService: jasmine.SpyObj<TreenodesService>;

  beforeEach(() => {
    const dimensionsDatasServiceSpy = jasmine.createSpyObj('DimensionsDatasService', ['getDimensionsDatas']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['get']);
    const appServiceSpy = jasmine.createSpyObj('AppService', ['getInitialDatas']);
    const treenodesServiceSpy = jasmine.createSpyObj('TreenodesService', ['getNodeFromName']);

    TestBed.configureTestingModule({
      providers: [
        ClustersService,
        { provide: DimensionsDatasService, useValue: dimensionsDatasServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: AppService, useValue: appServiceSpy },
        { provide: TreenodesService, useValue: treenodesServiceSpy }
      ]
    });

    service = TestBed.inject(ClustersService);
    mockDimensionsDatasService = TestBed.inject(DimensionsDatasService) as jasmine.SpyObj<DimensionsDatasService>;
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    mockAppService = TestBed.inject(AppService) as jasmine.SpyObj<AppService>;
    mockTreenodesService = TestBed.inject(TreenodesService) as jasmine.SpyObj<TreenodesService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSelectedClustersDetails', () => {
    it('should return empty array when dimensionsDatas is undefined', () => {
      mockDimensionsDatasService.dimensionsDatas = undefined;
      
      const result = service.getSelectedClustersDetails();
      
      expect(result).toEqual([]);
    });

    it('should return cluster details for each selected dimension', () => {
      const mockCluster1 = { cluster: 'node1', isLeaf: true };
      const mockCluster2 = { cluster: 'node2', isLeaf: true };
      const mockDimension = { name: 'dim1', type: 'Categorical' };
      
      const mockTreeNode1 = new TreeNodeModel(1, mockCluster1, mockDimension, [], 0, 0);
      const mockTreeNode2 = new TreeNodeModel(2, mockCluster2, mockDimension, [], 0, 0);
      
      mockDimensionsDatasService.dimensionsDatas = {
        selectedDimensions: [
          { name: 'dim1' },
          { name: 'dim2' }
        ],
        dimensionsTrees: [
          [mockTreeNode1],
          [mockTreeNode2]
        ]
      };

      const result = service.getSelectedClustersDetails();
      
      expect(result).toHaveSize(2);
      expect(result[0]).toContain(mockTreeNode1);
      expect(result[1]).toContain(mockTreeNode2);
    });
  });

  describe('getCurrentCellsPerCluster', () => {
    it('should return 1 when dimensionsDatas is undefined', () => {
      mockDimensionsDatasService.dimensionsDatas = undefined;
      
      const result = service.getCurrentCellsPerCluster();
      
      expect(result).toBe(1);
    });

    it('should calculate cells per cluster correctly', () => {
      mockDimensionsDatasService.dimensionsDatas = {
        selectedDimensions: [
          { currentHierarchyClusterCount: 3 },
          { currentHierarchyClusterCount: 4 }
        ]
      };

      const result = service.getCurrentCellsPerCluster();
      
      expect(result).toBe(12); // 3 * 4 = 12
    });

    it('should handle single dimension', () => {
      mockDimensionsDatasService.dimensionsDatas = {
        selectedDimensions: [
          { currentHierarchyClusterCount: 5 }
        ]
      };

      const result = service.getCurrentCellsPerCluster();
      
      expect(result).toBe(5);
    });
  });

  describe('getCurrentClusterDetailsFromNode', () => {
    it('should return leaf nodes', () => {
      const mockCluster = { cluster: 'leaf1', isLeaf: true };
      const mockDimension = { name: 'dim1', type: 'Categorical' };
      const leafNode = new TreeNodeModel(1, mockCluster, mockDimension, [], 0, 0);
      const nodes = [leafNode];

      const result = service.getCurrentClusterDetailsFromNode(nodes);
      
      expect(result).toContain(leafNode);
    });

    it('should return collapsed nodes', () => {
      const mockCluster = { cluster: 'collapsed1', isLeaf: false };
      const mockDimension = { name: 'dim1', type: 'Categorical' };
      const collapsedNode = new TreeNodeModel(1, mockCluster, mockDimension, ['collapsed1'], 0, 0);
      const nodes = [collapsedNode];

      const result = service.getCurrentClusterDetailsFromNode(nodes);
      
      expect(result).toContain(collapsedNode);
    });

    it('should recursively process children of expanded nodes', () => {
      const mockChildCluster = { cluster: 'leaf1', isLeaf: true };
      const mockParentCluster = { cluster: 'expanded1', isLeaf: false };
      const mockDimension = { name: 'dim1', type: 'Categorical' };
      
      const leafChild = new TreeNodeModel(2, mockChildCluster, mockDimension, [], 0, 0);
      const expandedNode = new TreeNodeModel(1, mockParentCluster, mockDimension, [], 0, 0);
      expandedNode.children = [leafChild];
      const nodes = [expandedNode];

      const result = service.getCurrentClusterDetailsFromNode(nodes);
      
      expect(result).toContain(leafChild);
      expect(result).not.toContain(expandedNode);
    });
  });

  describe('getDistributionDetailsFromNode', () => {
    beforeEach(() => {
      const mockCluster1 = { cluster: 'node1', isLeaf: true, name: 'Node 1' };
      const mockCluster2 = { cluster: 'node2', isLeaf: true, name: 'Node 2' };
      const mockSelectedCluster1 = { cluster: 'selected1', isLeaf: true, name: 'Selected 1' };
      const mockSelectedCluster2 = { cluster: 'selected2', isLeaf: true, name: 'Selected 2' };
      const mockDimension = { name: 'dim1', type: 'Categorical' };
      
      mockDimensionsDatasService.dimensionsDatas = {
        dimensionsTrees: [
          [new TreeNodeModel(1, mockCluster1, mockDimension, [], 0, 0)],
          [new TreeNodeModel(2, mockCluster2, mockDimension, [], 0, 0)]
        ],
        selectedNodes: [
          new TreeNodeModel(3, mockSelectedCluster1, mockDimension, [], 0, 0),
          new TreeNodeModel(4, mockSelectedCluster2, mockDimension, [], 0, 0)
        ],
        matrixDatas: {
          matrixCellDatas: []
        },
        contextSelection: {},
        matrixCellFreqDataMap: {}
      };
    });

    it('should return chart data for position 0', () => {
      const result = service.getDistributionDetailsFromNode(0);
      
      expect(result).toBeInstanceOf(ChartDatasModel);
      expect(result.datasets).toHaveSize(1);
    });

    it('should return chart data for position 1', () => {
      const result = service.getDistributionDetailsFromNode(1);
      
      expect(result).toBeInstanceOf(ChartDatasModel);
      expect(result.datasets).toHaveSize(1);
    });
  });

  describe('getInfoPerCluster', () => {
    it('should return empty chart data when hierarchyDatas is undefined', () => {
      mockDimensionsDatasService.dimensionsDatas = {
        hierarchyDatas: undefined,
        dimensions: []
      };

      const result = service.getInfoPerCluster(5);
      
      expect(result).toBeInstanceOf(ChartDatasModel);
      expect(result.datasets).toHaveSize(0);
    });

    it('should generate info per cluster chart data', () => {
      mockTranslateService.get.and.returnValue('Number of Clusters');
      mockDimensionsDatasService.dimensionsDatas = {
        hierarchyDatas: {
          totalInitialClusters: 10,
          totalClusters: 15
        },
        dimensions: [{ name: 'dim1' }, { name: 'dim2' }]
      };
      
      mockAppService.initialDatas = {
        coclusteringReport: {
          dimensionHierarchies: [
            {
              clusters: [
                { hierarchicalRank: 3, hierarchicalLevel: 0.5 },
                { hierarchicalRank: 4, hierarchicalLevel: 0.3 }
              ]
            }
          ]
        }
      };

      const result = service.getInfoPerCluster(5);
      
      expect(result).toBeInstanceOf(ChartDatasModel);
      expect(result.datasets).toHaveSize(2);
      expect(result.datasets[0].type).toBe(CHART_TYPES.LINE);
    });
  });

  describe('getClustersPerDimDatas', () => {
    it('should return empty chart data when selectedDimensions is undefined', () => {
      mockDimensionsDatasService.dimensionsDatas = {
        selectedDimensions: undefined,
        hierarchyDatas: undefined
      };

      const result = service.getClustersPerDimDatas(5);
      
      expect(result).toBeInstanceOf(ChartDatasModel);
      expect(result.datasets).toHaveSize(0);
    });

    it('should generate clusters per dimension chart data', () => {
      mockTranslateService.get.and.returnValue('Number of Clusters');
      mockDimensionsDatasService.dimensionsDatas = {
        selectedDimensions: [
          { name: 'dim1' },
          { name: 'dim2' }
        ],
        hierarchyDatas: {
          totalClusters: 10
        },
        dimensionsClusters: [
          [
            { hierarchicalRank: 3, isLeaf: false },
            { hierarchicalRank: 5, isLeaf: false }
          ],
          [
            { hierarchicalRank: 4, isLeaf: false }
          ]
        ]
      };

      const result = service.getClustersPerDimDatas(5);
      
      expect(result).toBeInstanceOf(ChartDatasModel);
      expect(result.datasets.length).toBeGreaterThan(0);
      expect(result.labels.length).toBeGreaterThan(0);
    });
  });

  describe('getFilteredDimensionTree', () => {
    it('should return empty array when parameters are undefined', () => {
      const result = service.getFilteredDimensionTree(undefined, undefined);
      
      expect(result).toEqual([]);
    });

    it('should return filtered cluster details', () => {
      const mockCluster = { cluster: 'node1', isLeaf: true, name: 'Node 1' };
      const mockDimension = new DimensionCovisualizationModel();
      const mockTreeNode = new TreeNodeModel(1, mockCluster, mockDimension, [], 0, 0);
      
      mockDimension.name = 'testDimension';
      mockDimension.isCategorical = true;
      mockDimension.startPosition = 0;

      mockDimensionsDatasService.dimensionsDatas = {
        nodesNames: {
          'testDimension': { 'node1': 'Node 1' }
        }
      };

      mockAppService.initialDatas = {
        coclusteringReport: {
          dimensionPartitions: [
            {
              valueGroups: [
                { values: ['value1', 'value2'] }
              ]
            }
          ]
        }
      };

      const result = service.getFilteredDimensionTree([mockTreeNode], mockDimension);
      
      expect(result).toHaveSize(1);
      expect(result[0]).toBeInstanceOf(ClusterDetailsModel);
    });

    it('should handle collapsed nodes with size calculation', () => {
      const mockCluster = { cluster: 'node1', isLeaf: false, name: 'Node 1' };
      const mockDimension = new DimensionCovisualizationModel();
      const mockTreeNode = new TreeNodeModel(1, mockCluster, mockDimension, ['node1'], 0, 0);
      
      mockDimension.name = 'testDimension';
      mockDimension.isCategorical = true;
      mockDimension.startPosition = 0;

      mockDimensionsDatasService.dimensionsDatas = {
        nodesNames: {
          'testDimension': { 'node1': 'Node 1' }
        }
      };

      const mockFoundCluster = { cluster: 'found', isLeaf: false, name: 'Found' };
      const mockFoundNode = new TreeNodeModel(2, mockFoundCluster, mockDimension, ['found'], 0, 0);
      mockFoundNode.childrenLeafIndexes = [0, 1];
      mockFoundNode.getChildrenList = jasmine.createSpy();

      mockTreenodesService.getNodeFromName.and.returnValue(mockFoundNode);

      mockAppService.initialDatas = {
        coclusteringReport: {
          dimensionPartitions: [
            {
              valueGroups: [
                { values: ['value1', 'value2'] },
                { values: ['value3'] }
              ]
            }
          ]
        }
      };

      const result = service.getFilteredDimensionTree([mockTreeNode], mockDimension);
      
      expect(result).toHaveSize(1);
      expect(mockTreenodesService.getNodeFromName).toHaveBeenCalledWith('testDimension', 'node1');
      expect(mockFoundNode.getChildrenList).toHaveBeenCalled();
    });
  });
});
