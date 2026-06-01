/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-keyboard-tooltip',
  templateUrl: './keyboard-tooltip.component.html',
  styleUrls: ['./keyboard-tooltip.component.scss'],
  standalone: false,
})
export class KeyboardTooltipComponent implements OnInit {
  @Input() key: string = '';
  @Input() tooltip: string = '';

  displayKey: string = '';
  tooltipWithCorrectKey: string = '';

  private isMac =
    typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    // Detect platform and use CMD for Mac, CTRL for others
    if (this.key) {
      this.displayKey = this.key === 'CTRL' && this.isMac ? 'CMD' : this.key;
    }

    // Replace the key in the tooltip to show the correct key for the platform
    if (this.tooltip) {
      const correctKey = this.isMac ? 'Cmd' : 'Ctrl';
      this.tooltipWithCorrectKey = this.translate
        .get(this.tooltip)
        .replace('Ctrl', correctKey);
    }
  }
}
