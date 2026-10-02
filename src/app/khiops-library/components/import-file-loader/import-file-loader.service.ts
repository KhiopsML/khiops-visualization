/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
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
  readImportFile(file: File): Promise<FileModel> {
    if (this.configService.isElectron) {
      const readLocalFile = this.configService.getConfig()?.readLocalFile;
      if (typeof readLocalFile === 'function') {
        // Always prefer Electron file loading to preserve full absolute path.
        return new Promise((resolve, reject) => {
          try {
            readLocalFile(file, (fileContent: any, filePath: string) => {
              resolve(new FileModel(fileContent, filePath, file));
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    }

    // Browser fallback when Electron bridge is unavailable.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', (event) => {
        const datas = event.target?.result?.toString();
        const filePath = (file as File & { path?: string }).path;
        resolve(new FileModel(datas, filePath || file.name, file));
      });
      reader.addEventListener('error', () => {
        reject(reader.error || new Error('failed to process file'));
      });
      reader.readAsText(file);
    });
  }
}
