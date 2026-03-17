/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';

/**
 * Directive to manage fullscreen animation
 * Adds 'first-open' class only on the first fullscreen activation
 * Removes animation on subsequent tab returns
 */
@Directive({
  selector: '[appFullscreenAnimation]',
  standalone: true,
})
export class FullscreenAnimationDirective implements OnChanges, OnDestroy {
  @Input() appFullscreenAnimation: boolean = false;

  private hasBeenFullscreenBefore = false;
  private animationTimeout: any;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['appFullscreenAnimation'] &&
      !changes['appFullscreenAnimation'].firstChange
    ) {
      const isFullscreen = changes['appFullscreenAnimation'].currentValue;

      if (isFullscreen) {
        // Only animate on first fullscreen activation
        if (!this.hasBeenFullscreenBefore) {
          this.elementRef.nativeElement.classList.add('first-open');
          this.hasBeenFullscreenBefore = true;

          // Remove animation class after animation completes (200ms)
          this.animationTimeout = setTimeout(() => {
            this.elementRef.nativeElement.classList.remove('first-open');
          }, 200);
        }
      } else {
        // Reset the flag when exiting fullscreen to allow animation on next open
        this.hasBeenFullscreenBefore = false;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }
}
