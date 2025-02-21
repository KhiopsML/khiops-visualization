/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';

@Component({
    selector: 'kl-graph-options-menu',
    templateUrl: './graph-options-menu.component.html',
    styleUrls: ['./graph-options-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GraphOptionsMenuComponent {
  @Input() graphOptions: DistributionOptionsI | undefined;
  @Output() graphOptionsChange = new EventEmitter<string>();

  changeGraphOption(option: string) {
    if (this.graphOptions) {
      this.graphOptions.selected = option;
      this.graphOptionsChange.emit(option);
    }
  }
}
