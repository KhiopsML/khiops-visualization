import { Injectable } from '@angular/core';
import { HistogramBarVO } from './histogram.bar-vo';
import { HistogramType } from './histogram.types';
import {
  HistogramValuesI,
  RangeXLinI,
  RangeXLogI,
  RangeYLogI,
} from './histogram.interfaces';

@Injectable({
  providedIn: 'root',
})
export class HistogramService {
  rangeXLin: RangeXLinI = {};
  rangeYLin: number = 0;
  rangeYLog: RangeYLogI = {
    min: 0,
    max: 0,
  };
  rangeXLog: RangeXLogI = {};

  constructor() {}

  getRangeX(datas: HistogramValuesI[]): [RangeXLinI, RangeXLogI] {
    this.rangeXLog.inf = datas.find(function (d: HistogramValuesI) {
      return d.partition[0] === 0 || d.partition[1] === 0;
    });

    this.rangeXLog.min = datas[0].partition[0];
    this.rangeXLog.negValuesCount = datas.filter(function (
      d: HistogramValuesI,
    ) {
      return d.partition[1] < 0;
    })?.length;
    this.rangeXLog.posValuesCount = datas.filter(function (
      d: HistogramValuesI,
    ) {
      return d.partition[1] > 0;
    })?.length;
    if (this.rangeXLog.inf) {
      // 0 exist
      this.rangeXLog.negStart =
        // @ts-ignore update it with es2023
        datas.findLast(function (d: HistogramValuesI) {
          return d.partition[0] < 0 && d.partition[1] <= 0;
        })?.partition[0] || undefined;
      this.rangeXLog.posStart =
        datas.find(function (d: HistogramValuesI) {
          return d.partition[0] > 0 && d.partition[1] > 0;
        })?.partition[0] || undefined;
    } else {
      this.rangeXLog.negStart =
        // @ts-ignore update it with es2023
        datas.findLast(function (d: HistogramValuesI) {
          return d.partition[0] < 0 && d.partition[1] <= 0;
        })?.partition[1] || undefined;
      this.rangeXLog.posStart =
        datas.find(function (d: HistogramValuesI) {
          return d.partition[0] > 0 && d.partition[1] > 0;
        })?.partition[0] || undefined;
    }

    this.rangeXLog.max = datas[datas.length - 1].partition[1];

    this.rangeXLog.middlewidth = 1.2;

    this.rangeXLin.min = datas[0].partition[0];
    this.rangeXLin.max = datas[datas.length - 1].partition[1];

    return [this.rangeXLin, this.rangeXLog];
  }

  getLinRangeY(datas: HistogramValuesI[]): number {
    const dataValues = datas.map((d: HistogramValuesI) => d.value);
    this.rangeYLin = Math.max(...dataValues);
    return this.rangeYLin;
  }

  getLogRangeY(datas: HistogramValuesI[]): RangeXLinI {
    const dataValues = datas.map((e) => e.logValue).filter((e) => e !== 0);
    this.rangeYLog.max = Math.max(...dataValues);
    this.rangeYLog.min = Math.min(...dataValues);

    return this.rangeYLog;
  }

  getLinRatioY(h: number, padding: number): number {
    let ratioY = (h - padding / 2) / this.rangeYLin;
    return ratioY;
  }

  getLogRatioY(h: number, padding: number): number {
    let ratioY;
    let shift = Math.abs(this.rangeYLog.min) - Math.abs(this.rangeYLog.max);
    ratioY = (h - padding / 2) / shift;
    return ratioY;
  }

  computeXbarDimensions(
    datas: HistogramValuesI[],
    xType: string,
  ): HistogramBarVO[] {
    let bars: HistogramBarVO[] = [];

    datas.forEach((d: HistogramValuesI, i: number) => {
      let histogramBar = new HistogramBarVO(
        d,
        this.rangeXLog.middlewidth,
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
