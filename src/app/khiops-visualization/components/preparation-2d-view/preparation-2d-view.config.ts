/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TranslateService } from '@ngstack/translate';

export function getPreparation2dVariablesGridColumns(
  translate: TranslateService,
  isSupervised: boolean,
) {
  return [
    {
      headerName: translate.get('GLOBAL.RANK'),
      field: 'rank',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.RANK'),
    },
    {
      headerName: translate.get('GLOBAL.NAME_1'),
      field: 'name1',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.NAME1'),
    },
    {
      headerName: translate.get('GLOBAL.NAME_2'),
      field: 'name2',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.NAME2'),
    },
    {
      headerName: translate.get('GLOBAL.DELTA_LEVEL'),
      field: 'deltaLevel',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.DELTALEVEL'),
      show: isSupervised,
    },
    {
      headerName: translate.get('GLOBAL.LEVEL'),
      field: 'level',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.LEVEL'),
    },
    {
      headerName: translate.get('GLOBAL.LEVEL_1'),
      field: 'level1',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.LEVEL1'),
      show: isSupervised,
    },
    {
      headerName: translate.get('GLOBAL.LEVEL_2'),
      field: 'level2',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.LEVEL2'),
      show: isSupervised,
    },
    {
      headerName: translate.get('GLOBAL.VARIABLES'),
      field: 'variables',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.VARIABLES'),
    },
    {
      headerName: translate.get('GLOBAL.PARTS_1'),
      field: 'parts1',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.PARTS1'),
    },
    {
      headerName: translate.get('GLOBAL.PARTS_2'),
      field: 'parts2',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.PARTS2'),
    },
    {
      headerName: translate.get('GLOBAL.CELLS'),
      field: 'cells',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.CELLS'),
    },
  ];
}
