/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { AppService } from '@khiops-covisualization/providers/app.service';

let importExtDatasService: ImportExtDatasService;
let appService: AppService;

describe('coVisualization', () => {
  describe('ImportExtDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient(withXhr())],
      });

      importExtDatasService = TestBed.inject(ImportExtDatasService);
      appService = TestBed.inject(AppService);
    });

    it('should be created', () => {
      expect(importExtDatasService).toBeTruthy();
    });

    // ===== formatImportedDatas =====

    describe('formatImportedDatas', () => {
      it('should return keys and values from tab-separated data', () => {
        const fileDatas = {
          datas: 'Key\tValue\nA\tval1\nB\tval2',
        };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.keys).toEqual(['Key', 'Value']);
        expect(result.values.length).toBe(2);
        expect(result.values[0]).toEqual(['A', 'val1']);
        expect(result.values[1]).toEqual(['B', 'val2']);
      });

      it('should return empty keys and values when datas is undefined', () => {
        const fileDatas = { datas: undefined };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.keys).toEqual([]);
        expect(result.values).toEqual([]);
      });

      it('should return empty keys and values when datas is null', () => {
        const fileDatas = { datas: null };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.keys).toEqual([]);
        expect(result.values).toEqual([]);
      });

      it('should return empty keys and values when datas is empty string', () => {
        const fileDatas = { datas: '' };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.keys).toEqual([]);
        expect(result.values).toEqual([]);
      });

      it('should handle single line data (header only)', () => {
        const fileDatas = { datas: 'Key\tValue' };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.keys).toEqual(['Key', 'Value']);
        expect(result.values).toEqual([]);
      });

      it('should handle data with Windows line endings (\\r\\n)', () => {
        const fileDatas = {
          datas: 'Key\tValue\r\nA\tval1\r\nB\tval2',
        };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.keys).toEqual(['Key', 'Value']);
        expect(result.values.length).toBe(2);
      });

      it('should remove surrounding double quotes from values', () => {
        const fileDatas = {
          datas: 'Key\tValue\nA\t"quoted value"',
        };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.values[0][1]).toBe('quoted value');
      });

      it('should unescape doubled double quotes', () => {
        const fileDatas = {
          datas: 'Key\tValue\nA\t""escaped""',
        };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.values[0][1]).toBe('"escaped"');
      });

      it('should merge continuation lines (single column) with previous value', () => {
        const fileDatas = {
          datas: 'Key\tValue\nA\tline1\ncontinuation',
        };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.values.length).toBe(1);
        expect(result.values[0][1]).toContain('line1');
        expect(result.values[0][1]).toContain('continuation');
      });

      it('should handle multiple rows correctly', () => {
        const fileDatas = {
          datas: 'ID\tName\n1\tAlice\n2\tBob\n3\tCharlie',
        };
        const result = importExtDatasService.formatImportedDatas(fileDatas);

        expect(result.keys).toEqual(['ID', 'Name']);
        expect(result.values.length).toBe(3);
        expect(result.values[0]).toEqual(['1', 'Alice']);
        expect(result.values[1]).toEqual(['2', 'Bob']);
        expect(result.values[2]).toEqual(['3', 'Charlie']);
      });
    });

    // ===== addImportedDatas =====

    describe('addImportedDatas', () => {
      it('should add new imported data and return it', () => {
        const result = importExtDatasService.addImportedDatas(
          'file.csv',
          '/path/to',
          'dimension1',
          'key1',
          '\t',
          { name: 'field1' },
          new File([''], 'file.csv'),
        );

        expect(result).toBeTruthy();
        expect(result.filename).toBe('file.csv');
        expect(result.dimension).toBe('dimension1');
        expect(result.joinKey).toBe('key1');
      });

      it('should return false when duplicate data is added', () => {
        const file = new File([''], 'file.csv');
        importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );

        const result = importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );

        expect(result).toBe(false);
      });

      it('should allow adding data with same filename but different dimension', () => {
        const file = new File([''], 'file.csv');
        importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );

        const result = importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim2',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );

        expect(result).toBeTruthy();
        expect(result.dimension).toBe('dim2');
      });

      it('should allow adding data with same filename but different field name', () => {
        const file = new File([''], 'file.csv');
        importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );

        const result = importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field2' },
          file,
        );

        expect(result).toBeTruthy();
        expect(result.field.name).toBe('field2');
      });

      it('should allow adding data with different joinKey', () => {
        const file = new File([''], 'file.csv');
        importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );

        const result = importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key2',
          '\t',
          { name: 'field1' },
          file,
        );

        expect(result).toBeTruthy();
      });
    });

    // ===== removeImportedDatas =====

    describe('removeImportedDatas', () => {
      it('should remove existing imported data and return true', () => {
        const file = new File([''], 'file.csv');
        importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );

        const result = importExtDatasService.removeImportedDatas(
          'file.csv',
          'dim1',
          'key1',
          '\t',
          'field1',
        );

        expect(result).toBe(true);
      });

      it('should return false when data does not exist', () => {
        const result = importExtDatasService.removeImportedDatas(
          'nonexistent.csv',
          'dim1',
          'key1',
          '\t',
          'field1',
        );

        expect(result).toBe(false);
      });

      it('should return false when removing already removed data', () => {
        const file = new File([''], 'file.csv');
        importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );

        importExtDatasService.removeImportedDatas(
          'file.csv',
          'dim1',
          'key1',
          '\t',
          'field1',
        );

        const result = importExtDatasService.removeImportedDatas(
          'file.csv',
          'dim1',
          'key1',
          '\t',
          'field1',
        );

        expect(result).toBe(false);
      });

      it('should only remove matching data entry', () => {
        const file = new File([''], 'file.csv');
        importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );
        importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field2' },
          file,
        );

        importExtDatasService.removeImportedDatas(
          'file.csv',
          'dim1',
          'key1',
          '\t',
          'field1',
        );

        const remaining = importExtDatasService.getImportedDatas();
        expect(remaining.length).toBe(1);
        expect(remaining[0].field.name).toBe('field2');
      });
    });

    // ===== getImportedDatasFromDimension =====

    describe('getImportedDatasFromDimension', () => {
      it('should return undefined when no data loaded for dimension', () => {
        const result = importExtDatasService.getImportedDatasFromDimension({
          name: 'test',
        });
        expect(result).toBeUndefined();
      });

      it('should return undefined when dimension is null', () => {
        const result =
          importExtDatasService.getImportedDatasFromDimension(null);
        expect(result).toBeUndefined();
      });

      it('should return undefined when dimension is undefined', () => {
        const result =
          importExtDatasService.getImportedDatasFromDimension(undefined);
        expect(result).toBeUndefined();
      });

      it('should return undefined when dimension has no name', () => {
        const result = importExtDatasService.getImportedDatasFromDimension({});
        expect(result).toBeUndefined();
      });
    });

    // ===== getImportedDatas =====

    describe('getImportedDatas', () => {
      it('should return empty array initially', () => {
        const result = importExtDatasService.getImportedDatas();
        expect(result).toEqual([]);
      });

      it('should return added data', () => {
        const file = new File([''], 'file.csv');
        importExtDatasService.addImportedDatas(
          'file.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );

        const result = importExtDatasService.getImportedDatas();
        expect(result.length).toBe(1);
        expect(result[0].filename).toBe('file.csv');
      });

      it('should return multiple items after multiple adds', () => {
        const file = new File([''], 'file.csv');
        importExtDatasService.addImportedDatas(
          'file1.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );
        importExtDatasService.addImportedDatas(
          'file2.csv',
          '/path',
          'dim2',
          'key2',
          '\t',
          { name: 'field2' },
          file,
        );

        const result = importExtDatasService.getImportedDatas();
        expect(result.length).toBe(2);
      });
    });

    // ===== initExtDatasFiles =====

    describe('initExtDatasFiles', () => {
      it('should initialize from saved data', () => {
        const savedDatas = [
          {
            filename: 'saved.csv',
            dimension: 'dim1',
            joinKey: 'key1',
            separator: '\t',
            field: { name: 'field1' },
          },
        ];
        spyOn(appService, 'getSavedDatas').and.returnValue(savedDatas);

        importExtDatasService.initExtDatasFiles();

        const result = importExtDatasService.getImportedDatas();
        expect(result).toEqual(savedDatas);
      });

      it('should initialize with empty array when no saved data', () => {
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);

        importExtDatasService.initExtDatasFiles();

        const result = importExtDatasService.getImportedDatas();
        expect(result).toEqual([]);
      });

      it('should initialize with empty array when saved data is null', () => {
        spyOn(appService, 'getSavedDatas').and.returnValue(null);

        importExtDatasService.initExtDatasFiles();

        const result = importExtDatasService.getImportedDatas();
        expect(result).toEqual([]);
      });
    });

    // ===== loadSavedExternalDatas =====

    describe('loadSavedExternalDatas', () => {
      it('should return resolved promise when no imported data', async () => {
        const result = await importExtDatasService.loadSavedExternalDatas();
        expect(result).toEqual([]);
      });
    });

    // ===== onFileRead =====

    describe('onFileRead', () => {
      it('should process file data and store in savedExternalDatas', (done) => {
        const datas = 'JoinKey\tFieldName\nval1\tdata1\nval2\tdata2';
        const externalDatas = {
          filename: 'test.csv',
          dimension: 'TestDim',
          joinKey: 'JoinKey',
          field: { name: 'FieldName' },
        };

        importExtDatasService.onFileRead(
          datas,
          externalDatas,
          0,
          null,
          'FieldName',
          'JoinKey',
          1,
          () => {
            const result = importExtDatasService.getImportedDatasFromDimension({
              name: 'TestDim',
            });
            expect(result).toBeDefined();
            expect(result['val1']).toBeDefined();
            expect(result['val1'][0].key).toBe('FieldName');
            expect(result['val1'][0].value).toBe('data1');
            expect(result['val2'][0].value).toBe('data2');
            done();
          },
        );
      });

      it('should call progress callback with correct message', (done) => {
        const datas = 'Key\tValue\nA\tv1';
        const externalDatas = {
          filename: 'test.csv',
          dimension: 'Dim1',
          joinKey: 'Key',
          field: { name: 'Value' },
        };

        const progressCallback = jasmine
          .createSpy('progressCallback')
          .and.callFake(() => {});

        importExtDatasService.onFileRead(
          datas,
          externalDatas,
          0,
          progressCallback,
          'Value',
          'Key',
          2,
          () => {
            expect(progressCallback).toHaveBeenCalled();
            const args = progressCallback.calls.first().args;
            expect(args[1]).toBe(50); // 1/2 * 100
            done();
          },
        );
      });

      it('should not duplicate entries for same key and field', (done) => {
        const datas = 'Key\tValue\nA\tv1';
        const externalDatas = {
          filename: 'test.csv',
          dimension: 'Dim1',
          joinKey: 'Key',
          field: { name: 'Value' },
        };

        // First call
        importExtDatasService.onFileRead(
          datas,
          externalDatas,
          0,
          null,
          'Value',
          'Key',
          1,
          () => {
            // Second call with same data
            importExtDatasService.onFileRead(
              datas,
              externalDatas,
              0,
              null,
              'Value',
              'Key',
              1,
              () => {
                const result =
                  importExtDatasService.getImportedDatasFromDimension({
                    name: 'Dim1',
                  });
                expect(result['A'].length).toBe(1);
                done();
              },
            );
          },
        );
      });
    });

    // ===== add/remove round-trip =====

    describe('add/remove round-trip', () => {
      it('should handle full lifecycle: add -> get -> remove -> get', () => {
        const file = new File([''], 'lifecycle.csv');

        // Add
        const added = importExtDatasService.addImportedDatas(
          'lifecycle.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );
        expect(added).toBeTruthy();
        expect(importExtDatasService.getImportedDatas().length).toBe(1);

        // Remove
        const removed = importExtDatasService.removeImportedDatas(
          'lifecycle.csv',
          'dim1',
          'key1',
          '\t',
          'field1',
        );
        expect(removed).toBe(true);
        expect(importExtDatasService.getImportedDatas().length).toBe(0);

        // Re-add should work
        const reAdded = importExtDatasService.addImportedDatas(
          'lifecycle.csv',
          '/path',
          'dim1',
          'key1',
          '\t',
          { name: 'field1' },
          file,
        );
        expect(reAdded).toBeTruthy();
      });
    });
  });
});
