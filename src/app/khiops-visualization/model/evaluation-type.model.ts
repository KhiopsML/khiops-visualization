export class EvaluationTypeModel {
  _id?: string;
  type?: string;
  dictionary?: string;
  instances?: number;

  constructor() {
    this._id = undefined;
    this.type = undefined;
    this.dictionary = undefined;
    this.instances = undefined;
  }
}
