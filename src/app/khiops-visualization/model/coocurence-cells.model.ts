import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { CoocurenceCellModel } from './coocurence-cell.model';
import { AppService } from '@khiops-visualization/providers/app.service';

export class CoocurenceCellsModel {
  title: string;
  values!: CoocurenceCellModel[];

  // coocurenceCell has dynamic fields
  displayedColumns: GridColumnsI[] = [];

  constructor(nameX, nameY) {
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
