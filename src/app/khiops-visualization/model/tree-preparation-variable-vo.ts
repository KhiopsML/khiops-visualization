import { TYPES } from '@khiops-library/enum/types';

export class TreePreparationVariableVO {
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
    // Generate id for grid
    this._id = id;

    this.variableType = 'preparation-tree';

    this.mode = object.mode || undefined;
    this.name = object.name || undefined;
    this.rank = object.rank || undefined;
    this.type = object.type || undefined;

    this.isNumerical = this.type === TYPES.NUMERICAL;
    this.isCategorical = this.type === TYPES.CATEGORICAL;

    this.derivationRule = object.derivationRule || undefined;
    this.values = object.values || undefined;
    this.parts = object.parts || undefined;
    this.modeFrequency = object.modeFrequency || undefined;
    this.constructionCost = object.constructionCost || undefined;
    this.preparationCost = object.preparationCost || undefined;
    this.dataCost = object.dataCost || undefined;
    this.level = object.level || undefined;
  }
}
