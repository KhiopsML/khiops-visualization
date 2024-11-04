export class CoocurenceCellModel {
  id: string;
  _id: string;
  frequency: number | undefined;
  coverage: number | undefined;

  [key: string]: any;

  constructor(index: number) {
    this.id = index.toString();
    this._id = index.toString();
    this.frequency = undefined;
    this.coverage = undefined;
  }
}
