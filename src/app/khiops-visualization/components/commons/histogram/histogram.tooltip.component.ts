/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-histogram-tooltip',
  template: `
    <div
      [ngStyle]="{
        'left.px': this.computeXPos(),
        'top.px': this.computeYPos()
      }"
      class="tooltip"
      [style.display]="display ? 'block' : 'none'"
    >
      <p [innerHTML]="text"></p>
    </div>
  `,
  styles: [
    `
      .tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        font-weight: 200;
        z-index: 2;
        padding: 0 10px;
        border-radius: 5px;
        font-size: 0.8rem;
        min-width: 140px;
        pointer-events: none;
      }
    `,
  ],
})
export class HistogramTooltipComponent {
  @Input() public text: string = '';
  @Input() public display: boolean = false;
  @Input() private posX: number = 0;
  @Input() private posY: number = 0;
  @Input() private canvasW: number = 0;

  computeYPos() {
    let top = this.posY - 0;
    if (top < 10) {
      top = 10;
    }
    return top;
  }

  computeXPos() {
    let left = this.posX + 20;
    if (left < 10) {
      left = 10;
    }
    if (left > this.canvasW - 170) {
      left = this.posX - 170;
    }
    return left;
  }
}
