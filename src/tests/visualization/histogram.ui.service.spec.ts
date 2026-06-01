/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { HistogramUIService } from '../../app/khiops-visualization/components/commons/histogram/histogram.ui.service';
import { HistogramValuesI } from '../../app/khiops-visualization/components/commons/histogram/histogram.interfaces';
import { AppService } from '@khiops-visualization/providers/app.service';

function makeHistogramValue(
  overrides: Partial<HistogramValuesI> = {},
): HistogramValuesI {
  return {
    frequency: 100,
    logValue: 2,
    partition: [0, 10],
    density: 0.05,
    probability: 0.25,
    ...overrides,
  };
}

describe('HistogramUIService', () => {
  // --- getColor ---

  it('should return the first color at index 0', () => {
    const color = HistogramUIService.getColor(0);
    expect(color).toBe('#6e93d5');
  });

  it('should return the second color at index 1', () => {
    const color = HistogramUIService.getColor(1);
    expect(color).toBe('#ffbe46');
  });

  it('should return empty string for out-of-range index', () => {
    const color = HistogramUIService.getColor(999);
    expect(color).toBe('');
  });

  // --- getColors ---

  it('should return an array with exactly 2 histogram colors', () => {
    const colors = HistogramUIService.getColors();
    expect(colors.length).toBe(2);
    expect(colors[0]).toBe('#6e93d5');
    expect(colors[1]).toBe('#ffbe46');
  });

  // --- getCurrentBarPosition ---

  it('should return the index when mouse is inside a bar', () => {
    const datas: HistogramValuesI[] = [
      makeHistogramValue({ coords: { x: 50, y: 100, barW: 30, barH: 80 } }),
      makeHistogramValue({ coords: { x: 100, y: 80, barW: 40, barH: 100 } }),
    ];
    const canvasPosition = { left: 0, top: 0 } as DOMRect;
    const event = { pageX: 110, pageY: 90 } as MouseEvent;
    const result = HistogramUIService.getCurrentBarPosition(
      datas,
      20,
      canvasPosition,
      event,
    );
    expect(result).toBe(1);
  });

  it('should return undefined when mouse is outside all bars', () => {
    const datas: HistogramValuesI[] = [
      makeHistogramValue({ coords: { x: 50, y: 100, barW: 30, barH: 80 } }),
    ];
    const canvasPosition = { left: 0, top: 0 } as DOMRect;
    const event = { pageX: 200, pageY: 200 } as MouseEvent;
    const result = HistogramUIService.getCurrentBarPosition(
      datas,
      20,
      canvasPosition,
      event,
    );
    expect(result).toBeUndefined();
  });

  it('should return undefined when datas is null', () => {
    const canvasPosition = { left: 0, top: 0 } as DOMRect;
    const event = { pageX: 10, pageY: 10 } as MouseEvent;
    const result = HistogramUIService.getCurrentBarPosition(
      null as any,
      20,
      canvasPosition,
      event,
    );
    expect(result).toBeUndefined();
  });

  it('should return the first matching bar index', () => {
    const datas: HistogramValuesI[] = [
      makeHistogramValue({ coords: { x: 10, y: 10, barW: 50, barH: 50 } }),
      makeHistogramValue({ coords: { x: 10, y: 10, barW: 50, barH: 50 } }),
    ];
    const canvasPosition = { left: 0, top: 0 } as DOMRect;
    const event = { pageX: 30, pageY: 30 } as MouseEvent;
    const result = HistogramUIService.getCurrentBarPosition(
      datas,
      20,
      canvasPosition,
      event,
    );
    expect(result).toBe(0);
  });

  it('should account for canvasPosition offset', () => {
    const datas: HistogramValuesI[] = [
      makeHistogramValue({ coords: { x: 50, y: 100, barW: 30, barH: 80 } }),
    ];
    const canvasPosition = { left: 100, top: 50 } as DOMRect;
    // Mouse at (160, 160) minus canvas offset (100, 50) = (60, 110) which is inside bar
    const event = { pageX: 160, pageY: 160 } as MouseEvent;
    const result = HistogramUIService.getCurrentBarPosition(
      datas,
      20,
      canvasPosition,
      event,
    );
    expect(result).toBe(0);
  });

  // --- generateTooltip ---

  it('should generate tooltip with bracket [ for first interval', () => {
    AppService.translate = { get: (k: string) => k } as any;
    AppService.Ls = { get: () => 4 } as any;

    const d = makeHistogramValue({ partition: [0, 10], density: 0.05, probability: 0.25, frequency: 100 });
    const result = HistogramUIService.generateTooltip(d, true);
    expect(result.title).toContain('[0, 10]');
    expect(result.title).toContain('GLOBAL.INTERVAL');
  });

  it('should generate tooltip with bracket ] for non-first interval', () => {
    AppService.translate = { get: (k: string) => k } as any;
    AppService.Ls = { get: () => 4 } as any;

    const d = makeHistogramValue({ partition: [10, 20] });
    const result = HistogramUIService.generateTooltip(d, false);
    expect(result.title).toContain(']10, 20]');
  });

  it('should include density, probability, and frequency in body', () => {
    AppService.translate = { get: (k: string) => k } as any;
    AppService.Ls = { get: () => 4 } as any;

    const d = makeHistogramValue({ density: 0.123, probability: 0.456, frequency: 789 });
    const result = HistogramUIService.generateTooltip(d, true);
    expect(result.body).toContain('GLOBAL.DENSITY');
    expect(result.body).toContain('GLOBAL.PROBABILITY');
    expect(result.body).toContain('GLOBAL.FREQUENCY');
  });

  // --- initCanvasContext ---

  it('should set canvas width and height and return context', () => {
    const canvas = document.createElement('canvas');
    const ctx = HistogramUIService.initCanvasContext(canvas, 400, 300);
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(300);
    expect(ctx).not.toBeNull();
  });

  // --- cleanDomContext ---

  it('should clear the canvas without throwing', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    // Draw something first
    ctx.fillRect(0, 0, 200, 100);
    HistogramUIService.cleanDomContext(ctx, canvas);
    // After clearing, getImageData should be all zeros
    const data = ctx.getImageData(0, 0, 1, 1).data;
    expect(data[0]).toBe(0);
    expect(data[1]).toBe(0);
    expect(data[2]).toBe(0);
    expect(data[3]).toBe(0);
  });

  it('should handle null ctx by getting context from canvas', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    // Should not throw
    HistogramUIService.cleanDomContext(null, canvas);
    expect(true).toBe(true); // no error thrown
  });
});
