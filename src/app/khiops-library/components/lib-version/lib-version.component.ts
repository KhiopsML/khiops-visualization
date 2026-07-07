/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, inject } from '@angular/core';
import { LibVersionService } from './lib-version.service';

@Component({
  selector: 'kl-lib-version',
  template: ` <p class="kl-lib-version">{{ libVersion() }}</p> `,
  styleUrls: ['./lib-version.component.scss'],
})
export class LibVersionComponent {
  private readonly libVersionService = inject(LibVersionService);
  readonly libVersion = this.libVersionService.version;
}
