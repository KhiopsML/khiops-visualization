// @ts-nocheck
/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

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
});
