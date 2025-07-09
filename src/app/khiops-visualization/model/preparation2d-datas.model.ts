/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { CellModel } from '@khiops-library/model/cell.model';
import { Preparation2dVariableModel } from './preparation2d-variable.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { MatrixDatasModel } from '@khiops-library/model/matrix-datas.model';

export class Preparation2dDatasModel {
  isAxisInverted = false;
  selectedVariable?: Preparation2dVariableModel = undefined;
  selectedCellIndex: number = 0;
  selectedCell!: CellModel;
  matrixDatas!: MatrixDatasModel | undefined;
  isTargetAvailable = false;
  currentCellDatas!: {
    values: any[][]; // Dynamic values according to the input datas
    displayedColumns: GridColumnsI[][];
  };
  isSupervised = false;
}
