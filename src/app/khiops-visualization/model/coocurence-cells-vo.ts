import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { CoocurenceCellVO } from './coocurence-cell-vo';

export class CoocurenceCellsVO {
  title: string;
  values: CoocurenceCellVO[];

  // coocurenceCell has dynamic fields
  displayedColumns: GridColumnsI[] = [];

  constructor(translate, nameX, nameY) {
    this.title =
      translate.instant('GLOBAL.CELLS_OF') + ' ' + nameX + ' x ' + nameY;

    this.displayedColumns.push({
      headerName: translate.instant('GLOBAL.CELL_ID'),
      field: 'id',
      tooltip: translate.instant('TOOLTIPS.PREPARATION_2D.CELLS.ID'),
    });
    this.displayedColumns.push({
      headerName: nameX,
      field: nameX,
      tooltip: translate.instant('TOOLTIPS.PREPARATION_2D.CELLS.NAMEX'),
    });
    this.displayedColumns.push({
      headerName: nameY,
      field: nameY,
      tooltip: translate.instant('TOOLTIPS.PREPARATION_2D.CELLS.NAMEY'),
    });
    this.displayedColumns.push({
      headerName: translate.instant('GLOBAL.FREQUENCY'),
      field: 'frequency',
      tooltip: translate.instant('TOOLTIPS.PREPARATION_2D.CELLS.FREQUENCY'),
    });
    this.displayedColumns.push({
      headerName: translate.instant('GLOBAL.COVERAGE'),
      field: 'coverage',
      tooltip: translate.instant('TOOLTIPS.PREPARATION_2D.CELLS.COVERAGE'),
    });
  }
}
