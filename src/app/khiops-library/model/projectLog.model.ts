export class ProjectLogModel {
  task: string;
  message: string;

  constructor(log, message) {
    this.task = log.taskName;
    this.message = message;
  }
}
