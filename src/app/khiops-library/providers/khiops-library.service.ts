/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

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
  private graphColorSet: ChartColorsSetI[];
  private appConfig: any;

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

  setAppConfig(config: any) {
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
