import { MatrixModeI } from '../interfaces/matrix-mode';

export class MatrixModesI {
  types: MatrixModeI[] = [];
  selected: MatrixModeI | undefined = undefined;
  selectedIndex: number | undefined = undefined;
}