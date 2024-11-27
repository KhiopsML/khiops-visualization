export class ConfigModel {
  showProjectTab?: boolean;
  appSource!: string;
  trackerId?: string;
  changeDetector: boolean = false;
  onFileOpen!: Function;
  onCopyData!: Function;
  onCopyImage!: Function;
  onThemeChanged!: Function;
  onSendEvent!: Function;
  readLocalFile?: Function;
}
