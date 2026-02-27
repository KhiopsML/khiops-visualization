/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HistogramService } from '@khiops-visualization/components/commons/histogram/histogram.service';
import { AppService } from '@khiops-visualization/providers/app.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import { TranslateModule } from '@ngstack/translate';
import { HistogramType } from '@khiops-visualization/components/commons/histogram/histogram.type';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas';
import { provideMockStore } from '@ngrx/store/testing';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { HistogramValuesI } from '@khiops-visualization/components/commons/histogram/histogram.interfaces.d';

let appService: AppService;
let histogramService: HistogramService;
let distributionDatasService: DistributionDatasService;
let preparationDatasService: PreparationDatasService;

/**
 * Helper function to get histogram graph data from file data and variable index
 */
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

describe('HistogramService - BugAnalysisResults_NewBounds Tests', () => {
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
        HistogramService,
      ],
    });

    // Inject services
    histogramService = TestBed.inject(HistogramService);
    appService = TestBed.inject(AppService);
    distributionDatasService = TestBed.inject(DistributionDatasService);
    preparationDatasService = TestBed.inject(PreparationDatasService);
  });

  // ========== 3 TESTS SIMPLES ==========

  /**
   * Test 1: Service should be created
   */
  it('Test 1: should create HistogramService', () => {
    expect(histogramService).toBeTruthy();
  });

  /**
   * Test 2: Should load and process BugAnalysisResults_NewBounds data
   */
  it('Test 2: should load BugAnalysisResults_NewBounds data successfully', () => {
    const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');
    expect(fileDatas).toBeTruthy();
    expect(fileDatas.preparationReport).toBeTruthy();
    expect(fileDatas.preparationReport.variablesStatistics).toBeTruthy();
    expect(
      fileDatas.preparationReport.variablesStatistics.length,
    ).toBeGreaterThan(0);
  });

  /**
   * Test 3: Should get histogram data for the 'Values' variable (R03)
   */
  it('Test 3: should get histogram data for Values variable', () => {
    const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');

    // Find the 'Values' variable (should be R03 based on the structure)
    const valuesVariableIndex =
      fileDatas.preparationReport.variablesStatistics.findIndex(
        (variable: any) => variable.name === 'Values',
      );

    expect(valuesVariableIndex).toBeGreaterThanOrEqual(0);

    const histogramDatas = getHistogramGraphDatas(
      fileDatas,
      valuesVariableIndex,
    );
    expect(histogramDatas).toBeTruthy();
    expect(Array.isArray(histogramDatas)).toBe(true);
    expect(histogramDatas.length).toBeGreaterThan(0);
  });

  // ========== 7 TESTS COMPLEXES ==========

  /**
   * Test 4: Should compute X ranges (linear and logarithmic) correctly
   */
  it('Test 4: should compute X ranges correctly', () => {
    const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');

    // Find the 'Values' variable
    const valuesVariableIndex =
      fileDatas.preparationReport.variablesStatistics.findIndex(
        (variable: any) => variable.name === 'Values',
      );

    const histogramDatas = getHistogramGraphDatas(
      fileDatas,
      valuesVariableIndex,
    );
    expect(histogramDatas).toBeTruthy();

    // Test getRangeX method
    const [rangeXLin, rangeXLog] = histogramService.getRangeX(histogramDatas!);

    // Verify linear range
    expect(rangeXLin.min).toBeDefined();
    expect(rangeXLin.max).toBeDefined();
    expect(rangeXLin.max).toBeGreaterThanOrEqual(rangeXLin.min!);

    // Verify logarithmic range properties
    expect(rangeXLog.min).toBeDefined();
    expect(rangeXLog.max).toBeDefined();
    expect(rangeXLog.middlewidth).toBeDefined();
    expect(rangeXLog.middlewidth).toEqual(1.2); // MIDDLE_WIDTH constant

    // Verify values are from the actual data bounds
    expect(rangeXLin.min).toBeCloseTo(59996.5, 1);
    expect(rangeXLin.max).toBeCloseTo(60000.5, 1);
  });

  /**
   * Test 5: Should compute Y linear range correctly for large density values
   */
  it('Test 5: should compute Y linear range correctly for large density values', () => {
    const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');

    const valuesVariableIndex =
      fileDatas.preparationReport.variablesStatistics.findIndex(
        (variable: any) => variable.name === 'Values',
      );

    const histogramDatas = getHistogramGraphDatas(
      fileDatas,
      valuesVariableIndex,
    );
    expect(histogramDatas).toBeTruthy();

    // Test getLinRangeY method
    const rangeYLin = histogramService.getLinRangeY(histogramDatas!);

    expect(rangeYLin).toBeGreaterThan(0);
    expect(typeof rangeYLin).toBe('number');
    expect(Number.isFinite(rangeYLin)).toBe(true);

    // Should be the maximum density value in the dataset
    const maxDensity = Math.max(...histogramDatas!.map((d) => d.density));
    expect(rangeYLin).toEqual(maxDensity);
  });

  /**
   * Test 6: Should compute Y logarithmic range correctly
   */
  it('Test 6: should compute Y logarithmic range correctly', () => {
    const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');

    const valuesVariableIndex =
      fileDatas.preparationReport.variablesStatistics.findIndex(
        (variable: any) => variable.name === 'Values',
      );

    const histogramDatas = getHistogramGraphDatas(
      fileDatas,
      valuesVariableIndex,
    );
    expect(histogramDatas).toBeTruthy();

    // Test getLogRangeY method
    const rangeYLog = histogramService.getLogRangeY(histogramDatas!);

    expect(rangeYLog.min).toBeDefined();
    expect(rangeYLog.max).toBeDefined();
    expect(rangeYLog.max).toBeGreaterThanOrEqual(rangeYLog.min!);
    expect(Number.isFinite(rangeYLog.min!)).toBe(true);
    expect(Number.isFinite(rangeYLog.max!)).toBe(true);

    // Should handle the case where only one data point exists correctly
    const nonZeroLogValues = histogramDatas!
      .map((d) => d.logValue)
      .filter((v) => v !== 0);
    if (nonZeroLogValues.length === 1) {
      expect(rangeYLog.min).toEqual(0);
    } else {
      expect(rangeYLog.min).toEqual(Math.min(...nonZeroLogValues));
    }
    expect(rangeYLog.max).toEqual(Math.max(...nonZeroLogValues));
  });

  /**
   * Test 7: Should compute linear Y ratio correctly for canvas dimensions
   */
  it('Test 7: should compute linear Y ratio correctly for canvas dimensions', () => {
    const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');

    const valuesVariableIndex =
      fileDatas.preparationReport.variablesStatistics.findIndex(
        (variable: any) => variable.name === 'Values',
      );

    const histogramDatas = getHistogramGraphDatas(
      fileDatas,
      valuesVariableIndex,
    );
    expect(histogramDatas).toBeTruthy();

    // First get the range
    const rangeYLin = histogramService.getLinRangeY(histogramDatas!);

    // Test getLinRatioY method with typical canvas dimensions
    const canvasHeight = 400;
    const padding = 50;
    const ratioY = histogramService.getLinRatioY(canvasHeight, padding);

    expect(ratioY).toBeGreaterThan(0);
    expect(Number.isFinite(ratioY)).toBe(true);

    // Verify the calculation: (h - padding/2) / rangeYLin
    const expectedRatio = (canvasHeight - padding / 2) / rangeYLin;
    expect(ratioY).toBeCloseTo(expectedRatio, 10);

    // Test with different dimensions
    const smallHeight = 100;
    const smallPadding = 20;
    const smallRatio = histogramService.getLinRatioY(smallHeight, smallPadding);
    expect(smallRatio).toBeLessThan(ratioY); // Smaller canvas should give smaller ratio
  });

  /**
   * Test 8: Should compute logarithmic Y ratio correctly
   */
  it('Test 8: should compute logarithmic Y ratio correctly', () => {
    const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');

    const valuesVariableIndex =
      fileDatas.preparationReport.variablesStatistics.findIndex(
        (variable: any) => variable.name === 'Values',
      );

    const histogramDatas = getHistogramGraphDatas(
      fileDatas,
      valuesVariableIndex,
    );
    expect(histogramDatas).toBeTruthy();

    // First get the logarithmic range
    const rangeYLog = histogramService.getLogRangeY(histogramDatas!);

    // Test getLogRatioY method
    const canvasHeight = 400;
    const padding = 50;
    const ratioY = histogramService.getLogRatioY(canvasHeight, padding);

    expect(Number.isFinite(ratioY)).toBe(true);

    // Verify the calculation: (h - padding/2) / shift where shift = |min| - |max|
    const shift = Math.abs(rangeYLog.min || 0) - Math.abs(rangeYLog.max || 0);
    const expectedRatio = (canvasHeight - padding / 2) / shift;
    expect(ratioY).toBeCloseTo(expectedRatio, 10);
  });

  /**
   * Test 9: Should compute X bars dimensions for linear histogram
   */
  it('Test 9: should compute X bars dimensions for linear histogram', () => {
    const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');

    const valuesVariableIndex =
      fileDatas.preparationReport.variablesStatistics.findIndex(
        (variable: any) => variable.name === 'Values',
      );

    const histogramDatas = getHistogramGraphDatas(
      fileDatas,
      valuesVariableIndex,
    );
    expect(histogramDatas).toBeTruthy();

    // First compute ranges
    histogramService.getRangeX(histogramDatas!);

    // Test computeXbarsDimensions with linear type
    const bars = histogramService.computeXbarsDimensions(
      histogramDatas!,
      HistogramType.XLIN,
    );

    expect(bars).toBeTruthy();
    expect(Array.isArray(bars)).toBe(true);
    expect(bars.length).toEqual(histogramDatas!.length);

    // Each bar should have proper properties
    bars.forEach((bar, index) => {
      expect(bar).toBeTruthy();
      expect(bar.partition).toEqual(histogramDatas![index].partition);
      expect(typeof bar.barXlin).toBe('number');
      expect(typeof bar.barWlin).toBe('number');
      expect(bar.barWlin).toBeGreaterThanOrEqual(0);
    });

    // Bars should be ordered correctly
    for (let i = 1; i < bars.length; i++) {
      expect(bars[i].barXlin).toBeGreaterThanOrEqual(bars[i - 1].barXlin);
    }
  });

  /**
   * Test 10: Should compute X bars dimensions for logarithmic histogram with edge cases
   */
  it('Test 10: should compute X bars dimensions for logarithmic histogram with edge cases', () => {
    const fileDatas = require('../../assets/mocks/kv/BugAnalysisResults_NewBounds.json');

    const valuesVariableIndex =
      fileDatas.preparationReport.variablesStatistics.findIndex(
        (variable: any) => variable.name === 'Values',
      );

    const histogramDatas = getHistogramGraphDatas(
      fileDatas,
      valuesVariableIndex,
    );
    expect(histogramDatas).toBeTruthy();

    // First compute ranges
    const [rangeXLin, rangeXLog] = histogramService.getRangeX(histogramDatas!);

    // Test computeXbarsDimensions with logarithmic type
    const bars = histogramService.computeXbarsDimensions(
      histogramDatas!,
      HistogramType.XLOG,
    );

    expect(bars).toBeTruthy();
    expect(Array.isArray(bars)).toBe(true);
    expect(bars.length).toEqual(histogramDatas!.length);

    // Each bar should have proper logarithmic properties
    bars.forEach((bar, index) => {
      expect(bar).toBeTruthy();
      expect(bar.partition).toEqual(histogramDatas![index].partition);
      expect(typeof bar.barXlog).toBe('number');
      expect(typeof bar.barWlog).toBe('number');
      expect(bar.barWlog).toBeGreaterThanOrEqual(0);
    });

    // Test edge cases - bars with values containing zero or negative numbers
    const hasZeroValues = rangeXLog.inf !== undefined;
    if (hasZeroValues) {
      expect(rangeXLog.inf).toBeTruthy();
      expect(rangeXLog.negStart).toBeDefined();
      expect(rangeXLog.posStart).toBeDefined();
    }

    // Verify negative and positive value counts are calculated correctly
    expect(typeof rangeXLog.negValuesCount).toBe('number');
    expect(typeof rangeXLog.posValuesCount).toBe('number');
    expect(
      rangeXLog.negValuesCount! + rangeXLog.posValuesCount!,
    ).toBeLessThanOrEqual(histogramDatas!.length);
  });
});
