/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  input,
  output,
} from '@angular/core';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngstack/translate';

@Component({
    selector: 'kl-graph-options-menu',
    templateUrl: './graph-options-menu.component.html',
    styleUrls: ['./graph-options-menu.component.scss'],
    imports: [MatButtonModule, MatMenuModule, MatIconModule, TranslateModule]
})
export class GraphOptionsMenuComponent {
  graphOptions = input<DistributionOptionsI | undefined>();
  graphOptionsChange = output<string>();

  changeGraphOption(option: string) {
    const graphOptions = this.graphOptions();

    if (graphOptions) {
      graphOptions.selected = option;
      this.graphOptionsChange.emit(option);
    }
  }
}
