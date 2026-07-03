/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'khiops-menu',
  templateUrl: './khiops-menu.component.html',
  styleUrls: ['./khiops-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
/**
 * Main Menu component used to choose Visu or Covisu in dev mode
 */
export class KhiopsMenuComponent {}
