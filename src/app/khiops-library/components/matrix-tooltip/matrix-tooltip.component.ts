/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CellModel } from '@khiops-library/model/cell.model';

@Component({
  selector: 'kl-matrix-tooltip',
  templateUrl: './matrix-tooltip.component.html',
  styleUrls: ['./matrix-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MatrixTooltipComponent implements OnChanges {
  @Input() public cell?: CellModel;
  @Input() private position?: {
    x: number;
    y: number;
  };
  @ViewChild('matrixTooltipDiv')
  private matrixTooltipDiv?: ElementRef<HTMLElement>;

  ngOnChanges(changes: SimpleChanges) {
    if (
      this.matrixTooltipDiv?.nativeElement &&
      changes.position?.currentValue
    ) {
      if (this.position!.x < 400) {
        this.matrixTooltipDiv.nativeElement.style.left =
          this.position!.x + 40 + 'px';
      } else {
        this.matrixTooltipDiv.nativeElement.style.left =
          this.position!.x - 340 + 'px';
      }
      this.matrixTooltipDiv.nativeElement.style.top =
        this.position!.y - 100 + 'px';
    }
    if (this.matrixTooltipDiv?.nativeElement && changes.cell) {
      if (changes.cell.currentValue) {
        this.matrixTooltipDiv.nativeElement.style.visibility = 'visible';
      } else {
        this.matrixTooltipDiv.nativeElement.style.visibility = 'hidden';
      }
    }
  }

  /**
   * Truncate text with ellipsis if it exceeds 100 characters
   */
  truncateText(text: string | undefined, maxLength: number = 200): string {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }
}
