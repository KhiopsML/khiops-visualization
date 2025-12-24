/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { FileModel } from '../../model/file.model';
import { ConfigService } from '@khiops-library/providers/config.service';

@Injectable({
  providedIn: 'root',
})
export class ImportFileLoaderService {
  constructor(private configService: ConfigService) {}
  readImportFile(file: File): any {
    if (this.configService.isElectron) {
      if (!this.configService.isE2eTesting) {
        // Method called automatically at startup
        // For security reasons, local files can not be loaded automatically without Electron
        return new Promise((resolve) => {
          this.configService
            ?.getConfig()
            ?.readLocalFile?.(file, (fileContent: any, filePath: string) => {
              resolve(new FileModel(fileContent, filePath, file));
            });
        });
      } else {
        return new Promise((resolve) => {
          resolve(
            new FileModel(
              `education	An example of text
Bachelors	This text is standard`,
              'path',
              file,
            ),
          );
        });
      }
    } else {
      // Method called when user open an external file manually
      return new Promise((resolve, reject) => {
        console.log(file);
        let reader = new FileReader();
        reader.addEventListener('loadend', async (e) => {
          // @ts-ignore
          const datas = e.target.result.toString();
          // @ts-ignore
          resolve(new FileModel(datas, file.path, file));
        });
        reader.addEventListener('error', () => {
          reader.abort();
          reject(new Error('failed to process file'));
        });
        reader.readAsText(file);
      });
    }
  }
}
