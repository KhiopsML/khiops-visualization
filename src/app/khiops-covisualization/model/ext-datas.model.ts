import { ExtDatasFieldI } from '@khiops-covisualization/interfaces/ext-datas-field';

export class ExtDatasModel {
  filename: string;
  dimension: string;
  joinKey: string;
  separator: string;
  field: ExtDatasFieldI;
  file?: File;
  path?: string;

  constructor(
    filename: string,
    dimension: string,
    joinKey: string,
    separator: string,
    field: ExtDatasFieldI,
    file?: File,
    path?: string,
  ) {
    this.filename = filename;
    this.dimension = dimension;
    this.joinKey = joinKey;
    this.separator = separator;
    this.field = field;
    this.file = file;
    this.path = path || '';
  }
}
