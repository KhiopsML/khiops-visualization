import { Log } from '@khiops-visualization/interfaces/app-datas';

export class ProjectLogModel {
  task: string;
  message: string;

  constructor(log: Log, message: string) {
    this.task = log.taskName;
    this.message = message;
  }
}
