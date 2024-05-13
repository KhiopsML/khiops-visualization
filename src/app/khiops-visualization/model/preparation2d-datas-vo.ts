import { CellVO } from '@khiops-library/model/cell-vo';
import { Preparation2dVariableVO } from './preparation2d-variable-vo';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';

export class Preparation2dDatasVO {
  isAxisInverted = false;
  selectedVariable?: Preparation2dVariableVO = undefined;
  selectedCellIndex: number = 0;
  selectedCell: CellVO = undefined;
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
      ?.variablesPairsStatistics[0];
  }

  isSupervisedVariable(): boolean {
    const firstVar = Object.keys(
      this.appDatas?.bivariatePreparationReport
        ?.variablesPairsDetailedStatistics,
    )?.[0];

    return this.appDatas.bivariatePreparationReport
      ?.variablesPairsDetailedStatistics?.[firstVar]?.dataGrid?.isSupervised;
  }
}
