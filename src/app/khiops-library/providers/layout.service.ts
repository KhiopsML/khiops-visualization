/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from './ls.service';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private splitSizes: any;

  constructor(private ls: Ls) {}

  /**
   * Initializes the layout service with default split sizes.
   * It retrieves stored split sizes from local storage and sets them to the provided splitSizes.
   * If no stored values are found, it uses the provided splitSizes as defaults.
   * @param splitSizes - The default split sizes to initialize with.
   */
  initialize(splitSizes: any) {
    this.splitSizes = splitSizes;

    const storedSplitValues = this.ls.get(LS.SPLIT_SIZES);

    // Set default split sizes if not into local storage
    this.splitSizes = UtilsService.setDefaultLSValues(
      storedSplitValues,
      this.splitSizes,
    );
  }

  /**
   * Retrieves the split sizes for a specific view.
   * @param view - The view for which to get the split sizes.
   * @returns The split sizes for the specified view.
   */
  getViewSplitSizes(view: any): any {
    return this.splitSizes[view];
  }

  /**
   * Retrieves the split sizes for all views.
   * @returns The split sizes object containing sizes for all views.
   */
  getSplitSizes(): any {
    return this.splitSizes;
  }

  /**
   * Sets the split sizes for a specific view and updates the local storage.
   * @param view - The view for which to set the split sizes.
   * @param sizes - The sizes to set for the specified view.
   */
  setViewSplitSizes(view: string, sizes: any) {
    this.splitSizes[view] = sizes;
    this.setSplitSizes(this.splitSizes);
  }

  /**
   * Sets the split sizes for all views and updates the local storage.
   * @param splitSizes - The new split sizes to set for all views.
   */
  setSplitSizes(splitSizes: any) {
    this.splitSizes = splitSizes;
    this.ls.set(LS.SPLIT_SIZES, this.splitSizes);
  }

  /**
   * Resizes an item and updates the split sizes for the specified view.
   * @param item - The item to resize.
   * @param sizes - The current split sizes.
   * @param itemSize - The new size for the item.
   * @param view - The view for which to update the split sizes.
   */
  resizeAndSetSplitSizes(
    item: string,
    sizes: any,
    itemSize: any,
    view: string,
    dispatchEvent?: boolean,
  ) {
    if (dispatchEvent !== false) {
      window.dispatchEvent(new Event('resize'));
    }
    if (item) {
      sizes[item] = itemSize;
      this.setViewSplitSizes(view, sizes);
    }
  }

  /**
   * Switches the split sizes between two views.
   * @param oldPosition - The old position of the view.
   * @param newPosition - The new position of the view.
   */
  switchSplitSizes(oldPosition: number, newPosition: number) {
    const oldView =
      oldPosition === 0 || oldPosition === 1 ? 'axisView' : 'contextView';
    const newView =
      newPosition === 0 || newPosition === 1 ? 'axisView' : 'contextView';

    // All contexts have same layout
    if (newView === 'contextView') {
      newPosition = 0;
    }
    if (oldPosition > 1) {
      oldPosition = 0;
    }

    // Maybe split view sizes managment needs a deep refactoring
    [
      this.splitSizes[oldView]['col0Row' + oldPosition + 'Col'],
      this.splitSizes[newView]['col0Row' + newPosition + 'Col'],
    ] = [
      this.splitSizes[newView]['col0Row' + newPosition + 'Col'],
      this.splitSizes[oldView]['col0Row' + oldPosition + 'Col'],
    ];
    [
      this.splitSizes[oldView]['col0Row' + oldPosition + 'Col2Row'],
      this.splitSizes[newView]['col0Row' + newPosition + 'Col2Row'],
    ] = [
      this.splitSizes[newView]['col0Row' + newPosition + 'Col2Row'],
      this.splitSizes[oldView]['col0Row' + oldPosition + 'Col2Row'],
    ];
  }
}
