import { Injectable } from '@angular/core';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { FileModel } from '@khiops-library/model/file.model';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { ImportFileLoaderService } from '@khiops-library/components/import-file-loader/import-file-loader.service';

@Injectable({
  providedIn: 'root',
})
export class ImportExtDatasService {
  importExtDatas: ExtDatasModel[];
  savedExternalDatas: any;

  constructor(
    private translate: TranslateService,
    private importFileLoaderService: ImportFileLoaderService,
    private appService: AppService,
  ) {
    this.importExtDatas = [];
    this.savedExternalDatas = {};
  }

  /**
   * Chat gpt optimisation
   * Big external datas file long loading #110
   */
  formatImportedDatas(
    fileDatas: FileModel,
    joinKey?,
    fieldName?,
    separator?: string,
  ): any {
    const formatedDatas = {
      keys: [],
      values: [],
    };

    if (fileDatas.datas) {
      // Split lines without removing carriage returns
      const lines: string[] = fileDatas.datas.split(/\r?\n/);

      // Process lines
      lines.forEach((line) => {
        const columns = line.split(/\t/);

        // Handle merging lines
        if (columns.length === 1 && formatedDatas.values.length > 0) {
          formatedDatas.values[formatedDatas.values.length - 1][1] +=
            '\n' + columns[0];
        } else {
          // Remove first and last double quotes and trailing newline
          const formattedColumn = columns[1]
            ?.replace(/^"|"$/g, '')
            .replace(/""/g, '"');
          formatedDatas.values.push([columns[0], formattedColumn]);
        }
      });

      // Set keys and remove the first line for values
      if (formatedDatas.values.length > 0) {
        formatedDatas.keys =
          formatedDatas.values.shift()?.map((key) => key.replace(/""/g, '"')) ||
          [];
      }
    }

    return formatedDatas;
  }

  addImportedDatas(filename, path, dimension, joinKey, separator, field, file) {
    const data = new ExtDatasModel(
      filename,
      dimension,
      joinKey,
      separator,
      field,
      file,
      path,
    );
    if (
      !this.importExtDatas.find(
        (e) =>
          e.filename === filename &&
          e.dimension === dimension &&
          e.joinKey === joinKey &&
          e.field.name === field.name,
      )
    ) {
      this.importExtDatas.push(data);
      return data;
    } else {
      return false;
    }
  }

  removeImportedDatas(filename, dimension, joinKey, separator, fieldName) {
    const extDataPos = this.importExtDatas.findIndex(
      (e) =>
        e.filename === filename &&
        e.dimension === dimension &&
        e.joinKey === joinKey &&
        e.field.name === fieldName,
    );
    if (extDataPos !== -1) {
      this.importExtDatas.splice(extDataPos, 1);
      return true;
    } else {
      return false;
    }
  }

  getImportedDatasFromDimension(dimension) {
    return this.savedExternalDatas?.[dimension?.name?.toLowerCase()];
  }

  getImportedDatas() {
    return this.importExtDatas;
  }

  onFileRead(
    datas: any,
    externalDatas: ExtDatasModel,
    percentIndex: number,
    progressCallback,
    fieldName: string,
    joinKey: string,
    importExtDatasLength: number,
    resolve,
  ) {
    const fileDatas = new FileModel(datas, externalDatas.filename);

    setTimeout(() => {
      percentIndex++;
      if (progressCallback) {
        const msg = this.translate.get('GLOBAL.IMPORTING_EXT_DATA', {
          fieldName: fieldName,
          dimension: externalDatas.dimension,
        });
        const percent = (percentIndex / importExtDatasLength) * 100;
        progressCallback(msg, percent);
      }
      const formatedDatas = this.formatImportedDatas(fileDatas);

      const keyIndex = formatedDatas.keys.indexOf(joinKey);
      const fieldIndex = formatedDatas.keys.indexOf(fieldName);

      if (!this.savedExternalDatas[externalDatas.dimension.toLowerCase()]) {
        this.savedExternalDatas[externalDatas.dimension.toLowerCase()] = [];
      }
      const formatedDatasValuesLength = formatedDatas.values.length;
      for (let j = 0; j < formatedDatasValuesLength; j++) {
        const extKey = formatedDatas.values[j][keyIndex].replace(
          /[\n\r]+/g,
          '',
        ); // remove carriage return #53

        try {
          if (
            !this.savedExternalDatas[externalDatas.dimension.toLowerCase()][
              extKey
            ]
          ) {
            this.savedExternalDatas[externalDatas.dimension.toLowerCase()][
              extKey
            ] = [];
          }
          if (
            !this.savedExternalDatas[externalDatas.dimension.toLowerCase()][
              extKey
            ].find((e) => e.key === formatedDatas.keys[fieldIndex])
          ) {
            const currentExtData = {
              key: formatedDatas.keys[fieldIndex],
              value: formatedDatas.values[j][fieldIndex],
            };
            this.savedExternalDatas[externalDatas.dimension.toLowerCase()][
              extKey
            ].push(currentExtData);
          }
        } catch (e) {}
      }
      resolve(externalDatas.dimension);
    });
  }

  loadSavedExternalDatas(progressCallback?) {
    const promises: Promise<any>[] = [];
    this.savedExternalDatas = {};
    if (this.importExtDatas.length > 0) {
      let percentIndex = 0;

      const importExtDatasLength = this.importExtDatas.length;
      for (let i = 0; i < importExtDatasLength; i++) {
        const promise = new Promise((resolve, reject) => {
          const externalDatas: ExtDatasModel = this.importExtDatas[i];
          if (!(externalDatas.file instanceof File)) {
            // If command is called by user
            // @ts-ignore
            externalDatas.file.path = externalDatas.path;
          }
          console.log(
            'ImportExtDatasService ~ promise ~ externalDatas:',
            externalDatas,
          );
          const joinKey = externalDatas.joinKey;
          const fieldName = externalDatas.field.name;
          this.importFileLoaderService
            .readImportFile(externalDatas.file)
            .then((res: any) =>
              this.onFileRead(
                res.datas,
                externalDatas,
                percentIndex,
                progressCallback,
                fieldName,
                joinKey,
                importExtDatasLength,
                resolve,
              ),
            )
            .catch(() => {
              resolve(undefined);
            });
        });
        promises.push(promise);
      }
    }
    return Promise.all(promises);
  }

  initExtDatasFiles() {
    this.importExtDatas = this.appService.getSavedDatas('importedDatas') || [];
  }
}
