import { VARIABLE_TYPES } from '@khiops-library/enum/variable-types';

export class Preparation2dVariableModel {
  _id: string;

  noCorrelation: boolean;

  name: string;
  name1: string;
  name2: string;
  nameX: string;
  nameY: string;
  variableType: string;
  rank: string;

  values: number;
  cells: number;
  dataCost: number;
  parts: number;
  parts1: number;
  parts2: number;
  level: number;
  level1: number;
  level2: number;
  preparationCost: number;
  constructionCost: number;
  variables: number;

  constructor(object) {
    // Assign values from input
    Object.assign(this, object);

    this.variableType = VARIABLE_TYPES.PREPARATION_2D;

    if (!this.noCorrelation) {
      if ((object.level1 === 0 || object.level2 === 0) && !object.level) {
        this.noCorrelation = true;
      } else {
        this.noCorrelation = false;
      }
    }

    if (this.name1 && this.name2) {
      this.nameX = this.name1;
      this.nameY = this.name2;
      this.name = this.name1 + '`' + this.name2;
    }

    // Generate id for grid
    this._id = object.name;
  }
}