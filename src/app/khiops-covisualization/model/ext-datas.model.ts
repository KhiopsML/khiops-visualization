export class ExtDatasModel {
  filename: string;
  dimension: string;
  joinKey: string;
  separator: string;
  field: {
    name: string;
    type: string;
    import: boolean;
  };
  file?: File;
  path?: string;

  constructor(filename, dimension, joinKey, separator, field, file?, path?) {
    this.filename = filename;
    this.dimension = dimension;
    this.joinKey = joinKey;
    this.separator = separator;
    this.field = field;
    this.file = file;
    this.path = path || '';
  }
}
