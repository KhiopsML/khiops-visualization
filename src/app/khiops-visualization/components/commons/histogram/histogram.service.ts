/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { HistogramBarModel } from './histogram.bar.model';
import { HistogramType } from './histogram.type';
import {
  HistogramValuesI,
  RangeXLinI,
  RangeXLogI,
  RangeYLogI,
} from './histogram.interfaces';
const MIDDLE_WIDTH = 1.2;

@Injectable({
  providedIn: 'root',
})
export class HistogramService {
  private rangeXLin: RangeXLinI = {};
  private rangeYLin: number = 0;
  private rangeYLog: RangeYLogI = {
    min: 0,
    max: 0,
  };
  private rangeXLog: RangeXLogI = {};

  /**
   * Get the range for the X axis (linear and logarithmic)
   * @param datas Histogram values data
   * @returns Tuple containing linear and logarithmic ranges for X axis
   */
  getRangeX(datas: HistogramValuesI[]): [RangeXLinI, RangeXLogI] {
    this.rangeXLog.inf = datas.find(function (d: HistogramValuesI) {
      return d.partition[0] === 0 || d.partition[1] === 0;
    });

    this.rangeXLog.min = datas[0]?.partition[0];
    this.rangeXLog.negValuesCount = datas.filter(function (
      d: HistogramValuesI,
    ) {
      return d.partition[1] !== undefined && d.partition[1] < 0;
    })?.length;
    this.rangeXLog.posValuesCount = datas.filter(function (
      d: HistogramValuesI,
    ) {
      return d.partition[1] !== undefined && d.partition[1] > 0;
    })?.length;
    if (this.rangeXLog.inf) {
      // 0 exist
      this.rangeXLog.negStart =
        // @ts-ignore update it with es2023
        datas.findLast(function (d: HistogramValuesI) {
          return (
            d.partition[0] !== undefined &&
            d.partition[1] !== undefined &&
            d.partition[0] < 0 &&
            d.partition[1] <= 0
          );
        })?.partition[0] || undefined;
      this.rangeXLog.posStart =
        datas.find(function (d: HistogramValuesI) {
          return (
            d.partition[0] !== undefined &&
            d.partition[1] !== undefined &&
            d.partition[0] > 0 &&
            d.partition[1] > 0
          );
        })?.partition[0] || undefined;
    } else {
      this.rangeXLog.negStart =
        // @ts-ignore update it with es2023
        datas.findLast(function (d: HistogramValuesI) {
          return (
            d.partition[0] !== undefined &&
            d.partition[1] !== undefined &&
            d.partition[0] < 0 &&
            d.partition[1] <= 0
          );
        })?.partition[1] || undefined;
      this.rangeXLog.posStart =
        datas.find(function (d: HistogramValuesI) {
          return (
            d.partition[0] !== undefined &&
            d.partition[1] !== undefined &&
            d.partition[0] > 0 &&
            d.partition[1] > 0
          );
        })?.partition[0] || undefined;
    }

    this.rangeXLog.max = datas[datas.length - 1]?.partition[1];

    this.rangeXLog.middlewidth = MIDDLE_WIDTH;

    this.rangeXLin.min = datas[0]?.partition[0];
    this.rangeXLin.max = datas[datas.length - 1]?.partition[1];

    return [this.rangeXLin, this.rangeXLog];
  }

  /**
   * Get the linear range for Y axis
   * @param datas Histogram values data
   * @returns Linear range for Y axis
   */
  getLinRangeY(datas: HistogramValuesI[]): number {
    const dataValues = datas.map((d: HistogramValuesI) => d.density);
    this.rangeYLin = Math.max(...dataValues);
    return this.rangeYLin;
  }

  /**
   * Get the logarithmic range for Y axis
   * @param datas Histogram values data
   * @returns Logarithmic range for Y axis
   */
  getLogRangeY(datas: HistogramValuesI[]): RangeXLinI {
    const dataValues = datas.map((e) => e.logValue).filter((e) => e !== 0);

    // Numerical histogram Ylog broken when only one data #194
    this.rangeYLog.max = Math.max(...dataValues);
    if (dataValues.length === 1) {
      this.rangeYLog.min = 0;
    } else {
      this.rangeYLog.min = Math.min(...dataValues);
    }

    return this.rangeYLog;
  }

  /**
   * Get the linear ratio for Y axis
   * @param h Height of the canvas
   * @param padding Padding for Y axis
   * @returns Linear ratio for Y axis
   */
  getLinRatioY(h: number, padding: number): number {
    let ratioY = (h - padding / 2) / this.rangeYLin;
    return ratioY;
  }

  /**
   * Get the logarithmic ratio for Y axis
   * @param h Height of the canvas
   * @param padding Padding for Y axis
   * @returns Logarithmic ratio for Y axis
   */
  getLogRatioY(h: number, padding: number): number {
    let ratioY;
    let shift =
      Math.abs(this.rangeYLog.min || 0) - Math.abs(this.rangeYLog.max || 0);
    ratioY = (h - padding / 2) / shift;
    return ratioY;
  }

  /**
   * Compute the dimensions of the X bars
   * @param datas Histogram values data
   * @param xType Type of X axis (linear or logarithmic)
   * @returns Array of HistogramBarModel containing the computed dimensions
   */
  computeXbarsDimensions(
    datas: HistogramValuesI[],
    xType: string,
  ): HistogramBarModel[] {
    let bars: HistogramBarModel[] = [];

    datas.forEach((d: HistogramValuesI, _i: number) => {
      let histogramBar = new HistogramBarModel(
        d,
        this.rangeXLog.middlewidth || MIDDLE_WIDTH,
        xType,
      );
      if (xType === HistogramType.XLIN) {
        histogramBar.computeXLin(bars);
      } else {
        histogramBar.computeXLog(bars);
      }
      bars.push(histogramBar);
    });
    return bars;
  }
}
