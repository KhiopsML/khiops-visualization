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
import { ChartOptions, TooltipItem, ChartTypeRegistry } from 'chart.js';
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
      this.title = this.translate.get('GLOBAL.GLOBAL_TARGET_DISTRIBUTION');
    }
    // Override tooltip infos
    this.chartOptions = {
      plugins: {
        tooltip: {
          callbacks: {
            title: (items: any) => this.getTooltipTitle(items),
            label: (items: TooltipItem<keyof ChartTypeRegistry>) =>
              this.getTooltipLabel(items),
            afterLabel: (items: TooltipItem<keyof ChartTypeRegistry>) =>
              this.getTooltipAfterLabel(items),
          },
        },
      },
      onClick: undefined, // Remove click listener
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            maxTicksLimit: 5,
            callback: (tickValue: string | number) => {
              return tickValue + '%';
            },
          },
        },
      },
    };
  }

  /**
   * Handles fullscreen toggle event
   * @param isFullscreen - Indicates if the component is in fullscreen mode
   */
  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
  }

  /**
   * Get tooltip title for chart
   * @param items - Tooltip items
   * @returns Title string or undefined
   */
  private getTooltipTitle(items: any): string | undefined {
    if (!items || items.length === 0 || !items[0]) {
      return undefined;
    }
    return (
      this.translate.get('GLOBAL.VARIABLE') + ': ' + items[0].dataset.label
    );
  }

  /**
   * Get tooltip label for chart
   * @param items - Tooltip item
   * @returns Label string or undefined
   */
  private getTooltipLabel(
    items: TooltipItem<keyof ChartTypeRegistry>,
  ): string | undefined {
    if (items?.dataset) {
      return (
        this.translate.get('GLOBAL.PROBABILITY') +
        ': ' +
        this.toPrecision.transform(
          (items.dataset as any).extra?.[0]?.extra?.percent,
        ) +
        '%'
      );
    }
    return undefined;
  }

  /**
   * Get tooltip after label for chart
   * @param items - Tooltip item
   * @returns After label string or undefined
   */
  private getTooltipAfterLabel(
    items: TooltipItem<keyof ChartTypeRegistry>,
  ): string | undefined {
    if (items?.dataset) {
      return (
        this.translate.get('GLOBAL.FREQUENCY') +
        ': ' +
        this.toPrecision.transform(
          (items.dataset as any)?.extra?.[0]?.extra?.value,
        )
      );
    }
    return undefined;
  }

  /**
   * Calculate proportional bar spacing based on number of bars
   * @param barCount - Number of bars in the chart
   * @returns Object containing barPercentage and categoryPercentage
   */
  private calculateBarSpacing(barCount: number): {
    barPercentage: number;
    categoryPercentage: number;
  } {
    // Base values for few bars
    const minBarPercentage = 0.9;
    const minCategoryPercentage = 0.3;

    // Maximum values for many bars (to prevent chart from becoming too wide)
    const maxCategoryPercentage = 0.8;

    // Calculate proportional spacing
    // For 1-2 bars: use minimum values
    // For 3+ bars: increase categoryPercentage proportionally
    const barPercentage = minBarPercentage;
    let categoryPercentage = minCategoryPercentage;

    if (barCount > 2) {
      // Increase category percentage by 0.1 for each additional bar above 2
      // But cap at maximum value
      const increment = Math.min(
        (barCount - 2) * 0.1,
        maxCategoryPercentage - minCategoryPercentage,
      );
      categoryPercentage = Math.min(
        minCategoryPercentage + increment,
        maxCategoryPercentage,
      );
    }

    return { barPercentage, categoryPercentage };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.inputDatas?.currentValue) {
      // Keep labels into displayedvalues to copy datas into clipboard
      this.displayedValues = [];
      if (this.inputDatas?.datasets) {
        const barCount = this.inputDatas.datasets.length;
        const spacing = this.calculateBarSpacing(barCount);

        Object.keys(this.inputDatas.datasets).map((_key, i) => {
          // Add proportional bar spacing properties to each dataset
          if (this.inputDatas?.datasets[i]) {
            this.inputDatas.datasets[i].barPercentage = spacing.barPercentage;
            this.inputDatas.datasets[i].categoryPercentage =
              spacing.categoryPercentage;
          }
          this.displayedValues.push({
            name: this.inputDatas?.datasets[i]?.label,
          });
        });
      }
    }
  }
}
