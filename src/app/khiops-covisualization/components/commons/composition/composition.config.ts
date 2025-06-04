/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TranslateService } from '@ngstack/translate';
import { GridColumnsI } from '../../../../khiops-library/interfaces/grid-columns';
import { IconCellComponent } from '../../../../khiops-library/components/ag-grid/icon-cell/icon-cell.component';
import { ICellRendererParams } from '@ag-grid-community/core';

export function getCompositionDisplayedColumns(
  translate: TranslateService,
  isVarPart?: boolean,
  showDetailedPartsCallback?: (data: any) => void,
): GridColumnsI[] {
  if (!isVarPart) {
    // Common case
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
  } else {
    // Individuals * variables case
    return [
      {
        headerName: translate.get('GLOBAL.CLUSTER'),
        field: 'cluster',
        tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.CLUSTER'),
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
        show: false,
        tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.TYPICALITY'),
      },
      {
        headerName: translate.get('GLOBAL.INNER_VARIABLE'),
        field: 'innerVariable',
        tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.INNER_VARIABLE'),
      },
      {
        headerName: translate.get('GLOBAL.PART'),
        field: 'part',
        tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.PART'),
      },
      {
        headerName: translate.get('GLOBAL.PART_DETAILS'),
        field: 'remove',
        cellRendererFramework: IconCellComponent,
        cellRendererParams: {
          icon: 'add_box',
          action: (e: ICellRendererParams) => {
            if (showDetailedPartsCallback) {
              showDetailedPartsCallback(e);
            }
          },
        },
      },
      {
        headerName: translate.get('GLOBAL.FREQUENCY'),
        field: 'frequency',
        tooltip: translate.get('TOOLTIPS.AXIS.COMPOSITION.FREQUENCY'),
      },
      {
        headerName: 'type',
        field: 'type',
      },
      {
        headerName: 'detailedParts',
        field: 'detailedParts',
      },
    ];
  }
}
