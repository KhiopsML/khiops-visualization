/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input } from '@angular/core';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartOptions } from 'chart.js';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

@Component({
  selector: 'kl-unfold-hierarchy-info-rate-graph',
  templateUrl: './unfold-hierarchy-info-rate-graph.component.html',
  standalone: false,
})
export class UnfoldHierarchyInfoRateGraphComponent extends SelectableComponent {
  private _infoPerCluster: ChartDatasModel | undefined;
  datas: ChartDatasModel | undefined;

  @Input()
  set infoPerCluster(value: ChartDatasModel | undefined) {
    this._infoPerCluster = value;
    this.datas = value; // Automatic assignment
  }

  get infoPerCluster(): ChartDatasModel | undefined {
    return this._infoPerCluster;
  }

  @Input() colorSetInfoPerCluster: ChartColorsSetI | undefined;
  @Input() chartOptions: ChartOptions | undefined;

  public componentType = COMPONENT_TYPES.ND_LINE_CHART; // needed to copy datas
}
