/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { CooccurrenceCellModel } from './cooccurrence-cell.model';
import { AppService } from '@khiops-visualization/providers/app.service';

export class CooccurrenceCellsModel {
  title: string;
  values!: CooccurrenceCellModel[];

  // cooccurrenceCell has dynamic fields
  displayedColumns: GridColumnsI[] = [];

  constructor(nameX: string, nameY: string) {
    this.title =
      AppService.translate.get('GLOBAL.CELLS_OF') + ' ' + nameX + ' x ' + nameY;

    this.displayedColumns.push({
      headerName: AppService.translate.get('GLOBAL.CELL_ID'),
      field: 'id',
      tooltip: AppService.translate.get('TOOLTIPS.PREPARATION_2D.CELLS.ID'),
    });
    this.displayedColumns.push({
      headerName: nameX,
      field: nameX,
      tooltip: AppService.translate.get('TOOLTIPS.PREPARATION_2D.CELLS.NAMEX'),
    });
    this.displayedColumns.push({
      headerName: nameY,
      field: nameY,
      tooltip: AppService.translate.get('TOOLTIPS.PREPARATION_2D.CELLS.NAMEY'),
    });
    this.displayedColumns.push({
      headerName: AppService.translate.get('GLOBAL.FREQUENCY'),
      field: 'frequency',
      tooltip: AppService.translate.get(
        'TOOLTIPS.PREPARATION_2D.CELLS.FREQUENCY',
      ),
    });
    this.displayedColumns.push({
      headerName: AppService.translate.get('GLOBAL.COVERAGE'),
      field: 'coverage',
      tooltip: AppService.translate.get(
        'TOOLTIPS.PREPARATION_2D.CELLS.COVERAGE',
      ),
    });
  }
}
