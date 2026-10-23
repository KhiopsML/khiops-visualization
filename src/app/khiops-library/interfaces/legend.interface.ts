/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { DynamicI } from '@khiops-library/interfaces/globals.interface';

export interface LegendItem {
  name: string;
  color?: string;
  borderColor?: string;
  shortname?: string;
}

export interface LegendSeries {
  name?: string;
}

export interface LegendDataset {
  label?: string;
  extra?: DynamicI[];
}

export interface LegendDataWithSeries {
  series: LegendSeries[];
}

export interface LegendDynamicItem {
  show?: boolean;
  name?: string;
}

export interface LegendDatasetsInput {
  datasets: LegendDataset[];
}

export type LegendInputData =
  | LegendDatasetsInput
  | LegendDataWithSeries[]
  | LegendDynamicItem[]
  | undefined;
