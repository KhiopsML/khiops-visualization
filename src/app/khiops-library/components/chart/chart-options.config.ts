/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ChartOptions } from 'chart.js';
import type { TooltipItem, ChartEvent, ActiveElement } from 'chart.js';

/**
 * Interface defining the parameters required to build chart options
 */
export interface ChartOptionsParams {
  color: string;
  fontColor: string;
  graphClickEvent: (e: ChartEvent, items: ActiveElement[]) => void;
}

/**
 * Creates default chart options for Chart.js components
 * @param params - Parameters containing colors and event handlers
 * @returns ChartOptions configuration object
 */
export function createDefaultChartOptions(
  params: ChartOptionsParams,
): ChartOptions {
  return {
    plugins: {
      chartAreaBorder: {
        borderColor: 'transparent',
        borderWidth: 0,
      },
      // https://www.chartjs.org/docs/latest/configuration/tooltip.html
      tooltip: {
        titleFont: {
          family: 'Poppins, Verdana, Arial, sans-serif',
          size: 12.5,
          weight: 'normal',
          lineHeight: 1.2,
        },
        bodyFont: {
          family: 'Poppins, Verdana, Arial, sans-serif',
          size: 12.5,
          weight: 'normal',
          lineHeight: 1.2,
        },
        titleMarginBottom: 3,
        titleSpacing: 3,
        bodySpacing: 3,
        footerSpacing: 3,
        caretSize: 0,
        callbacks: {
          title: (items: TooltipItem<'bar' | 'line'>[]): string => {
            if (items?.[0]) {
              return items[0].label;
            }
            return '';
          },
          label: (items: TooltipItem<'bar' | 'line'>): string => {
            if (items?.dataset) {
              return items.dataset.label || '';
            }
            return '';
          },
        },
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
      legend: {
        display: false,
      },
    },
    interaction: {
      mode: 'point',
    },
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    onClick: params.graphClickEvent,
    scales: {
      y: {
        border: {
          dash: [5, 5],
          display: false,
        },
        grid: {
          color: params.color,
          drawTick: false,
        },
        beginAtZero: true,
        min: 0,
        ticks: {
          color: params.fontColor,
          maxTicksLimit: 7,
          callback: function (value: string | number): string | number {
            // Fix axis labels display on responsive small size
            // For example 50 is displayed 50,00000000000
            return value;
          },
        },
      },
      x: {
        border: {
          dash: [5, 5],
          display: false,
        },
        grid: {
          color: params.color,
          drawTick: false,
          display: false,
        },
        min: 0,
        ticks: {
          color: params.fontColor,
          autoSkip: true,
          autoSkipPadding: 5,
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  } as ChartOptions;
}
