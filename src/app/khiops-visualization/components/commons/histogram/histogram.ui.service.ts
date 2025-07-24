/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { HistogramValuesI } from './histogram.interfaces';
import { HISTOGRAM_COLORS } from '@khiops-visualization/config/colors';
import { AppService } from '@khiops-visualization/providers/app.service';

@Injectable({
  providedIn: 'root',
})
export class HistogramUIService {
  static readonly chartColors: string[] = HISTOGRAM_COLORS;

  /**
   * Gets a color from the chart color palette by index
   * @param i - Index of the color to retrieve
   * @returns Color string from the chart colors array
   */
  static getColor(i: number): string {
    return this.chartColors[i] || '';
  }

  /**
   * Gets the complete chart color palette
   * @returns Array of color strings used for chart styling
   */
  static getColors(): string[] {
    return this.chartColors;
  }

  /**
   * Determines which histogram bar is at the current mouse position
   * @param datas - Array of histogram data values
   * @param yPadding - Vertical padding for the chart
   * @param canvasPosition - DOM rectangle of the canvas element
   * @param event - Mouse event containing cursor coordinates
   * @returns Index of the bar at the mouse position, or undefined if none
   */
  // @ts-ignore
  static getCurrentBarPosition(
    datas: HistogramValuesI[],
    yPadding: number,
    canvasPosition: DOMRect,
    event: MouseEvent,
  ) {
    if (datas) {
      let x = event.pageX - canvasPosition.left;
      let y = event.pageY - canvasPosition.top;

      for (let i = 0; i < datas.length; i++) {
        const coords = datas?.[i]?.coords;
        if (
          coords &&
          typeof coords.y === 'number' &&
          typeof coords.barH === 'number' &&
          typeof coords.x === 'number' &&
          typeof coords.barW === 'number' &&
          y > coords.y &&
          y < coords.y + coords.barH + yPadding / 2 &&
          x > coords.x &&
          x < coords.x + coords.barW
        ) {
          return i;
        }
      }
    }

    return undefined;
  }

  /**
   * Generates tooltip text for a histogram bar
   * @param d - Histogram data values for the bar
   * @param isFirstInterval - Whether this is the first interval in the histogram
   * @returns Formatted HTML string for the tooltip
   */
  static generateTooltip(
    d: HistogramValuesI,
    isFirstInterval: boolean,
  ): string {
    let bounds = '';
    if (isFirstInterval) {
      bounds += '[';
    } else {
      bounds += ']';
    }
    bounds += d.partition[0] + ', ' + d.partition[1] + ']';

    return (
      AppService.translate.get('GLOBAL.DENSITY') +
      ': ' +
      d3.format('.2e')(d.density) +
      '<br>' +
      AppService.translate.get('GLOBAL.PROBABILITY') +
      ': ' +
      d3.format('.2e')(d.probability) +
      '<br>' +
      AppService.translate.get('GLOBAL.FREQUENCY') +
      ': ' +
      d.frequency +
      '<br>' +
      AppService.translate.get('GLOBAL.INTERVAL') +
      ': ' +
      bounds
    );
  }

  /**
   * Initializes a canvas context with the specified dimensions
   * @param canvas - HTMLCanvasElement to initialize
   * @param w - Width to set for the canvas
   * @param h - Height to set for the canvas
   * @returns 2D rendering context or null if initialization failed
   */
  static initCanvasContext(canvas: HTMLCanvasElement, w: number, h: number) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
    }
    canvas.width = w;
    canvas.height = h;
    return ctx;
  }

  /**
   * Clears the canvas before drawing new content
   * @param ctx - Canvas rendering context to clear
   * @param canvas - HTMLCanvasElement to clear
   */
  static cleanDomContext(
    ctx: CanvasRenderingContext2D | null,
    canvas: HTMLCanvasElement,
  ) {
    if (canvas) {
      ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}
