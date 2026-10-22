/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { BorderTextCellComponent } from '@khiops-library/components/ag-grid/border-text-cell/border-text-cell.component';
import { LevelCellComponent } from '@khiops-library/components/ag-grid/level-cell/level-cell.component';
import { IconCellComponent } from '@khiops-library/components/ag-grid/icon-cell/icon-cell.component';
import { ICellRendererParams } from '@ag-grid-community/core';
import { TranslateService } from '@ngstack/translate';

export function getTreePreparationVariablesGridColumns(
  translate: TranslateService,
  onAnalyzeTree: (params: ICellRendererParams) => void,
) {
  return [
    {
      headerName: 'Tree analysis',
      field: 'treeAnalysis',
      tooltip: 'Tree analysis',
      cellRenderer: IconCellComponent,
      cellRendererParams: {
        icon: 'square-plus',
        action: onAnalyzeTree,
      },
    },
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
      cellRenderer: LevelCellComponent,
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
      cellRenderer: BorderTextCellComponent,
    },
    {
      headerName: translate.get('GLOBAL.MODE'),
      field: 'mode',
      show: false,
      tooltip: translate.get('TOOLTIPS.PREPARATION.VARIABLES.MODE'),
    },
  ];
}
