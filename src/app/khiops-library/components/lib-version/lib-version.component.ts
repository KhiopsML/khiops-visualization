/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { LibVersionService } from './lib-version.service';

@Component({
  selector: 'kl-lib-version',
  template: ` <p>Khiops-library {{ libVersion }}</p> `,
  standalone: false,
})
export class LibVersionComponent {
  libVersion: string | undefined;

  constructor() {
    this.libVersion = LibVersionService.getVersion();
  }
}
