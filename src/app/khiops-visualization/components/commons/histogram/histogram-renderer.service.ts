/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { format } from 'mathjs';
import { HistogramService } from './histogram.service';
import { HistogramUIService } from './histogram.ui.service';
import { HistogramBarModel } from './histogram.bar.model';
import { HistogramType } from './histogram.type';
import { HistogramValuesI, RangeYLogI } from './histogram.interfaces';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';

/**
 * Service responsible for rendering histogram graphics
 * Handles all drawing operations, canvas management, and D3.js chart rendering
 */
@Injectable({
  providedIn: 'root',
})
export class HistogramRendererService {
  constructor(private histogramService: HistogramService) {}

  /**
   * Initializes canvas contexts for histogram rendering
   */
  public initCanvasContexts(
    histogramCanvas: HTMLCanvasElement | null,
    histogramHoverCanvas: HTMLCanvasElement | null,
    histogramSelectedCanvas: HTMLCanvasElement | null,
    w: number,
    h: number,
  ): {
    ctx?: CanvasRenderingContext2D;
    ctxHover?: CanvasRenderingContext2D;
    ctxSelected?: CanvasRenderingContext2D;
  } {
    const ctx = histogramCanvas
      ? HistogramUIService.initCanvasContext(histogramCanvas, w, h) || undefined
      : undefined;

    const ctxHover = histogramHoverCanvas
      ? HistogramUIService.initCanvasContext(histogramHoverCanvas, w, h) ||
        undefined
      : undefined;

    const ctxSelected = histogramSelectedCanvas
      ? HistogramUIService.initCanvasContext(histogramSelectedCanvas, w, h) ||
        undefined
      : undefined;

    return { ctx, ctxHover, ctxSelected };
  }

  /**
   * Cleans all canvas contexts
   */
  public cleanCanvasContexts(
    ctx?: CanvasRenderingContext2D,
    ctxHover?: CanvasRenderingContext2D,
    ctxSelected?: CanvasRenderingContext2D,
    histogramCanvas?: HTMLCanvasElement | null,
    histogramHoverCanvas?: HTMLCanvasElement | null,
    histogramSelectedCanvas?: HTMLCanvasElement | null,
  ): void {
    if (ctx && histogramCanvas) {
      HistogramUIService.cleanDomContext(ctx, histogramCanvas);
    }
    if (ctxHover && histogramHoverCanvas) {
      HistogramUIService.cleanDomContext(ctxHover, histogramHoverCanvas);
    }
    if (ctxSelected && histogramSelectedCanvas) {
      HistogramUIService.cleanDomContext(ctxSelected, histogramSelectedCanvas);
    }
  }

  /**
   * Creates and configures the main SVG chart container
   */
  public createChart(
    chartElement: any,
    chartW: number,
    h: number,
    yPadding: number,
  ): any {
    // First remove svg if already added to the dom
    d3.select(chartElement).select('svg').remove();

    return d3
      .select(chartElement)
      .append('svg')
      .attr('width', chartW)
      .attr('height', h + yPadding);
  }

  /**
   * Draws a rectangle (histogram bar) on the specified canvas context
   * @param ctx - Canvas rendering context
   * @param d - Histogram data values containing density, frequency, etc.
   * @param i - Index of the current bar
   * @param bar - Histogram bar model with positioning data
   * @param w - Canvas width
   * @param h - Canvas height
   * @param xPadding - Horizontal padding
   * @param yPadding - Vertical padding
   * @param graphOptionsX - X-axis display options (linear/logarithmic)
   * @param graphOptionsY - Y-axis display options (linear/logarithmic)
   * @param rangeYLog - Y-axis logarithmic range data
   * @param ratioY - Y-axis scaling ratio
   * @param ratio - Overall scaling ratio
   * @param minBarHeight - Minimum height for bars to ensure visibility
   * @param defaultBarColor - Default color for bars
   * @param selectedItem - Index of selected item for highlighting
   */
  public drawRect(
    ctx: CanvasRenderingContext2D,
    d: HistogramValuesI,
    i: number,
    bar: HistogramBarModel,
    w: number,
    h: number,
    xPadding: number,
    yPadding: number,
    graphOptionsX: DistributionOptionsI | undefined,
    graphOptionsY: DistributionOptionsI | undefined,
    rangeYLog: RangeYLogI | undefined,
    ratioY: number,
    ratio: number,
    minBarHeight: number,
    defaultBarColor: string,
    selectedItem: number = -1,
  ): void {
    if (!ctx || !bar) return;

    let barX: number, barH: number, barW: number;

    // Calculate bar position and width
    if (graphOptionsX?.selected === HistogramType.XLIN) {
      barX = ((w - 2 * xPadding) / ratio) * bar.barXlin;
      barW = ((w - 2 * xPadding) / ratio) * bar.barWlin;
    } else {
      barX = ((w - 2 * xPadding) / ratio) * bar.barXlog;
      barW = ((w - 2 * xPadding) / ratio) * bar.barWlog;
    }

    // Calculate bar height
    if (graphOptionsY?.selected === HistogramType.YLIN) {
      barH = d.density * ratioY;
      // Prevent bar height from exceeding canvas height to handle very large density values
      const maxBarHeight = h - yPadding / 2;
      if (barH > maxBarHeight) {
        barH = maxBarHeight;
      }
    } else {
      if (d.logValue !== 0) {
        // Logarithmic scale calculation: map logValue to canvas height
        // The range is from rangeYLog.min to rangeYLog.max
        const logRange = (rangeYLog?.max || 0) - (rangeYLog?.min || 0);
        if (logRange > 0) {
          // Calculate relative position in log space (0 to 1)
          const relativePosition =
            (d.logValue - (rangeYLog?.min || 0)) / logRange;
          // Map to canvas height
          barH = relativePosition * (h - yPadding / 2);
        } else {
          barH = 0;
        }

        // Prevent bar height from exceeding canvas bounds in logarithmic scale
        const maxBarHeight = h - yPadding / 2;
        if (barH > maxBarHeight) {
          barH = maxBarHeight;
        }
        if (barH < 0) {
          barH = 0;
        }
      } else {
        barH = 0;
      }
    }

    // Apply minimum bar height
    if (barH !== 0 && barH < minBarHeight) {
      barH = minBarHeight;
    }
    if (graphOptionsY?.selected === HistogramType.YLOG && barH === 0) {
      barH = minBarHeight;
    }

    const x = barX + xPadding + xPadding / 2;
    const y = h - barH;

    // Tooltip issue on histogram #189
    if (barW < 1) {
      barW = 1.5;
    }

    // Keep current coords to bind clicks and tooltip
    d.coords = {
      x: x,
      y: y,
      barW: barW,
      barH: barH,
    };

    // Draw the rectangle
    ctx.fillStyle = UtilsService.hexToRgba(bar.color, 0.8);
    ctx.lineWidth = 0;
    ctx.fillRect(x, y, barW, barH);
    ctx.strokeStyle = selectedItem === i ? defaultBarColor : bar.color;
    ctx.lineWidth = selectedItem === i ? 2 : 1;
    ctx.strokeRect(x, y, barW, barH);
  }

  /**
   * Renders the complete histogram by drawing all bars on the canvas
   * @param datasSet - Array of histogram data values
   * @param ctx - Canvas rendering context (optional)
   * @param w - Canvas width
   * @param h - Canvas height
   * @param xPadding - Horizontal padding
   * @param yPadding - Vertical padding
   * @param graphOptionsX - X-axis display options (linear/logarithmic)
   * @param graphOptionsY - Y-axis display options (linear/logarithmic)
   * @param rangeYLog - Y-axis logarithmic range data
   * @param ratioY - Y-axis scaling ratio
   * @param minBarHeight - Minimum height for bars to ensure visibility
   * @param defaultBarColor - Default color for bars
   * @returns Object containing computed bars array and ratio value
   */
  public drawHistogram(
    datasSet: HistogramValuesI[],
    ctx: CanvasRenderingContext2D | undefined,
    w: number,
    h: number,
    xPadding: number,
    yPadding: number,
    graphOptionsX: DistributionOptionsI | undefined,
    graphOptionsY: DistributionOptionsI | undefined,
    rangeYLog: RangeYLogI | undefined,
    ratioY: number,
    minBarHeight: number,
    defaultBarColor: string,
  ): { bars: HistogramBarModel[]; ratio: number } {
    const bars = this.histogramService.computeXbarsDimensions(
      datasSet,
      graphOptionsX?.selected || HistogramType.XLIN,
    );

    let ratio = 0;
    if (graphOptionsX?.selected === HistogramType.XLIN) {
      const lastBar = bars[bars.length - 1];
      if (lastBar) {
        ratio = lastBar.barXlin + lastBar.barWlin;
      }
    } else {
      const lastBar = bars[bars.length - 1];
      if (lastBar) {
        ratio = lastBar.barXlog + lastBar.barWlog;
      }
    }

    if (ctx) {
      datasSet.forEach((d: HistogramValuesI, i: number) => {
        const bar = bars[i];
        if (bar) {
          this.drawRect(
            ctx,
            d,
            i,
            bar,
            w,
            h,
            xPadding,
            yPadding,
            graphOptionsX,
            graphOptionsY,
            rangeYLog,
            ratioY,
            ratio,
            minBarHeight,
            defaultBarColor,
          );
        }
      });
    }

    return { bars, ratio };
  }

  /**
   * Draws the X axis with proper scaling and ticks
   * @param svg - D3 SVG selection for the chart
   * @param domain - Domain values for the axis scale
   * @param shift - Horizontal shift offset for positioning
   * @param width - Width of the axis
   * @param h - Canvas height
   * @param xPadding - Horizontal padding
   * @param yPadding - Vertical padding
   * @param xTickCount - Number of ticks to display on the axis
   * @param graphOptionsX - X-axis display options (linear/logarithmic)
   */
  public drawXAxis(
    svg: any,
    domain: number[],
    shift: number,
    width: number,
    h: number,
    xPadding: number,
    yPadding: number,
    xTickCount: number | undefined,
    graphOptionsX: DistributionOptionsI | undefined,
  ): void {
    if (width === 0) return;

    let xAxis;
    shift = shift + xPadding;

    if (graphOptionsX?.selected === HistogramType.XLIN) {
      xAxis = d3.scaleLinear().domain(domain).range([0, width]);
    } else {
      xAxis = d3.scaleLog().base(10).domain(domain).range([0, width]);
    }

    //@ts-ignore
    const axis: d3.Axis<d3.NumberValue> = d3
      .axisBottom(xAxis)
      .ticks([xTickCount])
      .tickArguments([xTickCount, '.0e'])
      .tickSize(-h + yPadding / 2);

    if (graphOptionsX?.selected === HistogramType.XLIN) {
      // @ts-ignore
      axis.tickFormat((d: number) => {
        let val: any = d;
        return '' + format(val);
      });
    }

    svg
      .insert('g', ':first-child')
      .attr('class', 'barXlog axis-grid')
      .attr('transform', 'translate(' + (shift + xPadding / 2) + ',' + h + ') ')
      .call(axis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.4em')
      .attr('dy', '1em')
      .attr('transform', 'rotate(-35)');
  }

  /**
   * Draws the Y axis with proper scaling and ticks
   * @param svg - D3 SVG selection for the chart
   * @param h - Canvas height
   * @param w - Canvas width
   * @param xPadding - Horizontal padding
   * @param yPadding - Vertical padding
   * @param yTicksCount - Number of ticks to display on the Y axis
   * @param graphOptionsY - Y-axis display options (linear/logarithmic)
   * @param rangeYLin - Linear range for Y axis
   * @param rangeYLog - Logarithmic range for Y axis
   */
  public drawYAxis(
    svg: any,
    h: number,
    w: number,
    xPadding: number,
    yPadding: number,
    yTicksCount: number,
    graphOptionsY: DistributionOptionsI | undefined,
    rangeYLin: number | undefined,
    rangeYLog: RangeYLogI | undefined,
  ): void {
    let y;

    // Create the scale
    if (graphOptionsY?.selected === HistogramType.YLIN) {
      y = d3
        .scaleLinear()
        .domain([0, rangeYLin || 0])
        .range([h - yPadding / 2, 0]);
    } else {
      y = d3
        .scaleLinear()
        .domain([rangeYLog?.max || 0, rangeYLog?.min || 0])
        .range([0, h - yPadding / 2]);
    }

    let shift = xPadding;
    const tickSize = -(w - xPadding * 2);

    // Draw the axis
    const axis = d3
      .axisLeft(y)
      .tickSize(tickSize)
      .tickPadding(10)
      // @ts-ignore
      .tickFormat((d: number) => {
        let val: number = d;
        if (graphOptionsY?.selected === HistogramType.YLIN) {
          return '' + format(val);
        } else {
          const antiLog = Math.pow(10, val);
          return d3.format('.0e')(antiLog);
        }
      })
      .ticks(yTicksCount);

    svg
      .append('g')
      .attr('class', 'y axis-grid')
      .attr(
        'transform',
        'translate(' + (shift + xPadding / 2) + ',' + yPadding / 2 + ')',
      )
      .call(axis, 0);
  }
}
