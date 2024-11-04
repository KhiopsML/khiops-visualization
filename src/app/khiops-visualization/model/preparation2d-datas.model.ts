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
  matrixDatas!: MatrixDatasModel;
  isTargetAvailable = false;
  currentCellDatas!: {
    values: any[][]; // Dynamic values according to the input datas
    displayedColumns: GridColumnsI[][];
  };

  appDatas: VisualizationDatas = undefined;
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
    return this.appDatas?.bivariatePreparationReport
      ?.variablesPairsDetailedStatistics?.[
      Object.keys(
        this.appDatas?.bivariatePreparationReport
          ?.variablesPairsDetailedStatistics,
      )?.[0]!
    ]?.dataGrid?.isSupervised;
  }
}
