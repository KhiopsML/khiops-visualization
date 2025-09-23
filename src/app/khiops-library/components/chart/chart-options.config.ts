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
  displayColors?: boolean; // Optional parameter to control color square display in tooltips
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
        enabled: false,
        external: function (context) {
          // Tooltip Element
          let tooltipEl = document.getElementById('chartjs-tooltip');

          // Create element on first render
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.background = 'rgba(0, 0, 0, 0.8)';
            tooltipEl.style.color = 'white';
            tooltipEl.style.borderRadius = '3px';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.opacity = '0';
            tooltipEl.style.transition = 'all .25s ease';
            tooltipEl.style.fontFamily = 'Poppins, Verdana, Arial, sans-serif';
            tooltipEl.style.fontSize = '12.5px';
            tooltipEl.style.fontWeight = 'normal';
            tooltipEl.style.lineHeight = '1.2';
            tooltipEl.style.padding = '10px';
            tooltipEl.style.zIndex = '10000';
            document.body.appendChild(tooltipEl);
          }

          const tooltipModel = context.tooltip;
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          // Set Text
          if (tooltipModel.body) {
            const titleLines = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map((item) => item.lines);

            let innerHtml = '<div>';

            titleLines.forEach(function (title) {
              innerHtml +=
                '<div style="font-weight: bold; margin-bottom: 10px;">' +
                title +
                '</div>';
            });

            bodyLines.forEach(function (body, i) {
              const colors = tooltipModel.labelColors[i];
              // Only display color squares if displayColors is not explicitly set to false
              const shouldDisplayColors = params.displayColors !== false;

              if (colors && shouldDisplayColors) {
                innerHtml +=
                  '<div style="display: flex; align-items: center; margin-bottom: 3px;">';
                innerHtml +=
                  '<span style="display: inline-block; width: 12px; height: 12px; background-color: ' +
                  colors.backgroundColor +
                  '; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 0 4px rgba(0, 0, 0, 0.9), inset 0 0 2px rgba(255, 255, 255, 0.2)' +
                  '; margin-right: 10px; border-radius: 3px;"></span>';
                innerHtml += '<span>' + body + '</span>';
                innerHtml += '</div>';
              } else {
                innerHtml += '<div>' + body + '</div>';
              }
            });

            innerHtml += '</div>';
            tooltipEl.innerHTML = innerHtml;
          }

          const position = context.chart.canvas.getBoundingClientRect();

          // Set minimum width and smart positioning
          tooltipEl.style.minWidth = '200px';
          tooltipEl.style.maxWidth = '300px';
          tooltipEl.style.whiteSpace = 'nowrap';

          // Calculate initial position
          let leftPos =
            position.left + window.pageXOffset + tooltipModel.caretX + 10;
          const topPos =
            position.top + window.pageYOffset + tooltipModel.caretY - 10;

          // Check if tooltip would overflow on the right
          const tooltipWidth = tooltipEl.offsetWidth || 200; // fallback to min width
          const windowWidth = window.innerWidth;

          if (leftPos + tooltipWidth > windowWidth - 20) {
            // Position to the left of the cursor instead
            leftPos =
              position.left +
              window.pageXOffset +
              tooltipModel.caretX -
              tooltipWidth -
              10;

            // Ensure it doesn't go off the left edge
            if (leftPos < 20) {
              leftPos = 20;
            }
          }

          // Display, position, and set styles for font
          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = leftPos + 'px';
          tooltipEl.style.top = topPos + 'px';
        },
        boxPadding: 10,
        titleFont: {
          family: 'Poppins, Verdana, Arial, sans-serif',
          size: 12.5,
          weight: 'bold',
          lineHeight: 1.2,
        },
        bodyFont: {
          family: 'Poppins, Verdana, Arial, sans-serif',
          size: 12.5,
          weight: 'normal',
          lineHeight: 1.2,
        },
        titleMarginBottom: 10,
        titleSpacing: 3,
        bodySpacing: 3,
        footerSpacing: 3,
        caretSize: 0,
        // Tooltip-specific animations
        animation: {
          duration: 250,
          easing: 'easeOutQuart',
        },
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
    animation: {
      duration: 0, // Disable animations for chart elements (bars, lines, etc.)
      resize: {
        duration: 0,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    onClick: params.graphClickEvent,
    scales: {
      y: {
        border: {
          dash: [10, 5],
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
          dash: [4, 5],
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
