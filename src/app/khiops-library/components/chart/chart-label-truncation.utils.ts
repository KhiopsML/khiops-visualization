/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { UtilsService } from '@khiops-library/providers/utils.service';

/**
 * Minimum number of characters to display in a truncated X-axis label.
 * Prevents labels from becoming unreadable (e.g. "A…") on very dense charts.
 */
const MIN_LABEL_LENGTH = 10;

/**
 * Maximum number of characters to display in an X-axis label.
 * Avoids overly long labels even when there is plenty of space.
 */
const MAX_LABEL_LENGTH = 40;

/**
 * Scaling factor applied to the per-bar pixel ratio to convert it to
 * a character count. Calibrated so that approximately 0.24 characters
 * fit in each pixel of space allocated per bar.
 */
const LABEL_LENGTH_SCALE_FACTOR = 0.24;

/**
 * Utility class for handling dynamic X-axis label truncation in charts.
 * Provides methods to compute appropriate label lengths based on available space
 * and number of bars, then truncate labels with ellipsis accordingly.
 */
export class ChartLabelTruncationUtils {
  /**
   * Get X-axis tick callback value with dynamic cropping based on
   * available chart width and number of bars.
   *
   * @param tickValue The tick value from Chart.js
   * @param getLabelForValue Chart.js function to get the actual label from a value
   * @param chartWidth The current pixel width of the chart canvas
   * @param barCount The total number of bars in the chart
   * @returns Formatted label with ellipsis if needed
   */
  static getXAxisTickValue(
    tickValue: string | number,
    getLabelForValue: (value: number) => string,
    chartWidth: number,
    barCount: number,
  ): string {
    const value =
      typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
    const label = getLabelForValue(value);

    const maxLength = this.computeXAxisMaxLength(chartWidth, barCount);
    return UtilsService.ellipsis(label, maxLength);
  }

  /**
   * Computes the maximum number of characters to display on an X-axis label
   * based on the available container width and the number of bars in the chart.
   *
   * The result is proportional: more space per bar → longer labels,
   * less space per bar → shorter labels. The value is always clamped
   * between MIN_LABEL_LENGTH and MAX_LABEL_LENGTH.
   *
   * @param availableWidth The pixel width of the chart container
   * @param barCount The number of bars (or data points) rendered on the X axis
   * @returns The maximum character count for X-axis labels
   */
  static computeXAxisMaxLength(
    availableWidth: number,
    barCount: number,
  ): number {
    if (!barCount || barCount <= 0) {
      return MAX_LABEL_LENGTH;
    }

    const pixelsPerBar = availableWidth / barCount;
    const rawLength = Math.round(pixelsPerBar * LABEL_LENGTH_SCALE_FACTOR);

    return Math.min(MAX_LABEL_LENGTH, Math.max(MIN_LABEL_LENGTH, rawLength));
  }
}
