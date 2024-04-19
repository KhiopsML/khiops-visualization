import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as d3 from 'd3';
import { HistogramValuesI } from './histogram.interfaces';

@Injectable({
  providedIn: 'root',
})
export class HistogramUIService {
  static chartColors: string[] = ['#6e93d5', '#ffbe46'];
  static translate: TranslateService;

  constructor() {}

  static setTranslationService(translate: TranslateService) {
    this.translate = translate;
  }

  static getColor(i: number): string {
    return this.chartColors[i];
  }

  static getColors(): string[] {
    return this.chartColors;
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
      this.translate.instant('GLOBAL.DENSITY') +
      ': ' +
      d3.format('.2e')(d.value) +
      '<br>' +
      this.translate.instant('GLOBAL.FREQUENCY') +
      ': ' +
      d.frequency +
      '<br>' +
      this.translate.instant('GLOBAL.INTERVAL') +
      ': ' +
      bounds
    );
  }
}
