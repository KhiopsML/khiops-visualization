/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import * as ChartJs from 'chart.js';
import type { ChartEvent, ActiveElement, Chart } from 'chart.js';
import type { ActiveDataPoint } from 'chart.js';

import { UtilsService } from '../../providers/utils.service';
import { ChartColorsSetI } from '../../interfaces/chart-colors-set.interface';
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
 * Enables an orange dashed selection frame for selected bar columns.
 * When enabled, selected bars are highlighted with a 1px dashed outline
 * from chart top to bar base (with 2px padding) instead of a black border.
 */
const DASHED_SELECTION = true;

/**
 * Controls dashed selection frame height behavior.
 * - true: full chart height (+ top/bottom padding)
 * - false: max selected bar height (+ top/bottom padding)
 */
const DASHED_SELECTION_FULL = false;

/**
 * Color used for dashed selection outlines.
 */
const DASHED_SELECTION_COLOR = '#f84700';

/**
 * Dashed selection outline width in pixels.
 */
const DASHED_SELECTION_LINE_WIDTH = 1;

/**
 * Padding around selected bar columns for dashed selection outlines.
 */
const DASHED_SELECTION_PADDING = 5;

/**
 * Enables full-height click selection on bar charts.
 * - false: keep default behavior (must click on chart element)
 * - true: clicking anywhere vertically at a bar X position selects that bar
 */
const FULL_CLICK = true;

/**
 * Enables padded hover hitboxes for bars.
 * - false: keep default hover behavior
 * - true: hover can be detected within an expanded rectangle around bars
 */
const FULL_HOVER = true;

/**
 * Extra hover hitbox padding in pixels.
 * Uses dashed selection padding so hover area matches selection frame size.
 */
const HOVER_HITBOX_PADDING = DASHED_SELECTION_PADDING;

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
  private selectedBarIndex: number | undefined;

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

      const shadowPlugin = {
        id: 'selectedBarShadow',
        beforeDatasetsDraw: (chart: ChartJs.Chart) => {
          if (this.selectedBarIndex === undefined) return;
          const ctx = chart.ctx;
          ctx.save();
          // ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;
          // ctx.fillStyle = 'rgb(0 0 0)';
          for (let i = 0; i < chart.data.datasets.length; i++) {
            const meta = chart.getDatasetMeta(i);
            if (meta.hidden) continue;
            // @ts-ignore
            const el = meta.data[this.selectedBarIndex] as any;
            if (!el) continue;
            // Draw a solid opaque rectangle so the canvas shadow is fully opaque
            const barX = el.x - el.width / 2;
            const barY = el.y;
            const barW = el.width;
            const barH = el.base - el.y;
            ctx.fillRect(barX, barY, barW, barH);
          }
          ctx.restore();
        },
      };

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

      const dashedSelectionPlugin = {
        id: 'dashedSelection',
        afterDatasetsDraw: (chart: ChartJs.Chart) => {
          if (!DASHED_SELECTION || this.selectedBarIndex === undefined) {
            return;
          }

          const ctx = chart.ctx;
          const chartArea = chart.chartArea;
          if (!chartArea) {
            return;
          }

          ctx.save();
          ctx.strokeStyle = DASHED_SELECTION_COLOR;
          ctx.lineWidth = DASHED_SELECTION_LINE_WIDTH;
          ctx.setLineDash([4, 3]);

          const selectedBars: any[] = [];

          for (let i = 0; i < chart.data.datasets.length; i++) {
            const meta = chart.getDatasetMeta(i);
            if (meta.type !== CHART_TYPES.BAR) {
              continue;
            }
            if (meta.hidden) {
              continue;
            }

            // @ts-ignore
            const el = meta.data[this.selectedBarIndex] as any;
            if (!el) {
              continue;
            }

            selectedBars.push(el);
          }

          if (selectedBars.length > 0) {
            const left = Math.min(
              ...selectedBars.map((bar) => bar.x - bar.width / 2),
            );
            const right = Math.max(
              ...selectedBars.map((bar) => bar.x + bar.width / 2),
            );

            const x = left - DASHED_SELECTION_PADDING;
            const width = right - left + DASHED_SELECTION_PADDING * 2;
            const y = DASHED_SELECTION_FULL
              ? chartArea.top - DASHED_SELECTION_PADDING
              : Math.min(...selectedBars.map((bar) => bar.y)) -
                DASHED_SELECTION_PADDING;
            const bottom = DASHED_SELECTION_FULL
              ? chartArea.bottom + DASHED_SELECTION_PADDING
              : Math.max(...selectedBars.map((bar) => bar.base)) +
                DASHED_SELECTION_PADDING;
            const height = Math.max(1, bottom - y);

            ctx.strokeRect(x, y, width, height);
          }

          ctx.restore();
        },
      };

      const hoverPaddingPlugin = {
        id: 'hoverPadding',
        afterEvent: (
          chart: ChartJs.Chart,
          args: {
            event: ChartEvent;
            replay: boolean;
            changed?: boolean;
            cancelable: false;
            inChartArea: boolean;
          },
        ) => {
          if (!FULL_HOVER) {
            return;
          }

          const event = args.event;
          if (!event) {
            return;
          }

          if (event.type !== 'mousemove' && event.type !== 'mouseout') {
            return;
          }

          const clearHover = () => {
            chart.setActiveElements([]);
            chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
            args.changed = true;
          };

          if (event.type === 'mouseout') {
            clearHover();
            return;
          }

          if (typeof event.x !== 'number' || typeof event.y !== 'number') {
            return;
          }

          const chartArea = chart.chartArea;
          if (!chartArea) {
            return;
          }

          const visibleBarMetas: Array<{ datasetIndex: number; meta: any }> =
            [];
          for (let i = 0; i < chart.data.datasets.length; i++) {
            const meta = chart.getDatasetMeta(i);
            if (meta.type !== CHART_TYPES.BAR || meta.hidden) {
              continue;
            }
            visibleBarMetas.push({ datasetIndex: i, meta });
          }

          if (visibleBarMetas.length === 0) {
            return;
          }

          const labelCount = chart.data.labels?.length ?? 0;
          let hoveredElement: ActiveDataPoint | undefined;
          let bestDistance = Number.POSITIVE_INFINITY;

          for (let index = 0; index < labelCount; index++) {
            for (const { datasetIndex, meta } of visibleBarMetas) {
              const bar = meta.data[index] as any;
              if (!bar) {
                continue;
              }

              const left = bar.x - bar.width / 2 - HOVER_HITBOX_PADDING;
              const right = bar.x + bar.width / 2 + HOVER_HITBOX_PADDING;
              const top = DASHED_SELECTION_FULL
                ? chartArea.top - HOVER_HITBOX_PADDING
                : Math.min(bar.y, bar.base) - HOVER_HITBOX_PADDING;
              const bottom = DASHED_SELECTION_FULL
                ? chartArea.bottom + HOVER_HITBOX_PADDING
                : Math.max(bar.y, bar.base) + HOVER_HITBOX_PADDING;

              if (
                event.x >= left &&
                event.x <= right &&
                event.y >= top &&
                event.y <= bottom
              ) {
                // Keep closest bar when padded hitboxes overlap.
                const distance = Math.abs(event.x - bar.x);
                if (distance < bestDistance) {
                  bestDistance = distance;
                  hoveredElement = { datasetIndex, index };
                }
              }
            }
          }

          if (!hoveredElement) {
            clearHover();
            return;
          }

          const activeElements: ActiveDataPoint[] = [hoveredElement];

          if (activeElements.length === 0) {
            clearHover();
            return;
          }

          chart.setActiveElements(activeElements);
          chart.tooltip?.setActiveElements(activeElements, {
            x: event.x,
            y: event.y,
          });
          args.changed = true;
        },
      };

      let options: ChartOptions = createDefaultChartOptions({
        color: this.color,
        fontColor: this.fontColor,
        graphClickEvent: graphClickEvent,
      });

      // Merge chart options
      options = UtilsService.mergeDeep(options, chartOptions);

      // When FULL_CLICK is enabled, keep default click behavior first;
      // if no element is hit, fallback to X-axis index detection.
      options.onClick = (
        event: ChartEvent,
        items: ActiveElement[],
        chart: ChartJs.Chart,
      ) => {
        if (!FULL_CLICK || items.length > 0) {
          graphClickEvent(event, items);
          return;
        }

        const fullHeightItems = chart.getElementsAtEventForMode(
          event as unknown as Event,
          'index',
          {
            axis: 'x',
            intersect: false,
          },
          false,
        ) as ActiveElement[];

        graphClickEvent(event, fullHeightItems);
      };

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
        plugins: [
          shadowPlugin,
          chartAreaBorder,
          dashedSelectionPlugin,
          hoverPaddingPlugin,
        ],
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
    const run = () => {
      if (
        inputDatas &&
        this.chart &&
        (inputDatas.datasets.length === 0 ||
          inputDatas.datasets[0]?.data.length > 0)
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

        const hasVisibleXLabels = inputDatas.labels.some(
          (label) => String(label ?? '').trim().length > 0,
        );

        // Hide X ticks when labels are empty to reclaim bottom area for plot.
        const xScale = this.chart.options.scales?.['x'] as
          { ticks?: Record<string, unknown> } | undefined;
        if (xScale?.ticks) {
          const xTicks = xScale.ticks as Record<string, unknown>;
          xTicks.display = hasVisibleXLabels;
          xTicks.autoSkipPadding = hasVisibleXLabels ? 5 : 0;
          xTicks.maxRotation = 0;
          xTicks.minRotation = 0;
        }

        if (activeEntries !== undefined) {
          this.selectedBarIndex = activeEntries;
        }
        this.colorize(inputDatas, colorSet, selectedLineChartItem);
        if (activeEntries !== undefined) {
          // can be 0
          // Select previous value if set
          this.selectCurrentBarIndex(activeEntries, true);
        }
        this.chart.update();
      }
    };

    // Only delay when chart is in loading state, otherwise run directly
    if (isLoading) {
      setTimeout(run, 100);
    } else {
      run();
    }
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
      this.selectedBarIndex = index;
      if (inputDatas) {
        this.colorize(inputDatas, colorSet, selectedLineChartItem);
      }
      for (let i = 0; i < this.chart.data.datasets.length; i++) {
        const dataset = <ChartDatasetModel>this.chart.data.datasets[i];
        if (index !== undefined) {
          if (!DASHED_SELECTION) {
            dataset.borderColor![index] = this.barColor;
            if (
              dataset.type !== CHART_TYPES.LINE &&
              Array.isArray(dataset.borderWidth)
            ) {
              dataset.borderWidth[index] = 2;
            }
          }
        }
        dataset.borderSkipped = false;
      }
    }
  }

  /**
   * Creates a diagonal hatching canvas pattern over a base color.
   * @param color - The base fill color for the pattern
   * @returns A CanvasPattern with hatching, or the original color string if canvas is unavailable
   */
  private createHatchPattern(color: string): CanvasPattern | string {
    const size = 20;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return color;

    // Fill with base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Draw multiple parallel diagonal lines that connect seamlessly when tiled
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.imageSmoothingEnabled = false;

    const spacing = 10;
    // Draw lines across the full tile and beyond to connect seamlessly
    for (let offset = -size; offset < size * 2; offset += spacing) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + size, size);
      ctx.stroke();
    }

    return ctx.createPattern(canvas, 'repeat') || color;
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

        const baseColor = colorSet?.domain[i]!;
        if (dataset.type === CHART_TYPES.LINE) {
          dataset.backgroundColor = new Array(inputDatas.labels.length).fill(
            UtilsService.hexToRGBa(baseColor, 0.7),
          );
        } else {
          dataset.backgroundColor = new Array(inputDatas.labels.length).fill(
            UtilsService.hexToRGBa(baseColor, 0.7),
          );
        }
        const defaultGroupIndex = dataset.extra?.findIndex(
          (e: ChartDatasetExtra) => e.defaultGroupIndex,
        );
        // Apply hatching for default group index bar, keeping the same base color
        if (defaultGroupIndex !== -1 && defaultGroupIndex !== undefined) {
          const hatchColor = UtilsService.hexToRGBa(baseColor, 0.7);
          // @ts-ignore
          dataset.backgroundColor[defaultGroupIndex] = this.createHatchPattern(
            hatchColor ?? '',
          );
        }
        // Selected bar gets full opacity
        if (this.selectedBarIndex !== undefined) {
          const index = this.selectedBarIndex;
          if (index === defaultGroupIndex) {
            // Selected default group bar: full opacity with hatching
            const fullColor = UtilsService.hexToRGBa(baseColor, 1);
            // @ts-ignore
            (dataset.backgroundColor as (string | CanvasPattern)[])[index] =
              this.createHatchPattern(fullColor ?? '');
          } else if (dataset.type === CHART_TYPES.LINE) {
            (dataset.backgroundColor as string[])[index] =
              UtilsService.hexToRGBa(baseColor, 1) ?? '';
          } else {
            (dataset.backgroundColor as string[])[index] =
              UtilsService.hexToRGBa(baseColor, 1) ?? '';
          }
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
          UtilsService.hexToRGBa(baseColor, borderOpacity),
        );

        if (dataset.type !== CHART_TYPES.LINE) {
          // Only draw a border on the selected bar and the default group bar
          const barBorderWidth = new Array(inputDatas.labels.length).fill(0);
          if (defaultGroupIndex !== -1 && defaultGroupIndex !== undefined) {
            barBorderWidth[defaultGroupIndex] = 2;
          }
          if (!DASHED_SELECTION && this.selectedBarIndex !== undefined) {
            barBorderWidth[this.selectedBarIndex] = 2;
          }
          dataset.borderWidth = barBorderWidth;

          // Chart.js expects a corner object; only convert once, the array/number form is the source of truth
          if (Array.isArray(dataset.borderRadius)) {
            const [topLeft, topRight, bottomLeft, bottomRight] =
              dataset.borderRadius;
            dataset.borderRadius = {
              topLeft: topLeft ?? 0,
              topRight: topRight ?? 0,
              bottomLeft: bottomLeft ?? 0,
              bottomRight: bottomRight ?? 0,
            };
          } else if (typeof dataset.borderRadius === 'number') {
            const radius = dataset.borderRadius;
            dataset.borderRadius = {
              topLeft: radius,
              topRight: radius,
              bottomLeft: 0,
              bottomRight: 0,
            };
          }
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
    this.selectedBarIndex = undefined;
  }
}
