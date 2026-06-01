/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { HistogramRendererService } from '../../app/khiops-visualization/components/commons/histogram/histogram-renderer.service';
import { HistogramService } from '../../app/khiops-visualization/components/commons/histogram/histogram.service';
import { HistogramBarModel } from '../../app/khiops-visualization/components/commons/histogram/histogram.bar.model';
import { HistogramType } from '../../app/khiops-visualization/components/commons/histogram/histogram.type';
import { HistogramValuesI, RangeYLogI } from '../../app/khiops-visualization/components/commons/histogram/histogram.interfaces';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options.interface';

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

function makeBar(overrides: Partial<HistogramBarModel> = {}): HistogramBarModel {
  const bar = {
    barWlog: 1,
    barXlog: 0,
    barWlin: 10,
    barXlin: 0,
    color: '#ffbe46',
    computeXLog: jasmine.createSpy('computeXLog'),
    computeXLin: jasmine.createSpy('computeXLin'),
    ...overrides,
  } as any;
  return bar;
}

describe('HistogramRendererService', () => {
  let service: HistogramRendererService;
  let histogramServiceMock: jasmine.SpyObj<HistogramService>;

  beforeEach(() => {
    histogramServiceMock = jasmine.createSpyObj('HistogramService', [
      'computeXbarsDimensions',
    ]);

    TestBed.configureTestingModule({
      providers: [
        HistogramRendererService,
        { provide: HistogramService, useValue: histogramServiceMock },
      ],
    });
    service = TestBed.inject(HistogramRendererService);
  });

  // --- initCanvasContexts ---

  it('should return contexts for all three canvases', () => {
    const c1 = document.createElement('canvas');
    const c2 = document.createElement('canvas');
    const c3 = document.createElement('canvas');
    const result = service.initCanvasContexts(c1, c2, c3, 400, 300);
    expect(c1.width).toBe(400);
    expect(c1.height).toBe(300);
    expect(result.ctx).not.toBeNull();
    expect(result.ctxHover).not.toBeNull();
    expect(result.ctxSelected).not.toBeNull();
  });

  it('should return undefined contexts when canvases are null', () => {
    const result = service.initCanvasContexts(null, null, null, 400, 300);
    expect(result.ctx).toBeUndefined();
    expect(result.ctxHover).toBeUndefined();
    expect(result.ctxSelected).toBeUndefined();
  });

  // --- cleanCanvasContexts ---

  it('should clean all provided canvas contexts without error', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillRect(0, 0, 100, 100);

    service.cleanCanvasContexts(ctx, undefined, undefined, canvas, null, null);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    expect(data[3]).toBe(0); // alpha = 0 means cleared
  });

  it('should skip cleaning when ctx is undefined', () => {
    // Should not throw
    service.cleanCanvasContexts(
      undefined,
      undefined,
      undefined,
      null,
      null,
      null,
    );
    expect(true).toBe(true);
  });

  // --- drawRect ---

  it('should return undefined when ctx is falsy', () => {
    const d = makeHistogramValue();
    const bar = makeBar();
    const result = service.drawRect(
      null as any,
      d,
      0,
      bar,
      400,
      300,
      40,
      50,
      { types: [], selected: HistogramType.XLIN },
      { types: [], selected: HistogramType.YLIN },
      undefined,
      1,
      100,
      4,
      'black',
    );
    expect(result).toBeUndefined();
  });

  it('should return undefined when bar is falsy', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const d = makeHistogramValue();
    const result = service.drawRect(
      ctx,
      d,
      0,
      null as any,
      400,
      300,
      40,
      50,
      undefined,
      undefined,
      undefined,
      1,
      100,
      4,
      'black',
    );
    expect(result).toBeUndefined();
  });

  it('should draw bar and return data with coords for XLIN/YLIN', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const d = makeHistogramValue({ density: 0.05 });
    const bar = makeBar({ barXlin: 0, barWlin: 10 });
    const graphOptionsX: DistributionOptionsI = {
      types: [HistogramType.XLIN],
      selected: HistogramType.XLIN,
    };
    const graphOptionsY: DistributionOptionsI = {
      types: [HistogramType.YLIN],
      selected: HistogramType.YLIN,
    };
    const result = service.drawRect(
      ctx,
      d,
      0,
      bar,
      400,
      300,
      40,
      50,
      graphOptionsX,
      graphOptionsY,
      undefined,
      100,
      100,
      4,
      'black',
    );
    expect(result).toBe(d);
    expect(d.coords!.barW).toBeGreaterThan(0);
    expect(d.coords!.barH).toBeGreaterThan(0);
  });

  it('should use barXlog/barWlog for XLOG option', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const d = makeHistogramValue({ density: 0.1 });
    const bar = makeBar({ barXlog: 5, barWlog: 3 });
    const graphOptionsX: DistributionOptionsI = {
      types: [HistogramType.XLOG],
      selected: HistogramType.XLOG,
    };
    const graphOptionsY: DistributionOptionsI = {
      types: [HistogramType.YLIN],
      selected: HistogramType.YLIN,
    };
    const result = service.drawRect(
      ctx,
      d,
      0,
      bar,
      400,
      300,
      40,
      50,
      graphOptionsX,
      graphOptionsY,
      undefined,
      100,
      10,
      4,
      'black',
    );
    expect(result).toBe(d);
    // barX uses barXlog path
    expect(d.coords!.x).toBeGreaterThan(0);
  });

  it('should compute barH via log scale for YLOG with non-zero logValue', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const d = makeHistogramValue({ logValue: -1.5 });
    const bar = makeBar();
    const rangeYLog: RangeYLogI = { min: -3, max: 0 };
    const graphOptionsX: DistributionOptionsI = {
      types: [],
      selected: HistogramType.XLIN,
    };
    const graphOptionsY: DistributionOptionsI = {
      types: [],
      selected: HistogramType.YLOG,
    };
    const result = service.drawRect(
      ctx,
      d,
      0,
      bar,
      400,
      300,
      40,
      50,
      graphOptionsX,
      graphOptionsY,
      rangeYLog,
      1,
      100,
      4,
      'black',
    );
    expect(result).toBe(d);
    // logValue=-1.5, range=3, relative=0.5, barH=0.5*(300-25)=137.5
    expect(d.coords!.barH).toBeCloseTo(137.5, 0);
  });

  it('should set barH to 0 for YLOG with logValue 0', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const d = makeHistogramValue({ logValue: 0 });
    const bar = makeBar();
    const graphOptionsY: DistributionOptionsI = {
      types: [],
      selected: HistogramType.YLOG,
    };
    service.drawRect(
      ctx,
      d,
      0,
      bar,
      400,
      300,
      40,
      50,
      { types: [], selected: HistogramType.XLIN },
      graphOptionsY,
      { min: -3, max: 0 },
      1,
      100,
      4,
      'black',
    );
    // logValue=0 => barH=0, then YLOG forces barH = minBarHeight=4
    expect(d.coords!.barH).toBe(4);
  });

  it('should enforce minimum bar width of 1.5 for very narrow bars', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const d = makeHistogramValue({ density: 0.1 });
    // barWlin extremely small => barW < 1
    const bar = makeBar({ barWlin: 0.001 });
    service.drawRect(
      ctx,
      d,
      0,
      bar,
      400,
      300,
      40,
      50,
      { types: [], selected: HistogramType.XLIN },
      { types: [], selected: HistogramType.YLIN },
      undefined,
      100,
      100,
      4,
      'black',
    );
    expect(d.coords!.barW).toBe(1.5);
  });

  // --- drawHistogram ---

  it('should return bars and ratio without ctx (no drawing)', () => {
    const datas = [
      makeHistogramValue({ partition: [0, 10] }),
      makeHistogramValue({ partition: [10, 20] }),
    ];
    const bar1 = makeBar({ barXlin: 0, barWlin: 10 });
    const bar2 = makeBar({ barXlin: 10, barWlin: 10 });
    histogramServiceMock.computeXbarsDimensions.and.returnValue([bar1, bar2]);

    const result = service.drawHistogram(
      datas,
      undefined,
      400,
      300,
      40,
      50,
      { types: [], selected: HistogramType.XLIN },
      { types: [], selected: HistogramType.YLIN },
      undefined,
      100,
      4,
      'black',
    );
    expect(result.bars.length).toBe(2);
    expect(result.ratio).toBe(20); // bar2.barXlin + bar2.barWlin
  });

  it('should compute ratio using barXlog/barWlog for XLOG', () => {
    const datas = [makeHistogramValue()];
    const bar = makeBar({ barXlog: 2, barWlog: 3 });
    histogramServiceMock.computeXbarsDimensions.and.returnValue([bar]);

    const result = service.drawHistogram(
      datas,
      undefined,
      400,
      300,
      40,
      50,
      { types: [], selected: HistogramType.XLOG },
      { types: [], selected: HistogramType.YLIN },
      undefined,
      100,
      4,
      'black',
    );
    expect(result.ratio).toBe(5);
  });

  it('should draw bars on ctx when provided', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const datas = [makeHistogramValue({ density: 0.05 })];
    const bar = makeBar({ barXlin: 0, barWlin: 10 });
    histogramServiceMock.computeXbarsDimensions.and.returnValue([bar]);

    const result = service.drawHistogram(
      datas,
      ctx,
      400,
      300,
      40,
      50,
      { types: [], selected: HistogramType.XLIN },
      { types: [], selected: HistogramType.YLIN },
      undefined,
      100,
      4,
      'black',
    );
    expect(result.bars.length).toBe(1);
    // Coords should be set after drawing
    expect(datas[0]!.coords!.x).toBeGreaterThanOrEqual(0);
  });

  it('should return ratio 0 for empty dataset', () => {
    histogramServiceMock.computeXbarsDimensions.and.returnValue([]);
    const result = service.drawHistogram(
      [],
      undefined,
      400,
      300,
      40,
      50,
      { types: [], selected: HistogramType.XLIN },
      undefined,
      undefined,
      100,
      4,
      'black',
    );
    expect(result.bars.length).toBe(0);
    expect(result.ratio).toBe(0);
  });

  // --- drawXAxis ---

  it('should not throw for width 0', () => {
    service.drawXAxis(null, [0, 10], 0, 0, 300, 40, 50, 5, {
      types: [],
      selected: HistogramType.XLIN,
    });
    // width === 0 => early return, no error
    expect(true).toBe(true);
  });

  // --- drawYAxis ---

  it('should draw Y axis with YLIN without error', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    // Create svg via service.createChart to get proper d3 selection
    const svg = service.createChart(div, 400, 300, 50);
    service.drawYAxis(
      svg,
      300,
      400,
      40,
      50,
      6,
      { types: [], selected: HistogramType.YLIN },
      0.1,
      undefined,
    );
    const yAxis = div.querySelector('.y.axis-grid');
    expect(yAxis).not.toBeNull();
    document.body.removeChild(div);
  });

  // --- createChart ---

  it('should create an SVG element with correct dimensions', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    service.createChart(div, 500, 400, 50);
    const svg = div.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('width')).toBe('500');
    expect(svg!.getAttribute('height')).toBe('450');
    document.body.removeChild(div);
  });

  it('should remove previous SVG before creating a new one', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    service.createChart(div, 500, 400, 50);
    service.createChart(div, 600, 500, 60);
    const svgs = div.querySelectorAll('svg');
    expect(svgs.length).toBe(1);
    expect(svgs[0]!.getAttribute('width')).toBe('600');
    document.body.removeChild(div);
  });
});
