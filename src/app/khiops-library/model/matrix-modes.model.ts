import { MatrixModeI } from '../interfaces/matrix-mode';

export class MatrixModesModel {
  types: MatrixModeI[] = [];
  selected: MatrixModeI | undefined = undefined;
  selectedIndex: number | undefined = undefined;
}
