/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'kl-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GaugeComponent {
  @Input() value: number = 0;
  @Input() size: number = 60;

  /**
   * Get the percentage value ensuring it's between 0 and 100
   * @returns The percentage as a number (0-100)
   */
  getPercentageValue(): number {
    return Math.max(0, Math.min(100, this.value));
  }

  /**
   * Calculate the radius based on size
   * @returns The radius for the circles
   */
  getRadius(): number {
    return this.size * 0.4; // 40% of the size for the radius
  }

  /**
   * Get the center coordinates
   * @returns The center position
   */
  getCenter(): number {
    return this.size / 2;
  }

  /**
   * Get the viewBox dimensions
   * @returns The viewBox string
   */
  getViewBox(): string {
    const padding = this.size * 0.1; // 10% padding
    return `${-padding} ${-padding} ${this.size + 2 * padding} ${this.size + 2 * padding}`;
  }

  /**
   * Calculate stroke dash offset for the circular progress
   * @returns The dash offset value
   */
  getStrokeDashOffset(): number {
    const circumference = 2 * Math.PI * this.getRadius();
    return circumference - (this.getPercentageValue() / 100) * circumference;
  }

  /**
   * Get the stroke dash array for the circular progress
   * @returns The circumference value for dash array
   */
  getStrokeDashArray(): number {
    return 2 * Math.PI * this.getRadius();
  }

  /**
   * Get the font size - always 13px regardless of component size
   * @returns The font size in pixels (always 13px)
   */
  getFontSize(): number {
    return 16; // Fixed size regardless of component size
  }

  /**
   * Get the stroke width for the background circle
   * @returns The stroke width
   */
  getBackgroundStrokeWidth(): number {
    return Math.max(2, this.size * 0.05);
  }

  /**
   * Get the stroke width for the progress circle
   * @returns The stroke width
   */
  getProgressStrokeWidth(): number {
    return Math.max(2, this.size * 0.06);
  }
}
