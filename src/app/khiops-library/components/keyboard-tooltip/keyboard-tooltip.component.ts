/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
import { Component, Input, OnInit } from '@angular/core';

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

  ngOnInit(): void {
    // Detect platform and use CMD for Mac, CTRL for others
    if (this.key) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      this.displayKey = this.key === 'CTRL' && isMac ? 'CMD' : this.key;
    }
  }
}
