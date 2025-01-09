/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { PreparationVariableModel } from './preparation-variable.model';

export class PreparationDatasModel {
  [key: string]: any;

  preparationReport:
    | {
        selectedVariable?: PreparationVariableModel;
        currentIntervalDatas: GridDatasI;
      }
    | undefined = {
    selectedVariable: undefined,
    currentIntervalDatas: {
      title: undefined,
      values: undefined,
      displayedColumns: [],
    },
  };
  textPreparationReport:
    | {
        selectedVariable?: PreparationVariableModel;
        currentIntervalDatas: GridDatasI;
      }
    | undefined = {
    selectedVariable: undefined,
    currentIntervalDatas: {
      title: undefined,
      values: undefined,
      displayedColumns: [],
    },
  };
  treePreparationReport: any;
}
