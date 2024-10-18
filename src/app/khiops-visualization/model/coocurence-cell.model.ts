export class CoocurenceCellModel {
  id: string;
  _id: string;
  frequency: number | undefined;
  coverage: number | undefined;

  constructor(index) {
    this.id = index;
    this._id = index;
    this.frequency = undefined;
    this.coverage = undefined;
  }
}
