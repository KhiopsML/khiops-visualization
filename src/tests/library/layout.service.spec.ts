/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck
import { TestBed } from '@angular/core/testing';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { Ls } from '@khiops-library/providers/ls.service';
import { LS } from '@khiops-library/enum/ls';
import { UtilsService } from '@khiops-library/providers/utils.service';

describe('LayoutService', () => {
  let service: LayoutService;
  let lsSpy: jasmine.SpyObj<Ls>;

  const defaultSplitSizes = {
    axisView: { a: 1 },
    contextView: { b: 2 },
  };

  beforeEach(() => {
    lsSpy = jasmine.createSpyObj('Ls', ['get', 'set']);
    TestBed.configureTestingModule({
      providers: [LayoutService, { provide: Ls, useValue: lsSpy }],
    });
    service = TestBed.inject(LayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default split sizes if nothing in LS', () => {
    lsSpy.get.and.returnValue(undefined);
    spyOn(UtilsService, 'setDefaultLSValues').and.callFake(
      (stored, def) => def,
    );
    service.initialize(defaultSplitSizes);
    expect(service.getSplitSizes()).toEqual(defaultSplitSizes);
  });

  it('should initialize with stored split sizes if present', () => {
    const stored = { axisView: { a: 99 }, contextView: { b: 88 } };
    lsSpy.get.and.returnValue(stored);
    spyOn(UtilsService, 'setDefaultLSValues').and.callFake(
      (stored, def) => stored,
    );
    service.initialize(defaultSplitSizes);
    expect(service.getSplitSizes()).toEqual(stored);
  });

  it('getViewSplitSizes returns correct view', () => {
    service['splitSizes'] = defaultSplitSizes;
    expect(service.getViewSplitSizes('axisView')).toEqual({ a: 1 });
  });

  it('getSplitSizes returns all split sizes', () => {
    service['splitSizes'] = defaultSplitSizes;
    expect(service.getSplitSizes()).toEqual(defaultSplitSizes);
  });

  it('setViewSplitSizes updates a view and calls setSplitSizes', () => {
    service['splitSizes'] = { axisView: { a: 1 } };
    spyOn(service, 'setSplitSizes');
    service.setViewSplitSizes('axisView', { a: 42 });
    expect(service['splitSizes']['axisView']).toEqual({ a: 42 });
    expect(service.setSplitSizes).toHaveBeenCalledWith(service['splitSizes']);
  });

  it('setSplitSizes updates all split sizes and saves to LS', () => {
    service.setSplitSizes({ foo: 123 });
    expect(service['splitSizes']).toEqual({ foo: 123 });
    expect(lsSpy.set).toHaveBeenCalledWith(LS.SPLIT_SIZES, { foo: 123 });
  });

  it('resizeAndSetSplitSizes updates item and calls setViewSplitSizes', () => {
    spyOn(service, 'setViewSplitSizes');
    const sizes = { item1: 10 };
    service.resizeAndSetSplitSizes('item1', sizes, 99, 'axisView');
    expect(sizes['item1']).toBe(99);
    expect(service.setViewSplitSizes).toHaveBeenCalledWith('axisView', sizes);
  });

  it('resizeAndSetSplitSizes does not dispatch resize if dispatchEvent is false', () => {
    spyOn(window, 'dispatchEvent');
    service['splitSizes'] = { axisView: {} };
    service.resizeAndSetSplitSizes('item1', {}, 1, 'axisView', false);
    expect(window.dispatchEvent).not.toHaveBeenCalled();
  });

  it('resizeAndSetSplitSizes dispatches resize event by default', () => {
    spyOn(window, 'dispatchEvent');
    service['splitSizes'] = { axisView: {} };
    service.resizeAndSetSplitSizes('item1', {}, 1, 'axisView');
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('resizeAndSetSplitSizes does nothing if item is falsy', () => {
    spyOn(service, 'setViewSplitSizes');
    const sizes = { item1: 10 };
    service.resizeAndSetSplitSizes('', sizes, 99, 'axisView');
    expect(service.setViewSplitSizes).not.toHaveBeenCalled();
  });

  it('switchSplitSizes swaps col0RowXCol and col0RowXCol2Row between views', () => {
    service['splitSizes'] = {
      axisView: { col0Row0Col: 1, col0Row0Col2Row: 2 },
      contextView: { col0Row0Col: 3, col0Row0Col2Row: 4 },
    };
    service.switchSplitSizes(0, 2);
    expect(service['splitSizes']['axisView']['col0Row0Col']).toBe(3);
    expect(service['splitSizes']['contextView']['col0Row0Col']).toBe(1);
    expect(service['splitSizes']['axisView']['col0Row0Col2Row']).toBe(4);
    expect(service['splitSizes']['contextView']['col0Row0Col2Row']).toBe(2);
  });

  it('switchSplitSizes normalizes newPosition and oldPosition', () => {
    service['splitSizes'] = {
      axisView: { col0Row0Col: 1, col0Row0Col2Row: 2 },
      contextView: { col0Row0Col: 3, col0Row0Col2Row: 4 },
    };
    service.switchSplitSizes(3, 3); // both > 1
    // After normalization, oldPosition = 0, newPosition = 0, so swap is performed twice, resulting in original values
    expect(service['splitSizes']['axisView']['col0Row0Col']).toBe(1);
    expect(service['splitSizes']['contextView']['col0Row0Col']).toBe(3);
  });

  it('should not throw if splitSizes keys are missing', () => {
    service['splitSizes'] = { axisView: {}, contextView: {} };
    expect(() => service.switchSplitSizes(0, 2)).not.toThrow();
  });

  it('should handle setDefaultLSValues returning undefined', () => {
    lsSpy.get.and.returnValue(undefined);
    spyOn(UtilsService, 'setDefaultLSValues').and.returnValue(undefined);
    service.initialize(defaultSplitSizes);
    expect(service.getSplitSizes()).toBeUndefined();
  });
});
