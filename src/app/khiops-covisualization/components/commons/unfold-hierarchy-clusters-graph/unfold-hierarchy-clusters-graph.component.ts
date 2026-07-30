/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  input,
  output,
} from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngstack/translate';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set.interface';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartOptions } from 'chart.js';
import { KhiopsLibraryModule } from '@khiops-library/khiops-library.module';

@Component({
  selector: 'kl-unfold-hierarchy-clusters-graph',
  templateUrl: './unfold-hierarchy-clusters-graph.component.html',
  imports: [FlexLayoutModule, TranslateModule, KhiopsLibraryModule],
})
export class UnfoldHierarchyClustersGraphComponent extends SelectableComponent {
  readonly legend = input<{ series: { name: string }[] }[] | undefined>();
  readonly colorSetClusterPerDim = input<ChartColorsSetI | undefined>();

  readonly clustersPerDimDatas = input<ChartDatasModel | undefined>(undefined);

  get datas(): ChartDatasModel | undefined {
    return this.clustersPerDimDatas();
  }

  readonly selectedLineChartItem = input('');
  readonly chartOptions = input<ChartOptions | undefined>();

  readonly legendItemClicked = output<any>();

  public componentType = COMPONENT_TYPES.ND_LINE_CHART; // needed to copy datas

  highlightChartLine(event: any) {
    this.legendItemClicked.emit(event);
  }
}
