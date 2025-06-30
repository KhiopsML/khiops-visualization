/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// Define global constants for interval patterns
const INF_PATTERN = /\]-inf[;,]([\d.]+)\]/;
const RANGE_PATTERN = /\]([\d.]+)[;,]([\d.]+)\]/;
const PLUS_INF_PATTERN = /\]([\d.]+)[;,]\+inf\[/;

export class CompositionUtils {
  /**
   * Merges a list of intervals into a simplified form
   * @param intervals Array of interval strings to merge
   * @returns Array of simplified interval strings
   */
  static simplifyIntervals(intervals: string[]): string[] {
    if (intervals.length === 0) return [];

    // First, sort the intervals
    const sortedIntervals = this.sortIntervals(intervals);

    // Extract numeric ranges from the intervals
    const ranges: Array<{ lower: number; upper: number }> = [];

    sortedIntervals.forEach((interval) => {
      let lower: number, upper: number;

      if (INF_PATTERN.test(interval)) {
        const match = interval.match(INF_PATTERN);
        lower = -Infinity;
        upper = match ? parseFloat(match[1]!) : NaN;
      } else if (PLUS_INF_PATTERN.test(interval)) {
        const match = interval.match(PLUS_INF_PATTERN);
        lower = match ? parseFloat(match[1]!) : NaN;
        upper = Infinity;
      } else if (RANGE_PATTERN.test(interval)) {
        const match = interval.match(RANGE_PATTERN);
        lower = match ? parseFloat(match[1]!) : NaN;
        upper = match ? parseFloat(match[2]!) : NaN;
      } else {
        // Non-numeric interval, keep as is
        return;
      }

      ranges.push({ lower, upper });
    });

    // No ranges to merge
    if (ranges.length === 0) return sortedIntervals;

    // Merge overlapping or contiguous ranges
    const mergedRanges: Array<{ lower: number; upper: number }> = [];
    let currentRange = ranges[0];

    for (let i = 1; i < ranges.length; i++) {
      const range = ranges[i];

      // Check if current range overlaps or is contiguous with the next one
      if (
        // @ts-ignore
        currentRange.upper >= range.lower ||
        // @ts-ignore
        Math.abs(currentRange.upper - range.lower) < 0.0001
      ) {
        // Merge ranges
        // @ts-ignore
        currentRange.upper = Math.max(currentRange.upper, range.upper);
      } else {
        // No overlap, store current range and start a new one
        mergedRanges.push(currentRange!);
        currentRange = range;
      }
    }

    // Add the last range
    mergedRanges.push(currentRange!);

    // Convert back to interval strings
    const result = mergedRanges.map((range) => {
      const separator = intervals[0]?.includes(',') ? ',' : ';';
      if (range.lower === -Infinity && range.upper === Infinity) {
        return `]-inf${separator}+inf[`;
      } else if (range.lower === -Infinity) {
        return `]-inf${separator}${range.upper}]`;
      } else if (range.upper === Infinity) {
        return `]${range.lower}${separator}+inf[`;
      } else {
        return `]${range.lower}${separator}${range.upper}]`;
      }
    });

    return result;
  }

  /**
   * Sorts interval strings in ascending order
   * Handles multiple interval formats and special cases like -inf and +inf
   * @param intervals Array of interval strings to sort
   * @returns Sorted array of interval strings
   */
  static sortIntervals(intervals: string[]): string[] {
    return [...intervals].sort((a, b) => {
      // Helper function to extract numeric value from interval bound
      const extractBound = (interval: string, isStart: boolean): number => {
        // Handle ]-inf and +inf[ cases
        if (interval.includes('-inf')) return -Infinity;
        if (interval.includes('+inf')) return +Infinity;

        // Try specific patterns first for better precision
        if (INF_PATTERN.test(interval)) {
          const match = interval.match(INF_PATTERN);
          return isStart ? -Infinity : match ? parseFloat(match[1]!) : 0;
        } else if (PLUS_INF_PATTERN.test(interval)) {
          const match = interval.match(PLUS_INF_PATTERN);
          return isStart ? (match ? parseFloat(match[1]!) : 0) : Infinity;
        } else if (RANGE_PATTERN.test(interval)) {
          const match = interval.match(RANGE_PATTERN);
          if (match) {
            return isStart ? parseFloat(match[1]!) : parseFloat(match[2]!);
          }
        }

        // Fallback: Extract all numbers from interval format like [1.5, 3.2] or ]2, 5[
        const numbers = interval.match(/-?\d+(?:\.\d+)?/g);
        if (!numbers || numbers.length === 0) return 0;

        // Return start bound or end bound based on isStart parameter
        return parseFloat(isStart ? numbers[0]! : numbers[numbers.length - 1]!);
      };

      // Extract start bounds for comparison
      const startA = extractBound(a, true);
      const startB = extractBound(b, true);

      // Primary sort by start bound
      if (startA !== startB) {
        return startA - startB;
      }

      // Secondary sort by end bound if start bounds are equal
      const endA = extractBound(a, false);
      const endB = extractBound(b, false);

      return endA - endB;
    });
  }
}
