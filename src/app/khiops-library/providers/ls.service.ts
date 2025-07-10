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

  /**
   * Sets the identifier for the local storage.
   * This identifier is used to prefix keys in local storage to avoid conflicts.
   * @param id - The identifier for the local storage.
   */
  setLsId(id: string) {
    this.LS_ID = id;
  }

  /**
   * Retrieves all local storage data.
   * @returns A promise that resolves with the local storage data.
   */
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

  /**
   * Retrieves a value from local storage by its key.
   * If the value is an object, it attempts to parse it as JSON.
   * @param key - The key of the item to retrieve.
   * @param defaultValue - The default value to return if the item is not found.
   * @returns The value associated with the key, or the default value if not found.
   */
  get(key: string, defaultValue?: any) {
    if (!this.configService.isElectronStorage) {
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
      return this.lsDatas?.[key] !== undefined && this.lsDatas[key] !== ''
        ? this.lsDatas[key]
        : defaultValue;
    }
  }

  /**
   * Sets a value in local storage with the specified key.
   * If the value is an object, it rounds numbers in the object before storing it.
   * @param key - The key under which to store the value.
   * @param value - The value to store.
   */
  set(key: string, value: any) {
    if (!this.configService.isElectronStorage) {
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

  /**
   * Saves all local storage data.
   * This method sends an event to save the current state of local storage.
   */
  setAll() {
    this.configService.getConfig().onSendEvent?.({
      message: 'ls.saveAll',
      data: {
        id: this.LS_ID,
        value: this.lsDatas,
      },
    });
  }

  /**
   * Deletes a specific item from local storage by its key.
   * @param key - The key of the item to delete.
   */
  del(key: string) {
    if (!this.configService.isElectronStorage) {
      localStorage.removeItem(this.LS_ID + key);
    } else {
      this.lsDatas && this.lsDatas[key] && delete this.lsDatas[key];
    }
  }

  /**
   * Deletes all items from local storage that start with the specified key.
   * @param keyToDel - The prefix of the keys to delete.
   */
  delStartWith(keyToDel: string) {
    if (!this.configService.isElectronStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key?.startsWith(this.LS_ID + keyToDel)) {
          localStorage.removeItem(key);
          // Decrement i to avoid skipping a key because the length of localStorage has decreased.
          i--;
        }
      }
    } else {
      if (this.lsDatas) {
        Object.keys(this.lsDatas).forEach((k) => {
          if (k.startsWith(keyToDel)) {
            delete this.lsDatas[k];
          }
        });
      }
    }
  }

  /**
   * Clears all items from local storage.
   * If the storage is not Electron-based, it clears the localStorage.
   * Otherwise, it sets lsDatas to undefined.
   */
  clear() {
    if (!this.configService.isElectronStorage) {
      localStorage.clear();
    } else {
      this.lsDatas = undefined;
    }
  }
}
