/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck

import { MatrixComponent } from '../../app/khiops-library/components/matrix/matrix.component';
import { LS } from '../../app/khiops-library/enum/ls';

describe('Matrix contrast persistence', () => {
  let component: MatrixComponent;
  let persistedSettings: Record<string, number>;
  let settings: Record<string, number>;

  beforeEach(() => {
    settings = {};
    persistedSettings = {};
    component = Object.create(MatrixComponent.prototype);
    component.ls = {
      set: jasmine.createSpy('set').and.callFake((key, value) => {
        settings[key] = value;
      }),
      setAll: jasmine.createSpy('setAll').and.callFake(() => {
        persistedSettings = { ...settings };
      }),
    };
    component.khiopsLibraryService = {
      saveFileRequested$: { next: jasmine.createSpy('saveFileRequested') },
    };
    component.drawMatrix = jasmine.createSpy('drawMatrix');
  });

  for (const contrast of [10, 30, 90]) {
    it(`should persist slider contrast ${contrast} and notify desktop file settings`, () => {
      component.onContrastChanged({ target: { value: String(contrast) } });

      expect(component.contrast).toBe(contrast);
      expect(persistedSettings[LS.SETTING_MATRIX_CONTRAST]).toBe(contrast);
      expect(component.ls.setAll).toHaveBeenCalledTimes(1);
      expect(
        component.khiopsLibraryService.saveFileRequested$.next,
      ).toHaveBeenCalledTimes(1);
      expect(component.drawMatrix).toHaveBeenCalledTimes(1);
    });
  }
});