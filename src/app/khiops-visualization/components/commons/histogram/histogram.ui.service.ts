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

  static getColor(i: number): string {
    return this.chartColors[i] || '';
  }

  static getColors(): string[] {
    return this.chartColors;
  }

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
        if (
          y > datas?.[i]?.coords?.y! &&
          y <
            datas?.[i]?.coords?.y! + datas?.[i]?.coords?.barH! + yPadding / 2 &&
          x > datas?.[i]?.coords?.x! &&
          x < datas?.[i]?.coords?.x! + datas?.[i]?.coords?.barW!
        ) {
          return i;
        }
      }
    }

    return undefined;
  }

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

  static initCanvasContext(canvas: HTMLCanvasElement, w: number, h: number) {
    const ctx = canvas.getContext('2d');
    ctx!.imageSmoothingEnabled = true;
    canvas.width = w;
    canvas.height = h;
    return ctx;
  }

  /**
   * Before draw canvas, clean dom
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
