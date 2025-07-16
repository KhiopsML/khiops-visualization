/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  EventEmitter,
  Output,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
} from '@angular/core';
import * as ChartJs from 'chart.js';
import type { ChartEvent, ActiveElement, Chart } from 'chart.js';

import { UtilsService } from '../../providers/utils.service';
import { KhiopsLibraryService } from '../../providers/khiops-library.service';
import { ChartColorsSetI } from '../../interfaces/chart-colors-set';
import { ChartOptions } from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { CHART_TYPES } from '@khiops-library/enum/chart-types';
import { createDefaultChartOptions } from './chart-options.config';

interface ChartDatasetExtra {
  defaultGroupIndex?: boolean;
  [key: string]: unknown;
}

@Component({
  selector: 'kl-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: false,
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @Input() public canvasIdContainer = 'kl-chart'; // May be updated if multiple graph
  @Input() private inputDatas: ChartDatasModel | undefined;
  @Input() private activeEntries: number | undefined;
  @Input() private type: ChartJs.ChartType = CHART_TYPES.BAR;
  @Input() private chartOptions: ChartOptions | undefined;
  @Input() private colorSet: ChartColorsSetI | undefined;
  @Input() private enableSelection = true;
  @Input() private selectedLineChartItem: string | undefined;

  @Output() private selectBarIndex: EventEmitter<number> = new EventEmitter();

  private ctx: ChartJs.ChartItem | undefined;
  private chart: ChartJs.Chart | undefined;
  private color: string = '';
  private barColor: string = '';
  private fontColor: string = '#999';
  public isLoading: boolean = false;

  constructor(
    private configService: ConfigService,
    private el: ElementRef,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    this.color = '#e5e5e5';
    this.barColor = 'rgba(0, 0, 0, 1)';
    this.colorSet = this.khiopsLibraryService.getGraphColorSet()[0];
  }

  ngOnInit() {
    // Keep a ref of instance
    this.el.nativeElement.componentInstance = this;
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  /**
   * Initializes the chart instance and sets up its configuration.
   */
  private initChart() {
    this.ctx = <ChartJs.ChartItem>(
      this.configService
        .getRootElementDom()
        .querySelector<HTMLElement>('#' + this.canvasIdContainer)
    );

    if (this.ctx) {
      // Destroy old chart if exists
      // Do it even if canvas is undefined to remove other canvas ids
      try {
        this.chart?.destroy();
      } catch (e) {}

      const chartAreaBorder = {
        id: 'chartAreaBorder',
        beforeDraw(
          chart: Chart,
          _args: Record<string, unknown>,
          options: ChartJs.LineOptions,
        ) {
          const {
            ctx,
            chartArea: { left, top, width, height },
          } = chart;
          ctx.save();
          ctx.strokeStyle = options.borderColor;
          ctx.lineWidth = options.borderWidth;
          ctx.setLineDash(options.borderDash || []);
          ctx.lineDashOffset = options.borderDashOffset;
          ctx.strokeRect(left, top, width, height);
          ctx.restore();
        },
      };

      let options: ChartOptions = createDefaultChartOptions({
        color: this.color,
        fontColor: this.fontColor,
        graphClickEvent: this.graphClickEvent.bind(this),
      });

      // Merge chart options
      options = UtilsService.mergeDeep(options, this.chartOptions);
      ChartJs.Chart.register.apply(
        null,
        // @ts-ignore
        Object.values(ChartJs).filter((chartClass) => chartClass.id),
      );

      const data: ChartJs.ChartData = { datasets: [], labels: [] };
      const config: ChartJs.ChartConfiguration = {
        type: this.type,
        data: data,
        options: options,
        plugins: [chartAreaBorder],
      };
      this.chart = new ChartJs.Chart(this.ctx, config);
    }
  }

  /**
   * Handles changes to input properties and updates the chart accordingly.
   * @param changes - The changes detected in input properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (
      this.chart &&
      changes.selectedLineChartItem &&
      changes.selectedLineChartItem.currentValue !== undefined
    ) {
      // can be ''
      this.colorize();
      this.chart.update();
    }

    if (changes.inputDatas?.currentValue) {
      this.updateGraph();
    }

    if (changes.chartOptions?.currentValue) {
      // We must reconstruct the chart if the scale change
      this.initChart();
    }

    if (
      changes.activeEntries &&
      changes.activeEntries.currentValue !== undefined
    ) {
      // can be 0
      this.updateGraph();
    }

    if (changes.scaleValue?.currentValue && !changes.scaleValue.firstChange) {
      this.updateGraph();
    }
  }

  /**
   * Updates the chart data and refreshes the chart display.
   */
  private updateGraph() {
    setTimeout(
      () => {
        if (this.inputDatas && this.chart) {
          // Update datas
          // @ts-ignore force khiops VO into Chart dataset
          this.chart.data.datasets = this.inputDatas.datasets;
          this.chart.data.labels = this.inputDatas.labels;

          this.colorize();
          if (this.activeEntries !== undefined) {
            // can be 0
            // Select previous value if set
            this.selectCurrentBarIndex(this.activeEntries);
          }
          this.chart.update();
          this.isLoading = false;
        }
      },
      this.isLoading ? 100 : 0,
    );
  }

  /**
   * Hides the active entries in the chart.
   */
  public hideActiveEntries() {
    this.selectCurrentBarIndex(undefined);
    this.chart?.update();
  }

  /**
   * Shows the active entries in the chart.
   */
  public showActiveEntries() {
    this.selectCurrentBarIndex(this.activeEntries);
    this.chart?.update();
  }

  /**
   * Handles click events on the chart and updates the selection state.
   * @param _e - The chart event.
   * @param items - The active elements clicked on the chart.
   */
  private graphClickEvent(_e: ChartEvent, items: ActiveElement[]) {
    if (this.enableSelection) {
      const l = items.length;
      if (l > 0) {
        for (let i = 0; i < l; i++) {
          // undefined if click outside bar
          const item = items[i];
          if (item && item.index !== undefined) {
            const selectedIndex = item.index;
            this.selectCurrentBarIndex(selectedIndex);
            this.selectBarIndex.emit(item.index);
            this.chart?.update();
          }
        }
      }
    }
  }

  /**
   * Selects the current bar index in the chart and updates its appearance.
   * @param index - The index of the bar to select.
   */
  private selectCurrentBarIndex(index: number | undefined) {
    if (this.chart && this.enableSelection) {
      this.colorize();
      for (let i = 0; i < this.chart.data.datasets.length; i++) {
        const dataset = <ChartDatasetModel>this.chart.data.datasets[i];
        dataset.borderColor![index!] = this.barColor;
        dataset.borderSkipped = false;
        dataset.borderWidth = 2;
      }
    }
  }

  /**
   * Applies colorization to the chart datasets based on the input data.
   */
  private colorize() {
    if (this.chart && this.inputDatas) {
      for (let i = 0; i < this.chart.data.datasets.length; i++) {
        const dataset: ChartDatasetModel = <ChartDatasetModel>(
          this.chart.data.datasets[i]
        );
        if (!dataset.borderWidth) {
          dataset.borderSkipped = false;
          dataset.borderWidth = 2;
        }

        dataset.backgroundColor = new Array(this.inputDatas.labels.length).fill(
          UtilsService.hexToRGBa(this.colorSet?.domain[i]!, 0.8),
        );
        const defaultGroupIndex = dataset.extra?.findIndex(
          (e: ChartDatasetExtra) => e.defaultGroupIndex,
        );
        if (defaultGroupIndex !== -1) {
          // @ts-ignore
          dataset.backgroundColor[defaultGroupIndex] = UtilsService.hexToRGBa(
            this.colorSet?.domain[i]!,
            0.5,
          );
        }

        let borderOpacity = 1;
        if (dataset.type === CHART_TYPES.LINE) {
          // hide non selected lines
          if (this.selectedLineChartItem === '') {
            dataset.borderWidth = 2;
          }
          if (this.selectedLineChartItem && this.selectedLineChartItem !== '') {
            if (this.selectedLineChartItem !== dataset.label) {
              borderOpacity = 0.85;
            } else {
              dataset.borderWidth = 4;
            }
          }
        }

        dataset.borderColor = new Array(this.inputDatas.labels.length).fill(
          UtilsService.hexToRGBa(this.colorSet?.domain[i]!, borderOpacity),
        );

        if (defaultGroupIndex !== -1) {
          // @ts-ignore
          dataset.borderColor[defaultGroupIndex] = UtilsService.hexToRGBa(
            '#ff6600',
            0.9,
          );
        }
      }
    }
  }

  /**
   * Handles keyboard events to navigate through active entries in the chart.
   * @param event - The keyboard event.
   */
  onKeyUp(event: KeyboardEvent) {
    if (this.activeEntries !== undefined) {
      // can be 0
      if (event.key === 'ArrowLeft' && this.activeEntries > 0) {
        this.activeEntries = this.activeEntries - 1;
      }
      if (
        event.code === 'ArrowRight' &&
        this.activeEntries < this.inputDatas!.labels.length - 1
      ) {
        this.activeEntries = this.activeEntries + 1;
      }
      this.selectCurrentBarIndex(this.activeEntries);
      this.chart?.update();
      this.selectBarIndex.emit(this.activeEntries);
    }
  }
}
