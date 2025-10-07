/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input } from '@angular/core';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'kl-unfold-hierarchy-info-rate-graph',
  templateUrl: './unfold-hierarchy-info-rate-graph.component.html',
  standalone: false,
})
export class UnfoldHierarchyInfoRateGraphComponent {
  @Input() infoPerCluster: ChartDatasModel | undefined;
  @Input() colorSetInfoPerCluster: ChartColorsSetI | undefined;
  @Input() infoPerClusterChartOptions: ChartOptions | undefined;
}
