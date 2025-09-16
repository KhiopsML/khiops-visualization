/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { GridOptionsModel } from '@khiops-library/model/grid-options.model';
import { Ls } from '@khiops-library/providers/ls.service';
import { LS } from '@khiops-library/enum/ls';

@Component({
  selector: 'app-data-type-selector',
  templateUrl: './data-type-selector.component.html',
  styleUrls: ['./data-type-selector.component.scss'],
  standalone: false,
})
export class DataTypeSelectorComponent implements OnInit {
  @Output() dataTypeChanged: EventEmitter<string> = new EventEmitter();

  public dataOptions: GridOptionsModel = new GridOptionsModel();

  constructor(private ls: Ls) {}

  ngOnInit() {
    this.dataOptions.selected = this.ls.get(
      LS.AG_GRID_GRAPH_OPTION,
      this.dataOptions.types[0],
    );
  }

  /**
   * Changes the data type and emits the change.
   * @param type - The new data type to be set.
   */
  changeDataType(type: string) {
    this.ls.set(LS.AG_GRID_GRAPH_OPTION, type);
    this.dataOptions.selected = type;
    this.dataTypeChanged.emit(type);
  }
}
