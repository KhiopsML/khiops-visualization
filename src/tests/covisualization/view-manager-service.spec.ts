/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { ViewManagerService } from '@khiops-covisualization/providers/view-manager.service';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { Ls } from '@khiops-library/providers/ls.service';
import { LS } from '@khiops-library/enum/ls';

let viewManagerService: ViewManagerService;
let appService: AppService;
let ls: Ls;

describe('coVisualization', () => {
  describe('ViewManagerService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient(withXhr())],
      });

      viewManagerService = TestBed.inject(ViewManagerService);
      appService = TestBed.inject(AppService);
      ls = TestBed.inject(Ls);
    });

    it('should be created', () => {
      expect(viewManagerService).toBeTruthy();
    });

    // ===== initViewsLayout =====

    describe('initViewsLayout', () => {
      it('should create ViewLayoutVO with correct number of dimension layouts', () => {
        const dimensions = [{ name: 'dim1' }, { name: 'dim2' }];
        const result = viewManagerService.initViewsLayout(dimensions);

        expect(result).toBeDefined();
        expect(result.dimensionsViewsLayoutsVO.length).toBe(2);
      });

      it('should mark dimensions at index >= 2 as context views', () => {
        const dimensions = [
          { name: 'dim1' },
          { name: 'dim2' },
          { name: 'dim3' },
        ];
        const result = viewManagerService.initViewsLayout(dimensions);

        expect(result.dimensionsViewsLayoutsVO.length).toBe(3);
        // isContextView sets isDistributionChecked = !isContextView
        expect(result.dimensionsViewsLayoutsVO[0].isDistributionChecked).toBe(
          true,
        );
        expect(result.dimensionsViewsLayoutsVO[1].isDistributionChecked).toBe(
          true,
        );
        expect(result.dimensionsViewsLayoutsVO[2].isDistributionChecked).toBe(
          false,
        );
      });

      it('should handle empty dimensions array', () => {
        const result = viewManagerService.initViewsLayout([]);

        expect(result).toBeDefined();
        expect(result.dimensionsViewsLayoutsVO.length).toBe(0);
      });

      it('should merge with saved data if available', () => {
        const savedLayout = {
          isDimensionsChecked: false,
          isCooccurrenceChecked: false,
          dimensionsViewsLayoutsVO: [],
        };
        spyOn(appService, 'getSavedDatas').and.returnValue(savedLayout);

        const dimensions = [{ name: 'dim1' }];
        const result = viewManagerService.initViewsLayout(dimensions);

        expect(result.isDimensionsChecked).toBe(false);
        expect(result.isCooccurrenceChecked).toBe(false);
      });

      it('should not merge when no saved data', () => {
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);

        const dimensions = [{ name: 'dim1' }];
        const result = viewManagerService.initViewsLayout(dimensions);

        expect(result.isDimensionsChecked).toBe(true);
        expect(result.isCooccurrenceChecked).toBe(true);
      });

      it('should handle dimensions with empty name', () => {
        const dimensions = [{ name: '' }, { name: 'dim2' }];
        const result = viewManagerService.initViewsLayout(dimensions);

        expect(result.dimensionsViewsLayoutsVO.length).toBe(2);
        expect(result.dimensionsViewsLayoutsVO[0].name).toBe('');
      });

      it('should handle single dimension', () => {
        const dimensions = [{ name: 'onlyDim' }];
        const result = viewManagerService.initViewsLayout(dimensions);

        expect(result.dimensionsViewsLayoutsVO.length).toBe(1);
        expect(result.dimensionsViewsLayoutsVO[0].name).toBe('onlyDim');
        expect(result.dimensionsViewsLayoutsVO[0].isDistributionChecked).toBe(
          true,
        );
      });
    });

    // ===== initSavedLayout =====

    describe('initSavedLayout', () => {
      it('should set views layout from saved data', () => {
        const savedLayout = {
          isDimensionsChecked: true,
          isCooccurrenceChecked: false,
          dimensionsViewsLayoutsVO: [],
        };
        spyOn(appService, 'getSavedDatas').and.returnValue(savedLayout);

        viewManagerService.initSavedLayout();

        const result = viewManagerService.getViewsLayout();
        expect(result).toEqual(savedLayout);
      });

      it('should not change layout when no saved data', () => {
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);

        viewManagerService.initSavedLayout();

        const result = viewManagerService.getViewsLayout();
        expect(result).toBeUndefined();
      });
    });

    // ===== getViewsLayout =====

    describe('getViewsLayout', () => {
      it('should return undefined initially', () => {
        expect(viewManagerService.getViewsLayout()).toBeUndefined();
      });

      it('should return layout after initViewsLayout', () => {
        viewManagerService.initViewsLayout([{ name: 'dim1' }]);
        const result = viewManagerService.getViewsLayout();
        expect(result).toBeDefined();
      });
    });

    // ===== setViewsLayout =====

    describe('setViewsLayout', () => {
      it('should set the views layout', () => {
        const layout = {
          isDimensionsChecked: true,
          isCooccurrenceChecked: true,
          dimensionsViewsLayoutsVO: [],
        };

        viewManagerService.setViewsLayout(layout);

        expect(viewManagerService.getViewsLayout()).toBe(layout);
      });

      it('should allow setting to undefined', () => {
        viewManagerService.initViewsLayout([{ name: 'dim1' }]);
        expect(viewManagerService.getViewsLayout()).toBeDefined();

        viewManagerService.setViewsLayout(undefined);
        expect(viewManagerService.getViewsLayout()).toBeUndefined();
      });

      it('should overwrite previous layout', () => {
        const layout1 = {
          isDimensionsChecked: true,
          isCooccurrenceChecked: true,
          dimensionsViewsLayoutsVO: [],
        };
        const layout2 = {
          isDimensionsChecked: false,
          isCooccurrenceChecked: false,
          dimensionsViewsLayoutsVO: [],
        };

        viewManagerService.setViewsLayout(layout1);
        expect(viewManagerService.getViewsLayout()).toBe(layout1);

        viewManagerService.setViewsLayout(layout2);
        expect(viewManagerService.getViewsLayout()).toBe(layout2);
      });
    });

    // ===== enableExtDatasView =====

    describe('enableExtDatasView', () => {
      it('should enable external data view for matching dimension', () => {
        viewManagerService.initViewsLayout([
          { name: 'dim1' },
          { name: 'dim2' },
        ]);
        spyOn(ls, 'set');

        viewManagerService.enableExtDatasView('dim1');

        const layout = viewManagerService.getViewsLayout();
        const dim1Layout = layout.dimensionsViewsLayoutsVO.find(
          (e) => e.name === 'dim1',
        );
        expect(dim1Layout.isExternalDataChecked).toBe(true);
      });

      it('should not affect other dimensions', () => {
        viewManagerService.initViewsLayout([
          { name: 'dim1' },
          { name: 'dim2' },
        ]);
        spyOn(ls, 'set');

        viewManagerService.enableExtDatasView('dim1');

        const layout = viewManagerService.getViewsLayout();
        const dim2Layout = layout.dimensionsViewsLayoutsVO.find(
          (e) => e.name === 'dim2',
        );
        expect(dim2Layout.isExternalDataChecked).toBeFalsy();
      });

      it('should not throw when dimension name does not exist', () => {
        viewManagerService.initViewsLayout([{ name: 'dim1' }]);

        expect(() =>
          viewManagerService.enableExtDatasView('nonexistent'),
        ).not.toThrow();
      });

      it('should not throw when layout is not initialized', () => {
        expect(() =>
          viewManagerService.enableExtDatasView('dim1'),
        ).not.toThrow();
      });

      it('should call saveViewsLayout', () => {
        viewManagerService.initViewsLayout([{ name: 'dim1' }]);
        spyOn(viewManagerService, 'saveViewsLayout');

        viewManagerService.enableExtDatasView('dim1');

        expect(viewManagerService.saveViewsLayout).toHaveBeenCalled();
      });
    });

    // ===== saveViewsLayout =====

    describe('saveViewsLayout', () => {
      it('should save layout and emit event', () => {
        spyOn(ls, 'set');
        let emittedValue: any;
        viewManagerService.viewsLayoutChanged.subscribe((val) => {
          emittedValue = val;
        });

        const layout = {
          isDimensionsChecked: true,
          isCooccurrenceChecked: true,
          dimensionsViewsLayoutsVO: [],
        };

        viewManagerService.saveViewsLayout(layout);

        expect(ls.set).toHaveBeenCalledWith(LS.VIEWS_LAYOUT, layout);
        expect(emittedValue).toBe(layout);
        expect(viewManagerService.getViewsLayout()).toBe(layout);
      });

      it('should save undefined layout', () => {
        spyOn(ls, 'set');

        viewManagerService.saveViewsLayout(undefined);

        expect(ls.set).toHaveBeenCalledWith(LS.VIEWS_LAYOUT, undefined);
        expect(viewManagerService.getViewsLayout()).toBeUndefined();
      });

      it('should emit event each time', () => {
        spyOn(ls, 'set');
        let emitCount = 0;
        viewManagerService.viewsLayoutChanged.subscribe(() => {
          emitCount++;
        });

        viewManagerService.saveViewsLayout({});
        viewManagerService.saveViewsLayout({});
        viewManagerService.saveViewsLayout({});

        expect(emitCount).toBe(3);
      });
    });

    // ===== viewsLayoutChanged EventEmitter =====

    describe('viewsLayoutChanged', () => {
      it('should be defined', () => {
        expect(viewManagerService.viewsLayoutChanged).toBeDefined();
      });

      it('should notify subscribers on save', (done) => {
        spyOn(ls, 'set');

        const layout = { isDimensionsChecked: true };
        viewManagerService.viewsLayoutChanged.subscribe((val) => {
          expect(val).toBe(layout);
          done();
        });

        viewManagerService.saveViewsLayout(layout);
      });
    });

    // ===== Integration =====

    describe('Integration', () => {
      it('should handle full workflow: init -> enable ext -> save -> get', () => {
        spyOn(ls, 'set');
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);

        const dimensions = [{ name: 'occupation' }, { name: 'education' }];
        viewManagerService.initViewsLayout(dimensions);

        let layout = viewManagerService.getViewsLayout();
        expect(layout.dimensionsViewsLayoutsVO.length).toBe(2);

        viewManagerService.enableExtDatasView('occupation');
        layout = viewManagerService.getViewsLayout();
        const occLayout = layout.dimensionsViewsLayoutsVO.find(
          (e) => e.name === 'occupation',
        );
        expect(occLayout.isExternalDataChecked).toBe(true);
      });

      it('should handle reinitialize with different dimensions', () => {
        spyOn(appService, 'getSavedDatas').and.returnValue(undefined);

        viewManagerService.initViewsLayout([
          { name: 'dim1' },
          { name: 'dim2' },
        ]);
        expect(
          viewManagerService.getViewsLayout().dimensionsViewsLayoutsVO.length,
        ).toBe(2);

        viewManagerService.initViewsLayout([
          { name: 'dimA' },
          { name: 'dimB' },
          { name: 'dimC' },
        ]);
        expect(
          viewManagerService.getViewsLayout().dimensionsViewsLayoutsVO.length,
        ).toBe(3);
      });
    });
  });
});
