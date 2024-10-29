export class FileModel {
  file: File | undefined;
  filename: string;
  datas: any;

  constructor(datas: any, filename: string, file?: File) {
    this.filename = filename || '';
    this.datas = datas || undefined;
    this.file = file;
  }
}
