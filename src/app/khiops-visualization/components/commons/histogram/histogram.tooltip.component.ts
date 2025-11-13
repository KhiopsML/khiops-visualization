/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnChanges, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-histogram-tooltip',
  template: `
    <div
      [ngStyle]="{
        'left.px': this.computeXPos(),
        'top.px': this.computeYPos(),
      }"
      class="tooltip"
      [class.visible]="display"
      *ngIf="shouldShow"
    >
      <p class="title" [innerHTML]="title" *ngIf="title"></p>
      <p [innerHTML]="body" *ngIf="body"></p>
    </div>
  `,
  styles: [
    `
      .tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        font-weight: 200;
        z-index: 2;
        padding: 0 10px;
        border-radius: 0px;
        font-size: 12px;
        min-width: 140px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms;
        p {
          color: #fff;
        }
      }
      .tooltip.visible {
        opacity: 1;
        transition: opacity 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0ms;
      }
      .title {
        font-weight: bold;
        margin-bottom: -5px;
      }
    `,
  ],
  standalone: false,
})
export class HistogramTooltipComponent implements OnChanges, OnDestroy {
  @Input() public title: string = '';
  @Input() public body: string = '';
  @Input() public display: boolean = false;
  @Input() private posX: number = 0;
  @Input() private posY: number = 0;
  @Input() private canvasW: number = 0;
  private hideTimeout: any;

  get shouldShow(): boolean {
    return this.display || this.hideTimeout;
  }

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
    if (left > this.canvasW - 200) {
      left = this.posX - 200;
    }
    return left;
  }

  ngOnChanges() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (!this.display) {
      // Délai pour laisser l'animation de fade out se terminer
      this.hideTimeout = setTimeout(() => {
        this.hideTimeout = null;
      }, 250);
    }
  }

  ngOnDestroy() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
}
