/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, computed, inject, input } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { ICONS } from './icons.list';

@Component({
  selector: 'kl-icon',
  template: `<span style="display: flex;" [innerHTML]="svgContent()"></span>`,
})
export class IconComponent {
  readonly name = input<string>('');
  readonly size = input<number>(22);

  private readonly sanitizer = inject(DomSanitizer);
  readonly svgContent = computed<SafeHtml>(() => {
    return this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()] ?? '');
  });
}
