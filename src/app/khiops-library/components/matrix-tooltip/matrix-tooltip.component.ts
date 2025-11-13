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
  @Input() public showExpectedFrequency: boolean = false;
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

    // Simple visibility toggle with CSS fade animation
    if (this.matrixTooltipDiv?.nativeElement && changes.cell) {
      if (changes.cell.currentValue) {
        this.matrixTooltipDiv.nativeElement.classList.add('visible');
      } else {
        this.matrixTooltipDiv.nativeElement.classList.remove('visible');
      }
    }
  }

  /**
   * Truncate text with ellipsis if it exceeds specified characters
   */
  truncateText(text: string | undefined, maxLength: number = 200): string {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  /**
   * Check if main value should be displayed (not for Hellinger type)
   */
  get shouldShowMainValue(): boolean {
    return this.cell?.displayedValue?.type !== 'HELLINGER';
  }

  /**
   * Check if frequency should be displayed (not for Frequency type)
   */
  get shouldShowFrequency(): boolean {
    return this.cell?.displayedValue?.type !== 'FREQUENCY';
  }

  /**
   * Check if Hellinger value should be displayed (only for Hellinger type)
   */
  get shouldShowHellingerValue(): boolean {
    return this.cell?.displayedValue?.type === 'HELLINGER';
  }

  /**
   * Check if expected frequency should be displayed
   */
  get shouldShowExpectedFrequency(): boolean {
    return this.showExpectedFrequency;
  }

  /**
   * Get the translated label for main value
   */
  getMainValueLabel(): string {
    if (!this.cell?.displayedValue?.type) return '';
    return `MATRIX_MODES_DETAILED.${this.cell.displayedValue.type}`;
  }

  /**
   * Get the translated label for Hellinger value
   */
  getHellingerValueLabel(): string {
    if (!this.cell?.displayedValue?.type) return '';
    return `MATRIX_MODES_DETAILED.${this.cell.displayedValue.type}`;
  }
}
