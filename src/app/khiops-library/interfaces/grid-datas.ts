import { GridColumnsI } from './grid-columns';

export interface GridDatasI {
  title?: string;
  values: any[] | undefined;
  displayedColumns: GridColumnsI[];
}
