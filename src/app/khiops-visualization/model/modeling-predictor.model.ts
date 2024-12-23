export class ModelingPredictorModel {
  rank: string;
  type: string;
  family: string;
  name: string;
  variables: number;

  constructor(object: any) {
    this.rank = object?.rank || '';
    this.type = object?.type || '';
    this.family = object?.family || '';
    this.name = object?.name || '';
    this.variables = object?.variables || undefined;
  }
}
