/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { MatrixComponent } from '../../app/khiops-library/components/matrix/matrix.component';
import { CellModel } from '../../app/khiops-library/model/cell.model';

describe('Matrix selection bounds', () => {
  it('exposes the combined drawn bounds and clears them with the selection', () => {
    const component: MatrixComponent = Object.create(MatrixComponent.prototype);
    const canvas = document.createElement('canvas');
    const renderer = {
      drawSelectedCell: jasmine.createSpy('drawSelectedCell'),
      cleanSelectedDomContext: jasmine.createSpy('cleanSelectedDomContext'),
    };
    Object.assign(component, {
      matrixSelectedDiv: { nativeElement: canvas },
      matrixSelectedCtx: canvas.getContext('2d'),
      matrixRendererService: renderer,
    });
    component.ngAfterViewInit();
    const bounds = Reflect.get(canvas, 'getSelectedCellBounds');
    const first = Object.assign(new CellModel(), { xCanvas: 10, yCanvas: 20, wCanvas: 30, hCanvas: 40 });
    const second = Object.assign(new CellModel(), { xCanvas: 5, yCanvas: 50, wCanvas: 80, hCanvas: 20 });

    component.drawSelectedCell(first);
    component.drawSelectedCell(second);
    expect(bounds()).toEqual({ x: 5, y: 20, width: 80, height: 50 });
    Reflect.apply(Reflect.get(component, 'cleanSelectedDomContext'), component, []);
    expect(bounds()).toBeUndefined();
  });
});
