import { DimensionVisualization } from '@khiops-visualization/interfaces/app-datas';
import * as _ from 'lodash'; // Important to import lodash in karma

export class VariableDetailsModel {
  dataGrid!: {
    dimensions: DimensionVisualization[];
    partTargetFrequencies: []; // regression or explanatory case
    partInterests: []; // regression or explanatory case
    cellTargetFrequencies: []; // bivariate case
    cellInterests: []; // bivariate case
    cellIds: []; // normal 2d case
    cellPartIndexes: []; // normal 2d case
    cellFrequencies: []; // normal 2d case
    frequencies: []; // normal case
  };
  inputValues!: {
    // regression or explanatory case
    values: string[];
    frequencies: string[];
  };
  isLimitedDatas = true;

  constructor(object: any, maxDatasSize: number) {
    this.isLimitedDatas = false;
    if (object) {
      const clone = _.cloneDeep(object);
      this.dataGrid = clone?.dataGrid || undefined;
      this.inputValues = clone?.inputValues || undefined;

      // Limit datas to 10000
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

  setCellFrequencies(cellFrequencies) {
    this.dataGrid.cellFrequencies = cellFrequencies;
  }

  setTargetCellFrequencies(cellTargetFrequencies) {
    this.dataGrid.cellTargetFrequencies = cellTargetFrequencies;
  }
}
