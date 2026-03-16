/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set.interface';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'kl-unfold-hierarchy-clusters-graph',
  templateUrl: './unfold-hierarchy-clusters-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UnfoldHierarchyClustersGraphComponent extends SelectableComponent {
  @Input() legend: { series: { name: string }[] }[] | undefined;
  @Input() colorSetClusterPerDim: ChartColorsSetI | undefined;

  private _clustersPerDimDatas: ChartDatasModel | undefined;
  datas: ChartDatasModel | undefined;

  @Input()
  set clustersPerDimDatas(value: ChartDatasModel | undefined) {
    this._clustersPerDimDatas = value;
    this.datas = value; // Automatic assignment
  }

  get clustersPerDimDatas(): ChartDatasModel | undefined {
    return this._clustersPerDimDatas;
  }

  @Input() selectedLineChartItem = '';
  @Input() chartOptions: ChartOptions | undefined;

  @Output() legendItemClicked = new EventEmitter<any>();

  public componentType = COMPONENT_TYPES.ND_LINE_CHART; // needed to copy datas

  highlightChartLine(event: any) {
    this.legendItemClicked.emit(event);
  }
}
