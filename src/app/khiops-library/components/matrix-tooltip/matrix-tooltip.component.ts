/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
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

const MATRIX_MAX_WIDTH = 400;
const DEFAULT_MATRIX_MIN_WIDTH = 200;
const TOOLTIP_CURSOR_OFFSET = 40;

@Component({
  selector: 'kl-matrix-tooltip',
  templateUrl: './matrix-tooltip.component.html',
  styleUrls: ['./matrix-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MatrixTooltipComponent implements OnChanges {
  public readonly matrixMaxWidth: number = MATRIX_MAX_WIDTH;
  @Input() public cell?: CellModel;
  @Input() public showExpectedFrequency: boolean = false;
  @Input() public minWidth: number = DEFAULT_MATRIX_MIN_WIDTH;
  @Input() private position?: {
    x: number;
    y: number;
  };
  @ViewChild('matrixTooltipDiv')
  private matrixTooltipDiv?: ElementRef<HTMLElement>;
  ngOnChanges(changes: SimpleChanges) {
    if (this.matrixTooltipDiv?.nativeElement) {
      const minWidth = this.getNormalizedMinWidth();

      this.matrixTooltipDiv.nativeElement.style.setProperty(
        '--matrix-min-width',
        `${minWidth}px`,
      );
      this.matrixTooltipDiv.nativeElement.style.setProperty(
        '--matrix-max-width',
        `${MATRIX_MAX_WIDTH}px`,
      );

      if (changes.position?.currentValue) {
        this.updateTooltipPosition();
      }
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

  private getNormalizedMinWidth(): number {
    if (!Number.isFinite(this.minWidth) || this.minWidth <= 0) {
      return DEFAULT_MATRIX_MIN_WIDTH;
    }
    return Math.min(this.minWidth, MATRIX_MAX_WIDTH);
  }

  private updateTooltipPosition(): void {
    const tooltipElement = this.matrixTooltipDiv?.nativeElement;
    if (!tooltipElement || !this.position) {
      return;
    }

    const viewportWidth = window.innerWidth;
    const projectedRightBoundary =
      this.position.x + TOOLTIP_CURSOR_OFFSET + MATRIX_MAX_WIDTH;
    const canFitOnRight = projectedRightBoundary <= viewportWidth;

    tooltipElement.classList.toggle('align-left', !canFitOnRight);
    tooltipElement.classList.toggle('align-right', canFitOnRight);

    if (canFitOnRight) {
      tooltipElement.style.left =
        this.position.x + TOOLTIP_CURSOR_OFFSET + 'px';
      tooltipElement.style.right = 'auto';
    } else {
      tooltipElement.style.left = 'auto';
      tooltipElement.style.right =
        viewportWidth - this.position.x + TOOLTIP_CURSOR_OFFSET + 'px';
    }
    tooltipElement.style.top = this.position.y - 100 + 'px';
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
