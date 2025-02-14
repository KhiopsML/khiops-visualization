/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TranslateService } from '@ngstack/translate';

export function getClusterGridColumns(translate: TranslateService) {
  return [
    {
      headerName: translate.get('GLOBAL.NAME'),
      field: 'name',
      tooltip: translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.NAME'),
    },
    {
      headerName: translate.get('GLOBAL.FATHER'),
      field: 'father',
      show: false,
      tooltip: translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.FATHER'),
    },
    {
      headerName: translate.get('GLOBAL.FREQUENCY'),
      field: 'frequency',
      tooltip: translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.FREQUENCY'),
    },
    {
      headerName: translate.get('GLOBAL.INTEREST'),
      field: 'interest',
      tooltip: translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.INTEREST'),
    },
    {
      headerName: translate.get('GLOBAL.HIERARCHICAL_LEVEL'),
      field: 'hierarchicalLevel',
      show: false,
      tooltip: translate.get(
        'TOOLTIPS.AXIS.CURRENT_CLUSTERS.HIERARCHICAL_LEVEL',
      ),
    },
    {
      headerName: translate.get('GLOBAL.RANK'),
      field: 'rank',
      show: false,
      tooltip: translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.RANK'),
    },
  ];
}
