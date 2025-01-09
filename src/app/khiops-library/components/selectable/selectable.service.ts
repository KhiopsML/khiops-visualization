/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectableService {
  selectableDatas: {
    selectedArea: any; // can be every component of Khiops
  };

  selectedServiceChange: Subject<any> = new Subject<any>();

  constructor() {
    this.selectableDatas = {
      selectedArea: undefined,
    };
  }

  initialize() {
    this.selectableDatas.selectedArea = undefined;
  }

  setSelectedArea(area: any) {
    this.selectableDatas.selectedArea = area;
    this.selectedServiceChange.next(this.selectableDatas.selectedArea);
  }

  getSelectedArea() {
    return this.selectableDatas.selectedArea;
  }
}
