/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { ICONS } from './icons.list';

@Component({
  selector: 'kl-icon',
  standalone: false,
  template: `<span style="display: flex;" [innerHTML]="svgContent"></span>`,
})
export class IconComponent {
  @Input() set name(value: string) {
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(
      ICONS[value] ?? '',
    );
  }
  @Input() size: number = 22;

  svgContent: SafeHtml = '';
  constructor(private sanitizer: DomSanitizer) {}
}
