/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class Ls {
  public LS_ID: string = '';

  lsDatas: any = undefined;

  constructor(private configService: ConfigService) {}

  setLsId(id: string) {
    this.LS_ID = id;
  }

  getAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.configService.getConfig().onSendEvent?.(
        {
          message: 'ls.getAll',
          data: {
            id: this.LS_ID,
          },
        },
        (datas: any) => {
          this.lsDatas = datas;
          resolve(this.lsDatas);
        },
      ) || reject('Failed to fetch data');
    });
  }

  get(key: string, defaultValue?: any) {
    if (this.configService.isDefaultStorage) {
      const item = localStorage.getItem(this.LS_ID + key);
      // if item is object
      if (item && item.startsWith('{')) {
        try {
          return JSON.parse(item) || defaultValue || undefined;
        } catch {
          return null;
        }
      } else {
        return item || defaultValue || undefined;
      }
    } else {
      return (this.lsDatas && this.lsDatas[key]) || defaultValue || undefined;
    }
  }

  set(key: string, value: any) {
    if (this.configService.isDefaultStorage) {
      if (typeof value === 'object' && value !== null) {
        value = UtilsService.roundNumbersInJson(value);
        localStorage.setItem(this.LS_ID + key, JSON.stringify(value));
      } else {
        localStorage.setItem(this.LS_ID + key, value);
      }
    } else {
      if (!this.lsDatas[key]) {
        // init lsDatas[key]
        this.lsDatas[key] = undefined;
      }
      this.lsDatas[key] = value;
    }
  }

  setAll() {
    this.configService.getConfig().onSendEvent?.({
      message: 'ls.saveAll',
      data: {
        id: this.LS_ID,
        value: this.lsDatas,
      },
    });
  }

  del(key: string) {
    if (this.configService.isDefaultStorage) {
      localStorage.removeItem(this.LS_ID + key);
    } else {
      this.lsDatas && this.lsDatas[key] && delete this.lsDatas[key];
    }
  }

  delStartWith(key: string) {
    if (this.configService.isDefaultStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key?.startsWith(key)) {
          localStorage.removeItem(key);
          // Decrement i to avoid skipping a key because the length of localStorage has decreased.
          i--;
        }
      }
    } else {
      if (this.lsDatas) {
        Object.keys(this.lsDatas).forEach((k) => {
          if (k.startsWith(key)) {
            delete this.lsDatas[k];
          }
        });
      }
    }
  }

  clear() {
    if (this.configService.isDefaultStorage) {
      localStorage.clear();
    } else {
      this.lsDatas = undefined;
    }
  }
}
