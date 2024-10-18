import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { CoocurenceCellModel } from './coocurence-cell-vo';

export class CoocurenceCellsVO {
  title: string;
  values: CoocurenceCellModel[];

  // coocurenceCell has dynamic fields
  displayedColumns: GridColumnsI[] = [];

  constructor(translate, nameX, nameY) {
    this.title =
      translate.get('GLOBAL.CELLS_OF') + ' ' + nameX + ' x ' + nameY;

    this.displayedColumns.push({
      headerName: translate.get('GLOBAL.CELL_ID'),
      field: 'id',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.CELLS.ID'),
    });
    this.displayedColumns.push({
      headerName: nameX,
      field: nameX,
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.CELLS.NAMEX'),
    });
    this.displayedColumns.push({
      headerName: nameY,
      field: nameY,
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.CELLS.NAMEY'),
    });
    this.displayedColumns.push({
      headerName: translate.get('GLOBAL.FREQUENCY'),
      field: 'frequency',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.CELLS.FREQUENCY'),
    });
    this.displayedColumns.push({
      headerName: translate.get('GLOBAL.COVERAGE'),
      field: 'coverage',
      tooltip: translate.get('TOOLTIPS.PREPARATION_2D.CELLS.COVERAGE'),
    });
  }
}
