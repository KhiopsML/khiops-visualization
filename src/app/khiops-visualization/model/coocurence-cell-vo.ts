export class CoocurenceCellVO {
  id: string;
  _id: string;
  frequency: number;
  coverage: number;

  constructor(index) {
    this.id = index;
    this._id = index;
    this.frequency = undefined;
    this.coverage = undefined;
  }
}
