/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  effect,
  Component,
  input,
  ChangeDetectionStrategy,
  output,
  signal,
} from '@angular/core';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options.interface';

@Component({
    selector: 'kl-graph-options-menu',
    templateUrl: './graph-options-menu.component.html',
    styleUrls: ['./graph-options-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GraphOptionsMenuComponent {
  graphOptions = input<DistributionOptionsI | undefined>(undefined);
  graphOptionsChange = output<string>();

  protected readonly selectedOption = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      this.selectedOption.set(this.graphOptions()?.selected);
    });
  }

  changeGraphOption(option: string) {
    if (this.graphOptions()) {
      this.selectedOption.set(option);
      this.graphOptionsChange.emit(option);
    }
  }
}
