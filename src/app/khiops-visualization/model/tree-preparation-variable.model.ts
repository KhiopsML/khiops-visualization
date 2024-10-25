import { TYPES } from '@khiops-library/enum/types';
import { VARIABLE_TYPES } from '@khiops-library/enum/variable-types';
import { VariableStatistic } from '@khiops-visualization/interfaces/tree-preparation-report';

export class TreePreparationVariableModel implements VariableStatistic {
  _id: string;
  mode: string;
  name: string;
  rank: string;
  variableType: string;
  type: string;
  derivationRule: string;
  values: number;
  parts: number;
  modeFrequency: number;
  constructionCost: number;
  preparationCost: number;
  dataCost: number;
  level: number;

  isCategorical: boolean;
  isNumerical: boolean;

  constructor(object: any, id: any) {
    // Assign values from input
    Object.assign(this, object);

    // Generate id for grid
    this._id = id;

    this.variableType = VARIABLE_TYPES.PREPARATION_TREE;

    this.isNumerical = this.type === TYPES.NUMERICAL;
    this.isCategorical = this.type === TYPES.CATEGORICAL;
  }
}
