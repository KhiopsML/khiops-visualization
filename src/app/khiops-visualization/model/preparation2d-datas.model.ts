import { CellModel } from '@khiops-library/model/cell.model';
import { Preparation2dVariableModel } from './preparation2d-variable.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';

export class Preparation2dDatasModel {
  isAxisInverted = false;
  selectedVariable?: Preparation2dVariableModel = undefined;
  selectedCellIndex: number = 0;
  selectedCell: CellModel = undefined;
  matrixDatas:
    | {
        variable: {
          nameX: string | undefined;
          nameY: string | undefined;
          xParts: number;
          yParts: number;
        };
        matrixCellDatas: any[];
      }
    | undefined;
  isTargetAvailable = false;
  currentCellDatas: {
    values: any[][]; // Dynamic values according to the input datas
    displayedColumns: GridColumnsI[][];
  };

  appDatas: any = undefined;
  isSupervised = false;

  constructor(appDatas) {
    this.appDatas = appDatas;
    this.isSupervised = this.isSupervisedVariable();
  }

  /**
   * Check if current datas are valid
   */
  isValid(): boolean {
    return this.appDatas?.bivariatePreparationReport
      ?.variablesPairsStatistics?.[0];
  }

  isSupervisedVariable(): boolean {
    return this.appDatas?.bivariatePreparationReport
      ?.variablesPairsDetailedStatistics?.[
      Object.keys(
        this.appDatas?.bivariatePreparationReport
          ?.variablesPairsDetailedStatistics,
      )?.[0]
    ]?.dataGrid?.isSupervised;
  }
}
