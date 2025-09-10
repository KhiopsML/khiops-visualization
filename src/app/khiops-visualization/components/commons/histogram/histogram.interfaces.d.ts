/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export interface RangeXLogI {
  inf?: HistogramValuesI;
  max?: number;
  middlewidth?: number;
  min?: number;
  negStart?: number;
  negValuesCount?: number;
  posStart?: number;
  posValuesCount?: number;
}

export interface RangeYLogI {
  min?: number;
  max?: number;
}

export interface RangeXLinI {
  min?: number;
  max?: number;
}

export interface HistogramValuesI {
  frequency: number;
  logValue: number;
  partition: number[];
  density: number;
  probability: number;
  coords?: {
    x: number;
    y: number;
    barW: number;
    barH: number;
  };
}

export interface TooltipData {
  title: string;
  body: string;
}
