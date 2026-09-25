/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  AfterViewInit,
  ElementRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  EventEmitter,
  NgZone,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
  ViewChild,
  input,
} from '@angular/core';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { ScrollableGraphComponent } from '@khiops-library/components/scrollable-graph/scrollable-graph.component';
import { TranslateService } from '@ngstack/translate';
import { ToPrecisionPipe } from '@khiops-library/pipes/to-precision.pipe';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set.interface';
import { ChartOptions, ChartTypeRegistry, TooltipItem } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ResizedEvent } from 'angular-resize-event-package';
import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values.interface';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { AppService } from '@khiops-visualization/providers/app.service';
import { LS } from '@khiops-library/enum/ls';
import { ChartLabelTruncationUtils } from '@khiops-library/components/chart/chart-label-truncation.utils';

@Component({
  selector: 'app-target-distribution-graph',
  templateUrl: './target-distribution-graph.component.html',
  styleUrls: ['./target-distribution-graph.component.scss'],
  providers: [ToPrecisionPipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TargetDistributionGraphComponent
  extends ScrollableGraphComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Output() graphTypeChanged: EventEmitter<string> = new EventEmitter();
  @Output()
  targetDistributionGraphDisplayedValuesChanged: EventEmitter<ChartToggleValuesI> =
    new EventEmitter();
  @Output() selectedItemChanged: EventEmitter<number> = new EventEmitter();

  @Input() override scrollPosition = 0;
  @Input() override inputDatas?: ChartDatasModel = undefined;
  @Input() public position = 0;
  @Input() public titleTooltip?: string;
  @Input() public title?: string;
  @Input() public activeEntries?: number;
  @Input() public displayedValues?: ChartToggleValuesI[];
  @Input() public showFullscreenBtn = false;
  @Input() public variableType?: string;
  @Input() public maxBarThickness?: number;
  protected enableSelection = input(true);

  public override view: any = undefined; // managed into ScrollableGraphComponent
  public override graphIdContainer: string | undefined = undefined;
  public override maxScale: number = 0;
  public override minScale: number = 0;
  public componentType = COMPONENT_TYPES.ND_BAR_CHART; // needed to copy datas
  public colorSet?: ChartColorsSetI;
  public graphOptions = {
    types: [TYPES.PROBABILITIES, TYPES.LIFT],
    selected: undefined,
  };
  public buttonTitle: string;
  public chartOptions: ChartOptions;
  public isFullscreen = false;
  public isSmallDiv = false;
  private selectedBarIndex?: number;

  @ViewChild('headerContainer', { read: ElementRef })
  private headerContainerRef?: ElementRef<HTMLElement>;
  @ViewChild('headerTools', { read: ElementRef })
  private headerToolsRef?: ElementRef<HTMLElement>;
  @ViewChild('headerTitle', { read: ElementRef })
  private headerTitleRef?: ElementRef<HTMLElement>;
  @ViewChild('legendMeasurer', { read: ElementRef })
  private legendMeasurerRef?: ElementRef<HTMLElement>;

  private readonly HEADER_SAFETY_MARGIN = 24;
  private readonly PERCENTAGE_SUFFIX = '%';

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private translate: TranslateService,
    private toPrecision: ToPrecisionPipe,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    super(selectableService, ngzone, configService);
    // Needed for scroll component
    this.maxScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_SCALE;
    this.minScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MIN_GRAPH_SCALE;

    this.graphOptions.selected = AppService.Ls.get(
      LS.TARGET_DISTRIBUTION_GRAPH_OPTION,
      this.graphOptions.types[0],
    );

    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[1];
    this.buttonTitle = this.translate.get('GLOBAL.VALUES');

    // Keep reference for callback context
    const self = this;

    // Override tooltip infos
    this.chartOptions = {
      plugins: {
        tooltip: {
          displayColors: true, // Show color square for target value
          callbacks: {
            title: (items: TooltipItem<keyof ChartTypeRegistry>[]) =>
              this.getTooltipTitle(items),
            label: (items: TooltipItem<keyof ChartTypeRegistry>) =>
              this.getTooltipLabel(items),
            beforeLabel: (items: TooltipItem<keyof ChartTypeRegistry>) =>
              this.getTooltipBeforeLabel(items),
            afterLabel: (items: TooltipItem<keyof ChartTypeRegistry>) =>
              this.getTooltipAfterLabel(items),
          },
        },
      },
      scales: {
        x: {
          // stacked: true,
          ticks: {
            callback: function (tickValue: string | number) {
              // Use regular function to access Chart.js 'this' context and getLabelForValue
              const chartWidth = (this as any).chart?.width ?? 600;
              const barCount = (this as any).chart?.data?.labels?.length ?? 1;
              return self.getXAxisTickValue(
                tickValue,
                this.getLabelForValue.bind(this),
                chartWidth,
                barCount,
              );
            },
          },
        },
        y: {
          // stacked: true,
          // min: 0,
          // max: 100,
          ticks: {
            callback: (tickValue: string | number) => {
              if (self.graphOptions.selected === TYPES.PROBABILITIES) {
                return tickValue + '%';
              } else {
                return tickValue;
              }
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
    this.graphIdContainer = 'target-distribution-graph-comp-' + this.position;
    this.title = this.title || this.translate.get('GLOBAL.TARGET_DISTRIBUTION');
  }

  override ngAfterViewInit() {
    this.scheduleLegendLayoutUpdate();
  }

  override ngOnChanges(changes: SimpleChanges) {
    if (changes['inputDatas'] || changes['maxBarThickness']) {
      this.applyMaxBarThickness();
    }

    if (changes['displayedValues'] || changes['title'] || changes['inputDatas']) {
      this.scheduleLegendLayoutUpdate();
    }
  }

  /**
   * Apply optional max bar thickness to all datasets when provided.
   */
  private applyMaxBarThickness() {
    if (!this.inputDatas?.datasets?.length) {
      return;
    }

    const spacing = this.calculateBarSpacing(this.inputDatas.datasets.length);

    for (const dataset of this.inputDatas.datasets) {
      if (!dataset) {
        continue;
      }

      if (this.maxBarThickness !== undefined) {
        dataset.maxBarThickness = this.maxBarThickness;
        dataset.barPercentage = spacing.barPercentage;
        dataset.categoryPercentage = spacing.categoryPercentage;
      } else if (dataset.maxBarThickness !== undefined) {
        (dataset as any).maxBarThickness = undefined;
        (dataset as any).barPercentage = undefined;
        (dataset as any).categoryPercentage = undefined;
      }
    }
  }

  /**
   * Keep few bars visually close while preserving readability on larger sets.
   */
  private calculateBarSpacing(barCount: number): {
    barPercentage: number;
    categoryPercentage: number;
  } {
    const minBarPercentage = 0.9;
    const minCategoryPercentage = 0.3;
    const maxCategoryPercentage = 0.8;

    const barPercentage = minBarPercentage;
    let categoryPercentage = minCategoryPercentage;

    if (barCount > 2) {
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

  /**
   * Handle resize event to check if the graph is in small div
   * @param event The resized event containing new dimensions
   */
  onResized(event: ResizedEvent) {
    if (event?.newRect?.width) {
      this.scheduleLegendLayoutUpdate();
    }
  }

  /**
   * Handle fullscreen toggle event
   * @param isFullscreen True if the graph is in fullscreen mode, false otherwise
   */
  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.resizeGraph();
      this.scheduleLegendLayoutUpdate();
    });
  }

  /**
   * Update legend layout based on real measured widths in header.
   * Keep legend on first line when title + legend fit available space,
   * otherwise move legend to second line.
   */
  private updateLegendLayout() {
    const headerContainerWidth = this.headerContainerRef?.nativeElement.clientWidth;
    const headerToolsWidth = this.headerToolsRef?.nativeElement.offsetWidth;
    const headerTitleWidth = this.headerTitleRef?.nativeElement.offsetWidth;
    const legendWidth = this.legendMeasurerRef?.nativeElement.scrollWidth;

    if (
      !headerContainerWidth ||
      headerToolsWidth === undefined ||
      !headerTitleWidth ||
      legendWidth === undefined
    ) {
      return;
    }

    const availableHeaderMainWidth =
      headerContainerWidth - headerToolsWidth - this.HEADER_SAFETY_MARGIN;
    const requiredHeaderMainWidth = headerTitleWidth + legendWidth;

    this.isSmallDiv = requiredHeaderMainWidth > availableHeaderMainWidth;
  }

  private scheduleLegendLayoutUpdate() {
    setTimeout(() => {
      this.updateLegendLayout();
    });
  }

  /**
   * Handle bar selection change event
   * @param index The index of the selected bar
   */
  onSelectBarChanged(index: number) {
    // Debounce each events
    // Each bar of grouped chart launch same event
    if (this.selectedBarIndex !== index) {
      // pass event from chart to parent
      this.selectedItemChanged.emit(index);
    }
    this.selectedBarIndex = index;
  }

  /**
   * Change the graph type and update options
   * @param type The new graph type to set
   */
  changeGraphType(type: string) {
    // this.trackerService.trackEvent('click', 'target_distribution_graph_type', type);
    AppService.Ls.set(LS.TARGET_DISTRIBUTION_GRAPH_OPTION, type);

    this.graphTypeChanged.emit(type);
  }

  /**
   * Handle toggle button change event
   * @param displayedValues The new displayed values from toggle button
   */
  onSelectToggleButtonChanged(displayedValues: ChartToggleValuesI) {
    this.targetDistributionGraphDisplayedValuesChanged.emit(displayedValues);
  }

  /**
   * Get tooltip title value (Group/Interval)
   * @param items Tooltip items from Chart.js
   * @returns Formatted group/interval title
   */
  private getTooltipTitle(
    items: TooltipItem<keyof ChartTypeRegistry>[],
  ): string {
    if (!items || items.length === 0 || !items[0]) {
      return '';
    }

    const firstItem = items[0];
    // Check if the variable type is numerical (intervals) or categorical (groups)
    const isNumerical = this.variableType === TYPES.NUMERICAL;

    if (firstItem.label) {
      if (isNumerical) {
        return this.translate.get('GLOBAL.INTERVAL') + ': ' + firstItem.label;
      } else {
        return this.translate.get('GLOBAL.GROUP') + ': ' + firstItem.label;
      }
    } else {
      // It's a target value (supervised)
      return (
        this.translate.get('GLOBAL.TARGET_VALUE') +
        ': ' +
        firstItem.dataset.label
      );
    }
  }

  /**
   * Get tooltip label value (Target value only)
   * @param items Tooltip items from Chart.js
   * @returns Formatted target value label
   */
  private getTooltipBeforeLabel(
    _items: TooltipItem<keyof ChartTypeRegistry>,
  ): string {
    return '';
  }

  /**
   * Get tooltip before label value (Probability or Lift)
   * @param items Tooltip items from Chart.js
   * @returns Formatted probability or lift label
   */
  private getTooltipLabel(
    items: TooltipItem<keyof ChartTypeRegistry>,
  ): string | undefined {
    if (!items?.dataset) {
      return undefined;
    }

    let value = this.toPrecision.transform(items.dataset.data[items.dataIndex]);
    let labelKey = 'GLOBAL.PROBABILITY';

    if (this.graphOptions.selected === TYPES.PROBABILITIES) {
      value = value + this.PERCENTAGE_SUFFIX;
    } else if (this.graphOptions.selected === TYPES.LIFT) {
      labelKey = 'GLOBAL.LIFT';
    }

    return this.translate.get(labelKey) + ': ' + value;
  }

  /**
   * Get tooltip after label value (Frequency)
   * @param items Tooltip items from Chart.js
   * @returns Formatted frequency label
   */
  private getTooltipAfterLabel(
    items: TooltipItem<keyof ChartTypeRegistry>,
  ): string | undefined {
    if (!items?.dataset) {
      return undefined;
    }

    const frequencyValue = this.toPrecision.transform(
      (items.dataset as any).extra[items.dataIndex].extra.value,
    );

    return this.translate.get('GLOBAL.FREQUENCY') + ': ' + frequencyValue;
  }

  /**
   * Get X-axis tick callback value with dynamic cropping based on
   * available chart width and number of bars
   * @param tickValue The tick value from Chart.js
   * @param getLabelForValue Chart.js function to get the actual label
   * @param chartWidth The current pixel width of the chart canvas
   * @param barCount The total number of bars in the chart
   * @returns Formatted label with ellipsis if needed
   */
  private getXAxisTickValue(
    tickValue: string | number,
    getLabelForValue: (value: number) => string,
    chartWidth: number,
    barCount: number,
  ): string {
    return ChartLabelTruncationUtils.getXAxisTickValue(
      tickValue,
      getLabelForValue,
      chartWidth,
      barCount,
    );
  }
}
