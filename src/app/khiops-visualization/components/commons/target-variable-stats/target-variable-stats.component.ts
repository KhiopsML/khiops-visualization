/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  SimpleChanges,
  OnChanges,
  Input,
  NgZone,
  ChangeDetectionStrategy,
} from '@angular/core';

import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TranslateService } from '@ngstack/translate';
import { ToPrecisionPipe } from '@khiops-library/pipes/to-precision.pipe';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartOptions } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

@Component({
  selector: 'app-target-variable-stats',
  templateUrl: './target-variable-stats.component.html',
  styleUrls: ['./target-variable-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ToPrecisionPipe],
  standalone: false,
})
export class TargetVariableStatsComponent
  extends SelectableComponent
  implements OnChanges
{
  @Input() public inputDatas?: ChartDatasModel;
  @Input() public title?: string;

  public colorSet?: ChartColorsSetI;
  public componentType = COMPONENT_TYPES.ND_BAR_CHART; // needed to copy datas
  public chartOptions: ChartOptions;
  public isFullscreen = false;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private toPrecision: ToPrecisionPipe,
    private translate: TranslateService,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    super(selectableService, ngzone, configService);
    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[1];
    if (!this.title) {
      this.title = this.translate.get('GLOBAL.TARGET_VARIABLE_STATS');
    }
    // Override tooltip infos
    this.chartOptions = {
      plugins: {
        tooltip: {
          callbacks: {
            label: (items: any) => {
              if (items?.dataset) {
                return items.dataset.label;
              }
              return undefined;
            },
            beforeLabel: (items: any) => {
              if (items?.dataset) {
                return (
                  this.toPrecision.transform(
                    items.dataset.extra[0].extra.percent,
                  ) + '%'
                );
              }
              return undefined;
            },
            afterLabel: (items: any) => {
              if (items?.dataset) {
                return this.toPrecision.transform(
                  items.dataset.extra[0].extra.value,
                );
              }
              return undefined;
            },
          },
        },
      },
      onClick: undefined, // Remove click listener
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            maxTicksLimit: 5,
          },
        },
      },
    };
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.inputDatas?.currentValue) {
      // Keep labels into displayedvalues to copy datas into clipboard
      this.displayedValues = [];
      if (this.inputDatas?.datasets) {
        Object.keys(this.inputDatas.datasets).map((_key, i) => {
          this.displayedValues.push({
            name: this.inputDatas?.datasets[i]?.label,
          });
        });
      }
    }
  }
}
