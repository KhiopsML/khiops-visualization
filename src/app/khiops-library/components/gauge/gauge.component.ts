/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

@Component({
  selector: 'kl-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GaugeComponent {
  private static readonly defaultSize = 60;
  private static readonly minStrokeWidth = 2;
  readonly fontSize = 16;

  readonly value = input(0, {
    transform: (value: unknown) => GaugeComponent.toFiniteNumber(value, 0),
  });

  readonly size = input(GaugeComponent.defaultSize, {
    transform: (value: unknown) =>
      Math.max(
        GaugeComponent.defaultSize,
        GaugeComponent.toFiniteNumber(value, GaugeComponent.defaultSize),
      ),
  });

  readonly percentageValue = computed(() =>
    GaugeComponent.clamp(this.value(), 0, 100),
  );

  readonly center = computed(() => this.size() / 2);

  readonly radius = computed(() => this.size() * 0.4);

  readonly viewBox = computed(() => {
    const size = this.size();
    const padding = size * 0.1;

    return `${-padding} ${-padding} ${size + 2 * padding} ${size + 2 * padding}`;
  });

  readonly strokeDashArray = computed(() => 2 * Math.PI * this.radius());

  readonly strokeDashOffset = computed(
    () => this.strokeDashArray() * (1 - this.percentageValue() / 100),
  );

  readonly backgroundStrokeWidth = computed(() =>
    Math.max(GaugeComponent.minStrokeWidth, this.size() * 0.07),
  );

  readonly progressStrokeWidth = computed(() =>
    Math.max(GaugeComponent.minStrokeWidth, this.size() * 0.08),
  );

  readonly circleTransform = computed(() => {
    const center = this.center();

    return `rotate(-90 ${center} ${center})`;
  });

  private static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private static toFiniteNumber(value: unknown, fallback: number): number {
    const parsedValue = numberAttribute(value, fallback);

    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }
}
