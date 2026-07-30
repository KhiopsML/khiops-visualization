/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngstack/translate';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set.interface';
import { ChartOptions } from 'chart.js';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { ChartComponent } from '@khiops-library/components/chart/chart.component';

@Component({
  selector: 'kl-unfold-hierarchy-info-rate-graph',
  templateUrl: './unfold-hierarchy-info-rate-graph.component.html',
  imports: [FlexLayoutModule, TranslateModule, ChartComponent],
})
export class UnfoldHierarchyInfoRateGraphComponent extends SelectableComponent {
  readonly infoPerCluster = input<ChartDatasModel | undefined>(undefined);

  readonly colorSetInfoPerCluster = input<ChartColorsSetI | undefined>();
  readonly chartOptions = input<ChartOptions | undefined>();

  get datas(): ChartDatasModel | undefined {
    return this.infoPerCluster();
  }

  public componentType = COMPONENT_TYPES.ND_LINE_CHART; // needed to copy datas
}
