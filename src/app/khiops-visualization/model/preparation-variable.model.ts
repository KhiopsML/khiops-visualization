import { TYPES } from '@khiops-library/enum/types';
import { VARIABLE_TYPES } from '@khiops-library/enum/variable-types';

export class PreparationVariableModel {
  _id: string;
  mode: string;
  name: string;
  name1: string;
  name2: string;
  nameX: string;
  nameY: string;

  rank: string;
  variableType: string;
  type: string;
  preparedName: string;
  derivationRule: string;

  isCategorical: boolean;
  isNumerical: boolean;

  weight: number;
  values: number;
  parts: number;
  modeFrequency: number;
  constructionCost: number;
  preparationCost: number;
  dataCost: number;
  level: number;

  is2dVariable = false;

  constructor(object, id) {
    // Assign values from input
    Object.assign(this, object);

    // Generate id for grid
    this._id = id;

    this.isNumerical = this.type === TYPES.NUMERICAL;
    this.isCategorical = this.type === TYPES.CATEGORICAL;

    this.variableType = VARIABLE_TYPES.PREPARATION;
    if (object.name1 && object.name2) {
      this.is2dVariable = true;
      this.variableType = VARIABLE_TYPES.PREPARATION_2D;
    }

    // for regression matrix
    if (this.name1) {
      this.nameX = this.name1;
    }
    if (this.name2) {
      this.nameY = this.name2;
    }
    if (!this.name && this.name1 && this.name2) {
      this.name = this.name1 + '`' + this.name2;
    }
  }
}
