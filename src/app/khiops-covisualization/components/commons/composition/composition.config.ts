/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TranslateService } from '@ngstack/translate';

export function getCompositionDisplayedColumns(translate: TranslateService) {
  return [
    {
      headerName: translate.get('GLOBAL.CLUSTER'),
      field: 'cluster',
      tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.CLUSTER'),
    },
    {
      headerName: translate.get('GLOBAL.TERMINAL_CLUSTER'),
      show: false,
      field: 'terminalCluster',
      tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.TERMINAL_CLUSTER'),
    },
    {
      headerName: translate.get('GLOBAL.RANK'),
      show: false,
      field: 'rank',
      tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.RANK'),
    },
    {
      headerName: translate.get('GLOBAL.TYPICALITY'),
      field: 'typicality',
      tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.TYPICALITY'),
    },
    {
      headerName: translate.get('GLOBAL.VALUE'),
      field: 'value',
      tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.VALUE'),
    },
    {
      headerName: translate.get('GLOBAL.FREQUENCY'),
      field: 'frequency',
      tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.FREQUENCY'),
    },
  ];
}
