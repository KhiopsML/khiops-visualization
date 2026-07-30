/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'khiops-menu',
  templateUrl: './khiops-menu.component.html',
  styleUrls: ['./khiops-menu.component.scss'],
  imports: [MatButtonModule, RouterLink],
})
/**
 * Main Menu component used to choose Visu or Covisu in dev mode
 */
export class KhiopsMenuComponent {
  readonly menuEntries = signal([
    {
      path: 'visualization',
      label: 'Khiops-visualization',
    },
    {
      path: 'covisualization',
      label: 'Khiops-covisualization',
    },
  ]);
}
