/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
import { Component, computed, inject, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-keyboard-tooltip',
  templateUrl: './keyboard-tooltip.component.html',
  styleUrls: ['./keyboard-tooltip.component.scss'],
  imports: [MatTooltipModule],
})
export class KeyboardTooltipComponent {
  private static readonly ctrlLabelRegex = /\bCtrl\b/g;

  private readonly translate = inject(TranslateService);

  readonly key = input('', { alias: 'key' });
  readonly tooltip = input('', { alias: 'tooltip' });

  private readonly isMac =
    typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);

  readonly displayKey = computed(() => {
    const key = this.key();

    return key === 'CTRL' && this.isMac ? 'CMD' : key;
  });

  readonly tooltipWithCorrectKey = computed(() => {
    const tooltipKey = this.tooltip();

    if (!tooltipKey) {
      return '';
    }

    const correctKey = this.isMac ? 'Cmd' : 'Ctrl';

    return this.translate
      .get(tooltipKey)
      .replace(KeyboardTooltipComponent.ctrlLabelRegex, correctKey);
  });
}
