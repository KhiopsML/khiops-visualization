export class EvaluationTypeVO {
  _id: string;
  type: string;
  dictionary: string;
  instances: string;

  constructor() {
    this._id = undefined;
    this.type = undefined;
    this.dictionary = undefined;
    this.instances = undefined;
  }
}
