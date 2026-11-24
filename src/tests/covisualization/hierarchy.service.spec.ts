/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { provideHttpClient, withXhr } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngstack/translate';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { HierarchyService } from '@khiops-covisualization/providers/hierarchy.service';
import { SaveService } from '@khiops-covisualization/providers/save.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { CovisualizationDatas } from '@khiops-covisualization/interfaces/app-datas.interface';
import { UtilsService } from '@khiops-library/providers/utils.service';

describe('HierarchyService', () => {
  let appService: AppService;
  let dimensionsDatasService: DimensionsDatasService;
  let hierarchyService: HierarchyService;
  let saveService: SaveService;
  let treenodesService: TreenodesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideHttpClient(withXhr())],
    });

    appService = TestBed.inject(AppService);
    dimensionsDatasService = TestBed.inject(DimensionsDatasService);
    hierarchyService = TestBed.inject(HierarchyService);
    saveService = TestBed.inject(SaveService);
    treenodesService = TestBed.inject(TreenodesService);

    const fileDatas: CovisualizationDatas = UtilsService.fastestJsonCopyV2(
      require('../../assets/mocks/kc/v4.json'),
    );
    fileDatas.savedDatas = {};
    loadFile(fileDatas);
  });

  function loadFile(fileDatas: CovisualizationDatas) {
    appService.setFileDatas(fileDatas);
    treenodesService.initialize();
    dimensionsDatasService.getDimensions();
    dimensionsDatasService.initSelectedDimensions();
    dimensionsDatasService.saveInitialDimension();
    dimensionsDatasService.constructDimensionsTrees();
  }

  function expectConsistentCells(
    datas: CovisualizationDatas,
    parts = datas.coclusteringReport.dimensionSummaries.map(
      (dimension) => dimension.parts,
    ),
  ) {
    const report = datas.coclusteringReport;
    expect(report.summary.cells).toBe(report.cellFrequencies.length);
    expect(report.cellPartIndexes.length).toBe(report.cellFrequencies.length);
    expect(report.cellFrequencies.reduce((sum, value) => sum + value, 0)).toBe(
      report.summary.instances,
    );
    for (const indexes of report.cellPartIndexes) {
      expect(indexes.length).toBe(report.dimensionSummaries.length);
      indexes.forEach((index, dimension) => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(parts[dimension]);
      });
    }
  }

  it('keeps an excluded dimension fully unfolded when no manual fold exists', fakeAsync(() => {
    const occupationPartition =
      appService.appDatas!.coclusteringReport.dimensionPartitions[0];
    hierarchyService.toggleDimensionHierarchyFold('occupation', false);

    hierarchyService.unfoldHierarchy(2);
    tick();

    expect(
      appService.appDatas!.coclusteringReport.dimensionPartitions[0],
    ).toEqual(occupationPartition);
    expect(
      appService.appDatas!.coclusteringReport.dimensionSummaries.map(
        (dimension) => dimension.parts,
      ),
    ).toEqual([9, 1]);
  }));

  it('preserves manual folds and the exact partition of an excluded dimension', fakeAsync(() => {
    treenodesService.collapseNode('occupation', 'A15');
    saveService.updateJSon(
      'occupation',
      treenodesService.getSavedCollapsedNodes(),
    );
    const occupationPartition =
      appService.appDatas!.coclusteringReport.dimensionPartitions[0];
    expect(
      appService.appDatas!.coclusteringReport.dimensionSummaries[0].parts,
    ).toBe(8);
    hierarchyService.toggleDimensionHierarchyFold('occupation', false);

    hierarchyService.unfoldHierarchy(2);
    tick();

    expect(
      appService.appDatas!.coclusteringReport.dimensionPartitions[0],
    ).toEqual(occupationPartition);
    expect(
      appService.appDatas!.coclusteringReport.dimensionSummaries.map(
        (dimension) => dimension.parts,
      ),
    ).toEqual([8, 1]);
    expect(appService.appDatas!.savedDatas.collapsedNodes.occupation).toEqual([
      'A15',
    ]);
    expect(treenodesService.getSavedCollapsedNodes()).toEqual(
      appService.appDatas!.savedDatas.collapsedNodes,
    );
  }));

  it('replaces previous folds when an excluded dimension is checked again', fakeAsync(() => {
    treenodesService.collapseNode('occupation', 'A15');
    saveService.updateJSon(
      'occupation',
      treenodesService.getSavedCollapsedNodes(),
    );
    hierarchyService.toggleDimensionHierarchyFold('occupation', false);
    hierarchyService.unfoldHierarchy(2);
    tick();

    hierarchyService.toggleDimensionHierarchyFold('occupation', true);
    hierarchyService.unfoldHierarchy(18);
    tick();

    expect(
      appService.appDatas!.coclusteringReport.dimensionSummaries.map(
        (dimension) => dimension.parts,
      ),
    ).toEqual([9, 9]);
    expect(treenodesService.getSavedCollapsedNodes()).toEqual({
      occupation: [],
      education: [],
    });
  }));

  for (const saveHierarchyOnly of [false, true]) {
    it(`preserves mixed folds after ${saveHierarchyOnly ? 'Save hierarchy as' : 'Save as'} and JSON reload`, fakeAsync(() => {
      const initialReport = UtilsService.fastestJsonCopyV2(
        appService.initialDatas!.coclusteringReport,
      );
      treenodesService.collapseNode('occupation', 'A15');
      saveService.updateJSon(
        'occupation',
        treenodesService.getSavedCollapsedNodes(),
      );
      hierarchyService.toggleDimensionHierarchyFold('occupation', false);
      hierarchyService.unfoldHierarchy(2);
      tick();
      const expectedReport = UtilsService.fastestJsonCopyV2(
        appService.appDatas!.coclusteringReport,
      );

      const saved = saveHierarchyOnly
        ? saveService.constructSavedJson(
            treenodesService.getSavedCollapsedNodes(),
          )
        : saveService.constructDatasToSave();

      expect(saved.coclusteringReport).toEqual(
        saveHierarchyOnly ? expectedReport : initialReport,
      );
      expect(appService.initialDatas!.coclusteringReport).toEqual(
        initialReport,
      );
      expect(appService.appDatas!.coclusteringReport).toEqual(expectedReport);
      expect(saved.savedDatas.collapsedNodes.occupation).toEqual(['A15']);
      expectConsistentCells(saved);

      const reloaded: CovisualizationDatas = JSON.parse(JSON.stringify(saved));
      loadFile(reloaded);
      appService.setCroppedFileDatas(
        saveService.constructSavedJson(
          treenodesService.getSavedCollapsedNodes(),
        ),
      );

      expect(appService.appDatas!.coclusteringReport).toEqual(expectedReport);
      expectConsistentCells(appService.appDatas!);
    }));
  }

  it('keeps all partitions and cells unchanged when all dimensions are excluded', fakeAsync(() => {
    treenodesService.collapseNode('occupation', 'A15');
    treenodesService.collapseNode('education', 'B16');
    saveService.updateJSon(
      'occupation',
      treenodesService.getSavedCollapsedNodes(),
    );
    const expectedReport = UtilsService.fastestJsonCopyV2(
      appService.appDatas!.coclusteringReport,
    );
    hierarchyService.toggleDimensionHierarchyFold('occupation', false);
    hierarchyService.toggleDimensionHierarchyFold('education', false);

    hierarchyService.unfoldHierarchy(2);
    tick();

    expect(appService.appDatas!.coclusteringReport).toEqual(expectedReport);
    expectConsistentCells(appService.appDatas!);
  }));

  it('preserves a previous automatic fold through successive hierarchy changes', fakeAsync(() => {
    hierarchyService.unfoldHierarchy(10);
    tick();
    const occupationPartition = UtilsService.fastestJsonCopyV2(
      appService.appDatas!.coclusteringReport.dimensionPartitions[0],
    );
    const occupationParts =
      appService.appDatas!.coclusteringReport.dimensionSummaries[0].parts;
    expect(occupationParts).toBeLessThan(9);

    for (const rank of [2, 18]) {
      hierarchyService.toggleDimensionHierarchyFold('occupation', false);
      hierarchyService.unfoldHierarchy(rank);
      tick();

      expect(
        appService.appDatas!.coclusteringReport.dimensionPartitions[0],
      ).toEqual(occupationPartition);
      expect(
        appService.appDatas!.coclusteringReport.dimensionSummaries.map(
          (dimension) => dimension.parts,
        ),
      ).toEqual([occupationParts, rank === 2 ? 1 : 9]);
      expectConsistentCells(appService.appDatas!);
    }
  }));

  it('preserves the latest manual expansion rather than restoring an older fold', fakeAsync(() => {
    treenodesService.collapseNode('occupation', 'A15');
    treenodesService.collapseNode('occupation', 'A10');
    saveService.updateJSon(
      'occupation',
      treenodesService.getSavedCollapsedNodes(),
    );
    treenodesService.expandNode('occupation', 'A15');
    saveService.updateJSon(
      'occupation',
      treenodesService.getSavedCollapsedNodes(),
    );
    const occupationPartition = UtilsService.fastestJsonCopyV2(
      appService.appDatas!.coclusteringReport.dimensionPartitions[0],
    );
    hierarchyService.toggleDimensionHierarchyFold('occupation', false);

    hierarchyService.unfoldHierarchy(2);
    tick();

    expect(
      appService.appDatas!.coclusteringReport.dimensionPartitions[0],
    ).toEqual(occupationPartition);
    expect(appService.appDatas!.savedDatas.collapsedNodes.occupation).toEqual([
      'A10',
    ]);
    expectConsistentCells(appService.appDatas!);
  }));

  it('preserves excluded folds by dimension name after axes are reordered', fakeAsync(() => {
    treenodesService.collapseNode('occupation', 'A15');
    saveService.updateJSon(
      'occupation',
      treenodesService.getSavedCollapsedNodes(),
    );
    const occupationPartition = UtilsService.fastestJsonCopyV2(
      appService.appDatas!.coclusteringReport.dimensionPartitions[0],
    );
    dimensionsDatasService.updateSelectedDimension(
      dimensionsDatasService.dimensionsDatas.selectedDimensions[1],
      0,
    );
    dimensionsDatasService.constructDimensionsTrees();
    hierarchyService.toggleDimensionHierarchyFold('occupation', false);

    hierarchyService.unfoldHierarchy(2);
    tick();

    expect(
      appService.appDatas!.coclusteringReport.dimensionPartitions[0],
    ).toEqual(occupationPartition);
    expect(
      appService.appDatas!.coclusteringReport.dimensionSummaries.map(
        (dimension) => dimension.parts,
      ),
    ).toEqual([8, 1]);
    expectConsistentCells(
      appService.appDatas!,
      dimensionsDatasService.dimensionsDatas.selectedDimensions.map(
        (dimension) => dimension.parts,
      ),
    );
  }));

  for (const hasSavedState of [false, true]) {
    it(`keeps an untouched report when all dimensions are excluded and saved folds are ${hasSavedState ? 'empty' : 'undefined'}`, fakeAsync(() => {
      if (!hasSavedState) {
        treenodesService.initSavedDatas();
        expect(treenodesService.getSavedCollapsedNodes()).toBeUndefined();
      }
      const expectedReport = UtilsService.fastestJsonCopyV2(
        appService.appDatas!.coclusteringReport,
      );
      hierarchyService.toggleDimensionHierarchyFold('occupation', false);
      hierarchyService.toggleDimensionHierarchyFold('education', false);

      hierarchyService.unfoldHierarchy(2);
      tick();

      expect(appService.appDatas!.coclusteringReport).toEqual(expectedReport);
      expect(treenodesService.getSavedCollapsedNodes()).toEqual({});
      expectConsistentCells(appService.appDatas!);
    }));
  }

  it('preserves nested folds in the second dimension while clearing folds in the checked dimension', fakeAsync(() => {
    treenodesService.collapseNode('occupation', 'A15');
    for (const node of ['B16', 'B12', 'B4']) {
      treenodesService.collapseNode('education', node);
    }
    saveService.updateJSon(
      'education',
      treenodesService.getSavedCollapsedNodes(),
    );
    const educationPartition = UtilsService.fastestJsonCopyV2(
      appService.appDatas!.coclusteringReport.dimensionPartitions[1],
    );
    const educationParts =
      appService.appDatas!.coclusteringReport.dimensionSummaries[1].parts;
    expect(educationParts).toBeLessThan(9);
    hierarchyService.toggleDimensionHierarchyFold('education', false);

    hierarchyService.unfoldHierarchy(18);
    tick();
    const saved = saveService.constructSavedJson(
      treenodesService.getSavedCollapsedNodes(),
    );

    expect(saved.coclusteringReport.dimensionPartitions[0]).toEqual(
      appService.initialDatas!.coclusteringReport.dimensionPartitions[0],
    );
    expect(saved.coclusteringReport.dimensionPartitions[1]).toEqual(
      educationPartition,
    );
    expect(
      saved.coclusteringReport.dimensionSummaries.map(
        (dimension) => dimension.parts,
      ),
    ).toEqual([9, educationParts]);
    expect(saved.savedDatas.collapsedNodes).toEqual({
      occupation: [],
      education: ['B16', 'B12', 'B4'],
    });
    expectConsistentCells(saved);

    loadFile(JSON.parse(JSON.stringify(saved)));
    const reopened = saveService.constructSavedJson(
      treenodesService.getSavedCollapsedNodes(),
    );
    expect(reopened.coclusteringReport).toEqual(saved.coclusteringReport);
    expectConsistentCells(reopened);
  }));

  it('uses the latest exclusions when alternating dimensions between saves', fakeAsync(() => {
    treenodesService.collapseNode('occupation', 'A15');
    saveService.updateJSon(
      'occupation',
      treenodesService.getSavedCollapsedNodes(),
    );

    hierarchyService.toggleDimensionHierarchyFold('occupation', false);
    hierarchyService.unfoldHierarchy(2);
    tick();
    expect(
      appService.appDatas!.coclusteringReport.dimensionSummaries.map(
        (dimension) => dimension.parts,
      ),
    ).toEqual([8, 1]);
    expectConsistentCells(appService.appDatas!);

    hierarchyService.toggleDimensionHierarchyFold('occupation', true);
    hierarchyService.toggleDimensionHierarchyFold('education', false);
    hierarchyService.unfoldHierarchy(18);
    tick();
    expect(
      appService.appDatas!.coclusteringReport.dimensionSummaries.map(
        (dimension) => dimension.parts,
      ),
    ).toEqual([9, 1]);
    expectConsistentCells(appService.appDatas!);

    hierarchyService.toggleDimensionHierarchyFold('occupation', false);
    hierarchyService.toggleDimensionHierarchyFold('education', true);
    hierarchyService.unfoldHierarchy(18);
    tick();
    expect(
      appService.appDatas!.coclusteringReport.dimensionSummaries.map(
        (dimension) => dimension.parts,
      ),
    ).toEqual([9, 9]);
    expectConsistentCells(appService.appDatas!);
  }));

  for (const unfoldHierarchy of [false, true]) {
    it(`preserves numerical intervals after hierarchy export and reload ${unfoldHierarchy ? 'with' : 'without'} excluded dimensions`, fakeAsync(() => {
      const fileDatas: CovisualizationDatas = UtilsService.fastestJsonCopyV2(
        require('../../assets/mocks/kc/8-TS4624User_Coclustering.json'),
      );
      fileDatas.savedDatas = {};
      loadFile(fileDatas);
      treenodesService.collapseNode('sum_count', ']356.5;533.5]');
      saveService.updateJSon(
        'sum_count',
        treenodesService.getSavedCollapsedNodes(),
      );
      const numericalPartition = UtilsService.fastestJsonCopyV2(
        appService.appDatas!.coclusteringReport.dimensionPartitions[2],
      );
      expect(numericalPartition.intervals.length).toBe(31);
      if (unfoldHierarchy) {
        hierarchyService.toggleDimensionHierarchyFold('sum_count', false);
        hierarchyService.unfoldHierarchy(3);
        tick();
      }
      const saved = saveService.constructSavedJson(
        treenodesService.getSavedCollapsedNodes(),
      );

      expect(saved.coclusteringReport.dimensionPartitions[2]).toEqual(
        numericalPartition,
      );
      expect(
        saved.coclusteringReport.dimensionSummaries.map(
          (dimension) => dimension.parts,
        ),
      ).toEqual(unfoldHierarchy ? [1, 1, 31] : [19, 3, 31]);
      expectConsistentCells(saved);

      let exported = saved;
      for (let cycle = 0; cycle < 3; cycle++) {
        loadFile(JSON.parse(JSON.stringify(exported)));
        exported = saveService.constructSavedJson(
          treenodesService.getSavedCollapsedNodes(),
        );
        expect(exported.coclusteringReport).toEqual(saved.coclusteringReport);
        expectConsistentCells(exported);
      }
    }));
  }
});
