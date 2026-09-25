/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-histogram-tooltip',
  templateUrl: './histogram.tooltip.component.html',
  styleUrls: ['./histogram.tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
      // Delay to let the fade-out animation finish.
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
