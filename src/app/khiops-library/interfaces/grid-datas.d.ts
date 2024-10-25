import { DynamicI } from './globals';
import { GridColumnsI } from './grid-columns';

export interface GridDatasI {
  title?: string;
  values: DynamicI | undefined;
  displayedColumns: GridColumnsI[] | undefined;
}
