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
    this.variableType = 'preparation-2d';

    this.noCorrelation = object.noCorrelation || undefined;

    this.name = object.name || undefined;
    this.name1 = object.name1 || undefined;
    this.name2 = object.name2 || undefined;
    this.nameX = object.nameX || undefined;
    this.nameY = object.nameY || undefined;
    this.rank = object.rank || undefined;

    this.parts = object.parts || undefined;
    this.values = object.values || undefined;
    this.cells = object.cells || undefined;
    this.dataCost = object.dataCost || undefined;
    this.parts1 = object.parts1 || undefined;
    this.parts2 = object.parts2 || undefined;
    this.level = object.level !== undefined ? object.level : undefined;
    this.level1 = object.level1 !== undefined ? object.level1 : undefined;
    this.level2 = object.level2 !== undefined ? object.level2 : undefined;
    this.preparationCost = object.preparationCost || undefined;
    this.constructionCost = object.constructionCost || undefined;
    this.variables = object.variables || undefined;

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
