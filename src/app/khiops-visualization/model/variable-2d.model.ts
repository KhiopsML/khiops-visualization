export class Variable2dModel {
  _id: string;
  rank: string;
  name1: string;
  name2: string;
  deltaLevel: number;
  level: number;
  level1: number;
  level2: number;
  variables: number;
  cells: number;
  parts1: number;
  parts2: number;

  constructor(object: any) {
    // Assign values from input
    Object.assign(this, object);

    this._id = object.name1 + '`' + object.name2;
  }
}
