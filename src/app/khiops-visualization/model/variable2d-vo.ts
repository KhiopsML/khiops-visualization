export class Variable2dVO {
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
    this._id = object.name1 + '`' + object.name2;

    this.rank = object.rank || undefined;
    this.name1 = object.name1 || undefined;
    this.name2 = object.name2 || undefined;
    this.deltaLevel =
      object.deltaLevel !== undefined ? object.deltaLevel : undefined;
    this.level = object.level !== undefined ? object.level : undefined;
    this.level1 = object.level1 !== undefined ? object.level1 : undefined;
    this.level2 = object.level2 !== undefined ? object.level2 : undefined;
    this.variables =
      object.variables !== undefined ? object.variables : undefined;
    this.cells = object.cells || undefined;
    this.parts1 = object.parts1 || undefined;
    this.parts2 = object.parts2 || undefined;
  }
}
