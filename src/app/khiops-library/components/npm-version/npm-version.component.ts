/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { LibVersionService } from '../lib-version/lib-version.service';

@Component({
  selector: 'kl-npm-version',
  templateUrl: './npm-version.component.html',
  styleUrls: ['./npm-version.component.scss'],
  standalone: false,
})
export class NpmVersionComponent {
  version?: string = '';
  constructor() {
    this.version = LibVersionService.getVersion();
  }
}
