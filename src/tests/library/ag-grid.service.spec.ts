/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { AgGridService } from '../../app/khiops-library/components/ag-grid/ag-grid.service';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns.interface';

describe('AgGridService', () => {
  let service: AgGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgGridService);
  });

  // ─── isNumeric ───────────────────────────────────────────────────────

  it('isNumeric returns false for null', () => {
    expect(service.isNumeric(null)).toBe(false);
  });

  it('isNumeric returns false for undefined', () => {
    expect(service.isNumeric(undefined)).toBe(false);
  });

  it('isNumeric returns false for empty string', () => {
    expect(service.isNumeric('')).toBe(false);
  });

  it('isNumeric returns false for whitespace-only string', () => {
    expect(service.isNumeric('   ')).toBe(false);
  });

  it('isNumeric returns true for integer number', () => {
    expect(service.isNumeric(42)).toBe(true);
  });

  it('isNumeric returns true for zero', () => {
    expect(service.isNumeric(0)).toBe(true);
  });

  it('isNumeric returns true for negative number', () => {
    expect(service.isNumeric(-7.5)).toBe(true);
  });

  it('isNumeric returns true for string integer "123"', () => {
    expect(service.isNumeric('123')).toBe(true);
  });

  it('isNumeric returns true for string decimal "3.14"', () => {
    expect(service.isNumeric('3.14')).toBe(true);
  });

  it('isNumeric returns true for string with comma separator "1,000"', () => {
    expect(service.isNumeric('1,000')).toBe(true);
  });

  it('isNumeric returns false for non-numeric string "abc"', () => {
    expect(service.isNumeric('abc')).toBe(false);
  });

  it('isNumeric returns false for Infinity', () => {
    expect(service.isNumeric(Infinity)).toBe(false);
  });

  it('isNumeric returns false for NaN', () => {
    expect(service.isNumeric(NaN)).toBe(false);
  });

  // ─── getCellAlignment ────────────────────────────────────────────────

  it('getCellAlignment returns "left" for null inputDatas', () => {
    expect(service.getCellAlignment(null as any, 'col')).toBe('left');
  });

  it('getCellAlignment returns "left" for empty array', () => {
    expect(service.getCellAlignment([], 'col')).toBe('left');
  });

  it('getCellAlignment returns "right" when all values are numeric', () => {
    const data = [{ v: 1 }, { v: 2 }, { v: 3 }];
    expect(service.getCellAlignment(data, 'v')).toBe('right');
  });

  it('getCellAlignment returns "left" when all values are text', () => {
    const data = [{ v: 'a' }, { v: 'b' }, { v: 'c' }];
    expect(service.getCellAlignment(data, 'v')).toBe('left');
  });

  it('getCellAlignment returns "left" when all values are null/undefined/empty', () => {
    const data = [{ v: null }, { v: undefined }, { v: '' }];
    expect(service.getCellAlignment(data, 'v')).toBe('left');
  });

  it('getCellAlignment returns "right" when ratio >= threshold (default 0.7)', () => {
    // 8 numeric + 2 text = 80% numeric ≥ 70% threshold → right
    const data = [
      { v: 1 },
      { v: 2 },
      { v: 3 },
      { v: 4 },
      { v: 5 },
      { v: 6 },
      { v: 7 },
      { v: 8 },
      { v: 'x' },
      { v: 'y' },
    ];
    expect(service.getCellAlignment(data, 'v')).toBe('right');
  });

  it('getCellAlignment returns "left" when ratio < threshold', () => {
    // 1 numeric + 9 text = 10% < 70% → left
    const data = [
      { v: 1 },
      { v: 'a' },
      { v: 'b' },
      { v: 'c' },
      { v: 'd' },
      { v: 'e' },
      { v: 'f' },
      { v: 'g' },
      { v: 'h' },
      { v: 'i' },
    ];
    expect(service.getCellAlignment(data, 'v')).toBe('left');
  });

  it('getCellAlignment respects custom threshold', () => {
    // 5 numeric + 5 text = 50%. threshold=0.5 → right
    const data = [
      { v: 1 },
      { v: 2 },
      { v: 3 },
      { v: 4 },
      { v: 5 },
      { v: 'a' },
      { v: 'b' },
      { v: 'c' },
      { v: 'd' },
      { v: 'e' },
    ];
    expect(service.getCellAlignment(data, 'v', 0.5)).toBe('right');
  });

  it('getCellAlignment samples max 20 rows', () => {
    // 25 rows, first 20 are numeric, last 5 are text → right (only samples 20)
    const data: any[] = [];
    for (let i = 0; i < 20; i++) data.push({ v: i });
    for (let i = 0; i < 5; i++) data.push({ v: 'text' });
    expect(service.getCellAlignment(data, 'v')).toBe('right');
  });

  // ─── createColumnDefs ───────────────────────────────────────────────

  it('createColumnDefs returns empty array for empty columns', () => {
    expect(service.createColumnDefs([], [])).toEqual([]);
  });

  it('createColumnDefs skips hidden columns', () => {
    const cols: GridColumnsI[] = [
      { headerName: 'A', field: 'a', hidden: true },
    ];
    const result = service.createColumnDefs(cols, [{ a: 1 }]);
    expect(result.length).toBe(0);
  });

  it('createColumnDefs creates correct column for visible column', () => {
    const cols: GridColumnsI[] = [{ headerName: 'Name', field: 'name' }];
    const data = [{ name: 'Alice' }];
    const result = service.createColumnDefs(cols, data);
    expect(result.length).toBe(1);
    expect(result[0].headerName).toBe('Name');
    expect(result[0].field).toBe('name');
    expect(result[0].colId).toBe('Name');
    expect(result[0].sortable).toBe(true);
    expect(result[0].suppressMovable).toBe(true);
    expect(result[0].resizable).toBe(true);
    expect(result[0].cellDataType).toBe('text');
  });

  it('createColumnDefs sets hide=true when col.show is false', () => {
    const cols: GridColumnsI[] = [{ headerName: 'H', field: 'h', show: false }];
    const result = service.createColumnDefs(cols, [{ h: 1 }]);
    expect(result[0].hide).toBe(true);
  });

  it('createColumnDefs builds tooltip from headerName + tooltip', () => {
    const cols: GridColumnsI[] = [
      { headerName: 'Col', field: 'c', tooltip: 'some tip' },
    ];
    const result = service.createColumnDefs(cols, [{ c: 1 }]);
    expect(result[0].headerTooltip).toBe('Col: some tip');
  });

  it('createColumnDefs uses headerName as tooltip when no tooltip', () => {
    const cols: GridColumnsI[] = [{ headerName: 'Col', field: 'c' }];
    const result = service.createColumnDefs(cols, [{ c: 1 }]);
    expect(result[0].headerTooltip).toBe('Col');
  });

  it('createColumnDefs reads width from cellsSizes option', () => {
    const cols: GridColumnsI[] = [{ headerName: 'W', field: 'w' }];
    const result = service.createColumnDefs(cols, [{ w: 1 }], {
      cellsSizes: { grid1: { w: 200 } },
      gridId: 'grid1',
    });
    expect(result[0].width).toBe(200);
  });

  it('createColumnDefs cellClass returns right-aligned for numeric data', () => {
    const cols: GridColumnsI[] = [{ headerName: 'N', field: 'n' }];
    const data = [{ n: 42 }];
    const result = service.createColumnDefs(cols, data);
    const cellClassFn = result[0].cellClass as (params: any) => string;
    expect(cellClassFn({})).toBe('ag-right-aligned-cell');
  });

  it('createColumnDefs cellClass returns left-aligned for text data', () => {
    const cols: GridColumnsI[] = [{ headerName: 'T', field: 't' }];
    const data = [{ t: 'hello' }];
    const result = service.createColumnDefs(cols, data);
    const cellClassFn = result[0].cellClass as (params: any) => string;
    expect(cellClassFn({})).toBe('ag-left-aligned-cell');
  });

  it('createColumnDefs cellClass appends custom string cellClass', () => {
    const cols: GridColumnsI[] = [
      { headerName: 'C', field: 'c', cellClass: 'my-class' },
    ];
    const data = [{ c: 'text' }];
    const result = service.createColumnDefs(cols, data);
    const cellClassFn = result[0].cellClass as (params: any) => string;
    expect(cellClassFn({})).toBe('ag-left-aligned-cell my-class');
  });

  it('createColumnDefs cellClass calls custom function cellClass', () => {
    const cols: GridColumnsI[] = [
      { headerName: 'C', field: 'c', cellClass: () => 'dynamic-cls' },
    ];
    const data = [{ c: 'text' }];
    const result = service.createColumnDefs(cols, data);
    const cellClassFn = result[0].cellClass as (params: any) => string;
    expect(cellClassFn({})).toBe('ag-left-aligned-cell dynamic-cls');
  });

  it('createColumnDefs headerClass returns right-aligned for numeric data', () => {
    const cols: GridColumnsI[] = [{ headerName: 'N', field: 'n' }];
    const data = [{ n: 42 }];
    const result = service.createColumnDefs(cols, data);
    const headerClassFn = result[0].headerClass as (params: any) => string;
    expect(headerClassFn({})).toBe('ag-right-aligned-header');
  });

  it('createColumnDefs headerClass appends custom string headerClass', () => {
    const cols: GridColumnsI[] = [
      { headerName: 'H', field: 'h', headerClass: 'hdr-cls' },
    ];
    const data = [{ h: 'text' }];
    const result = service.createColumnDefs(cols, data);
    const headerClassFn = result[0].headerClass as (params: any) => string;
    expect(headerClassFn({})).toBe('ag-left-aligned-header hdr-cls');
  });

  it('createColumnDefs headerClass calls custom function headerClass', () => {
    const cols: GridColumnsI[] = [
      { headerName: 'H', field: 'h', headerClass: () => 'fn-hdr' },
    ];
    const data = [{ h: 'text' }];
    const result = service.createColumnDefs(cols, data);
    const headerClassFn = result[0].headerClass as (params: any) => string;
    expect(headerClassFn({})).toBe('ag-left-aligned-header fn-hdr');
  });

  it('createColumnDefs adds numeric cellRenderer when appConfig provided and column is numeric', () => {
    const cols: GridColumnsI[] = [{ headerName: 'V', field: 'v' }];
    const data = [{ v: 3.14159 }];
    const result = service.createColumnDefs(cols, data, {
      appConfig: { GLOBAL: { TO_FIXED: 4 } },
    });
    // The cellRenderer should exist and format the value
    const renderer = result[0].cellRenderer as (params: any) => string;
    expect(typeof renderer).toBe('function');
    // empty/null/undefined → ''
    expect(renderer({ value: null })).toBe('');
    expect(renderer({ value: undefined })).toBe('');
    expect(renderer({ value: '' })).toBe('');
  });

  it('createColumnDefs does NOT add numeric renderer when column is text', () => {
    const cols: GridColumnsI[] = [{ headerName: 'T', field: 't' }];
    const data = [{ t: 'hello' }];
    const result = service.createColumnDefs(cols, data, {
      appConfig: { GLOBAL: { TO_FIXED: 4 } },
    });
    // text column should not have a custom renderer
    expect(result[0].cellRenderer).toBeUndefined();
  });

  it('createColumnDefs preserves existing cellRenderer over auto-format', () => {
    const customRenderer = (p: any) => `<b>${p.value}</b>`;
    const cols: GridColumnsI[] = [
      { headerName: 'V', field: 'v', cellRenderer: customRenderer },
    ];
    const data = [{ v: 42 }];
    const result = service.createColumnDefs(cols, data, {
      appConfig: { GLOBAL: { TO_FIXED: 4 } },
    });
    expect(result[0].cellRenderer).toBe(customRenderer);
  });

  // ─── createComparator ────────────────────────────────────────────────

  it('createComparator sorts numbers correctly', () => {
    const cmp = service.createComparator();
    expect(cmp(1, 2)).toBeLessThan(0);
    expect(cmp(10, 3)).toBeGreaterThan(0);
    expect(cmp(5, 5)).toBe(0);
  });

  it('createComparator sorts strings correctly', () => {
    const cmp = service.createComparator();
    expect(cmp('apple', 'banana')).toBeLessThan(0);
    expect(cmp('cherry', 'banana')).toBeGreaterThan(0);
    expect(cmp('same', 'same')).toBe(0);
  });

  it('createComparator treats null/undefined as empty string', () => {
    const cmp = service.createComparator();
    expect(cmp(null, null)).toBe(0);
    expect(cmp(undefined, undefined)).toBe(0);
    expect(cmp(null, '')).toBe(0);
    expect(cmp('', undefined)).toBe(0);
  });

  it('createComparator handles mixed numeric/string values via Number coercion', () => {
    const cmp = service.createComparator();
    // '' becomes Number('') = 0, so both are numeric
    expect(cmp('', 0)).toBe(0);
  });

  // ─── analyzeAndEnhanceColumns ────────────────────────────────────────

  it('analyzeAndEnhanceColumns adds _detectedType "numeric" for numeric columns', () => {
    const cols: GridColumnsI[] = [{ headerName: 'V', field: 'v' }];
    const data = [{ v: 1 }, { v: 2 }];
    const result = service.analyzeAndEnhanceColumns(data, cols) as any;
    expect(result[0]._detectedType).toBe('numeric');
    expect(result[0]._alignment).toBe('right');
  });

  it('analyzeAndEnhanceColumns adds _detectedType "text" for text columns', () => {
    const cols: GridColumnsI[] = [{ headerName: 'N', field: 'n' }];
    const data = [{ n: 'abc' }];
    const result = service.analyzeAndEnhanceColumns(data, cols) as any;
    expect(result[0]._detectedType).toBe('text');
    expect(result[0]._alignment).toBe('left');
  });

  // ─── sanitizeGridData ───────────────────────────────────────────────

  it('sanitizeGridData returns empty array for null inputs', () => {
    expect(service.sanitizeGridData(null as any, null as any)).toEqual([]);
  });

  it('sanitizeGridData returns empty array for undefined displayedColumns', () => {
    expect(service.sanitizeGridData([{ a: 1 }], undefined as any)).toEqual([]);
  });

  it('sanitizeGridData extracts only declared fields', () => {
    const cols: GridColumnsI[] = [{ headerName: 'A', field: 'a' }];
    const data = [{ a: 1, b: 2, c: 3 }];
    const result = service.sanitizeGridData(data, cols);
    expect(result.length).toBe(1);
    expect(result[0].a).toBe(1);
    expect(result[0].b).toBeUndefined();
  });

  it('sanitizeGridData skips null entries in inputDatas', () => {
    const cols: GridColumnsI[] = [{ headerName: 'X', field: 'x' }];
    const data = [{ x: 10 }, null as any, { x: 20 }];
    const result = service.sanitizeGridData(data, cols);
    expect(result.length).toBe(2);
    expect(result[0].x).toBe(10);
    expect(result[1].x).toBe(20);
  });

  // ─── getAlignmentClasses ────────────────────────────────────────────

  it('getAlignmentClasses returns right-aligned classes', () => {
    const result = service.getAlignmentClasses('right');
    expect(result.cellClass).toBe('ag-right-aligned-cell');
    expect(result.headerClass).toBe('ag-right-aligned-header');
  });

  it('getAlignmentClasses returns left-aligned classes', () => {
    const result = service.getAlignmentClasses('left');
    expect(result.cellClass).toBe('ag-left-aligned-cell');
    expect(result.headerClass).toBe('ag-left-aligned-header');
  });
});
