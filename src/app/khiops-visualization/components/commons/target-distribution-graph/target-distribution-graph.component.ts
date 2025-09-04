/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  OnInit,
  EventEmitter,
  NgZone,
  Output,
} from '@angular/core';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { ScrollableGraphComponent } from '@khiops-library/components/scrollable-graph/scrollable-graph.component';
import { TranslateService } from '@ngstack/translate';
import { ToPrecisionPipe } from '@khiops-library/pipes/to-precision.pipe';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartOptions, TooltipItem } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ResizedEvent } from 'angular-resize-event-package';
import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { AppService } from '@khiops-visualization/providers/app.service';
import { LS } from '@khiops-library/enum/ls';

@Component({
  selector: 'app-target-distribution-graph',
  templateUrl: './target-distribution-graph.component.html',
  styleUrls: ['./target-distribution-graph.component.scss'],
  providers: [ToPrecisionPipe],
  standalone: false,
})
export class TargetDistributionGraphComponent
  extends ScrollableGraphComponent
  implements OnInit
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

  private readonly SMALL_DIV_THRESHOLD = 600;
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
          boxPadding: 10,
          displayColors: true, // Show color square for target value
          callbacks: {
            title: (items: TooltipItem<'bar'>[]) => this.getTooltipTitle(items),
            label: (items: TooltipItem<'bar'>) => this.getTooltipLabel(items),
            beforeLabel: (items: TooltipItem<'bar'>) =>
              this.getTooltipBeforeLabel(items),
            afterLabel: (items: TooltipItem<'bar'>) =>
              this.getTooltipAfterLabel(items),
          },
        },
      },
      scales: {
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
    this.graphIdContainer = 'target-distribution-graph-comp-' + this.position;
    this.title = this.title || this.translate.get('GLOBAL.TARGET_DISTRIBUTION');
  }

  /**
   * Handle resize event to check if the graph is in small div
   * @param event The resized event containing new dimensions
   */
  onResized(event: ResizedEvent) {
    this.isSmallDiv = (event?.newRect?.width || 0) < this.SMALL_DIV_THRESHOLD;
  }

  /**
   * Handle fullscreen toggle event
   * @param isFullscreen True if the graph is in fullscreen mode, false otherwise
   */
  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.resizeGraph();
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
  private getTooltipTitle(items: TooltipItem<'bar'>[]): string {
    if (!items || items.length === 0 || !items[0]) {
      return '';
    }

    const firstItem = items[0];
    // Check if the variable type is numerical (intervals) or categorical (groups)
    const isNumerical = this.variableType === TYPES.NUMERICAL;

    if (isNumerical) {
      return this.translate.get('GLOBAL.INTERVAL') + ': ' + firstItem.label;
    } else {
      return this.translate.get('GLOBAL.GROUP') + ': ' + firstItem.label;
    }
  }

  /**
   * Get tooltip label value (Target value only)
   * @param items Tooltip items from Chart.js
   * @returns Formatted target value label
   */
  private getTooltipLabel(items: TooltipItem<'bar'>): string {
    if (!items?.dataset) {
      return '';
    }

    return (
      this.translate.get('GLOBAL.TARGET_VALUE') + ': ' + items.dataset.label
    );
  }

  /**
   * Get tooltip before label value (Probability)
   * @param items Tooltip items from Chart.js
   * @returns Formatted probability label
   */
  private getTooltipBeforeLabel(items: TooltipItem<'bar'>): string | undefined {
    if (!items?.dataset) {
      return undefined;
    }

    let value = this.toPrecision.transform(items.dataset.data[items.dataIndex]);

    if (this.graphOptions.selected === TYPES.PROBABILITIES) {
      value = value + this.PERCENTAGE_SUFFIX;
    }

    return this.translate.get('GLOBAL.PROBABILITY') + ': ' + value;
  }

  /**
   * Get tooltip after label value (Frequency)
   * @param items Tooltip items from Chart.js
   * @returns Formatted frequency label
   */
  private getTooltipAfterLabel(items: TooltipItem<'bar'>): string | undefined {
    if (!items?.dataset) {
      return undefined;
    }

    const frequencyValue = this.toPrecision.transform(
      (items.dataset as any).extra[items.dataIndex].extra.value,
    );

    return this.translate.get('GLOBAL.FREQUENCY') + ': ' + frequencyValue;
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
}
