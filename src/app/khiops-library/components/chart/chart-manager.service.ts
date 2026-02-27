/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import * as ChartJs from 'chart.js';
import type { ChartEvent, ActiveElement, Chart } from 'chart.js';

import { UtilsService } from '../../providers/utils.service';
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

/**
 * Service to manage Chart.js operations and configurations.
 * Handles chart initialization, colorization, selection, and updates.
 */
@Injectable()
export class ChartManagerService {
  private chart: ChartJs.Chart | undefined;
  private color: string = '#eeeeee';
  private barColor: string = 'rgba(0, 0, 0, 1)';
  private fontColor: string = '#999';
  private lastDataHash: string | null = null;

  constructor(private configService: ConfigService) {}

  /**
   * Creates a hash from the input data to detect changes.
   * @param inputDatas - The chart data
   * @param activeEntries - The active entries index
   * @param colorSet - The color set
   * @param selectedLineChartItem - The selected line chart item
   * @returns A hash string representing the current state
   */
  private createDataHash(
    inputDatas: ChartDatasModel,
    activeEntries: number | undefined,
    colorSet: ChartColorsSetI | undefined,
    selectedLineChartItem: string | undefined,
  ): string {
    // Create a normalized representation for better comparison
    const normalizedData = {
      datasets:
        inputDatas.datasets?.map((dataset) => ({
          data: dataset.data,
          label: dataset.label,
          type: dataset.type,
        })) || [],
      labels: inputDatas.labels || [],
      activeEntries: activeEntries,
      colorSetDomain: colorSet?.domain || null,
      selectedLineChartItem: selectedLineChartItem || null,
    };

    const dataString = JSON.stringify(normalizedData, null, 0); // No indentation for consistent string

    // Improved hash function (djb2 algorithm)
    let hash = 5381;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) + hash + char; // hash * 33 + char
    }
    return (hash >>> 0).toString(); // Convert to unsigned 32-bit integer
  }

  /**
   * Initializes the chart instance and sets up its configuration.
   * @param canvasIdContainer - The ID of the canvas container
   * @param type - The type of chart to create
   * @param chartOptions - Optional chart configuration options
   * @param graphClickEvent - Callback function for chart click events
   * @returns True if chart was successfully initialized, false otherwise
   */
  initChart(
    canvasIdContainer: string,
    type: ChartJs.ChartType,
    chartOptions: ChartOptions | undefined,
    graphClickEvent: (_e: ChartEvent, items: ActiveElement[]) => void,
    hostElement?: HTMLElement,
  ): boolean {
    const searchContext = hostElement || this.configService.getRootElementDom();
    if (!searchContext) {
      return false;
    }
    const ctx = <ChartJs.ChartItem>(
      searchContext.querySelector<HTMLElement>('#' + canvasIdContainer)
    );

    if (ctx) {
      // Destroy old chart if exists
      // Do it even if canvas is undefined to remove other canvas ids
      try {
        this.chart?.destroy();
      } catch (e) {}
      this.lastDataHash = null; // Reset hash when reinitializing chart

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
        graphClickEvent: graphClickEvent,
      });

      // Merge chart options
      options = UtilsService.mergeDeep(options, chartOptions);
      ChartJs.Chart.register.apply(
        null,
        // @ts-ignore
        Object.values(ChartJs).filter((chartClass) => chartClass.id),
      );

      const data: ChartJs.ChartData = { datasets: [], labels: [] };
      const config: ChartJs.ChartConfiguration = {
        type: type,
        data: data,
        options: options,
        plugins: [chartAreaBorder],
      };
      this.chart = new ChartJs.Chart(ctx, config);
      return true;
    }
    return false;
  }

  /**
   * Updates the chart data and refreshes the chart display.
   * @param inputDatas - The data to display in the chart
   * @param activeEntries - The index of active entries to highlight
   * @param colorSet - The color set to use for styling
   * @param selectedLineChartItem - The selected line chart item for line charts
   * @param isLoading - Whether the chart is in loading state
   */
  updateGraph(
    inputDatas: ChartDatasModel,
    activeEntries: number | undefined,
    colorSet: ChartColorsSetI | undefined,
    selectedLineChartItem: string | undefined,
    isLoading: boolean,
  ): void {
    setTimeout(
      () => {
        if (
          inputDatas &&
          this.chart &&
          inputDatas.datasets[0]?.data.length > 0
        ) {
          // Create hash of current data state
          const currentDataHash = this.createDataHash(
            inputDatas,
            activeEntries,
            colorSet,
            selectedLineChartItem,
          );

          // Check if data has changed
          if (currentDataHash === this.lastDataHash) {
            // No changes detected, skip update
            return;
          }

          // Update last hash
          this.lastDataHash = currentDataHash;

          // Update datas
          // Force khiops VO into Chart dataset
          // @ts-ignore
          this.chart.data.datasets = inputDatas.datasets;
          this.chart.data.labels = inputDatas.labels;

          this.colorize(inputDatas, colorSet, selectedLineChartItem);
          if (activeEntries !== undefined) {
            // can be 0
            // Select previous value if set
            this.selectCurrentBarIndex(activeEntries, true);
          }
          this.chart.update();
        }
      },
      isLoading ? 100 : 0,
    );
  }

  /**
   * Hides the active entries in the chart.
   * @param inputDatas - The chart data
   * @param colorSet - The color set to use
   * @param selectedLineChartItem - The selected line chart item
   */
  hideActiveEntries(
    inputDatas?: ChartDatasModel,
    colorSet?: ChartColorsSetI,
    selectedLineChartItem?: string,
  ): void {
    this.selectCurrentBarIndex(
      undefined,
      true,
      inputDatas,
      colorSet,
      selectedLineChartItem,
    );
    this.chart?.update();
  }

  /**
   * Shows the active entries in the chart.
   * @param activeEntries - The index of active entries to show
   * @param inputDatas - The chart data
   * @param colorSet - The color set to use
   * @param selectedLineChartItem - The selected line chart item
   */
  showActiveEntries(
    activeEntries: number | undefined,
    inputDatas?: ChartDatasModel,
    colorSet?: ChartColorsSetI,
    selectedLineChartItem?: string,
  ): void {
    this.selectCurrentBarIndex(
      activeEntries,
      true,
      inputDatas,
      colorSet,
      selectedLineChartItem,
    );
    this.chart?.update();
  }

  /**
   * Selects the current bar index in the chart and updates its appearance.
   * @param index - The index of the bar to select
   * @param enableSelection - Whether selection is enabled
   * @param inputDatas - The chart data
   * @param colorSet - The color set to use
   * @param selectedLineChartItem - The selected line chart item
   */
  selectCurrentBarIndex(
    index: number | undefined,
    enableSelection: boolean,
    inputDatas?: ChartDatasModel,
    colorSet?: ChartColorsSetI,
    selectedLineChartItem?: string,
  ): void {
    if (this.chart && enableSelection) {
      if (inputDatas) {
        this.colorize(inputDatas, colorSet, selectedLineChartItem);
      }
      for (let i = 0; i < this.chart.data.datasets.length; i++) {
        const dataset = <ChartDatasetModel>this.chart.data.datasets[i];
        if (index !== undefined) {
          dataset.borderColor![index] = this.barColor;
        }
        dataset.borderSkipped = false;
        dataset.borderWidth = 2;
      }
    }
  }

  /**
   * Applies colorization to the chart datasets based on the input data.
   * @param inputDatas - The chart data
   * @param colorSet - The color set to use
   * @param selectedLineChartItem - The selected line chart item
   */
  colorize(
    inputDatas: ChartDatasModel,
    colorSet: ChartColorsSetI | undefined,
    selectedLineChartItem: string | undefined,
  ): void {
    if (this.chart && inputDatas) {
      for (let i = 0; i < this.chart.data.datasets.length; i++) {
        const dataset: ChartDatasetModel = <ChartDatasetModel>(
          this.chart.data.datasets[i]
        );
        if (!dataset.borderWidth) {
          dataset.borderSkipped = false;
          dataset.borderWidth = 2;
        }

        dataset.backgroundColor = new Array(inputDatas.labels.length).fill(
          UtilsService.hexToRGBa(colorSet?.domain[i]!, 0.7),
        );
        const defaultGroupIndex = dataset.extra?.findIndex(
          (e: ChartDatasetExtra) => e.defaultGroupIndex,
        );
        if (defaultGroupIndex !== -1) {
          // @ts-ignore
          dataset.backgroundColor[defaultGroupIndex] = UtilsService.hexToRGBa(
            colorSet?.domain[i]!,
            0.5,
          );
        }

        let borderOpacity = 1;
        if (dataset.type === CHART_TYPES.LINE) {
          // hide non selected lines
          if (selectedLineChartItem === '') {
            dataset.borderWidth = 2;
          }
          if (selectedLineChartItem && selectedLineChartItem !== '') {
            if (selectedLineChartItem !== dataset.label) {
              borderOpacity = 0.85;
            } else {
              dataset.borderWidth = 4;
            }
          }
        }

        dataset.borderColor = new Array(inputDatas.labels.length).fill(
          UtilsService.hexToRGBa(colorSet?.domain[i]!, borderOpacity),
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
   * Updates the chart display.
   */
  updateChart(): void {
    this.chart?.update();
  }

  /**
   * Gets the current chart instance.
   * @returns The Chart.js instance or undefined if not initialized
   */
  getChart(): ChartJs.Chart | undefined {
    return this.chart;
  }

  /**
   * Destroys the current chart instance.
   */
  destroy(): void {
    try {
      this.chart?.destroy();
    } catch (e) {}
    this.chart = undefined;
    this.lastDataHash = null; // Reset hash when chart is destroyed
  }
}
