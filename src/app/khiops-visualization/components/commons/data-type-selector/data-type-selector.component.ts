/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, inject, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { GridOptionsModel } from '@khiops-library/model/grid-options.model';
import { Ls } from '@khiops-library/providers/ls.service';
import { LS } from '@khiops-library/enum/ls';
import { TranslateModule } from '@ngstack/translate';

@Component({
  selector: 'app-data-type-selector',
  templateUrl: './data-type-selector.component.html',
  styleUrls: ['./data-type-selector.component.scss'],
  imports: [MatButtonModule, MatMenuModule, MatIconModule, TranslateModule],
})
export class DataTypeSelectorComponent {
  private readonly ls = inject(Ls);

  readonly dataTypeChanged = output<string>();

  readonly dataOptions: GridOptionsModel = new GridOptionsModel();

  readonly selectedDataType = signal(
    this.ls.get(LS.AG_GRID_GRAPH_OPTION, this.dataOptions.types[0]),
  );

  /**
   * Changes the data type and emits the change.
   * @param type - The new data type to be set.
   */
  changeDataType(type: string) {
    if (type === this.selectedDataType()) {
      return;
    }

    this.ls.set(LS.AG_GRID_GRAPH_OPTION, type);
    this.selectedDataType.set(type);
    this.dataTypeChanged.emit(type);
  }
}
