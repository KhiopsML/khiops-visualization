/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export class DimensionViewLayoutModel {
  name: string;
  isChecked = true;
  isHierarchyChecked = true;
  isClustersChecked = false;
  isAnnotationChecked = false;
  isCompositionChecked = true;
  isExternalDataChecked = false;
  isDistributionChecked = false;

  constructor(name: string, isContextView: boolean) {
    this.name = name || '';
    this.isDistributionChecked = !isContextView;
  }
}
