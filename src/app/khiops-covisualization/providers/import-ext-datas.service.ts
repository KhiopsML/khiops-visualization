import { Injectable } from '@angular/core';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { FileModel } from '@khiops-library/model/file.model';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { ImportFileLoaderService } from '@khiops-library/components/import-file-loader/import-file-loader.service';
import { ExtDatasFieldI } from '@khiops-covisualization/interfaces/ext-datas-field';

@Injectable({
  providedIn: 'root',
})
export class ImportExtDatasService {
  private importExtDatas: ExtDatasModel[];
  private savedExternalDatas: any;

  constructor(
    private translate: TranslateService,
    private importFileLoaderService: ImportFileLoaderService,
    private appService: AppService,
  ) {
    this.importExtDatas = [];
    this.savedExternalDatas = {};
  }

  /**
   * Formats the imported data from a file into a structured object containing keys and values.
   * Big external datas file long loading #110
   *
   * @param fileDatas - The file data model containing the data to be formatted.
   * @param joinKey - (Optional) The key to join the data on.
   * @param fieldName - (Optional) The name of the field to be used.
   * @param separator - (Optional) The separator used to split the data. Defaults to tab.
   * @returns An object containing the formatted keys and values.
   */
  formatImportedDatas(
    fileDatas: FileModel,
    joinKey?: string,
    fieldName?: string,
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
          // @ts-ignore
          formatedDatas.values[formatedDatas.values.length - 1][1] +=
            '\n' + columns[0];
        } else {
          // Remove first and last double quotes and trailing newline
          const formattedColumn = columns[1]
            ?.replace(/^"|"$/g, '')
            .replace(/""/g, '"');
          // @ts-ignore
          formatedDatas.values.push([columns[0], formattedColumn]);
        }
      });

      // Set keys and remove the first line for values
      if (formatedDatas.values.length > 0) {
        formatedDatas.keys =
          // @ts-ignore
          formatedDatas.values.shift()?.map((key) => key.replace(/""/g, '"')) ||
          [];
      }
    }

    return formatedDatas;
  }

  /**
   * Adds imported data to the list if it doesn't already exist.
   * @param filename The name of the file.
   * @param path The path of the file.
   * @param dimension The dimension of the data.
   * @param joinKey The key to join the data.
   * @param separator The separator used in the file.
   * @param field The field information.
   * @param file The file object.
   * @returns The added data or false if it already exists.
   */
  addImportedDatas(
    filename: string,
    path: string,
    dimension: string,
    joinKey: string,
    separator: string,
    field: ExtDatasFieldI,
    file: File,
  ) {
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

  /**
   * Removes imported data from the list if it exists.
   * @param filename The name of the file.
   * @param dimension The dimension of the data.
   * @param joinKey The key to join the data.
   * @param separator The separator used in the file.
   * @param fieldName The name of the field.
   * @returns True if the data was removed, false otherwise.
   */
  removeImportedDatas(
    filename: string,
    dimension: string,
    joinKey: string,
    separator: string,
    fieldName: string,
  ) {
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

  /**
   * Retrieves imported data for a specific dimension.
   * @param dimension The dimension to retrieve data for.
   * @returns The imported data for the specified dimension.
   */
  getImportedDatasFromDimension(dimension: any) {
    return this.savedExternalDatas?.[dimension?.name?.toLowerCase()];
  }

  /**
   * Retrieves all imported data.
   * @returns The list of all imported data.
   */
  getImportedDatas() {
    return this.importExtDatas;
  }

  /**
   * Handles the file read operation and processes the data.
   * @param datas The data read from the file.
   * @param externalDatas The external data model.
   * @param percentIndex The current progress index.
   * @param progressCallback The callback function to report progress.
   * @param fieldName The name of the field.
   * @param joinKey The key to join the data.
   * @param importExtDatasLength The total number of data items to import.
   * @param resolve The resolve function for the promise.
   */
  onFileRead(
    datas: any,
    externalDatas: ExtDatasModel,
    percentIndex: number,
    progressCallback: any,
    fieldName: string,
    joinKey: string,
    importExtDatasLength: number,
    resolve: any,
  ) {
    const fileDatas = new FileModel(datas, externalDatas.filename);

    setTimeout(() => {
      percentIndex++;
      if (progressCallback) {
        const msg = this.translate.get('GLOBAL.IMPORTING_EXT_DATA', {
          fieldName: fieldName,
          dimension: externalDatas.dimension,
        });
        const percent: number = (percentIndex / importExtDatasLength) * 100;
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
            ].find((e: any) => e.key === formatedDatas.keys[fieldIndex])
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

  /**
   * Loads saved external data files and processes them.
   * @param progressCallback Optional callback function to report progress.
   * @returns A promise that resolves when all files are processed.
   */
  loadSavedExternalDatas(progressCallback?: any): Promise<any> {
    const promises: Promise<any>[] = [];
    this.savedExternalDatas = {};
    if (this.importExtDatas.length > 0) {
      let percentIndex = 0;

      const importExtDatasLength = this.importExtDatas.length;
      for (let i = 0; i < importExtDatasLength; i++) {
        const promise = new Promise((resolve, reject) => {
          const externalDatas: ExtDatasModel | undefined =
            this.importExtDatas[i];
          if (!(externalDatas?.file instanceof File)) {
            // If command is called by user
            // @ts-ignore
            externalDatas.file.path = externalDatas.path;
          }

          if (externalDatas?.file) {
            const joinKey = externalDatas?.joinKey;
            const fieldName = externalDatas?.field.name;
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
          }
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
