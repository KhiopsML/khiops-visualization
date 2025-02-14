/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { BorderTextCellComponent } from '@khiops-library/components/ag-grid/border-text-cell/border-text-cell.component';
import { TranslateService } from '@ngstack/translate';

export function getTreePreparationVariablesGridColumns(
  translate: TranslateService,
) {
  return [
    {
      headerName: translate.get('GLOBAL.RANK'),
      field: 'rank',
      tooltip: translate.get('TOOLTIPS.PREPARATION.VARIABLES.RANK'),
    },
    {
      headerName: translate.get('GLOBAL.NAME'),
      field: 'name',
      tooltip: translate.get('TOOLTIPS.PREPARATION.VARIABLES.NAME'),
    },
    {
      headerName: translate.get('GLOBAL.LEVEL'),
      field: 'level',
      tooltip: translate.get('TOOLTIPS.PREPARATION.VARIABLES.LEVEL'),
    },
    {
      headerName: translate.get('GLOBAL.PARTS'),
      field: 'parts',
      tooltip: translate.get('TOOLTIPS.PREPARATION.VARIABLES.PARTS'),
    },
    {
      headerName: translate.get('GLOBAL.VALUES'),
      field: 'values',
      tooltip: translate.get('TOOLTIPS.PREPARATION.VARIABLES.VALUES'),
    },
    {
      headerName: translate.get('GLOBAL.TYPE'),
      field: 'type',
      tooltip: translate.get('TOOLTIPS.PREPARATION.VARIABLES.TYPE'),
      cellRendererFramework: BorderTextCellComponent,
    },
    {
      headerName: translate.get('GLOBAL.MODE'),
      field: 'mode',
      show: false,
      tooltip: translate.get('TOOLTIPS.PREPARATION.VARIABLES.MODE'),
    },
  ];
}
