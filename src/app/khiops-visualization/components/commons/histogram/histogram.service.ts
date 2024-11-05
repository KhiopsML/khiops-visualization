import { Injectable } from '@angular/core';
import { HistogramBarModel } from './histogram.bar.model';
import { HistogramType } from './histogram.type';
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
  private rangeXLin: RangeXLinI = {};
  private rangeYLin: number = 0;
  private rangeYLog: RangeYLogI = {
    min: 0,
    max: 0,
  };
  private rangeXLog: RangeXLogI = {};

  getRangeX(datas: HistogramValuesI[]): [RangeXLinI, RangeXLogI] {
    this.rangeXLog.inf = datas.find(function (d: HistogramValuesI) {
      return d.partition[0] === 0 || d.partition[1] === 0;
    });

    this.rangeXLog.min = datas[0]?.partition[0];
    this.rangeXLog.negValuesCount = datas.filter(function (
      d: HistogramValuesI,
    ) {
      return d.partition[1]! < 0;
    })?.length;
    this.rangeXLog.posValuesCount = datas.filter(function (
      d: HistogramValuesI,
    ) {
      return d.partition[1]! > 0;
    })?.length;
    if (this.rangeXLog.inf) {
      // 0 exist
      this.rangeXLog.negStart =
        // @ts-ignore update it with es2023
        datas.findLast(function (d: HistogramValuesI) {
          return d.partition[0]! < 0 && d.partition[1]! <= 0;
        })?.partition[0] || undefined;
      this.rangeXLog.posStart =
        datas.find(function (d: HistogramValuesI) {
          return d.partition[0]! > 0 && d.partition[1]! > 0;
        })?.partition[0] || undefined;
    } else {
      this.rangeXLog.negStart =
        // @ts-ignore update it with es2023
        datas.findLast(function (d: HistogramValuesI) {
          return d.partition[0]! < 0 && d.partition[1]! <= 0;
        })?.partition[1] || undefined;
      this.rangeXLog.posStart =
        datas.find(function (d: HistogramValuesI) {
          return d.partition[0]! > 0 && d.partition[1]! > 0;
        })?.partition[0] || undefined;
    }

    this.rangeXLog.max = datas[datas.length - 1]?.partition[1];

    this.rangeXLog.middlewidth = 1.2;

    this.rangeXLin.min = datas[0]?.partition[0];
    this.rangeXLin.max = datas[datas.length - 1]?.partition[1];

    return [this.rangeXLin, this.rangeXLog];
  }

  getLinRangeY(datas: HistogramValuesI[]): number {
    const dataValues = datas.map((d: HistogramValuesI) => d.value);
    this.rangeYLin = Math.max(...dataValues);
    return this.rangeYLin;
  }

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

  getLinRatioY(h: number, padding: number): number {
    let ratioY = (h - padding / 2) / this.rangeYLin;
    return ratioY;
  }

  getLogRatioY(h: number, padding: number): number {
    let ratioY;
    let shift = Math.abs(this.rangeYLog.min!) - Math.abs(this.rangeYLog.max!);
    ratioY = (h - padding / 2) / shift;
    return ratioY;
  }

  computeXbarsDimensions(
    datas: HistogramValuesI[],
    xType: string,
  ): HistogramBarModel[] {
    let bars: HistogramBarModel[] = [];

    datas.forEach((d: HistogramValuesI, i: number) => {
      let histogramBar = new HistogramBarModel(
        d,
        this.rangeXLog.middlewidth!,
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
