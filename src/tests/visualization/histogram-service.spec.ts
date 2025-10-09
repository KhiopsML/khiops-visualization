/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HistogramService } from '@khiops-visualization/components/commons/histogram/histogram.service';
import { AppService } from '@khiops-visualization/providers/app.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import { TranslateModule } from '@ngstack/translate';
import { Axis } from '@khiops-library/enum/axis';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas';
import { provideMockStore } from '@ngrx/store/testing';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';

let appService: AppService;
let histogramService: HistogramService;
let distributionDatasService: DistributionDatasService;
let preparationDatasService: PreparationDatasService;

function getHistogramGraphDatas(fileDatas: VisualizationDatas, variable: any) {
  appService.setFileDatas(fileDatas);
  preparationDatasService.initialize();
  distributionDatasService.initialize();
  distributionDatasService.setPreparationSource(REPORT.PREPARATION_REPORT);
  preparationDatasService.setSelectedVariable(
    fileDatas.preparationReport.variablesStatistics?.[variable]!.name,
    REPORT.PREPARATION_REPORT,
  );
  const selectedVariable = preparationDatasService.getSelectedVariable(
    REPORT.PREPARATION_REPORT,
  );
  return distributionDatasService.getHistogramGraphDatas(selectedVariable!);
}

describe('Visualization', () => {
  describe('Histogram datas', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
        providers: [
          provideMockStore({ initialState: {} }),
          DistributionDatasService,
          PreparationDatasService,
          TreePreparationDatasService,
          AppService,
        ],
      });

      // Inject services
      histogramService = TestBed.inject(HistogramService);
      appService = TestBed.inject(AppService);
      distributionDatasService = TestBed.inject(DistributionDatasService);
      preparationDatasService = TestBed.inject(PreparationDatasService);
    });

    it('histogramService should be created', () => {
      expect(histogramService).toBeTruthy();
    });

    it('getHistogramGraphDatas should return valid datas [defaultGroup, R001, modlHistograms is not given]', () => {
      const fileDatas = require('../../assets/mocks/kv/defaultGroup.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      expect(histogramDatas?.[0]?.density).toEqual(0.0000068024114898816155);
      expect(histogramDatas?.[0]?.frequency).toEqual(1263);
      expect(histogramDatas?.[0]?.probability).toEqual(0.07176544121825104);
      expect(histogramDatas?.[0]?.logValue).toEqual(-5.167337100368651);
      expect(histogramDatas?.[0]?.partition).toEqual([1000, 11550]);
    });

    it('getHistogramGraphDatas should return valid datas [test_report, R2, delta < 0]', () => {
      const fileDatas = require('../../assets/mocks/kv/test_report.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 1);
      expect(histogramDatas?.[0]?.density).toEqual(11.010949814839867);
      expect(histogramDatas?.[0]?.probability).toEqual(0.04292751583391977);
      expect(histogramDatas?.[0]?.logValue).toEqual(1.041824783236237);
      expect(histogramDatas?.[0]?.partition).toEqual([
        0.000007629394531, 0.00390625,
      ]);
    });

    it('getRangeX should return valid datas [ylogAdultAllReports, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      const res = histogramService.getRangeX(histogramDatas!);

      expect(res[0].min).toEqual(16.5);
      expect(res[0].max).toEqual(90.5);

      expect(JSON.stringify(res[1])).toEqual(
        JSON.stringify({
          min: 16.5,
          negValuesCount: 0,
          posValuesCount: 21,
          posStart: 16.5,
          max: 90.5,
          middlewidth: 1.2,
        }),
      );
    });

    it('getRangeX should return valid datas [ylogAdultAllReports, R3]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 2);
      const res = histogramService.getRangeX(histogramDatas!);

      expect(res[0].min).toEqual(-0.5);
      expect(res[0].max).toEqual(4356.5);

      expect(JSON.stringify(res[1])).toEqual(
        JSON.stringify({
          min: -0.5,
          negValuesCount: 0,
          posValuesCount: 51,
          posStart: 0.5,
          max: 4356.5,
          middlewidth: 1.2,
        }),
      );
    });

    it('getRangeX should return valid datas [UnivariateAnalysisResults, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/UnivariateAnalysisResults.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      const res = histogramService.getRangeX(histogramDatas!);

      expect(res[0].min).toEqual(-101556);
      expect(res[0].max).toEqual(497808);

      expect(JSON.stringify(res[1])).toEqual(
        JSON.stringify({
          min: -101556,
          negValuesCount: 34,
          posValuesCount: 37,
          negStart: -0.375,
          posStart: 0.328125,
          max: 497808,
          middlewidth: 1.2,
        }),
      );
    });

    it('getLinRangeY should return valid datas [ylogAdultAllReports, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      const res = histogramService.getLinRangeY(histogramDatas!);
      expect(res).toEqual(0.026668759583054657);
    });

    it('getLinRangeY should return valid datas [ylogAdultAllReports, R3]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 2);
      const res = histogramService.getLinRangeY(histogramDatas!);
      expect(res).toEqual(0.9532779165472339);
    });

    it('getLogRangeY should return valid datas [ylogAdultAllReports, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      const res = histogramService.getLogRangeY(histogramDatas!);
      expect(JSON.stringify(res)).toEqual(
        JSON.stringify({
          min: -4.157314522243283,
          max: -1.5739971837387918,
        }),
      );
    });

    it('getLogRangeY should return valid datas [ylogAdultAllReports, R3]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 2);
      const res = histogramService.getLogRangeY(histogramDatas!);
      expect(JSON.stringify(res)).toEqual(
        JSON.stringify({
          min: -6.817192708003344,
          max: -0.020780467643705575,
        }),
      );
    });

    it('computeXbarsDimensions should return valid datas [ylogAdultAllReports, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      const res = histogramService.computeXbarsDimensions(
        histogramDatas!,
        Axis.XLIN,
      );
      expect(JSON.stringify(res[0])).toEqual(
        JSON.stringify({
          barWlog: 0,
          barXlog: 0,
          barWlin: 1,
          barXlin: 0,
          color: '#ffbe46',
          partition: [16.5, 17.5],
        }),
      );
    });

    it('computeXbarsDimensions should return valid datas [ylogAdultAllReports, R2]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 1);
      const res = histogramService.computeXbarsDimensions(
        histogramDatas!,
        Axis.XLIN,
      );
      expect(JSON.stringify(res[0])).toEqual(
        JSON.stringify({
          barWlog: 0,
          barXlog: 0,
          barWlin: 0.03125,
          barXlin: 0,
          color: '#ffbe46',
          partition: [-0.03125, 0],
        }),
      );
    });

    it('computeXbarsDimensions should return valid datas [ylogAdultAllReports, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      const res = histogramService.computeXbarsDimensions(
        histogramDatas!,
        Axis.XLOG,
      );
      expect(JSON.stringify(res[0])).toEqual(
        JSON.stringify({
          barWlog: 0.02555410447238815,
          barXlog: 0,
          barWlin: 0,
          barXlin: 0,
          color: '#ffbe46',
          partition: [16.5, 17.5],
        }),
      );
    });

    it('computeXbarsDimensions should return valid datas [ylogAdultAllReports, R3]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 2);
      histogramService.getRangeX(histogramDatas!);
      const res = histogramService.computeXbarsDimensions(
        histogramDatas!,
        Axis.XLOG,
      );
      expect(JSON.stringify(res[0])).toEqual(
        JSON.stringify({
          barWlog: 0.15836249209524964,
          barXlog: 0,
          barWlin: 0,
          barXlin: 0,
          color: '#6e93d5',
          partition: [-0.5, 0.5],
        }),
      );
    });

    it('getLogRatioY should return valid datas [ylogAdultAllReports, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      histogramService.getLogRangeY(histogramDatas!);
      const res = histogramService.getLogRatioY(485, 50);
      expect(res).toEqual(178.0656186306165);
    });

    it('getLogRatioY should return valid datas [ylogAdultAllReports, R2]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 1);
      histogramService.getLogRangeY(histogramDatas!);
      const res = histogramService.getLogRatioY(370, 50);
      expect(res).toEqual(50.486935657957105);
    });

    it('getLinRatioY should return valid datas [ylogAdultAllReports, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      histogramService.getLinRangeY(histogramDatas!);
      const res = histogramService.getLinRatioY(370, 50);
      expect(res).toEqual(12936.48468821974);
    });

    it('complex computeXbarsDimensions should return valid datas [ylogAdultAllReports, R1, xLog]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 0);
      const res = histogramService.computeXbarsDimensions(
        histogramDatas!,
        Axis.XLOG,
      );
      const expectedRes = require('../mocks/visualization/histogram-datas/ylogAdultAllReports-histogram-xlog-r1.json');
      expect(JSON.stringify(res)).toEqual(JSON.stringify(expectedRes));
    });

    it('complex computeXbarsDimensions should return valid datas [ylogAdultAllReports, R3, xLin]', () => {
      const fileDatas = require('../../assets/mocks/kv/ylogAdultAllReports.json');
      const histogramDatas = getHistogramGraphDatas(fileDatas, 2);
      const res = histogramService.computeXbarsDimensions(
        histogramDatas!,
        Axis.XLIN,
      );
      const expectedRes = require('../mocks/visualization/histogram-datas/ylogAdultAllReports-histogram-xlin-r3.json');
      expect(JSON.stringify(res)).toEqual(JSON.stringify(expectedRes));
    });

    // Test cases for adaptive delta functionality
    it('should handle very small delta values with large scale data', () => {
      const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults.json');
      // Simulate data with large values but very small differences

      const histogramDatas = getHistogramGraphDatas(fileDatas, 2);

      // Verify that density values are finite and reasonable
      expect(histogramDatas?.[0]?.density).toEqual(2.71843350447628);
      expect(histogramDatas?.[0]?.logValue).toEqual(0.43431871420283175);

      expect(histogramDatas?.[6]?.density).toEqual(324.70204746622505);
      expect(histogramDatas?.[6]?.logValue).toEqual(2.5114850271553513);

      expect(histogramDatas?.[12]?.density).toEqual(4.8335415630622505);
      expect(histogramDatas?.[12]?.logValue).toEqual(0.6842654573927486);
    });

    // Test cases for adaptive delta functionality
    it('should handle very small delta values with normal scale data', () => {
      const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');
      // Simulate data with large values but very small differences

      const histogramDatas = getHistogramGraphDatas(fileDatas, 2);

      // Verify that density values are finite and reasonable
      expect(histogramDatas?.[0]?.density).toEqual(0.0000027184335044764845);
      expect(histogramDatas?.[0]?.logValue).toEqual(-5.565681285797136);
    });
  });
});
