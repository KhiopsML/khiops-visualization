/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ChartDatasetModel } from './chart-dataset.model';

export class ChartDatasModel {
  datasets: ChartDatasetModel[] = [];
  labels: string[] = [];

  emptyLabels() {
    this.labels.push('');
  }
}
