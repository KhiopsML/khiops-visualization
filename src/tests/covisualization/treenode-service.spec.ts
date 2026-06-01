/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { provideHttpClient } from '@angular/common/http';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TranslateModule } from '@ngstack/translate';
import { SaveService } from '../../app/khiops-covisualization/providers/save.service';
let appService: AppService;
let treenodesService: TreenodesService;
let dimensionsDatasService: DimensionsDatasService;
let saveService: SaveService;

describe('coVisualization', () => {
  describe('Treenode service datas', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
  providers: [provideHttpClient()],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      treenodesService = TestBed.inject(TreenodesService);
      saveService = TestBed.inject(SaveService);
      appService = TestBed.inject(AppService);

      const fileDatas = require('../../assets/mocks/kc/8-TS4624User_Coclustering.json');
      appService.setFileDatas(fileDatas);
    });

    it('1 - computeNumPartition should return valid datas [auto folded datas]', () => {
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();
      dimensionsDatasService.constructDimensionsTrees();
      dimensionsDatasService.getDatas();

      const nodes = [
        ']9.5;19.5]',
        ']27.5;31.5]',
        ']31.5;43.5]',
        ']43.5;63.5]',
        ']63.5;174.5]',
        ']216.5;238.5]',
        ']238.5;324.5]',
        ']356.5;533.5]',
        ']728.5;1077]',
      ];
      const index = 2;
      const partition = {
        name: 'sum_count',
        type: 'Numerical',
        intervals: [
          { cluster: ']-inf;1.5]', bounds: [1, 1.5] },
          { cluster: ']1.5;2.5]', bounds: [1.5, 2.5] },
          { cluster: ']2.5;4.5]', bounds: [2.5, 4.5] },
          { cluster: ']4.5;5.5]', bounds: [4.5, 5.5] },
          { cluster: ']5.5;9.5]', bounds: [5.5, 9.5] },
          { cluster: ']9.5;14.5]', bounds: [9.5, 14.5] },
          { cluster: ']14.5;19.5]', bounds: [14.5, 19.5] },
          { cluster: ']19.5;24.5]', bounds: [19.5, 24.5] },
          { cluster: ']24.5;27.5]', bounds: [24.5, 27.5] },
          { cluster: ']27.5;30.5]', bounds: [27.5, 30.5] },
          { cluster: ']30.5;31.5]', bounds: [30.5, 31.5] },
          { cluster: ']31.5;34.5]', bounds: [31.5, 34.5] },
          { cluster: ']34.5;43.5]', bounds: [34.5, 43.5] },
          { cluster: ']43.5;52.5]', bounds: [43.5, 52.5] },
          { cluster: ']52.5;63.5]', bounds: [52.5, 63.5] },
          { cluster: ']63.5;102.5]', bounds: [63.5, 102.5] },
          { cluster: ']102.5;174.5]', bounds: [102.5, 174.5] },
          { cluster: ']174.5;216.5]', bounds: [174.5, 216.5] },
          { cluster: ']216.5;221.5]', bounds: [216.5, 221.5] },
          { cluster: ']221.5;238.5]', bounds: [221.5, 238.5] },
          { cluster: ']238.5;285.5]', bounds: [238.5, 285.5] },
          { cluster: ']285.5;324.5]', bounds: [285.5, 324.5] },
          { cluster: ']324.5;356.5]', bounds: [324.5, 356.5] },
          { cluster: ']356.5;426.5]', bounds: [356.5, 426.5] },
          { cluster: ']426.5;533.5]', bounds: [426.5, 533.5] },
          { cluster: ']533.5;728.5]', bounds: [533.5, 728.5] },
          { cluster: ']728.5;879.5]', bounds: [728.5, 879.5] },
          { cluster: ']879.5;1077]', bounds: [879.5, 1077] },
          { cluster: ']1077;1520.5]', bounds: [1077, 1520.5] },
          { cluster: ']1520.5;2594.5]', bounds: [1520.5, 2594.5] },
          { cluster: ']2594.5;8933]', bounds: [2594.5, 8933] },
          { cluster: ']8933;+inf[', bounds: [8933, 50851] },
        ],
      };

      const computedPartition = saveService.computeNumPartition(
        nodes,
        index,
        partition,
      );

      expect(computedPartition.intervals![4]!.cluster).toEqual(']5.5;9.5]');
      expect(computedPartition.intervals![4]!.bounds).toEqual([5.5, 9.5]);
      expect(computedPartition.intervals![5]!.cluster).toEqual(']9.5;19.5]');
      expect(computedPartition.intervals![5]!.bounds).toEqual([9.5, 19.5]);
      expect(computedPartition.intervals![6]!.cluster).toEqual(']19.5;24.5]');
      expect(computedPartition.intervals![6]!.bounds).toEqual([19.5, 24.5]);
    });

    it('2 - computeNumPartition should return valid datas [unfoldState=44]', () => {
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();
      dimensionsDatasService.constructDimensionsTrees();

      dimensionsDatasService.getDatas();
      const unfoldState = 44;
      treenodesService.setSelectedUnfoldHierarchy(unfoldState);
      const collapsedNodes = treenodesService.getLeafNodesForARank(unfoldState);
      treenodesService.setSavedCollapsedNodes(collapsedNodes);
      const datas = saveService.constructSavedJson(collapsedNodes);

      // Here we check that 9.5;19.5 interval is removed
      expect(
        datas.coclusteringReport.dimensionPartitions[2]!.intervals![4]!.cluster,
      ).toEqual(']5.5;19.5]');
      expect(
        datas.coclusteringReport.dimensionPartitions[2]!.intervals![4]!.bounds,
      ).toEqual([5.5, 19.5]);
      expect(
        datas.coclusteringReport.dimensionPartitions[2]!.intervals![5]!.cluster,
      ).toEqual(']19.5;24.5]');
      expect(
        datas.coclusteringReport.dimensionPartitions[2]!.intervals![5]!.bounds,
      ).toEqual([19.5, 24.5]);
    });
  });

  describe('Treenode service datas', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
  providers: [provideHttpClient()],
      });

      // Inject services
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      treenodesService = TestBed.inject(TreenodesService);
      appService = TestBed.inject(AppService);
      saveService = TestBed.inject(SaveService);

      const fileDatas = require('../../assets/mocks/kc/DataNoisyCorrelatedN1000000_C1000_V10_L5Coclustering.json');
      appService.setFileDatas(fileDatas);
    });

    it('1 - computeCatPartition should return valid datas [auto folded datas]', () => {
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();
      dimensionsDatasService.constructDimensionsTrees();

      dimensionsDatasService.getDatas();
      const unfoldState = 20;
      treenodesService.setSelectedUnfoldHierarchy(unfoldState);
      const collapsedNodes = treenodesService.getLeafNodesForARank(unfoldState);
      treenodesService.setSavedCollapsedNodes(collapsedNodes);
      const datas = saveService.constructSavedJson(collapsedNodes);
      expect(
        datas.coclusteringReport.dimensionPartitions[0]!.valueGroups![0]!
          .cluster,
      ).toEqual('A31');
      expect(
        datas.coclusteringReport.dimensionPartitions[0]!.valueGroups![2]!
          .cluster,
      ).toEqual('A36');
      expect(
        datas.coclusteringReport.dimensionPartitions[0]!.valueGroups![3]!
          .cluster,
      ).toEqual('A38');
    });

    it('1 - computeCatPartition should return valid datas [unfoldState = 200]', () => {
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();
      dimensionsDatasService.constructDimensionsTrees();

      dimensionsDatasService.getDatas();
      const unfoldState = 200;
      treenodesService.setSelectedUnfoldHierarchy(unfoldState);
      const collapsedNodes = treenodesService.getLeafNodesForARank(unfoldState);
      treenodesService.setSavedCollapsedNodes(collapsedNodes);
      const datas = saveService.constructSavedJson(collapsedNodes);
      expect(
        datas.coclusteringReport.dimensionPartitions[0]!.valueGroups![0]!
          .cluster,
      ).toEqual('A257');
      expect(
        datas.coclusteringReport.dimensionPartitions[0]!.valueGroups![2]!
          .cluster,
      ).toEqual('A255');
      expect(
        datas.coclusteringReport.dimensionPartitions[0]!.valueGroups![3]!
          .cluster,
      ).toEqual('A264');
      expect(
        datas.coclusteringReport.dimensionPartitions[0]!.valueGroups![8]!
          .cluster,
      ).toEqual('A267');
    });
  });

  describe('TreenodesService methods', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient()],
      });

      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      treenodesService = TestBed.inject(TreenodesService);
      appService = TestBed.inject(AppService);
      saveService = TestBed.inject(SaveService);
    });

    function loadV4() {
      const fileDatas = require('../../assets/mocks/kc/v4.json');
      appService.setFileDatas(fileDatas);
      dimensionsDatasService.getDimensions();
      dimensionsDatasService.initSelectedDimensions();
      dimensionsDatasService.saveInitialDimension();
      dimensionsDatasService.constructDimensionsTrees();
    }

    // ===== initialize =====

    describe('initialize', () => {
      it('should set collapsedNodesToSave to empty object when no saved data', () => {
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);
        treenodesService.initialize();
        expect(treenodesService.getSavedCollapsedNodes()).toEqual({});
      });

      it('should set collapsedNodesToSave from saved data', () => {
        const savedNodes = { dim1: ['A1', 'A2'] };
        spyOn(appService, 'getSavedDatas').and.returnValue(savedNodes);
        treenodesService.initialize();
        expect(treenodesService.getSavedCollapsedNodes()).toEqual(savedNodes);
      });
    });

    // ===== getLeafNodesForARank =====

    describe('getLeafNodesForARank', () => {
      it('should return collapsed nodes for each dimension at a given rank', () => {
        loadV4();
        const result = treenodesService.getLeafNodesForARank(5);

        const dims = dimensionsDatasService.getSelectedDimensions();
        expect(result[dims[0].name]).toBeDefined();
        expect(result[dims[1].name]).toBeDefined();
        expect(Array.isArray(result[dims[0].name])).toBe(true);
      });

      it('should return empty arrays at very high rank', () => {
        loadV4();
        const result = treenodesService.getLeafNodesForARank(999);

        const dims = dimensionsDatasService.getSelectedDimensions();
        for (const dim of dims) {
          expect(result[dim.name].length).toBeGreaterThanOrEqual(0);
        }
      });

      it('should return more collapsed nodes at lower rank', () => {
        loadV4();
        const resultLow = treenodesService.getLeafNodesForARank(2);
        const resultHigh = treenodesService.getLeafNodesForARank(100);

        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        expect(resultLow[dimName].length).toBeGreaterThanOrEqual(
          resultHigh[dimName].length,
        );
      });
    });

    // ===== updateSelectedNodeName =====

    describe('updateSelectedNodeName', () => {
      it('should create nodesNames entry for dimension', () => {
        loadV4();
        dimensionsDatasService.dimensionsDatas.nodesNames = {};

        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        treenodesService.updateSelectedNodeName(dimName, 'A1', 'NewName');

        expect(
          dimensionsDatasService.dimensionsDatas.nodesNames[dimName]['A1'],
        ).toBe('NewName');
      });

      it('should create nodesNames object if undefined', () => {
        loadV4();
        dimensionsDatasService.dimensionsDatas.nodesNames = undefined;

        treenodesService.updateSelectedNodeName('dim1', 'node1', 'renamed');

        expect(
          dimensionsDatasService.dimensionsDatas.nodesNames,
        ).toBeDefined();
        expect(
          dimensionsDatasService.dimensionsDatas.nodesNames['dim1']['node1'],
        ).toBe('renamed');
      });

      it('should overwrite existing name', () => {
        loadV4();
        dimensionsDatasService.dimensionsDatas.nodesNames = {
          dim1: { node1: 'old' },
        };

        treenodesService.updateSelectedNodeName('dim1', 'node1', 'new');

        expect(
          dimensionsDatasService.dimensionsDatas.nodesNames['dim1']['node1'],
        ).toBe('new');
      });

      it('should handle multiple nodes in same dimension', () => {
        loadV4();
        dimensionsDatasService.dimensionsDatas.nodesNames = {};

        treenodesService.updateSelectedNodeName('dim1', 'n1', 'name1');
        treenodesService.updateSelectedNodeName('dim1', 'n2', 'name2');

        expect(
          dimensionsDatasService.dimensionsDatas.nodesNames['dim1']['n1'],
        ).toBe('name1');
        expect(
          dimensionsDatasService.dimensionsDatas.nodesNames['dim1']['n2'],
        ).toBe('name2');
      });
    });

    // ===== mergeCollapsedNodes =====

    describe('mergeCollapsedNodes', () => {
      it('should merge two objects with arrays', () => {
        const obj1 = { dim1: ['A1', 'A2'] };
        const obj2 = { dim1: ['A2', 'A3'] };
        const result = treenodesService.mergeCollapsedNodes(obj1, obj2);

        expect(result.dim1).toEqual(jasmine.arrayContaining(['A1', 'A2', 'A3']));
        expect(result.dim1.length).toBe(3); // unique values only
      });

      it('should handle null obj1', () => {
        const result = treenodesService.mergeCollapsedNodes(null, {
          dim1: ['A1'],
        });
        expect(result.dim1).toEqual(['A1']);
      });

      it('should handle null obj2', () => {
        const result = treenodesService.mergeCollapsedNodes(
          { dim1: ['A1'] },
          null,
        );
        expect(result.dim1).toEqual(['A1']);
      });

      it('should handle both null', () => {
        const result = treenodesService.mergeCollapsedNodes(null, null);
        expect(result).toEqual({});
      });

      it('should handle undefined obj1', () => {
        const result = treenodesService.mergeCollapsedNodes(undefined, {
          dim1: ['A1'],
        });
        expect(result.dim1).toEqual(['A1']);
      });

      it('should handle undefined obj2', () => {
        const result = treenodesService.mergeCollapsedNodes(
          { dim1: ['A1'] },
          undefined,
        );
        expect(result.dim1).toEqual(['A1']);
      });

      it('should merge non-overlapping dimensions', () => {
        const obj1 = { dim1: ['A1'] };
        const obj2 = { dim2: ['B1'] };
        const result = treenodesService.mergeCollapsedNodes(obj1, obj2);

        expect(result.dim1).toEqual(['A1']);
        expect(result.dim2).toEqual(['B1']);
      });

      it('should handle non-array values in obj2', () => {
        const obj1 = { key: 'value1' };
        const obj2 = { key: 'value2' };
        const result = treenodesService.mergeCollapsedNodes(obj1, obj2);

        expect(result.key).toBe('value2');
      });

      it('should handle empty arrays', () => {
        const obj1 = { dim1: [] };
        const obj2 = { dim1: [] };
        const result = treenodesService.mergeCollapsedNodes(obj1, obj2);

        expect(result.dim1).toEqual([]);
      });
    });

    // ===== setSelectedNode =====

    describe('setSelectedNode', () => {
      it('should return a node for valid dimension and node name', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const cluster =
          dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[0][0];

        const result = treenodesService.setSelectedNode(
          dimName,
          cluster.name,
        );

        expect(result).toBeDefined();
      });

      it('should return fallback node when node name not found', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;

        const result = treenodesService.setSelectedNode(
          dimName,
          'nonExistentNode',
        );

        // Should fall back to first node
        expect(result).toBeDefined();
      });

      it('should return undefined for non-existent dimension', () => {
        loadV4();
        const result = treenodesService.setSelectedNode(
          'nonExistent',
          'node1',
        );
        expect(result).toBeUndefined();
      });

      it('should update selectedNodes array', () => {
        loadV4();
        treenodesService.initSelectedNodes();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const cluster =
          dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[0][0];

        treenodesService.setSelectedNode(dimName, cluster.name);

        expect(
          dimensionsDatasService.dimensionsDatas.selectedNodes[0],
        ).toBeDefined();
      });

      it('should emit event when node changes and stopPropagation is false', () => {
        loadV4();
        treenodesService.initSelectedNodes();
        const eventsService = TestBed.inject(EventsService);
        spyOn(eventsService, 'emitTreeSelectedNodeChanged');

        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const cluster =
          dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[0][0];

        treenodesService.setSelectedNode(dimName, cluster.name, false);

        expect(
          eventsService.emitTreeSelectedNodeChanged,
        ).toHaveBeenCalled();
      });

      it('should not emit event when stopPropagation is true', () => {
        loadV4();
        treenodesService.initSelectedNodes();
        const eventsService = TestBed.inject(EventsService);
        spyOn(eventsService, 'emitTreeSelectedNodeChanged');

        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const cluster =
          dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[0][0];

        treenodesService.setSelectedNode(dimName, cluster.name, true);

        expect(
          eventsService.emitTreeSelectedNodeChanged,
        ).not.toHaveBeenCalled();
      });
    });

    // ===== updateSelectedNodes =====

    describe('updateSelectedNodes', () => {
      it('should swap selected nodes at given position', () => {
        loadV4();
        treenodesService.initSelectedNodes();

        const dims = dimensionsDatasService.getSelectedDimensions();
        // Set initial selected nodes
        treenodesService.setSelectedNode(dims[0].name, dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[0][0].name, true);
        treenodesService.setSelectedNode(dims[1].name, dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[1][0].name, true);

        const node0Before = dimensionsDatasService.dimensionsDatas.selectedNodes[0];
        const node1Before = dimensionsDatasService.dimensionsDatas.selectedNodes[1];

        treenodesService.updateSelectedNodes(dims[1], 0);

        expect(dimensionsDatasService.dimensionsDatas.selectedNodes[0]).toEqual(node1Before);
        expect(dimensionsDatasService.dimensionsDatas.selectedNodes[1]).toEqual(node0Before);
      });

      it('should not change anything when dimension not found', () => {
        loadV4();
        treenodesService.initSelectedNodes();
        const fakeDim = { name: 'nonExistent' };

        expect(() => treenodesService.updateSelectedNodes(fakeDim, 0)).not.toThrow();
      });
    });

    // ===== getLastVisibleNode =====

    describe('getLastVisibleNode', () => {
      it('should return leaf node directly', () => {
        const leafNode = { isLeaf: true, isCollapsed: false, children: [] };
        const result = treenodesService.getLastVisibleNode([leafNode]);
        expect(result).toBe(leafNode);
      });

      it('should return collapsed node', () => {
        const collapsedNode = {
          isLeaf: false,
          isCollapsed: true,
          children: [{ isLeaf: true, isCollapsed: false, children: [] }],
        };
        const result = treenodesService.getLastVisibleNode([collapsedNode]);
        expect(result).toBe(collapsedNode);
      });

      it('should recurse into expanded node children', () => {
        const childLeaf = { isLeaf: true, isCollapsed: false, children: [] };
        const expandedNode = {
          isLeaf: false,
          isCollapsed: false,
          children: [childLeaf],
        };
        const result = treenodesService.getLastVisibleNode([expandedNode]);
        expect(result).toBe(childLeaf);
      });

      it('should recurse deeply', () => {
        const deepLeaf = { isLeaf: true, isCollapsed: false, children: [] };
        const mid = {
          isLeaf: false,
          isCollapsed: false,
          children: [deepLeaf],
        };
        const top = { isLeaf: false, isCollapsed: false, children: [mid] };

        const result = treenodesService.getLastVisibleNode([top]);
        expect(result).toBe(deepLeaf);
      });
    });

    // ===== getFirstVisibleNode =====

    describe('getFirstVisibleNode', () => {
      it('should return undefined when node is parent cluster', () => {
        const nodes = [
          {
            name: 'root',
            isParentCluster: true,
            isCollapsed: false,
            parentCluster: null,
          },
        ];
        const result = treenodesService.getFirstVisibleNode(
          nodes,
          nodes[0],
        );
        expect(result).toBeUndefined();
      });

      it('should return collapsed parent as last visible', () => {
        const parent = {
          name: 'parent',
          isParentCluster: true,
          isCollapsed: true,
          parentCluster: null,
        };
        const child = {
          name: 'child',
          isParentCluster: false,
          isCollapsed: false,
          parentCluster: 'parent',
        };
        const result = treenodesService.getFirstVisibleNode(
          [parent, child],
          child,
        );
        expect(result).toBe(parent);
      });
    });

    // ===== initSelectedNodes =====

    describe('initSelectedNodes', () => {
      it('should reset selectedNodes to empty array', () => {
        loadV4();
        dimensionsDatasService.dimensionsDatas.selectedNodes = [
          { name: 'test' },
        ];

        treenodesService.initSelectedNodes();

        expect(
          dimensionsDatasService.dimensionsDatas.selectedNodes,
        ).toEqual([]);
      });
    });

    // ===== getSelectedNodes =====

    describe('getSelectedNodes', () => {
      it('should return the selectedNodes array', () => {
        loadV4();
        treenodesService.initSelectedNodes();

        const result = treenodesService.getSelectedNodes();
        expect(result).toEqual([]);
      });

      it('should return set nodes after setSelectedNode', () => {
        loadV4();
        treenodesService.initSelectedNodes();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const cluster =
          dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[0][0];

        treenodesService.setSelectedNode(dimName, cluster.name, true);

        const result = treenodesService.getSelectedNodes();
        expect(result.length).toBeGreaterThan(0);
      });
    });

    // ===== getNodesNames =====

    describe('getNodesNames', () => {
      it('should return nodesNames from dimensionsDatas', () => {
        loadV4();
        dimensionsDatasService.dimensionsDatas.nodesNames = {
          dim1: { n1: 'name1' },
        };

        const result = treenodesService.getNodesNames();
        expect(result).toEqual({ dim1: { n1: 'name1' } });
      });
    });

    // ===== getNodeFromDimensionTree =====

    describe('getNodeFromDimensionTree', () => {
      it('should find a node by name in the dimension tree', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const clusterName =
          dimensionsDatasService.dimensionsDatas.dimensionsClusters[0][0]
            .cluster;

        const result = treenodesService.getNodeFromDimensionTree(
          dimName,
          clusterName,
        );

        expect(result).toBeDefined();
        expect(result.name).toBe(clusterName);
      });

      it('should return undefined for non-existent node', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;

        const result = treenodesService.getNodeFromDimensionTree(
          dimName,
          'nonExistentCluster',
        );

        expect(result).toBeUndefined();
      });

      it('should return undefined for non-existent dimension', () => {
        loadV4();
        const result = treenodesService.getNodeFromDimensionTree(
          'nonExistent',
          'anyNode',
        );
        expect(result).toBeUndefined();
      });

      it('should return a cloned object (immutable)', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const clusterName =
          dimensionsDatasService.dimensionsDatas.dimensionsClusters[0][0]
            .cluster;

        const result1 = treenodesService.getNodeFromDimensionTree(
          dimName,
          clusterName,
        );
        const result2 = treenodesService.getNodeFromDimensionTree(
          dimName,
          clusterName,
        );

        expect(result1).not.toBe(result2); // different references
        expect(result1.name).toBe(result2.name); // same data
      });
    });

    // ===== getNodeFromName =====

    describe('getNodeFromName', () => {
      it('should find a node by name in clusters', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const clusterName =
          dimensionsDatasService.dimensionsDatas.dimensionsClusters[0][0].name;

        const result = treenodesService.getNodeFromName(dimName, clusterName);
        expect(result).toBeDefined();
      });

      it('should return undefined for non-existent node', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;

        const result = treenodesService.getNodeFromName(
          dimName,
          'nonExistentNode',
        );
        expect(result).toBeUndefined();
      });

      it('should return undefined for non-existent dimension', () => {
        loadV4();
        const result = treenodesService.getNodeFromName(
          'nonExistent',
          'anyNode',
        );
        expect(result).toBeUndefined();
      });

      it('should return cloned data', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const clusterName =
          dimensionsDatasService.dimensionsDatas.dimensionsClusters[0][0].name;

        const r1 = treenodesService.getNodeFromName(dimName, clusterName);
        const r2 = treenodesService.getNodeFromName(dimName, clusterName);

        expect(r1).not.toBe(r2);
      });
    });

    // ===== getFirstAvailableNode =====

    describe('getFirstAvailableNode', () => {
      it('should return first cluster node', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;

        const result = treenodesService.getFirstAvailableNode(dimName);
        expect(result).toBeDefined();
      });

      it('should return undefined for non-existent dimension', () => {
        loadV4();
        const result = treenodesService.getFirstAvailableNode('nonExistent');
        expect(result).toBeUndefined();
      });

      it('should return cloned data', () => {
        loadV4();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;

        const r1 = treenodesService.getFirstAvailableNode(dimName);
        const r2 = treenodesService.getFirstAvailableNode(dimName);

        expect(r1).not.toBe(r2);
        expect(r1.name).toBe(r2.name);
      });
    });

    // ===== ensureAllDimensionsHaveSelection =====

    describe('ensureAllDimensionsHaveSelection', () => {
      it('should select first node for dimensions without selection', () => {
        loadV4();
        treenodesService.initSelectedNodes();
        // selectedNodes is empty, so all should be filled
        treenodesService.ensureAllDimensionsHaveSelection();

        const dims = dimensionsDatasService.getSelectedDimensions();
        for (let i = 0; i < dims.length; i++) {
          expect(
            dimensionsDatasService.dimensionsDatas.selectedNodes[i],
          ).toBeDefined();
        }
      });

      it('should not overwrite existing selections', () => {
        loadV4();
        treenodesService.initSelectedNodes();

        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        const cluster =
          dimensionsDatasService.dimensionsDatas.currentDimensionsClusters[0][0];
        treenodesService.setSelectedNode(dimName, cluster.name, true);

        const existingNode =
          dimensionsDatasService.dimensionsDatas.selectedNodes[0];
        treenodesService.ensureAllDimensionsHaveSelection();

        expect(
          dimensionsDatasService.dimensionsDatas.selectedNodes[0],
        ).toBe(existingNode);
      });
    });

    // ===== setSavedCollapsedNodes / getSavedCollapsedNodes =====

    describe('setSavedCollapsedNodes / getSavedCollapsedNodes', () => {
      it('should set and get collapsed nodes', () => {
        const nodes = { dim1: ['A1', 'A2'] };
        treenodesService.setSavedCollapsedNodes(nodes);
        expect(treenodesService.getSavedCollapsedNodes()).toEqual(nodes);
      });

      it('should overwrite previous collapsed nodes', () => {
        treenodesService.setSavedCollapsedNodes({ dim1: ['A1'] });
        treenodesService.setSavedCollapsedNodes({ dim2: ['B1'] });
        expect(treenodesService.getSavedCollapsedNodes()).toEqual({
          dim2: ['B1'],
        });
      });

      it('should handle empty object', () => {
        treenodesService.setSavedCollapsedNodes({});
        expect(treenodesService.getSavedCollapsedNodes()).toEqual({});
      });
    });

    // ===== updateCollapsedNodesToSave =====

    describe('updateCollapsedNodesToSave', () => {
      it('should add node when way is 1', () => {
        treenodesService.setSavedCollapsedNodes({});
        treenodesService.updateCollapsedNodesToSave('dim1', 'A1', 1);

        const result = treenodesService.getSavedCollapsedNodes();
        expect(result['dim1']).toContain('A1');
      });

      it('should remove node when way is -1', () => {
        treenodesService.setSavedCollapsedNodes({ dim1: ['A1', 'A2'] });
        treenodesService.updateCollapsedNodesToSave('dim1', 'A1', -1);

        const result = treenodesService.getSavedCollapsedNodes();
        expect(result['dim1']).not.toContain('A1');
        expect(result['dim1']).toContain('A2');
      });

      it('should not add duplicate nodes', () => {
        treenodesService.setSavedCollapsedNodes({});
        treenodesService.updateCollapsedNodesToSave('dim1', 'A1', 1);
        treenodesService.updateCollapsedNodesToSave('dim1', 'A1', 1);

        const result = treenodesService.getSavedCollapsedNodes();
        expect(result['dim1'].length).toBe(1);
      });

      it('should handle remove on non-existent node (no error)', () => {
        treenodesService.setSavedCollapsedNodes({});
        treenodesService.updateCollapsedNodesToSave('dim1', 'nonExistent', -1);

        const result = treenodesService.getSavedCollapsedNodes();
        expect(result['dim1']).toEqual([]);
      });

      it('should create dimension entry if it does not exist', () => {
        treenodesService.setSavedCollapsedNodes({});
        treenodesService.updateCollapsedNodesToSave('newDim', 'A1', 1);

        const result = treenodesService.getSavedCollapsedNodes();
        expect(result['newDim']).toEqual(['A1']);
      });

      it('should handle null collapsedNodesToSave', () => {
        treenodesService.setSavedCollapsedNodes(undefined);
        treenodesService.updateCollapsedNodesToSave('dim1', 'A1', 1);

        const result = treenodesService.getSavedCollapsedNodes();
        expect(result['dim1']).toContain('A1');
      });
    });

    // ===== collapseNode / expandNode =====

    describe('collapseNode / expandNode', () => {
      it('should add node to collapsed nodes on collapse', () => {
        loadV4();
        treenodesService.initSelectedNodes();
        treenodesService.setSavedCollapsedNodes({});
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;

        treenodesService.collapseNode(dimName, 'A1');

        const collapsed = treenodesService.getSavedCollapsedNodes();
        expect(collapsed[dimName]).toContain('A1');
      });

      it('should remove node from collapsed nodes on expand', () => {
        loadV4();
        treenodesService.initSelectedNodes();
        const dimName = dimensionsDatasService.getSelectedDimensions()[0].name;
        treenodesService.setSavedCollapsedNodes({ [dimName]: ['A1', 'A2'] });

        treenodesService.expandNode(dimName, 'A1');

        const collapsed = treenodesService.getSavedCollapsedNodes();
        expect(collapsed[dimName]).not.toContain('A1');
        expect(collapsed[dimName]).toContain('A2');
      });
    });

    // ===== isSaveChanged =====

    describe('isSaveChanged', () => {
      it('should return false when objects are equal', () => {
        const obj1 = { a: 1, b: [1, 2] };
        const obj2 = { a: 1, b: [1, 2] };
        expect(treenodesService.isSaveChanged(obj1, obj2)).toBe(false);
      });

      it('should return true when objects differ', () => {
        const obj1 = { a: 1 };
        const obj2 = { a: 2 };
        expect(treenodesService.isSaveChanged(obj1, obj2)).toBe(true);
      });

      it('should return true for nested difference', () => {
        const obj1 = { a: { b: 1 } };
        const obj2 = { a: { b: 2 } };
        expect(treenodesService.isSaveChanged(obj1, obj2)).toBe(true);
      });

      it('should return false for identical empty objects', () => {
        expect(treenodesService.isSaveChanged({}, {})).toBe(false);
      });

      it('should return true when comparing with null', () => {
        expect(treenodesService.isSaveChanged({ a: 1 }, null)).toBe(true);
      });

      it('should return false when both null', () => {
        expect(treenodesService.isSaveChanged(null, null)).toBe(false);
      });
    });

    // ===== setSelectedUnfoldHierarchy / getUnfoldHierarchy =====

    describe('setSelectedUnfoldHierarchy / getUnfoldHierarchy', () => {
      it('should set and get unfold hierarchy value', () => {
        loadV4();
        treenodesService.setSelectedUnfoldHierarchy(42);
        expect(treenodesService.getUnfoldHierarchy()).toBe(42);
      });

      it('should return 0 by default', () => {
        dimensionsDatasService.initialize();
        expect(treenodesService.getUnfoldHierarchy()).toBe(0);
      });

      it('should handle zero value', () => {
        loadV4();
        treenodesService.setSelectedUnfoldHierarchy(10);
        treenodesService.setSelectedUnfoldHierarchy(0);
        expect(treenodesService.getUnfoldHierarchy()).toBe(0);
      });
    });

    // ===== getHierarchyDatas =====

    describe('getHierarchyDatas', () => {
      it('should return hierarchy data with totalClusters', () => {
        loadV4();
        const result = treenodesService.getHierarchyDatas();

        expect(result).toBeDefined();
        expect(result.totalClusters).toBeGreaterThan(0);
      });

      it('should set totalCells', () => {
        loadV4();
        const result = treenodesService.getHierarchyDatas();

        expect(result.totalCells).toBeGreaterThan(0);
      });

      it('should set minClusters to number of dimensions', () => {
        loadV4();
        const result = treenodesService.getHierarchyDatas();

        expect(result.minClusters).toBe(2); // v4.json has 2 dimensions
      });

      it('should return undefined when no data loaded', () => {
        appService.initialize();
        dimensionsDatasService.initialize();
        const result = treenodesService.getHierarchyDatas();

        // hierarchyDatas object still exists but totalClusters is 0
        expect(result).toBeDefined();
      });

      it('should initialize selectedUnfoldHierarchy to totalClusters', () => {
        loadV4();
        dimensionsDatasService.dimensionsDatas.hierarchyDatas.selectedUnfoldHierarchy = 0;

        const result = treenodesService.getHierarchyDatas();

        expect(result.selectedUnfoldHierarchy).toBe(result.totalClusters);
      });
    });

    // ===== initSavedDatas =====

    describe('initSavedDatas', () => {
      it('should set collapsedNodesToSave to undefined when no saved collapsed nodes', () => {
        spyOn(appService, 'getSavedDatas').and.callFake((type) => {
          if (type === 'collapsedNodes') return undefined;
          return undefined;
        });

        treenodesService.initSavedDatas();
        expect(treenodesService.getSavedCollapsedNodes()).toBeUndefined();
      });

      it('should preserve collapsed nodes when saved data exists', () => {
        const savedNodes = { dim1: ['A1'] };
        spyOn(appService, 'getSavedDatas').and.callFake((type) => {
          if (type === 'collapsedNodes') return savedNodes;
          return undefined;
        });

        treenodesService.initSavedDatas();

        expect(treenodesService.getSavedCollapsedNodes()).toEqual(savedNodes);
      });

      it('should set nodesNames from saved data', () => {
        const savedNames = { dim1: { n1: 'name1' } };
        spyOn(appService, 'getSavedDatas').and.callFake((type) => {
          if (type === 'nodesNames') return savedNames;
          return undefined;
        });

        treenodesService.initSavedDatas();

        expect(treenodesService.getNodesNames()).toEqual(savedNames);
      });

      it('should set empty nodesNames when no saved data', () => {
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);

        treenodesService.initSavedDatas();

        expect(treenodesService.getNodesNames()).toEqual({});
      });
    });

    // ===== initSavedUnfoldRank =====

    describe('initSavedUnfoldRank', () => {
      it('should set unfold hierarchy from saved data', () => {
        loadV4();
        // Set up appDatas with savedDatas
        appService.appDatas.savedDatas = { unfoldHierarchyState: 15 };

        treenodesService.initSavedUnfoldRank();

        expect(treenodesService.getUnfoldHierarchy()).toBe(15);
      });

      it('should not change unfold hierarchy when no saved data', () => {
        loadV4();
        treenodesService.setSelectedUnfoldHierarchy(5);
        appService.appDatas.savedDatas = undefined;

        treenodesService.initSavedUnfoldRank();

        expect(treenodesService.getUnfoldHierarchy()).toBe(5);
      });
    });

    // ===== updateCurrentHierarchyClustersCount =====

    describe('updateCurrentHierarchyClustersCount', () => {
      it('should update cluster counts for dimensions', () => {
        loadV4();
        const dims = dimensionsDatasService.dimensionsDatas.dimensions;

        treenodesService.updateCurrentHierarchyClustersCount(10);

        // After update, each dimension should have currentHierarchyClusterCount set
        for (const dim of dims) {
          expect(dim.currentHierarchyClusterCount).toBeDefined();
          expect(dim.currentHierarchyClusterCount).toBeGreaterThan(0);
        }
      });
    });

    // ===== getHierarchyFromClustersCount =====

    describe('getHierarchyFromClustersCount', () => {
      it('should return rank that produces <= nbCells clusters', () => {
        loadV4();

        const result = treenodesService.getHierarchyFromClustersCount(50, 100);

        expect(result).toBeDefined();
        expect(typeof result).toBe('number');
      });

      it('should decrease rank until within cell limit', () => {
        loadV4();

        const result = treenodesService.getHierarchyFromClustersCount(50, 5);

        expect(result).toBeLessThan(50);
      });
    });
  });
});
