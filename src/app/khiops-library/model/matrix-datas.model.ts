import { CellModel } from '@khiops-library/model/cell.model';
import { MatrixVariableI } from '../interfaces/matrix-variable';

export class MatrixDatasModel {
  matrixCellDatas: CellModel[];
  variable: MatrixVariableI;
  propagateChanges?: boolean;
}