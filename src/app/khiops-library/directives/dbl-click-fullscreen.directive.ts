/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
  type SimpleChanges,
  OnChanges,
} from '@angular/core';

/**
 * Toggle fullscreen state on host double click.
 * Output name is aligned with kl-btn-fullscreen to reuse existing handlers.
 */
@Directive({
  selector: '[dblClickFullScreen]',
})
export class DblClickFullscreenDirective implements OnChanges {
  @Input() dblClickFullScreen: boolean | '' | null = null;
  @Output() toggleFullscreen = new EventEmitter<boolean>();

  private isFullscreen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dblClickFullScreen']) {
      const value = changes['dblClickFullScreen'].currentValue;
      if (typeof value === 'boolean') {
        this.isFullscreen = value;
      }
    }
  }

  @HostListener('dblclick', ['$event'])
  onDoubleClick(event: MouseEvent): void {
    if (this.isInteractiveTarget(event.target)) {
      return;
    }

    // Prevent native double-click text selection on header.
    event.preventDefault();

    this.isFullscreen = !this.isFullscreen;
    this.toggleFullscreen.emit(this.isFullscreen);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (event.detail !== 2 || this.isInteractiveTarget(event.target)) {
      return;
    }

    // Prevent selection start before dblclick event is fired.
    event.preventDefault();
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
      return false;
    }

    return !!target.closest(
      'button, a, input, textarea, select, option, label, mat-checkbox, [mat-menu-item], [mat-stroked-button], [mat-icon-button]'
    );
  }
}