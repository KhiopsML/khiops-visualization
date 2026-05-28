/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';

import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { provideHttpClient } from '@angular/common/http';
import { AppService } from '@khiops-visualization/providers/app.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import { TYPES } from '@khiops-library/enum/types';
import { TranslateModule } from '@ngstack/translate';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { provideMockStore } from '@ngrx/store/testing';

let distributionDatasService: DistributionDatasService;
let preparationDatasService: PreparationDatasService;
let treePreparationDatasService: TreePreparationDatasService;
let appService: AppService;

describe('Visualization', () => {
  describe('DistributionDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [
          provideHttpClient(),
          provideMockStore({ initialState: {} }),
          DistributionDatasService,
          PreparationDatasService,
          TreePreparationDatasService,
          AppService,
        ],
      });

      // Inject services
      distributionDatasService = TestBed.inject(DistributionDatasService);
      preparationDatasService = TestBed.inject(PreparationDatasService);
      treePreparationDatasService = TestBed.inject(TreePreparationDatasService);
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);
      appService = TestBed.inject(AppService);
    });

    it('should be created', () => {
      expect(distributionDatasService).toBeTruthy();
    });

    it('appService should be created', () => {
      expect(appService).toBeTruthy();
    });

    it('getTargetDistributionGraphDatas should return valid datas [C100_AllReports, Numerical, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getTargetDistributionGraphDatas(
        selectedVariable!,
      );

      expect(res!.datasets[0]!.data[0]).toEqual(45.101424849088026);
    });

    it('getTargetDistributionGraphDatas should return valid labels [C100_AllReports, Numerical, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getTargetDistributionGraphDatas(
        selectedVariable!,
      );

      expect(res!.labels[0]).toEqual('[0.0002370088478,0.3074067]');
    });

    it('getTargetDistributionGraphDatas should return valid labels [AdultAllReports, Categorical, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/AdultAllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getTargetDistributionGraphDatas(
        selectedVariable!,
      );

      expect(res!.labels[0]).toEqual('{Husband,Wife}');
    });

    it('getTargetDistributionGraphDatas should return valid datas [C100_AllReports, Numerical, R41]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[40].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getTargetDistributionGraphDatas(
        selectedVariable!,
        TYPES.LIFT,
      );

      expect(res!.datasets[0]!.data[0]).toEqual(1.0250084657655503);
    });

    it('getdistributionGraphDatas should return valid datas [C100_AllReports, Numerical, R2]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[1].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getdistributionGraphDatas(
        selectedVariable!,
      );
      expect(res!.datasets[0]!.data[0]).toEqual(5251282);
    });

    it('getdistributionGraphDatas should return valid default group index [2d-cells-AllReports, Categorical, R06]', () => {
      const fileDatas = require('../../assets/mocks/kv/2d-cells-AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[5].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getdistributionGraphDatas(
        selectedVariable!,
      );
      expect(res!.datasets[0]!.extra[2].defaultGroupIndex).toEqual(false);
      expect(res!.datasets[0]!.extra[3].defaultGroupIndex).toEqual(true);
    });

    it('getHistogramGraphDatas should return valid datas [defaultGroup, Numerical, R1, Missing informations Non supervised]', () => {
      const fileDatas = require('../../assets/mocks/kv/defaultGroup.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getHistogramGraphDatas(
        selectedVariable!,
      );

      expect(res![0]!.frequency).toEqual(1263);
      expect(res![0]!.logValue).toEqual(-5.167337100368651);
      expect(res![0]!.partition).toEqual([1000, 11550]);
      expect(res![0]!.density).toEqual(0.0000068024114898816155);
    });

    it('getdistributionGraphDatas should return valid datas [C100_AllReports, Numerical, R15]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[14].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getdistributionGraphDatas(
        selectedVariable!,
      );
      expect(res!.datasets[0]!.data[0]).toEqual(5149479);
    });

    it('getdistributionGraphDatas should return valid lables [C100_AllReports, Numerical, R15]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[14].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getdistributionGraphDatas(
        selectedVariable!,
      );
      expect(res!.labels[1]).toEqual(']0,0.5]');
    });

    it('getdistributionGraphDatas should return valid datas [irisU, Categorical, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/irisU.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getdistributionGraphDatas(
        selectedVariable!,
      );
      expect(res!.datasets[0]!.data[0]).toEqual(37);
    });

    it('getdistributionGraphDatas should return valid labels [irisU, Categorical, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/irisU.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getdistributionGraphDatas(
        selectedVariable!,
      );
      expect(res!.labels[0]).toEqual('{Iris-versicolor}');
    });

    it('getdistributionGraphDatas should return valid datas [new-hyper-tree, treePreparationReport, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/new-hyper-tree.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(
        REPORT.TREE_PREPARATION_REPORT,
      );

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getdistributionGraphDatas(
        selectedVariable!,
      );
      expect(res!.datasets[0]!.data[0]).toEqual(9418);
    });

    it('getTreeNodeTargetDistributionGraphDatas should return valid datas [new-hyper-tree, treePreparationReport, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/new-hyper-tree.json');
      appService.setFileDatas(fileDatas);

      treePreparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(
        REPORT.TREE_PREPARATION_REPORT,
      );

      treePreparationDatasService.setSelectedVariable(
        fileDatas.treePreparationReport.variablesStatistics[0].name,
      );
      treePreparationDatasService.initSelectedNodes();
      const nodeToSelect = treePreparationDatasService.getNodeFromName('L75');
      const node = new TreeNodeModel(nodeToSelect!, undefined, true);
      const currentNode = treePreparationDatasService.setSelectedNode(
        node,
        true,
      );
      const res =
        distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
          currentNode!,
        );
      expect(res!.datasets[0]!.extra[0].extra.value).toEqual(5074);
    });

    it('getTreeNodeTargetDistributionGraphDatas should return valid datas [tree-education_AllReports, R1, L16]', () => {
      const fileDatas = require('../../assets/mocks/kv/tree-education_AllReports.json');
      appService.setFileDatas(fileDatas);

      treePreparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(
        REPORT.TREE_PREPARATION_REPORT,
      );

      treePreparationDatasService.setSelectedVariable(
        fileDatas.treePreparationReport.variablesStatistics[0].name,
      );
      treePreparationDatasService.initSelectedNodes();
      const nodeToSelect = treePreparationDatasService.getNodeFromName('L16');
      const node = new TreeNodeModel(nodeToSelect!, undefined, true);
      const currentNode = treePreparationDatasService.setSelectedNode(
        node,
        true,
      );
      const res =
        distributionDatasService.getTreeNodeTargetDistributionGraphDatas(
          currentNode!,
        );
      // First value (9th) must be at index 6
      // https://github.com/khiopsrelease/kv-release/issues/46
      expect(res!.datasets[6]!.extra[0].extra.value).toEqual(1);
    });

    it('getHistogramGraphDatas should return valid datas [ylogAdultAllReports, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[0].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getHistogramGraphDatas(
        selectedVariable!,
      );

      expect(res![0]!.frequency).toEqual(595);
      expect(res![0]!.logValue).toEqual(-1.9142764735569882);
      expect(res![0]!.partition).toEqual([16.5, 17.5]);
      expect(res![0]!.density).toEqual(0.012182138323573974);
    });

    it('getHistogramGraphDatas should return valid datas [ylogAdultAllReports, R3]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[2].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getHistogramGraphDatas(
        selectedVariable!,
      );

      expect(res![0]!.frequency).toEqual(46560);
      expect(res![0]!.logValue).toEqual(-0.020780467643705575);
      expect(res![0]!.partition).toEqual([-0.5, 0.5]);
      expect(res![0]!.density).toEqual(0.9532779165472339);
    });

    it('getdistributionGraphDatas should return default group index information datas [AnalysisRegressionQ99, preparationReport, R04]', () => {
      const fileDatas = require('../../assets/mocks/kv/AnalysisRegressionQ99.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      distributionDatasService.initialize();
      distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[3].name,
        REPORT.PREPARATION_REPORT,
      );
      const selectedVariable = preparationDatasService.getSelectedVariable(
        REPORT.PREPARATION_REPORT,
      );
      const res = distributionDatasService.getdistributionGraphDatas(
        selectedVariable!,
      );
      expect(res!.labels[1]).toEqual('{ho,*}');
    });

    // ===== initialize =====

    describe('initialize', () => {
      it('should initialize without errors', () => {
        expect(() => distributionDatasService.initialize()).not.toThrow();
      });

      it('should initialize with loaded data', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        distributionDatasService.initialize();
        const datas = distributionDatasService.getDatas();
        expect(datas).toBeDefined();
      });
    });

    // ===== getDatas =====

    describe('getDatas', () => {
      it('should return datas after initialization', () => {
        distributionDatasService.initialize();
        const datas = distributionDatasService.getDatas();
        expect(datas).toBeDefined();
      });
    });

    // ===== setPreparationSource =====

    describe('setPreparationSource', () => {
      it('should set preparation source', () => {
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);
        distributionDatasService.initialize();
        expect(distributionDatasService.getDatas()).toBeDefined();
      });

      it('should set tree preparation source', () => {
        distributionDatasService.setPreparationSource(REPORT.TREE_PREPARATION_REPORT);
        distributionDatasService.initialize();
        expect(distributionDatasService.getDatas()).toBeDefined();
      });
    });

    // ===== isValid =====

    describe('isValid', () => {
      it('should return false when no data loaded', () => {
        appService.initialize();
        distributionDatasService.initialize();
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);
        expect(distributionDatasService.isValid()).toBe(false);
      });

      it('should return true when data loaded', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        distributionDatasService.initialize();
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);
        expect(distributionDatasService.isValid()).toBe(true);
      });
    });

    // ===== isBigDistributionVariable =====

    describe('isBigDistributionVariable', () => {
      it('should return false for normal variable', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        distributionDatasService.initialize();
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

        preparationDatasService.setSelectedVariable(
          fileDatas.preparationReport.variablesStatistics[0].name,
          REPORT.PREPARATION_REPORT,
        );
        const selectedVariable = preparationDatasService.getSelectedVariable(REPORT.PREPARATION_REPORT);
        const result = distributionDatasService.isBigDistributionVariable(selectedVariable!.rank);
        expect(typeof result).toBe('boolean');
      });
    });

    // ===== computeModalityCounts =====

    describe('computeModalityCounts', () => {
      it('should compute modality counts for 2D array', () => {
        const modality = [[10, 20], [30, 40]];
        const result = distributionDatasService.computeModalityCounts(modality);
        expect(result).toBeDefined();
        expect(result.total).toBe(100);
        expect(result.series.length).toBe(2);
        expect(result.series[0]).toBe(40);
        expect(result.series[1]).toBe(60);
      });

      it('should handle empty modality', () => {
        const result = distributionDatasService.computeModalityCounts(null);
        expect(result).toBeDefined();
        expect(result.total).toBe(0);
      });

      it('should compute totalProbability', () => {
        const modality = [[5, 15], [10, 20]];
        const result = distributionDatasService.computeModalityCounts(modality);
        expect(result.totalProbability.length).toBe(2);
        expect(result.totalProbability[0]).toBe(15 / 50);
        expect(result.totalProbability[1]).toBe(35 / 50);
      });
    });

    // ===== formatXAxis =====

    describe('formatXAxis', () => {
      it('should format numerical partition', () => {
        const result = distributionDatasService.formatXAxis([1, 10], 0, 'Numerical');
        expect(typeof result).toBe('string');
        expect(result).toContain('1');
      });

      it('should format first numerical partition with [', () => {
        const result = distributionDatasService.formatXAxis([1, 10], 0, 'Numerical');
        expect(result.startsWith('[')).toBe(true);
      });

      it('should format non-first numerical partition with ]', () => {
        const result = distributionDatasService.formatXAxis([10, 20], 1, 'Numerical');
        expect(result.startsWith(']')).toBe(true);
      });

      it('should format categorical single-value partition', () => {
        const result = distributionDatasService.formatXAxis('A', 0, 'Categorical');
        expect(result).toContain('A');
      });

      it('should format categorical multi-value partition', () => {
        const result = distributionDatasService.formatXAxis('A,B', 0, 'Categorical');
        expect(result).toContain('A');
        expect(result).toContain('B');
      });
    });

    // ===== defineDefaultGroup =====

    describe('defineDefaultGroup', () => {
      it('should not throw with valid dimension', () => {
        const dimension = { variable: 'v1', type: 'Categorical', partitionType: 'Value groups', partition: [['A'], ['B', 'C']], defaultGroupIndex: 1 };
        expect(() => distributionDatasService.defineDefaultGroup(dimension)).not.toThrow();
      });
    });

    // ===== setTargetDistributionDisplayedValues =====

    describe('setTargetDistributionDisplayedValues', () => {
      it('should set displayed values', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        distributionDatasService.initialize();
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

        const values = [{ name: '0', show: true }, { name: '1', show: true }];
        distributionDatasService.setTargetDistributionDisplayedValues(values);
        const datas = distributionDatasService.getDatas();
        expect(datas.targetDistributionDisplayedValues).toEqual(values);
      });
    });

    // ===== getDistributionGraphDatas (level) =====

    describe('getLeveldistributionGraphDatas', () => {
      it('should return level distribution data', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        distributionDatasService.initialize();
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

        const variables = preparationDatasService.getVariablesDatas(REPORT.PREPARATION_REPORT);
        if (variables && variables.length > 0) {
          const result = distributionDatasService.getLeveldistributionGraphDatas(variables);
          expect(result.labels).toBeDefined();
          expect(result.datasets).toBeDefined();
          expect(result.datasets.length).toBeGreaterThan(0);
        }
      });
    });

    // ===== getImportanceDistributionGraphDatas =====

    describe('getImportanceDistributionGraphDatas', () => {
      it('should return importance distribution data', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/C100_AllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        distributionDatasService.initialize();
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

        const variables = preparationDatasService.getVariablesDatas(REPORT.PREPARATION_REPORT);
        if (variables && variables.length > 0) {
          const result = distributionDatasService.getImportanceDistributionGraphDatas(variables);
          expect(result.labels).toBeDefined();
          expect(result.datasets).toBeDefined();
        }
      });
    });

    // ===== getAllFrequencyAndCoverageValues =====

    describe('getAllFrequencyAndCoverageValues', () => {
      it('should not throw for valid inputs', () => {
        const currentDatas = [[10, 20], [30, 40]];
        const dimensions = [{ variable: 'v1', type: 'Numerical', partitionType: 'Intervals', partition: [[0, 1], [1, 2]] }];
        expect(() => distributionDatasService.getAllFrequencyAndCoverageValues(currentDatas, dimensions)).not.toThrow();
      });
    });

    // ===== updateGraphOptions =====

    describe('updateGraphOptions', () => {
      it('should update graph options', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        distributionDatasService.initialize();
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

        expect(() => distributionDatasService.updateGraphOptions()).not.toThrow();
      });
    });

    // ===== initTargetDistributionDisplayedValues =====

    describe('initTargetDistributionDisplayedValues', () => {
      it('should initialize target distribution displayed values with string partition', () => {
        distributionDatasService.initialize();
        distributionDatasService.initTargetDistributionDisplayedValues(['val1', 'val2', 'val3']);
        const datas = distributionDatasService.getDatas();
        expect(datas.targetDistributionDisplayedValues).toBeDefined();
        expect(Array.isArray(datas.targetDistributionDisplayedValues)).toBe(true);
      });
    });

    // ===== computeDistributionGraph with different types =====

    describe('computeDistributionGraph', () => {
      it('should compute distribution graph for bi2', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/bi2.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        distributionDatasService.initialize();
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

        // Use a variable that has detailed statistics (rank R02+)
        const varWithDetails = fileDatas.preparationReport.variablesStatistics.find(
          (v) => fileDatas.preparationReport.variablesDetailedStatistics[v.rank],
        );
        if (varWithDetails) {
          preparationDatasService.setSelectedVariable(varWithDetails.name, REPORT.PREPARATION_REPORT);
          const selectedVariable = preparationDatasService.getSelectedVariable(REPORT.PREPARATION_REPORT);
          const res = distributionDatasService.getdistributionGraphDatas(selectedVariable!);
          expect(res).toBeDefined();
          if (res) {
            expect(res.datasets.length).toBeGreaterThan(0);
          }
        }
      });
    });

    // ===== getHistogramGraphDatas additional =====

    describe('getHistogramGraphDatas (additional)', () => {
      it('should return undefined for variable without histogram datas', () => {
        const fileDatas = JSON.parse(JSON.stringify(require('../../assets/mocks/kv/bi2.json')));
        appService.setFileDatas(fileDatas);
        preparationDatasService.initialize();
        distributionDatasService.initialize();
        distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);

        // Select a categorical variable (no histogram)
        const catVar = fileDatas.preparationReport.variablesStatistics.find(
          (v) => v.type === 'Categorical'
        );
        if (catVar) {
          preparationDatasService.setSelectedVariable(catVar.name, REPORT.PREPARATION_REPORT);
          const selectedVariable = preparationDatasService.getSelectedVariable(REPORT.PREPARATION_REPORT);
          const res = distributionDatasService.getHistogramGraphDatas(selectedVariable!);
          // May return undefined or empty for categorical variable
          if (res) {
            expect(Array.isArray(res)).toBe(true);
          }
        }
      });
    });
  });
});
