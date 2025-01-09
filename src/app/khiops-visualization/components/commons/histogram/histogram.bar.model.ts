/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { HistogramUIService } from './histogram.ui.service';
import { HistogramValuesI } from './histogram.interfaces';
import { HistogramType } from './histogram.type';

export class HistogramBarModel {
  public barWlog: number = 0;
  public barXlog: number = 0;
  public barWlin: number = 0;
  public barXlin: number = 0;
  public color: string = HistogramUIService.getColor(1);
  private partition?: number[] = [];

  constructor(d: HistogramValuesI, middlewidth: number, xType: string) {
    this.partition = d.partition;
    if (xType === HistogramType.XLIN) {
      let barWlin = 0;
      if (this.partition[0]! < 0 && this.partition[1]! > 0) {
        barWlin = Math.abs(this.partition[0]!) + Math.abs(this.partition[1]!);
      } else {
        barWlin = Math.abs(this.partition[0]!) - Math.abs(this.partition[1]!);
      }
      this.barWlin = Math.abs(barWlin);
    } else {
      let barWlog = 0;
      if (d.partition[0] === 0 || d.partition[1] === 0) {
        barWlog = Math.log10(middlewidth);
        this.color = HistogramUIService.getColor(0);
      } else {
        barWlog =
          Math.log10(Math.abs(this.partition[0]!)) -
          Math.log10(Math.abs(this.partition[1]!));

        if (this.partition[0]! < 0 && this.partition[1]! > 0) {
          barWlog = Math.log10(middlewidth) * 2;
          this.color = HistogramUIService.getColor(0);
        }
      }
      this.barWlog = Math.abs(barWlog);
    }
  }

  public computeXLog(bars: HistogramBarModel[]) {
    let sum = bars.reduce(
      (partialSum: number, a: HistogramBarModel) =>
        Math.abs(partialSum) + Math.abs(a.barWlog),
      0,
    );
    this.barXlog = sum || 0;
  }

  public computeXLin(bars: HistogramBarModel[]) {
    let sum = bars.reduce(
      (partialSum: number, a: HistogramBarModel) =>
        Math.abs(partialSum) + Math.abs(a.barWlin),
      0,
    );
    this.barXlin = sum || 0;
  }
}
