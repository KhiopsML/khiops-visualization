import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { PreparationVariableModel } from './preparation-variable.model';

export class PreparationDatasModel {
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
