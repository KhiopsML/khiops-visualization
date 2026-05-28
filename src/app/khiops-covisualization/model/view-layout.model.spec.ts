/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { ViewLayoutVO } from './view-layout.model';
import { DimensionViewLayoutModel } from './dimension-view-layout.model';

describe('ViewLayoutVO', () => {
  // --- Constructor ---

  it('should initialize with default values', () => {
    const layout = new ViewLayoutVO();
    expect(layout.isDimensionsChecked).toBe(true);
    expect(layout.isCooccurrenceChecked).toBe(true);
    expect(layout.dimensionsViewsLayoutsVO.length).toBe(0);
  });

  // --- addDimensionViewLayout ---

  it('should add a dimension view layout with correct name', () => {
    const layout = new ViewLayoutVO();
    layout.addDimensionViewLayout('dim1', false);
    expect(layout.dimensionsViewsLayoutsVO.length).toBe(1);
    expect(layout.dimensionsViewsLayoutsVO[0]!.name).toBe('dim1');
  });

  it('should set isDistributionChecked to false for context view', () => {
    const layout = new ViewLayoutVO();
    layout.addDimensionViewLayout('dim1', true);
    expect(layout.dimensionsViewsLayoutsVO[0]!.isDistributionChecked).toBe(
      false,
    );
  });

  it('should set isDistributionChecked to true for non-context view', () => {
    const layout = new ViewLayoutVO();
    layout.addDimensionViewLayout('dim1', false);
    expect(layout.dimensionsViewsLayoutsVO[0]!.isDistributionChecked).toBe(
      true,
    );
  });

  it('should merge previous layout when provided', () => {
    const layout = new ViewLayoutVO();
    const prev = new DimensionViewLayoutModel('dim1', false);
    prev.isChecked = false;
    prev.isHierarchyChecked = false;
    prev.isClustersChecked = true;

    layout.addDimensionViewLayout('dim1', false, prev);

    const result = layout.dimensionsViewsLayoutsVO[0]!;
    expect(result.isChecked).toBe(false);
    expect(result.isHierarchyChecked).toBe(false);
    expect(result.isClustersChecked).toBe(true);
  });

  it('should add multiple dimension view layouts', () => {
    const layout = new ViewLayoutVO();
    layout.addDimensionViewLayout('dim1', false);
    layout.addDimensionViewLayout('dim2', true);
    layout.addDimensionViewLayout('dim3', false);
    expect(layout.dimensionsViewsLayoutsVO.length).toBe(3);
    expect(layout.dimensionsViewsLayoutsVO[1]!.name).toBe('dim2');
  });

  // --- mergeWithPreviousValues ---

  it('should merge isDimensionsChecked and isCooccurrenceChecked', () => {
    const layout = new ViewLayoutVO();
    layout.mergeWithPreviousValues({
      isDimensionsChecked: false,
      isCooccurrenceChecked: false,
    });
    expect(layout.isDimensionsChecked).toBe(false);
    expect(layout.isCooccurrenceChecked).toBe(false);
  });

  it('should keep defaults when lsValues has undefined properties', () => {
    const layout = new ViewLayoutVO();
    layout.mergeWithPreviousValues({});
    expect(layout.isDimensionsChecked).toBe(true);
    expect(layout.isCooccurrenceChecked).toBe(true);
  });

  it('should merge dimensionsViewsLayoutsVO by matching name', () => {
    const layout = new ViewLayoutVO();
    layout.addDimensionViewLayout('dim1', false);
    layout.addDimensionViewLayout('dim2', true);

    const prevDim1 = new DimensionViewLayoutModel('dim1', false);
    prevDim1.isChecked = false;

    layout.mergeWithPreviousValues({
      dimensionsViewsLayoutsVO: [prevDim1],
    });

    expect(layout.dimensionsViewsLayoutsVO[0]!.isChecked).toBe(false);
    // dim2 remains unchanged
    expect(layout.dimensionsViewsLayoutsVO[1]!.isChecked).toBe(true);
  });

  it('should allow merge when prevValue has no name (cypress tests)', () => {
    const layout = new ViewLayoutVO();
    layout.addDimensionViewLayout('dim1', false);

    const prevNoName: any = {
      isChecked: false,
      isAnnotationChecked: true,
    };

    layout.mergeWithPreviousValues({
      dimensionsViewsLayoutsVO: [prevNoName],
    });

    expect(layout.dimensionsViewsLayoutsVO[0]!.isChecked).toBe(false);
    expect(layout.dimensionsViewsLayoutsVO[0]!.isAnnotationChecked).toBe(true);
  });

  it('should not merge when prevValue name does not match', () => {
    const layout = new ViewLayoutVO();
    layout.addDimensionViewLayout('dim1', false);

    const prevMismatch = new DimensionViewLayoutModel('other', false);
    prevMismatch.isChecked = false;

    layout.mergeWithPreviousValues({
      dimensionsViewsLayoutsVO: [prevMismatch],
    });

    // isChecked should remain true (default) because names don't match
    expect(layout.dimensionsViewsLayoutsVO[0]!.isChecked).toBe(true);
  });
});
