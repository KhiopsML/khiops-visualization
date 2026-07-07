/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, inject, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-btn-fullscreen',
  templateUrl: './btn-fullscreen.component.html',
  styleUrls: ['./btn-fullscreen.component.scss'],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
})
export class BtnFullscreenComponent {
  readonly isFullscreen = signal(false);
  readonly toggleFullscreen = output<boolean>();
  public readonly translate = inject(TranslateService);

  clickFullscreen(): void {
    this.isFullscreen.update((isFullscreen) => !isFullscreen);
    this.toggleFullscreen.emit(this.isFullscreen());
  }
}
