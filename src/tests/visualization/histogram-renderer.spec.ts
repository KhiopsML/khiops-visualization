/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { HistogramRendererService } from '../../app/khiops-visualization/components/commons/histogram/histogram-renderer.service';
import { HistogramService } from '../../app/khiops-visualization/components/commons/histogram/histogram.service';
import { HistogramBarModel } from '../../app/khiops-visualization/components/commons/histogram/histogram.bar.model';
import { HistogramValuesI } from '../../app/khiops-visualization/components/commons/histogram/histogram.interfaces';
import { HistogramType } from '../../app/khiops-visualization/components/commons/histogram/histogram.type';

describe('HistogramRendererService', () => {
  let service: HistogramRendererService;
  let histogramService: HistogramService;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HistogramRendererService, HistogramService],
    });
    service = TestBed.inject(HistogramRendererService);
    histogramService = TestBed.inject(HistogramService);

    // Mock canvas and context
    mockCanvas = document.createElement('canvas');
    mockContext = mockCanvas.getContext('2d')!;

    // Mock fillRect and strokeRect methods
    spyOn(mockContext, 'fillRect');
    spyOn(mockContext, 'strokeRect');
  });

  describe('drawRect with very large density values', () => {
    it('should handle very large density values without exceeding canvas height', () => {
      // Test data with very large density value similar to the bug report
      const testData: HistogramValuesI = {
        frequency: 1243,
        logValue: 6.008,
        partition: [0.4995117188, 0.5007324219],
        density: 1018265.62, // Very large density value from the bug report
        probability: 0.396365,
        coords: undefined,
      };

      const testBar = new HistogramBarModel(testData, 1.2, HistogramType.XLIN);
      testBar.barXlin = 10;
      testBar.barWlin = 5;

      const canvasWidth = 800;
      const canvasHeight = 400;
      const xPadding = 40;
      const yPadding = 50;
      const ratioY = 0.0001; // Small ratio that would normally cause huge bar height
      const minBarHeight = 4;
      const defaultBarColor = 'black';

      // Call drawRect
      service.drawRect(
        mockContext,
        testData,
        0,
        testBar,
        canvasWidth,
        canvasHeight,
        xPadding,
        yPadding,
        { selected: HistogramType.XLIN }, // graphOptionsX
        { selected: HistogramType.YLIN }, // graphOptionsY
        undefined, // rangeYLog
        ratioY,
        1, // ratio
        minBarHeight,
        defaultBarColor,
        -1, // selectedItem
      );

      // Verify that fillRect was called
      expect(mockContext.fillRect).toHaveBeenCalled();

      // Get the parameters passed to fillRect
      const fillRectCall = (
        mockContext.fillRect as jasmine.Spy
      ).calls.mostRecent();
      const [x, y, width, height] = fillRectCall.args;

      // The height should not exceed the maximum allowed height
      const maxBarHeight = canvasHeight - yPadding / 2;
      expect(height <= maxBarHeight).toBeTruthy();

      // The height should be positive
      expect(height > 0).toBeTruthy();

      // The y position should be valid (within canvas bounds)
      expect(y >= 0).toBeTruthy();
      expect(y + height <= canvasHeight).toBeTruthy();
    });

    it('should preserve normal behavior for regular density values', () => {
      // Test data with normal density value
      const testData: HistogramValuesI = {
        frequency: 50,
        logValue: 2.5,
        partition: [0.1, 0.2],
        density: 0.5, // Normal density value
        probability: 0.1,
        coords: undefined,
      };

      const testBar = new HistogramBarModel(testData, 1.2, HistogramType.XLIN);
      testBar.barXlin = 10;
      testBar.barWlin = 5;

      const canvasWidth = 800;
      const canvasHeight = 400;
      const xPadding = 40;
      const yPadding = 50;
      const ratioY = 100; // Normal ratio
      const minBarHeight = 4;
      const defaultBarColor = 'black';

      // Expected height calculation
      const expectedHeight = testData.density * ratioY; // 0.5 * 100 = 50

      service.drawRect(
        mockContext,
        testData,
        0,
        testBar,
        canvasWidth,
        canvasHeight,
        xPadding,
        yPadding,
        { selected: HistogramType.XLIN },
        { selected: HistogramType.YLIN },
        undefined,
        ratioY,
        1,
        minBarHeight,
        defaultBarColor,
        -1,
      );

      expect(mockContext.fillRect).toHaveBeenCalled();

      const fillRectCall = (
        mockContext.fillRect as jasmine.Spy
      ).calls.mostRecent();
      const [x, y, width, height] = fillRectCall.args;

      // For normal values, the height should match expected calculation
      expect(height).toEqual(expectedHeight);
    });

    it('should apply minimum bar height when calculated height is too small', () => {
      const testData: HistogramValuesI = {
        frequency: 1,
        logValue: -2,
        partition: [0.1, 0.2],
        density: 0.001, // Very small density
        probability: 0.001,
        coords: undefined,
      };

      const testBar = new HistogramBarModel(testData, 1.2, HistogramType.XLIN);
      testBar.barXlin = 10;
      testBar.barWlin = 5;

      const canvasWidth = 800;
      const canvasHeight = 400;
      const xPadding = 40;
      const yPadding = 50;
      const ratioY = 1000; // Ratio that would produce small height
      const minBarHeight = 4;
      const defaultBarColor = 'black';

      service.drawRect(
        mockContext,
        testData,
        0,
        testBar,
        canvasWidth,
        canvasHeight,
        xPadding,
        yPadding,
        { selected: HistogramType.XLIN },
        { selected: HistogramType.YLIN },
        undefined,
        ratioY,
        1,
        minBarHeight,
        defaultBarColor,
        -1,
      );

      expect(mockContext.fillRect).toHaveBeenCalled();

      const fillRectCall = (
        mockContext.fillRect as jasmine.Spy
      ).calls.mostRecent();
      const [x, y, width, height] = fillRectCall.args;

      // Height should be at least the minimum bar height
      expect(height >= minBarHeight).toBeTruthy();
    });

    it('should handle logarithmic Y scale without exceeding canvas bounds', () => {
      // Test data similar to R12 from irisU.khj with high frequency
      const testData: HistogramValuesI = {
        frequency: 68,
        logValue: 4.2, // High log value that could cause overflow
        partition: [1.5, 1.65],
        density: 680.0, // High density value
        probability: 0.687,
        coords: undefined,
      };

      const testBar = new HistogramBarModel(testData, 1.2, HistogramType.XLIN);
      testBar.barXlin = 10;
      testBar.barWlin = 5;

      const canvasWidth = 800;
      const canvasHeight = 400;
      const xPadding = 40;
      const yPadding = 50;
      const ratioY = 30; // Ratio that could cause bar overflow in YLOG mode
      const minBarHeight = 4;
      const defaultBarColor = 'black';

      // Mock rangeYLog that could cause overflow
      const rangeYLog = {
        min: -1.0,
        max: 5.0,
      };

      service.drawRect(
        mockContext,
        testData,
        0,
        testBar,
        canvasWidth,
        canvasHeight,
        xPadding,
        yPadding,
        { selected: HistogramType.XLIN }, // graphOptionsX
        { selected: HistogramType.YLOG }, // graphOptionsY - logarithmic mode
        rangeYLog,
        ratioY,
        1, // ratio
        minBarHeight,
        defaultBarColor,
        -1, // selectedItem
      );

      // Verify that fillRect was called
      expect(mockContext.fillRect).toHaveBeenCalled();

      // Get the parameters passed to fillRect
      const fillRectCall = (
        mockContext.fillRect as jasmine.Spy
      ).calls.mostRecent();
      const [x, y, width, height] = fillRectCall.args;

      // The height should not exceed the maximum allowed height
      const maxBarHeight = canvasHeight - yPadding / 2;
      expect(height <= maxBarHeight).toBeTruthy();

      // The height should be positive (not negative due to overflow)
      expect(height >= 0).toBeTruthy();

      // The y position should be valid (within canvas bounds)
      expect(y >= 0).toBeTruthy();
      expect(y + height <= canvasHeight).toBeTruthy();

      // Verify logarithmic calculation is correct
      // logValue = 4.2, range is -1.0 to 5.0, so relative position = (4.2 - (-1.0)) / (5.0 - (-1.0)) = 5.2 / 6.0 ≈ 0.867
      const expectedRelativePosition =
        (testData.logValue - rangeYLog.min) / (rangeYLog.max - rangeYLog.min);
      const expectedHeight =
        expectedRelativePosition * (canvasHeight - yPadding / 2);
      expect(height).toBeCloseTo(expectedHeight, 1);
    });

    it('should correctly calculate logarithmic heights for different values', () => {
      // Test multiple values to ensure logarithmic scale is working
      const rangeYLog = { min: 0.0, max: 4.0 };
      const canvasHeight = 400;
      const yPadding = 50;
      const maxBarHeight = canvasHeight - yPadding / 2;

      // Test data with logValue = 1.0 (should be 1/4 of the way up)
      const testData1: HistogramValuesI = {
        frequency: 10,
        logValue: 1.0,
        partition: [0, 1],
        density: 10.0,
        probability: 0.1,
        coords: undefined,
      };

      // Test data with logValue = 3.0 (should be 3/4 of the way up)
      const testData2: HistogramValuesI = {
        frequency: 30,
        logValue: 3.0,
        partition: [1, 2],
        density: 30.0,
        probability: 0.3,
        coords: undefined,
      };

      const testBar = new HistogramBarModel(testData1, 1.2, HistogramType.XLIN);
      testBar.barXlin = 10;
      testBar.barWlin = 5;

      // Test first value
      service.drawRect(
        mockContext,
        testData1,
        0,
        testBar,
        800,
        canvasHeight,
        40,
        yPadding,
        { selected: HistogramType.XLIN },
        { selected: HistogramType.YLOG },
        rangeYLog,
        1,
        1,
        4,
        'black',
        -1,
      );

      let fillRectCall = (
        mockContext.fillRect as jasmine.Spy
      ).calls.mostRecent();
      let height1 = fillRectCall.args[3];

      // Test second value
      service.drawRect(
        mockContext,
        testData2,
        0,
        testBar,
        800,
        canvasHeight,
        40,
        yPadding,
        { selected: HistogramType.XLIN },
        { selected: HistogramType.YLOG },
        rangeYLog,
        1,
        1,
        4,
        'black',
        -1,
      );

      fillRectCall = (mockContext.fillRect as jasmine.Spy).calls.mostRecent();
      let height2 = fillRectCall.args[3];

      // Verify that the higher logValue results in a higher bar
      expect(height2).toBeGreaterThan(height1);

      // Verify expected heights
      const expectedHeight1 = (1.0 / 4.0) * maxBarHeight; // 1/4 of max height
      const expectedHeight2 = (3.0 / 4.0) * maxBarHeight; // 3/4 of max height

      expect(height1).toBeCloseTo(expectedHeight1, 1);
      expect(height2).toBeCloseTo(expectedHeight2, 1);
    });
  });

  describe('drawRect with irisU.json data for variable R12', () => {
    /**
     * Test drawRect method with real irisU.json data for variable R12
     * Verifies coordinates calculation for 1st and 3rd histogram bars
     */
    it('should correctly calculate coordinates for R12 variable from irisU.json', () => {
      // Load irisU.json data
      const fileDatas = require('../../assets/mocks/kv/irisU.json');
      expect(fileDatas).toBeTruthy();
      expect(fileDatas.preparationReport).toBeTruthy();
      expect(fileDatas.preparationReport.variablesStatistics).toBeTruthy();

      // Find R12 variable index (should be variable with name containing 'R12' or at specific index)
      // Based on typical Khiops data structure, R12 would be around index 11 (R1=0, R2=1, etc.)
      let r12VariableIndex =
        fileDatas.preparationReport.variablesStatistics.findIndex(
          (variable: any) => variable.name === 'R12',
        );

      // If not found by name, try index 11 (0-based for R12)
      if (
        r12VariableIndex === -1 &&
        fileDatas.preparationReport.variablesStatistics.length > 11
      ) {
        r12VariableIndex = 11;
      }

      // If still not found, look for the first numerical variable
      if (r12VariableIndex === -1) {
        r12VariableIndex =
          fileDatas.preparationReport.variablesStatistics.findIndex(
            (variable: any) =>
              variable.type === 'Numerical' &&
              variable.dataGrid &&
              variable.dataGrid.frequencies,
          );
      }

      expect(r12VariableIndex).toBeGreaterThanOrEqual(0);

      const r12Variable =
        fileDatas.preparationReport.variablesStatistics[r12VariableIndex];
      expect(r12Variable).toBeTruthy();

      // Check different possible data structures
      let frequencies: number[] = [];
      let intervals: number[][] = [];

      if (r12Variable.dataGrid && r12Variable.dataGrid.frequencies) {
        frequencies = r12Variable.dataGrid.frequencies;
        intervals = r12Variable.dataGrid.intervals || [];
      } else if (r12Variable.distributionValues) {
        // Alternative structure
        frequencies = r12Variable.distributionValues.map(
          (val: any) => val.frequency || val.valueFrequency || 1,
        );
        intervals = r12Variable.distributionValues.map(
          (val: any, idx: number) => [idx, idx + 1],
        );
      } else if (
        r12Variable.descriptiveStats &&
        r12Variable.descriptiveStats.values
      ) {
        // Another possible structure
        frequencies = r12Variable.descriptiveStats.values.map(
          (val: any) => val.frequency || 1,
        );
        intervals = r12Variable.descriptiveStats.values.map(
          (val: any, idx: number) => [idx, idx + 1],
        );
      } else {
        // Create mock data if structure is not as expected
        frequencies = [68, 82, 99, 75, 60]; // Sample frequencies
        intervals = [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
        ]; // Sample intervals
      }

      expect(frequencies.length).toBeGreaterThanOrEqual(3);

      // Create test histogram data from R12 variable - take first 3 bars
      const histogramData = frequencies
        .slice(0, 3)
        .map((freq: number, index: number) => {
          const interval = intervals[index] || [index, index + 1];
          return {
            frequency: freq,
            logValue: Math.log10(freq > 0 ? freq : 1),
            partition: interval,
            density:
              freq / (interval.length >= 2 ? interval[1] - interval[0] : 1),
            probability:
              freq / frequencies.reduce((sum: number, f: number) => sum + f, 0),
            coords: undefined,
          };
        });

      // Canvas setup
      const canvasWidth = 800;
      const canvasHeight = 400;
      const xPadding = 40;
      const yPadding = 50;
      const minBarHeight = 4;
      const defaultBarColor = '#1f77b4';

      // Calculate histogram bars using the service
      const bars = histogramService.computeXbarsDimensions(
        histogramData,
        HistogramType.XLIN,
      );

      // Calculate ratios for scaling
      let ratio = 0;
      const lastBar = bars[bars.length - 1];
      if (lastBar) {
        ratio = lastBar.barXlin + lastBar.barWlin;
      }

      // Calculate Y ratio based on max density
      const maxDensity = Math.max(...histogramData.map((d) => d.density));
      const ratioY = (canvasHeight - yPadding) / maxDensity;

      // Test the 1st bar (index 0)
      const firstBarData = histogramData[0];
      const firstBar = bars[0];

      let d = service.drawRect(
        mockContext,
        firstBarData,
        0,
        firstBar,
        canvasWidth,
        canvasHeight,
        xPadding,
        yPadding,
        { selected: HistogramType.XLIN }, // graphOptionsX
        { selected: HistogramType.YLIN }, // graphOptionsY
        undefined, // rangeYLog
        ratioY,
        ratio,
        minBarHeight,
        defaultBarColor,
        -1, // selectedItem
      );
      expect(d.coords.x).toEqual(60);
      expect(d.coords.barW).toEqual(240);

      // Verify first bar coordinates
      expect(firstBarData.coords).toBeTruthy();
      expect(firstBarData.coords!.x).toBeGreaterThanOrEqual(xPadding);
      expect(firstBarData.coords!.y).toBeGreaterThanOrEqual(0);
      expect(firstBarData.coords!.barW).toBeGreaterThan(0);
      expect(firstBarData.coords!.barH).toBeGreaterThanOrEqual(minBarHeight);

      // Store first bar coordinates for comparison
      const firstBarCoords = { ...firstBarData.coords! };

      // Test the 3rd bar (index 2)
      const thirdBarData = histogramData[2];
      const thirdBar = bars[2];

      d = service.drawRect(
        mockContext,
        thirdBarData,
        2,
        thirdBar,
        canvasWidth,
        canvasHeight,
        xPadding,
        yPadding,
        { selected: HistogramType.XLIN }, // graphOptionsX
        { selected: HistogramType.YLIN }, // graphOptionsY
        undefined, // rangeYLog
        ratioY,
        ratio,
        minBarHeight,
        defaultBarColor,
        -1, // selectedItem
      );

      expect(d.coords.x).toEqual(540);
      expect(d.coords.y).toEqual(50);
      expect(d.coords.barW).toEqual(240);
      expect(d.coords.barH).toEqual(350);

      // Verify third bar coordinates
      expect(thirdBarData.coords).toBeTruthy();
      expect(thirdBarData.coords!.x).toBeGreaterThanOrEqual(xPadding);
      expect(thirdBarData.coords!.y).toBeGreaterThanOrEqual(0);
      expect(thirdBarData.coords!.barW).toBeGreaterThan(0);
      expect(thirdBarData.coords!.barH).toBeGreaterThanOrEqual(minBarHeight);

      // Store third bar coordinates for comparison
      const thirdBarCoords = { ...thirdBarData.coords! };

      // Verify that bars have different X positions (progression)
      expect(thirdBarCoords.x).toBeGreaterThan(firstBarCoords.x);

      // Verify that both bars fit within canvas bounds
      expect(firstBarCoords.x + firstBarCoords.barW).toBeLessThanOrEqual(
        canvasWidth,
      );
      expect(thirdBarCoords.x + thirdBarCoords.barW).toBeLessThanOrEqual(
        canvasWidth,
      );
      expect(firstBarCoords.y + firstBarCoords.barH).toBeLessThanOrEqual(
        canvasHeight,
      );
      expect(thirdBarCoords.y + thirdBarCoords.barH).toBeLessThanOrEqual(
        canvasHeight,
      );

      // Additional validation: coordinates should be well-formed
      expect(Number.isFinite(firstBarCoords.x)).toBeTruthy();
      expect(Number.isFinite(firstBarCoords.y)).toBeTruthy();
      expect(Number.isFinite(firstBarCoords.barW)).toBeTruthy();
      expect(Number.isFinite(firstBarCoords.barH)).toBeTruthy();

      expect(Number.isFinite(thirdBarCoords.x)).toBeTruthy();
      expect(Number.isFinite(thirdBarCoords.y)).toBeTruthy();
      expect(Number.isFinite(thirdBarCoords.barW)).toBeTruthy();
      expect(Number.isFinite(thirdBarCoords.barH)).toBeTruthy();
    });

    /**
     * Test drawRect method with real irisU.json data for variable R12 using logarithmic scales
     * Verifies coordinates calculation for 1st and 3rd histogram bars with XLOG and YLOG
     */
    it('should correctly calculate coordinates for R12 variable from irisU.json with logarithmic scales', () => {
      // Load irisU.json data
      const fileDatas = require('../../assets/mocks/kv/irisU.json');
      expect(fileDatas).toBeTruthy();
      expect(fileDatas.preparationReport).toBeTruthy();
      expect(fileDatas.preparationReport.variablesStatistics).toBeTruthy();

      // Find R12 variable index (should be variable with name containing 'R12' or at specific index)
      // Based on typical Khiops data structure, R12 would be around index 11 (R1=0, R2=1, etc.)
      let r12VariableIndex =
        fileDatas.preparationReport.variablesStatistics.findIndex(
          (variable: any) => variable.name === 'R12',
        );

      // If not found by name, try index 11 (0-based for R12)
      if (
        r12VariableIndex === -1 &&
        fileDatas.preparationReport.variablesStatistics.length > 11
      ) {
        r12VariableIndex = 11;
      }

      // If still not found, look for the first numerical variable
      if (r12VariableIndex === -1) {
        r12VariableIndex =
          fileDatas.preparationReport.variablesStatistics.findIndex(
            (variable: any) =>
              variable.type === 'Numerical' &&
              variable.dataGrid &&
              variable.dataGrid.frequencies,
          );
      }

      expect(r12VariableIndex).toBeGreaterThanOrEqual(0);

      const r12Variable =
        fileDatas.preparationReport.variablesStatistics[r12VariableIndex];
      expect(r12Variable).toBeTruthy();

      // Check different possible data structures
      let frequencies: number[] = [];
      let intervals: number[][] = [];

      if (r12Variable.dataGrid && r12Variable.dataGrid.frequencies) {
        frequencies = r12Variable.dataGrid.frequencies;
        intervals = r12Variable.dataGrid.intervals || [];
      } else if (r12Variable.distributionValues) {
        // Alternative structure
        frequencies = r12Variable.distributionValues.map(
          (val: any) => val.frequency || val.valueFrequency || 1,
        );
        intervals = r12Variable.distributionValues.map(
          (val: any, idx: number) => [idx, idx + 1],
        );
      } else if (
        r12Variable.descriptiveStats &&
        r12Variable.descriptiveStats.values
      ) {
        // Another possible structure
        frequencies = r12Variable.descriptiveStats.values.map(
          (val: any) => val.frequency || 1,
        );
        intervals = r12Variable.descriptiveStats.values.map(
          (val: any, idx: number) => [idx, idx + 1],
        );
      } else {
        // Create mock data if structure is not as expected
        frequencies = [68, 82, 99, 75, 60]; // Sample frequencies
        intervals = [
          [0.1, 1.0], // Use values > 0 for logarithmic scale
          [1.0, 2.0],
          [2.0, 3.0],
          [3.0, 4.0],
          [4.0, 5.0],
        ]; // Sample intervals with positive values for log scale
      }

      expect(frequencies.length).toBeGreaterThanOrEqual(3);

      // Create test histogram data from R12 variable - take first 3 bars
      // For logarithmic scales, ensure positive values
      const histogramData = frequencies
        .slice(0, 3)
        .map((freq: number, index: number) => {
          const interval = intervals[index] || [index + 0.1, index + 1.1]; // Ensure positive values
          const adjustedFreq = freq > 0 ? freq : 1; // Ensure positive frequency for log
          return {
            frequency: adjustedFreq,
            logValue: Math.log10(adjustedFreq),
            partition: interval,
            density:
              adjustedFreq /
              (interval.length >= 2 ? interval[1] - interval[0] : 1),
            probability:
              adjustedFreq /
              frequencies.reduce(
                (sum: number, f: number) => sum + Math.max(f, 1),
                0,
              ),
            coords: undefined,
          };
        });

      // Canvas setup
      const canvasWidth = 800;
      const canvasHeight = 400;
      const xPadding = 40;
      const yPadding = 50;
      const minBarHeight = 4;
      const defaultBarColor = '#1f77b4';

      // Calculate histogram bars using the service with XLOG type for logarithmic X axis
      const bars = histogramService.computeXbarsDimensions(
        histogramData,
        HistogramType.XLOG,
      );

      // Calculate ratios for scaling using logarithmic X axis
      let ratio = 0;
      const lastBar = bars[bars.length - 1];
      if (lastBar) {
        ratio = lastBar.barXlog + lastBar.barWlog;
      }

      // For logarithmic Y axis, we need to provide rangeYLog
      const logValues = histogramData.map((d) => d.logValue);
      const rangeYLog = {
        min: Math.min(...logValues) - 0.1, // Add some margin
        max: Math.max(...logValues) + 0.1,
      };

      // Calculate Y ratio - not used directly for log scale but needed for the function
      const maxDensity = Math.max(...histogramData.map((d) => d.density));
      const ratioY = (canvasHeight - yPadding) / maxDensity;

      // Test the 1st bar (index 0)
      const firstBarData = histogramData[0];
      const firstBar = bars[0];

      let d = service.drawRect(
        mockContext,
        firstBarData,
        0,
        firstBar,
        canvasWidth,
        canvasHeight,
        xPadding,
        yPadding,
        { selected: HistogramType.XLOG }, // graphOptionsX - LOGARITHMIC
        { selected: HistogramType.YLOG }, // graphOptionsY - LOGARITHMIC
        rangeYLog, // rangeYLog for logarithmic Y scale
        ratioY,
        ratio,
        minBarHeight,
        defaultBarColor,
        -1, // selectedItem
      );

      expect(d.coords.x).toEqual(60);
      expect(d.coords.y).toEqual(296.73014080753296);
      expect(d.coords.barW).toEqual(487.43459462076873);
      expect(d.coords.barH).toEqual(103.26985919246704);

      // Verify first bar coordinates
      expect(firstBarData.coords).toBeTruthy();
      expect(firstBarData.coords!.x).toBeGreaterThanOrEqual(xPadding);
      expect(firstBarData.coords!.y).toBeGreaterThanOrEqual(0);
      expect(firstBarData.coords!.barW).toBeGreaterThan(0);
      expect(firstBarData.coords!.barH).toBeGreaterThanOrEqual(minBarHeight);

      // Store first bar coordinates for comparison
      const firstBarCoords = { ...firstBarData.coords! };

      // Test the 3rd bar (index 2)
      const thirdBarData = histogramData[2];
      const thirdBar = bars[2];

      d = service.drawRect(
        mockContext,
        thirdBarData,
        2,
        thirdBar,
        canvasWidth,
        canvasHeight,
        xPadding,
        yPadding,
        { selected: HistogramType.XLOG }, // graphOptionsX - LOGARITHMIC
        { selected: HistogramType.YLOG }, // graphOptionsY - LOGARITHMIC
        rangeYLog, // rangeYLog for logarithmic Y scale
        ratioY,
        ratio,
        minBarHeight,
        defaultBarColor,
        -1, // selectedItem
      );

      expect(d.coords.x).toEqual(694.1670285259332);
      expect(d.coords.y).toEqual(128.2698591924668);
      expect(d.coords.barW).toEqual(85.83297147406675);
      expect(d.coords.barH).toEqual(271.7301408075332);

      // Verify third bar coordinates
      expect(thirdBarData.coords).toBeTruthy();
      expect(thirdBarData.coords!.x).toBeGreaterThanOrEqual(xPadding);
      expect(thirdBarData.coords!.y).toBeGreaterThanOrEqual(0);
      expect(thirdBarData.coords!.barW).toBeGreaterThan(0);
      expect(thirdBarData.coords!.barH).toBeGreaterThanOrEqual(minBarHeight);

      // Store third bar coordinates for comparison
      const thirdBarCoords = { ...thirdBarData.coords! };

      // Verify that bars have different X positions (progression)
      expect(thirdBarCoords.x).toBeGreaterThan(firstBarCoords.x);

      // Verify that both bars fit within canvas bounds
      expect(firstBarCoords.x + firstBarCoords.barW).toBeLessThanOrEqual(
        canvasWidth,
      );
      expect(thirdBarCoords.x + thirdBarCoords.barW).toBeLessThanOrEqual(
        canvasWidth,
      );
      expect(firstBarCoords.y + firstBarCoords.barH).toBeLessThanOrEqual(
        canvasHeight,
      );
      expect(thirdBarCoords.y + thirdBarCoords.barH).toBeLessThanOrEqual(
        canvasHeight,
      );

      // Additional validation: coordinates should be well-formed
      expect(Number.isFinite(firstBarCoords.x)).toBeTruthy();
      expect(Number.isFinite(firstBarCoords.y)).toBeTruthy();
      expect(Number.isFinite(firstBarCoords.barW)).toBeTruthy();
      expect(Number.isFinite(firstBarCoords.barH)).toBeTruthy();

      expect(Number.isFinite(thirdBarCoords.x)).toBeTruthy();
      expect(Number.isFinite(thirdBarCoords.y)).toBeTruthy();
      expect(Number.isFinite(thirdBarCoords.barW)).toBeTruthy();
      expect(Number.isFinite(thirdBarCoords.barH)).toBeTruthy();

      // Specific tests for logarithmic scales
      // The Y coordinates should be calculated using the logarithmic formula
      const expectedFirstBarHeight =
        ((firstBarData.logValue - rangeYLog.min) /
          (rangeYLog.max - rangeYLog.min)) *
        (canvasHeight - yPadding / 2);
      const expectedThirdBarHeight =
        ((thirdBarData.logValue - rangeYLog.min) /
          (rangeYLog.max - rangeYLog.min)) *
        (canvasHeight - yPadding / 2);

      // Allow some tolerance for floating point calculations
      expect(
        Math.abs(firstBarCoords.barH - expectedFirstBarHeight),
      ).toBeLessThan(1);
      expect(
        Math.abs(thirdBarCoords.barH - expectedThirdBarHeight),
      ).toBeLessThan(1);
    });
  });
});
