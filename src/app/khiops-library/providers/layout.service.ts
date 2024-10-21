import { Injectable } from '@angular/core';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from './ls.service';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  splitSizes: any;

  constructor(private ls: Ls) {}

  initialize(splitSizes) {
    this.splitSizes = splitSizes;

    const storedSplitValues = this.ls.get(LS.SPLIT_SIZES);

    // Set default split sizes if not into local storage
    this.splitSizes = UtilsService.setDefaultLSValues(
      storedSplitValues,
      this.splitSizes,
    );
  }

  getViewSplitSizes(view): any {
    return this.splitSizes[view];
  }

  getSplitSizes(): any {
    return this.splitSizes;
  }

  setViewSplitSizes(view, sizes) {
    this.splitSizes[view] = sizes;
    this.setSplitSizes(this.splitSizes);
  }

  setSplitSizes(splitSizes) {
    this.splitSizes = splitSizes;
    this.ls.set(LS.SPLIT_SIZES, JSON.stringify(this.splitSizes));
  }

  resizeAndSetSplitSizes(item, sizes, itemSize, view, dispatchEvent?) {
    if (dispatchEvent !== false) {
      window.dispatchEvent(new Event('resize'));
    }
    if (item) {
      sizes[item] = itemSize;
      this.setViewSplitSizes(view, sizes);
    }
  }

  switchSplitSizes(oldPosition, newPosition) {
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
