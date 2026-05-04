/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { MatrixRendererService } from '@khiops-library/components/matrix/matrix.renderer.service';
import { CellModel } from '@khiops-library/model/cell.model';

function makeCell(
  xAxisFullPart: string[] = [],
  yAxisFullPart: string[] = [],
): CellModel {
  return { xAxisFullPart, yAxisFullPart } as unknown as CellModel;
}

describe('MatrixRendererService', () => {
  describe('checkCellContainsSelectedInnerVariables (inner variable prefix matching)', () => {
    let service: MatrixRendererService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(MatrixRendererService);
    });

    // 1. Exact match on xAxisFullPart
    it('should return true when xAxisFullPart contains the exact variable name (no part suffix)', () => {
      const cell = makeCell(['V1'], []);
      expect(
        (service as any).checkCellContainsSelectedInnerVariables(cell, ['V1']),
      ).toBe(true);
    });

    // 2. Prefix match: "V1 B0" selected with "V1"
    it('should return true when xAxisFullPart value starts with selected variable followed by a space', () => {
      const cell = makeCell(['V1 B0', 'V2 B1'], []);
      expect(
        (service as any).checkCellContainsSelectedInnerVariables(cell, ['V1']),
      ).toBe(true);
    });

    // 3. Core bug fix: "V11 B0" must NOT match "V1"
    it('should return false when xAxisFullPart value starts with a longer variable name (V11 should not match V1)', () => {
      const cell = makeCell(['V11 B0', 'V12 B1'], []);
      expect(
        (service as any).checkCellContainsSelectedInnerVariables(cell, ['V1']),
      ).toBe(false);
    });

    // 4. Core bug fix: "V20 B0" must NOT match "V2"
    it('should return false when xAxisFullPart value starts with a longer variable name (V20 should not match V2)', () => {
      const cell = makeCell(['V20 B0', 'V21 B1'], []);
      expect(
        (service as any).checkCellContainsSelectedInnerVariables(cell, ['V2']),
      ).toBe(false);
    });

    // 5. Match on yAxisFullPart
    it('should return true when yAxisFullPart contains a matching inner variable', () => {
      const cell = makeCell([], ['V2 B3']);
      expect(
        (service as any).checkCellContainsSelectedInnerVariables(cell, ['V2']),
      ).toBe(true);
    });

    // 6. Multiple selected variables — one matches
    it('should return true when one of the selected inner variables matches a cell value', () => {
      const cell = makeCell(['V3 B0'], []);
      expect(
        (service as any).checkCellContainsSelectedInnerVariables(cell, [
          'V1',
          'V3',
        ]),
      ).toBe(true);
    });

    // 7. No selected variables → should return false
    it('should return false when selectedInnerVariables is empty', () => {
      const cell = makeCell(['V1 B0'], []);
      expect(
        (service as any).checkCellContainsSelectedInnerVariables(cell, []),
      ).toBe(false);
    });

    // 8. No axis parts → should return false
    it('should return false when both xAxisFullPart and yAxisFullPart are empty arrays', () => {
      const cell = makeCell([], []);
      expect(
        (service as any).checkCellContainsSelectedInnerVariables(cell, ['V1']),
      ).toBe(false);
    });

    // 9. shouldHatchCellForInnerVariables: no inner variables → never hatch
    it('shouldHatchCellForInnerVariables should return false when hasInnerVariables is false', () => {
      const cell = makeCell(['V1 B0'], []);
      expect(
        (service as any).shouldHatchCellForInnerVariables(cell, ['V1'], false),
      ).toBe(false);
    });

    // 10. shouldHatchCellForInnerVariables: cell matches selected variable → must NOT be hatched
    it('shouldHatchCellForInnerVariables should return false (do not hatch) when cell contains the selected variable', () => {
      const cell = makeCell(['V1 B0'], []);
      expect(
        (service as any).shouldHatchCellForInnerVariables(cell, ['V1'], true),
      ).toBe(false);
    });
  });
});
