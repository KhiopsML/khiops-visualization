import {
  DimensionVisualization,
  VariableDetail,
} from '@khiops-visualization/interfaces/app-datas';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppConfig } from 'src/environments/environment';

export class VariableDetailsModel {
  dataGrid!: {
    dimensions: DimensionVisualization[];
    partTargetFrequencies: number[][]; // regression or explanatory case
    partInterests: number[]; // regression or explanatory case
    cellTargetFrequencies: number[][]; // bivariate case
    cellInterests: number[]; // bivariate case
    cellIds: string[]; // normal 2d case
    cellPartIndexes: number[][]; // normal 2d case
    cellFrequencies: number[][]; // normal 2d case
    frequencies: number[]; // normal case
  };
  inputValues!: {
    // regression or explanatory case
    values: string[];
    frequencies: string[];
  };
  isLimitedDatas = true;

  constructor(object: VariableDetail) {
    this.isLimitedDatas = false;
    if (object) {
      const clone: VariableDetail = _.cloneDeep(object);

      // @ts-ignore
      this.dataGrid = clone?.dataGrid || undefined;

      // @ts-ignore
      this.inputValues = clone?.inputValues || undefined;

      // Limit datas to 10000
      const maxDatasSize = AppConfig.visualizationCommon.GLOBAL.MAX_TABLE_SIZE;
      if (
        maxDatasSize &&
        this.inputValues &&
        this.inputValues.values.length > maxDatasSize
      ) {
        this.inputValues.values.length = maxDatasSize;
        this.isLimitedDatas = true;
      }
    }
  }

  setCellFrequencies(cellFrequencies: number[][]) {
    this.dataGrid.cellFrequencies = cellFrequencies;
  }

  setTargetCellFrequencies(cellTargetFrequencies: number[][]) {
    this.dataGrid.cellTargetFrequencies = cellTargetFrequencies;
  }
}
