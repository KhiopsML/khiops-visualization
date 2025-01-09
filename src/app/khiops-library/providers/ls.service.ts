/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class Ls {
  public LS_ID: string = '';

  setLsId(id: string) {
    this.LS_ID = id;
  }

  get(key: string, defaultValue?: any) {
    return localStorage.getItem(this.LS_ID + key) || defaultValue || undefined;
  }

  set(key: string, value: any) {
    if (typeof value === 'object' && value !== null) {
      value = UtilsService.roundNumbersInJson(value);
    }
    localStorage.setItem(this.LS_ID + key, JSON.stringify(value));
  }

  del(key: string) {
    localStorage.removeItem(this.LS_ID + key);
  }
}
