/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { CHART_TYPES } from '@khiops-library/enum/chart-types';

export class ChartDatasetModel {
  label: string | undefined;
  data: any = [];
  extra: any = [];
  minBarLength: number = 3;
  fill: boolean = false;
  borderSkipped: boolean = false;
  type: string; // By default
  borderWidth!: number;
  // maxBarThickness: number = 50;
  maxBarThickness!: number;
  barThickness!: number;
  barPercentage!: number;
  categoryPercentage!: number;
  pointRadius?: number;
  pointHitRadius?: number;
  pointHoverRadius?: number;
  backgroundColor?: string[];
  borderColor?: string[];

  constructor(label?: string, type?: string) {
    this.label = label || '';
    this.type = type || CHART_TYPES.BAR; // By default
  }
}
