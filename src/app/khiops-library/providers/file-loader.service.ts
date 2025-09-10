/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KhiopsLibraryService } from './khiops-library.service';
import { Ls } from '@khiops-library/providers/ls.service';
import { LS } from '@khiops-library/enum/ls';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  getVisualizationMockFile,
  getCoviszalizationMockFile,
} from '../config/mock-files';

@Injectable({
  providedIn: 'root',
})
export class FileLoaderService {
  public fileLoaded: BehaviorSubject<any> = new BehaviorSubject(undefined);
  public fileLoaded$: Observable<any> = this.fileLoaded.asObservable();

  fileLoaderDatas!: {
    isLoadingDatas: boolean;
    datas: any;
    isBigJsonFile: boolean;
    loadingInfo: string;
  };

  constructor(
    private ls: Ls,
    private http: HttpClient,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    this.initialize();
  }

  /**
   * Initializes the file loader service by setting up the initial state of fileLoaderDatas.
   */
  initialize() {
    this.fileLoaderDatas = {
      isLoadingDatas: false,
      datas: undefined,
      isBigJsonFile: false,
      loadingInfo: '',
    };
  }

  /**
   * Returns the data loaded from a file.
   *
   * @returns The data loaded from a file.
   */
  getDatas(): any {
    return this.fileLoaderDatas;
  }

  /**
   * Sets the data loaded from a file and emits it through the fileLoaded BehaviorSubject.
   *
   * @param datas - The data to set.
   */
  setDatas(datas: any): any {
    this.fileLoaderDatas.datas = datas;
    this.fileLoaded.next(datas);
  }

  /**
   * Debugs the reading of visualization files.
   * File selection is configured in mock-files.config.ts - uncomment the desired file there.
   *
   * @param fileName - The name of the file to read. If not provided, uses the file from configuration.
   * @returns The file data or an error message.
   */
  debugReadDatas(fileName?: string): any {
    // Visualization files and Co visualization files
    // File selection is configured in mock-files.ts
    let urlKV = getVisualizationMockFile();
    let urlKC = getCoviszalizationMockFile();

    if (fileName) {
      urlKV = fileName;
      urlKC = fileName;
    }

    let url;
    if (this.khiopsLibraryService.isKhiopsVisu()) {
      url = './assets/mocks/kv/' + urlKV;
    } else {
      url = './assets/mocks/kc/' + urlKC;
    }
    return this.readWebFile(url);
  }

  /**
   * Reads a file from a given URL and returns its content as a Promise.
   * If the file is successfully read, it resolves with the data.
   * If an error occurs, it rejects with a status code of 500.
   *
   * @param url - The URL of the file to read.
   * @returns A Promise that resolves with the file data or rejects with an error.
   */
  readWebFile(url: string): any {
    this.fileLoaderDatas.isLoadingDatas = true;
    this.setDatas(undefined);

    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(
        (datas: any) => {
          datas.filename = url;
          this.fileLoaderDatas.isLoadingDatas = false;
          this.setDatas(datas);
          if (datas) {
            resolve(this.fileLoaderDatas.datas);
          } else {
            reject({
              status: 500,
            });
          }
        },
        (_error) => {
          this.fileLoaderDatas.isLoadingDatas = false;
          this.setDatas(undefined);

          reject({
            status: 500,
          });
        },
      );
    });
  }

  /**
   * Reads a file from the local file system and returns its content as a Promise.
   * If the file is successfully read, it resolves with the data.
   * If an error occurs, it rejects with an error message.
   *
   * @param filename - The name of the file to read.
   * @returns A Promise that resolves with the file data or rejects with an error.
   */
  readFile(filename: any) {
    this.fileLoaderDatas.isLoadingDatas = true;
    this.fileLoaderDatas.isBigJsonFile = false;
    this.setDatas(undefined);

    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.addEventListener('loadend', async (e) => {
        this.fileLoaderDatas.isLoadingDatas = false;
        const datas = await JSON.parse(e.target!.result!.toString());
        datas.filename = filename;
        this.setDatas(datas);
        resolve(this.fileLoaderDatas.datas);
      });
      reader.addEventListener('error', () => {
        reader.abort();
        this.setDatas(undefined);
        reject(new Error('failed to process file'));
      });
      reader.readAsText(filename);
    });
  }

  /**
   * Closes the currently opened file and resets the file loader state.
   */
  closeFile() {
    this.setDatas(undefined);
  }

  /**
   * Sets the file history in local storage.
   *
   * @param filename - The name of the file to add to the history.
   */
  setFileHistory(filename: any) {
    const currentLs = this.ls.get(LS.OPEN_FILE);
    let parsedLs: any = {
      files: [],
    };
    if (currentLs) {
      // parsedLs = JSON.parse(currentLs);
      parsedLs = currentLs;
      const isExistingHistoryIndex = parsedLs.files.indexOf(filename);

      if (isExistingHistoryIndex !== -1) {
        // remove at index
        parsedLs.files.splice(isExistingHistoryIndex, 1);
      } else {
        // remove last item
        if (parsedLs.files.length >= 5) {
          parsedLs.files.splice(-1, 1);
        }
      }
    }
    // add to the top of the list
    parsedLs.files.unshift(filename);

    this.ls.set(LS.OPEN_FILE, parsedLs);
  }

  /**
   * Retrieves the file history from local storage.
   *
   * @returns The file history object containing a list of opened files.
   */
  getFileHistory() {
    const currentLs = this.ls.get(LS.OPEN_FILE);
    if (currentLs) {
      return currentLs;
    } else {
      return {
        files: [],
      };
    }
  }
}
