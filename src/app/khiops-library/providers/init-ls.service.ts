/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ViewLayoutVO } from '../../khiops-covisualization/model/view-layout.model';

/**
 * Initializes the local storage with default view layout settings.
 *
 * @returns {ViewLayoutVO} The initialized view layout object with default settings.
 */
export function initLS() {
  let ls: ViewLayoutVO = new ViewLayoutVO();
  // @ts-ignore
  ls = {
    isDimensionsChecked: true,
    isCooccurrenceChecked: true,
    dimensionsViewsLayoutsVO: [
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
      {
        isChecked: true,
        isHierarchyChecked: true,
        isClustersChecked: true,
        isAnnotationChecked: true,
        isCompositionChecked: true,
        isExternalDataChecked: true,
        isDistributionChecked: true,
        name: '',
      },
    ],
  };

  return ls;
}
