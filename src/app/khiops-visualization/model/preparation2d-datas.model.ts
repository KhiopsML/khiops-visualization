/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { CellModel } from '@khiops-library/model/cell.model';
import { Preparation2dVariableModel } from './preparation2d-variable.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { MatrixDatasModel } from '@khiops-library/model/matrix-datas.model';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas';

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

  appDatas?: VisualizationDatas = undefined;
  isSupervised = false;

  constructor(appDatas: VisualizationDatas) {
    this.appDatas = appDatas;
    this.isSupervised = this.isSupervisedVariable();
  }

  /**
   * Check if current datas are valid
   */
  isValid(): boolean {
    return this.appDatas?.bivariatePreparationReport
      ?.variablesPairsStatistics?.[0]
      ? true
      : false;
  }

  isSupervisedVariable(): boolean {
    return (
      this.appDatas?.bivariatePreparationReport
        ?.variablesPairsDetailedStatistics?.[
        Object.keys(
          this.appDatas?.bivariatePreparationReport
            ?.variablesPairsDetailedStatistics,
        )?.[0]!
      ]?.dataGrid?.isSupervised || false
    );
  }
}
