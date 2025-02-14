/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TranslateService } from '@ngstack/translate';

export function getClustersDisplayedColumns(translate: TranslateService) {
  return [
    {
      headerName: translate.get('GLOBAL.NAME'),
      field: 'hierarchy',
      tooltip: translate.get('TOOLTIPS.AXIS.SELECTED_CLUSTERS.NAME'),
    },
    {
      headerName: translate.get('GLOBAL.CURRENT_CLUSTER'),
      field: 'shortDescription',
      tooltip: translate.get(
        'TOOLTIPS.AXIS.SELECTED_CLUSTERS.CURRENT_CLUSTERS',
      ),
    },
    {
      headerName: translate.get('GLOBAL.NB_CLUSTERS'),
      field: 'nbClusters',
      tooltip: translate.get('TOOLTIPS.AXIS.SELECTED_CLUSTERS.NB_CLUSTERS'),
    },
  ];
}
