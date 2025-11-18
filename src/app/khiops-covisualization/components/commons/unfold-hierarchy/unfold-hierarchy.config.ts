/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { CheckboxCellComponent } from '@khiops-library/components/ag-grid/checkbox-cell/checkbox-cell.component';
import { TranslateService } from '@ngstack/translate';
import cloneDeep from 'lodash-es/cloneDeep';
import type { ChartOptions } from 'chart.js';

export function getHierarchyGridColumns(translate: TranslateService) {
  return [
    {
      headerName: translate.get('GLOBAL.DIMENSION'),
      field: 'name',
    },
    {
      headerName: translate.get('GLOBAL.NB_OF_CLUSTER'),
      field: 'currentHierarchyClusterCount',
    },
    {
      headerName: translate.get('GLOBAL.MAX_NB_OF_CLUSTER'),
      field: 'initialParts',
    },
    {
      headerName: translate.get('GLOBAL.FOLD_UNFOLD'),
      field: 'hierarchyFold',
      cellRenderer: CheckboxCellComponent,
    },
  ];
}

export function getClusterPerDimChartOptions(
  translate: TranslateService,
  baseOptions: ChartOptions<'line'>,
): ChartOptions<'line'> {
  const options = cloneDeep(baseOptions);
  options.scales!.x!.title!.text = translate.get(
    'GLOBAL.TOTAL_NUMBER_OF_CLUSTERS',
  );
  options.scales!.y!.title!.text = translate.get(
    'GLOBAL.NB_OF_CLUSTERS_PER_DIM',
  );
  return options;
}

export function getInfoPerClusterChartOptions(
  translate: TranslateService,
  baseOptions: ChartOptions<'line'>,
): ChartOptions<'line'> {
  const options = cloneDeep(baseOptions);
  options.scales!.x!.title!.text = translate.get(
    'GLOBAL.TOTAL_NUMBER_OF_CLUSTERS',
  );
  options.scales!.y!.title!.text = translate.get('GLOBAL.INFORMATION_RATE');
  return options;
}

export function getDefaultChartOptions() {
  return {
    elements: {
      point: {
        radius: 0,
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '',
        },
        gridLines: {
          color: '#eeeeee',
        },
      },
      x: {
        title: {
          display: true,
          text: '',
        },
      },
    },
  };
}
