/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { FileModel } from '@khiops-library/model/file.model';
import { AppService } from './app.service';
import { TranslateService } from '@ngstack/translate';
import { ImportFileLoaderService } from '@khiops-library/components/import-file-loader/import-file-loader.service';
import { ExtDatasFieldI } from '@khiops-covisualization/interfaces/ext-datas-field.interface';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';

@Injectable({
  providedIn: 'root',
})
export class ImportExtDatasService {
  private importExtDatas: ExtDatasModel[];
  private savedExternalDatas: any;
  private readonly supportedSeparators = ['\t', ',', ';', ' '];
  private readonly separatorDetectionSampleSize = 20;

  private isLikelyAbsolutePath(path: string): boolean {
    return /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith('/') || path.startsWith('\\\\');
  }

  private getPathFromFile(file?: File): string {
    const fileWithPath = file as File & { path?: string };
    return fileWithPath?.path || '';
  }

  private resolveExternalDataPath(
    path: string | undefined,
    file: File | undefined,
    filename: string,
  ): string {
    if (path) {
      return path;
    }

    const filePath = this.getPathFromFile(file);
    if (filePath) {
      return filePath;
    }

    return this.isLikelyAbsolutePath(filename) ? filename : '';
  }

  constructor(
    private translate: TranslateService,
    private importFileLoaderService: ImportFileLoaderService,
    private appService: AppService,
    private khiopsLibraryService: KhiopsLibraryService,
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
    _joinKey?: string,
    __fieldName?: string,
    separator?: string,
  ): any {
    const formatedDatas: { keys: string[]; values: string[][] } = {
      keys: [],
      values: [],
    };

    if (fileDatas.datas) {
      const effectiveSeparator = this.getSeparatorValue(
        separator || this.detectFieldSeparator(fileDatas),
      );

      // Split lines without removing carriage returns
      const lines: string[] = fileDatas.datas
        .split(/\r?\n/)
        .filter((line: string) => line.length > 0);

      if (lines.length > 0) {
        const headerLine = lines[0];
        if (!headerLine) {
          return formatedDatas;
        }

        const headerColumns = this.splitLineWithSeparator(
          headerLine,
          effectiveSeparator,
        );
        formatedDatas.keys = headerColumns.map((key: string) =>
          (key || '').replace(/^"|"$/g, '').replace(/""/g, '"'),
        );

        lines.slice(1).forEach((line) => {
          const columns = this.splitLineWithSeparator(
            line,
            effectiveSeparator,
            formatedDatas.keys.length,
          );
          const formattedColumns = columns.map((column: string) =>
            (column || '').replace(/^"|"$/g, '').replace(/""/g, '"'),
          );

          // Handle continuation lines: append content to last column of previous row.
          if (
            formattedColumns.length === 1 &&
            formatedDatas.values.length > 0
          ) {
            const currentRow: string[] | undefined =
              formatedDatas.values[formatedDatas.values.length - 1];
            if (!currentRow) {
              return;
            }
            const lastColumnIndex = Math.max(0, currentRow.length - 1);
            currentRow[lastColumnIndex] += '\n' + formattedColumns[0];
          } else {
            formatedDatas.values.push(formattedColumns);
          }
        });
      }
    }

    return formatedDatas;
  }

  detectFieldSeparator(fileDatas: FileModel): string {
    const datas = fileDatas?.datas;
    if (!datas) {
      return '\t';
    }

    const candidateLines = datas
      .split(/\r?\n/)
      .filter((line: string) => line.trim().length > 0)
      .slice(0, this.separatorDetectionSampleSize);

    if (candidateLines.length === 0) {
      return '\t';
    }

    let detectedSeparator = '\t';
    let bestScore = -1;

    this.supportedSeparators.forEach((candidate) => {
      const score = this.getSeparatorDetectionScore(candidateLines, candidate);
      if (score > bestScore) {
        bestScore = score;
        detectedSeparator = candidate;
      }
    });

    return detectedSeparator;
  }

  private getSeparatorDetectionScore(lines: string[], separator: string): number {
    const columnCounts = lines.map(
      (line) => this.splitLineWithSeparator(line, separator).length,
    );
    const splitCounts = columnCounts.filter((count) => count > 1);

    if (splitCounts.length === 0) {
      return -1;
    }

    const countFrequencies = new Map<number, number>();
    splitCounts.forEach((count) => {
      countFrequencies.set(count, (countFrequencies.get(count) || 0) + 1);
    });

    let mostFrequentColumnCount = 0;
    let consistency = 0;

    countFrequencies.forEach((frequency, columnCount) => {
      if (frequency > consistency) {
        consistency = frequency;
        mostFrequentColumnCount = columnCount;
      }
    });

    const spreadPenalty = splitCounts.length - consistency;

    // Favor separators producing stable column counts across sampled lines.
    return consistency * 100 + mostFrequentColumnCount - spreadPenalty;
  }

  private getSeparatorValue(separator: string): string {
    if (separator === '\\t') {
      return '\t';
    }

    if (separator === '\\s') {
      return ' ';
    }

    return separator || '\t';
  }

  private splitLineWithSeparator(
    line: string,
    separator: string,
    expectedColumnCount?: number,
  ): string[] {
    if (separator === ' ') {
      return this.splitSpaceSeparatedLine(line, expectedColumnCount);
    }

    return this.splitDelimitedLine(line, separator);
  }

  private splitDelimitedLine(line: string, separator: string): string[] {
    if (!line) {
      return [''];
    }

    const columns: string[] = [];
    let currentColumn = '';
    let isInsideQuotes = false;

    for (let index = 0; index < line.length; index++) {
      const char = line[index];

      if (char === '"') {
        if (isInsideQuotes && line[index + 1] === '"') {
          currentColumn += '""';
          index++;
          continue;
        }

        isInsideQuotes = !isInsideQuotes;
        currentColumn += char;
        continue;
      }

      if (!isInsideQuotes && char === separator) {
        columns.push(currentColumn);
        currentColumn = '';
        continue;
      }

      currentColumn += char;
    }

    columns.push(currentColumn);
    return columns;
  }

  private splitSpaceSeparatedLine(
    line: string,
    expectedColumnCount?: number,
  ): string[] {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return [];
    }

    if (!expectedColumnCount || expectedColumnCount <= 1) {
      return trimmedLine.split(/\s+/);
    }

    const columns: string[] = [];
    let remaining = trimmedLine;

    for (let i = 0; i < expectedColumnCount - 1; i++) {
      const separatorMatch = remaining.match(/\s+/);
      if (!separatorMatch || separatorMatch.index === undefined) {
        columns.push(remaining);
        remaining = '';
        break;
      }

      const separatorIndex = separatorMatch.index;
      columns.push(remaining.slice(0, separatorIndex));
      remaining = remaining.slice(separatorIndex + separatorMatch[0].length);
    }

    columns.push(remaining);
    return columns;
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
    const resolvedPath = this.resolveExternalDataPath(path, file, filename);
    const data = new ExtDatasModel(
      filename,
      dimension,
      joinKey,
      separator,
      field,
      file,
      resolvedPath,
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
      this.khiopsLibraryService.dirtyStateChanged$.next();
      return data;
    } else {
      return false;
    }
  }

  updateImportedDatas(
    importedData: ExtDatasModel,
    dimension: string,
    joinKey: string,
    separator: string,
  ) {
    importedData.dimension = dimension;
    importedData.joinKey = joinKey;
    importedData.separator = separator;
    this.khiopsLibraryService.dirtyStateChanged$.next();
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
    _separator: string,
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
      this.khiopsLibraryService.dirtyStateChanged$.next();
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
      const formatedDatas = this.formatImportedDatas(
        fileDatas,
        undefined,
        undefined,
        externalDatas.separator,
      );

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
              source: externalDatas,
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
        const promise = new Promise((resolve) => {
          const externalDatas: ExtDatasModel | undefined =
            this.importExtDatas[i];

          const sourcePath = this.resolveExternalDataPath(
            externalDatas?.path,
            externalDatas?.file,
            externalDatas?.filename || '',
          );

          if (externalDatas && sourcePath) {
            externalDatas.path = sourcePath;
          }

          if (externalDatas && !(externalDatas.file instanceof File) && sourcePath) {
            const fileMetadata =
              externalDatas.file && typeof externalDatas.file === 'object'
                ? (externalDatas.file as unknown as Record<string, unknown>)
                : {};

            externalDatas.file = {
              ...fileMetadata,
              name: externalDatas.filename,
              path: sourcePath,
            } as unknown as File;
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
    const savedImportedDatas = this.appService.getSavedDatas('importedDatas') || [];
    this.importExtDatas = savedImportedDatas.map((entry: ExtDatasModel) => {
      const resolvedPath = this.resolveExternalDataPath(
        entry.path,
        entry.file,
        entry.filename,
      );

      if (!resolvedPath) {
        return entry;
      }

      return {
        ...entry,
        path: resolvedPath,
      };
    });
  }
}
