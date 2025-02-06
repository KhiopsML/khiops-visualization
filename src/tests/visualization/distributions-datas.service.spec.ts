/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TestBed } from '@angular/core/testing';

import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { HttpClientModule } from '@angular/common/http';
import { AppService } from '@khiops-visualization/providers/app.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import { TYPES } from '@khiops-library/enum/types';
import { TranslateModule } from '@ngstack/translate';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

let distributionDatasService: DistributionDatasService;
let preparationDatasService: PreparationDatasService;
let treePreparationDatasService: TreePreparationDatasService;
let appService: AppService;

describe('Visualization', () => {
  describe('DistributionDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
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
      expect(res!.datasets[0]!.data[0]).toEqual(50.012209523809524);
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

    it('getdistributionGraphDatas should return valid datas [defaultGroup, Numerical, R1, Missing informations Non supervised]', () => {
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
      expect(res![0]!.value).toEqual(0.0000068024114898816155);
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
      expect(res!.datasets[0]!.data[0]).toEqual(49.042657142857145);
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
      expect(res!.datasets[0]!.data[0]).toEqual(37.37373737373738);
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
      expect(res!.datasets[0]!.data[0]).toEqual(27.55896295429274);
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
      const currentNode = treePreparationDatasService.getSelectedNode();
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
      treePreparationDatasService.setSelectedNode(node, true);
      const currentNode = treePreparationDatasService.getSelectedNode();
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
      expect(res![0]!.value).toEqual(0.012182138323573974);
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
      expect(res![0]!.value).toEqual(0.9532779165472339);
    });
  });
});
