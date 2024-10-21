import { Injectable } from '@angular/core';
import { ChartColorsSetI } from '../interfaces/chart-colors-set';
import {
  CHART_COLORS_0,
  CHART_COLORS_1,
  CHART_COLORS_2,
} from '@khiops-library/config/colors';

@Injectable({
  providedIn: 'root',
})
export class KhiopsLibraryService {
  graphColorSet: ChartColorsSetI[];
  appConfig: any;

  /**
   * An array of graph colors used for chart visualizations.
   *
   * This array is initialized with 10 sets of colors from the `CHART_COLORS_2` constant,
   * flattened into a single array. Each color set is repeated 10 times to ensure a
   * sufficient number of colors for the charts.
   */
  graphColors: string[] = Array(10).fill(CHART_COLORS_1).flat();

  constructor() {
    this.graphColorSet = [
      {
        domain: CHART_COLORS_0,
      },
      {
        domain: this.graphColors,
      },
      {
        domain: CHART_COLORS_2,
      },
    ];
  }

  getGraphColorSet(): ChartColorsSetI[] {
    return this.graphColorSet;
  }

  setAppConfig(config) {
    this.appConfig = config;
  }

  getAppConfig(): any {
    return this.appConfig;
  }

  isKhiopsCovisu(): boolean {
    return this.getAppConfig().common.GLOBAL.DEBUG_SOFTWARE_LABEL === 'KC';
  }

  isKhiopsVisu(): boolean {
    return this.getAppConfig().common.GLOBAL.DEBUG_SOFTWARE_LABEL === 'KV';
  }
}
