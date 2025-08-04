/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { HttpClientModule } from '@angular/common/http';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
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
        imports: [HttpClientModule, TranslateModule.forRoot()],
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
        imports: [HttpClientModule, TranslateModule.forRoot()],
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
});
