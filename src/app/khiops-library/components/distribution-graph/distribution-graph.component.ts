/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  Output,
  NgZone,
  OnInit,
  EventEmitter,
} from '@angular/core';
import { SelectableService } from '../selectable/selectable.service';
import { ScrollableGraphComponent } from '../scrollable-graph/scrollable-graph.component';
import { KhiopsLibraryService } from '../../providers/khiops-library.service';
import { ToPrecisionPipe } from '../../pipes/to-precision.pipe';
import { ChartColorsSetI } from '../../interfaces/chart-colors-set';
import { ChartOptions, TooltipItem } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TYPES } from '@khiops-library/enum/types';
import { HistogramType } from '../../../khiops-visualization/components/commons/histogram/histogram.type';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';

@Component({
  selector: 'kl-distribution-graph',
  templateUrl: './distribution-graph.component.html',
  styleUrls: ['./distribution-graph.component.scss'],
  providers: [ToPrecisionPipe],
  standalone: false,
})
export class DistributionGraphComponent
  extends ScrollableGraphComponent
  implements OnInit
{
  @Input() public position = 0;
  @Input() declare public inputDatas: ChartDatasModel | undefined;
  @Input() public graphOptions: DistributionOptionsI | undefined;
  @Input() public activeEntries: number = 0;
  @Input() public hideGraphOptions = false;

  @Output() private graphTypeChanged: EventEmitter<string> = new EventEmitter();
  @Output() private selectedItemChanged: EventEmitter<number> =
    new EventEmitter();

  public override graphIdContainer: string | undefined = undefined;
  public override maxScale: number = 0;
  public override minScale: number = 0;
  public componentType = COMPONENT_TYPES.BAR_CHART; // needed to copy datas
  public colorSet: ChartColorsSetI | undefined;
  public chartOptions: ChartOptions;

  private readonly FALLBACK_MIN_VALUE = 1;
  private readonly PERCENTAGE_MULTIPLIER = 100;

  /**
   * Get the dynamic title based on the selected graph option
   * @returns The title key for translation
   */
  get dynamicTitle(): string {
    if (this.hideGraphOptions) {
      return 'GLOBAL.DISTRIBUTION'; // default fallback
    }

    switch (this.graphOptions?.selected) {
      case HistogramType.YLOG:
        return 'GLOBAL.FREQUENCY';
      case HistogramType.YLIN:
        return 'GLOBAL.COVERAGE';
      default:
        return 'GLOBAL.DISTRIBUTION';
    }
  }

  /**
   * Determine if legend should be visible based on the selected graph option
   * @returns True if legend should be visible, false otherwise
   */
  get shouldShowLegend(): boolean {
    return !(
      this.graphOptions?.selected === HistogramType.YLOG ||
      this.graphOptions?.selected === HistogramType.YLIN
    );
  }

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private toPrecision: ToPrecisionPipe,
    private khiopsLibraryService: KhiopsLibraryService,
    private ls: Ls,
  ) {
    super(selectableService, ngzone, configService);

    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[2];

    // Needed for scroll component
    this.maxScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_SCALE;
    this.minScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MIN_GRAPH_SCALE;

    // Keep reference for callback context
    const self = this;

    // Override tooltip infos
    this.chartOptions = {
      plugins: {
        tooltip: {
          callbacks: {
            label: (items: TooltipItem<'bar'>) => this.getTooltipLabel(items),
            afterLabel: (items: TooltipItem<'bar'>) =>
              this.getTooltipAfterLabel(items),
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value: string | number) => this.getYAxisTickValue(value),
          },
        },
        x: {
          ticks: {
            callback: function (tickValue: string | number) {
              // Use regular function to access Chart.js 'this' context and getLabelForValue
              return self.getXAxisTickValue(
                tickValue,
                this.getLabelForValue.bind(this),
              );
            },
          },
        },
      },
    };
  }

  /**
   * Initialize component and set graph ID
   */
  ngOnInit() {
    this.graphIdContainer = 'distribution-graph-comp-' + this.position;
    this.updateChartOptions();
  }

  /**
   * Handle bar selection change event
   * @param index The index of the selected bar
   */
  onSelectBarChanged(index: number) {
    // pass event from chart to parent
    this.selectedItemChanged.emit(index);
  }

  /**
   * Change the graph type and update options
   * @param type The new graph type to set
   */
  changeGraphType(type: string) {
    // this.trackerService.trackEvent('click', 'distribution_graph_type', this.graphOptions.selected);
    this.ls.set(LS.DISTRIBUTION_GRAPH_OPTION_Y, type);
    this.graphTypeChanged.emit(type);

    // Update the graph options with updated datas
    setTimeout(() => {
      this.updateChartOptions();
    });
  }

  /**
   * Update chart options based on current state
   */
  private updateChartOptions() {
    this.chartOptions.scales!.y!.max = undefined;
    this.chartOptions.scales!.y!.min = undefined;

    const minValue = this.calculateMinValue();

    // Configure Y axis scale according to the selected mode
    if (this.graphOptions!.selected === HistogramType.YLOG) {
      // In logarithmic mode, use the native logarithmic scale of Chart.js
      this.chartOptions.scales!.y!.type = TYPES.LOGARITHMIC;
      // Always start the Y axis at 1 in logarithmic mode
      if (minValue > this.FALLBACK_MIN_VALUE) {
        this.chartOptions.scales!.y!.min = this.FALLBACK_MIN_VALUE;
      }
    } else {
      // In linear mode, use the linear scale to display Coverage
      this.chartOptions.scales!.y!.type = TYPES.LINEAR;

      if (minValue > 0) {
        this.chartOptions.scales!.y!.min = 0;
      } else {
        this.chartOptions.scales!.y!.min = minValue;
      }
    }

    // Create a new reference to trigger change detection
    this.chartOptions = { ...this.chartOptions };
  }

  /**
   * Get tooltip label value based on current mode
   * @param items Tooltip items from Chart.js
   * @returns Formatted tooltip label or undefined
   */
  private getTooltipLabel(items: TooltipItem<'bar'>): string | undefined {
    if (!items?.dataset) {
      return undefined;
    }

    const isLinearMode =
      !this.hideGraphOptions &&
      this.graphOptions?.selected === HistogramType.YLIN;
    const isLogMode =
      !this.hideGraphOptions &&
      this.graphOptions?.selected === HistogramType.YLOG;

    if (isLinearMode || isLogMode) {
      return this.toPrecision.transform(
        (items.dataset as any).extra[items.dataIndex].extra.frequencyValue,
      );
    }

    return this.toPrecision.transform(items.dataset.data[items.dataIndex]);
  }

  /**
   * Get tooltip after label value for coverage percentage
   * @param items Tooltip items from Chart.js
   * @returns Formatted percentage string or undefined
   */
  private getTooltipAfterLabel(items: TooltipItem<'bar'>): string | undefined {
    const isLinearMode =
      !this.hideGraphOptions &&
      this.graphOptions?.selected === HistogramType.YLIN;

    if (isLinearMode && items?.dataset) {
      const coverageValue = (items.dataset as any).extra[items.dataIndex].extra
        .coverageValue;
      const percentValue = coverageValue * this.PERCENTAGE_MULTIPLIER;
      return this.toPrecision.transform(percentValue) + '%';
    }

    return undefined;
  }

  /**
   * Get Y-axis tick callback value
   * @param value Tick value
   * @returns Formatted tick value
   */
  private getYAxisTickValue(value: string | number): string | number {
    const isLogMode =
      !this.hideGraphOptions &&
      this.graphOptions?.selected === HistogramType.YLOG;

    if (isLogMode) {
      const valueStr = value.toString();
      return valueStr.startsWith('0') || valueStr.startsWith('1')
        ? value.toLocaleString()
        : '';
    }

    return typeof value === 'number'
      ? Math.round(value * this.PERCENTAGE_MULTIPLIER) /
          this.PERCENTAGE_MULTIPLIER
      : value;
  }

  /**
   * Get X-axis tick callback value with ellipsis
   * @param tickValue The tick value from Chart.js
   * @param getLabelForValue Chart.js function to get the actual label
   * @returns Formatted label with ellipsis if needed
   */
  private getXAxisTickValue(
    tickValue: string | number,
    getLabelForValue: (value: number) => string,
  ): string {
    const value =
      typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
    let label = getLabelForValue(value);
    label = UtilsService.ellipsis(
      label,
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_LABEL_LENGTH,
    );
    return label;
  }

  /**
   * Calculate minimum value from dataset
   * @returns Minimum value from the first dataset
   */
  private calculateMinValue(): number {
    const minValues = this.inputDatas?.datasets?.[0]?.data;
    return minValues ? Math.min(...minValues) : 0;
  }
}
