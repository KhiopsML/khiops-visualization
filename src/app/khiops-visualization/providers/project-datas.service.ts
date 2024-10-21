import { Injectable } from '@angular/core';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ProjectLogModel } from '@khiops-library/model/project-log.model';
import { ProjectSummaryModel } from '@khiops-library/model/project-summary.model';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectDatasService {
  constructor(private appService: AppService) {}

  getProjectSummaryDatas(): InfosDatasI[] {
    const appDatas = this.appService.getDatas();
    if (appDatas.preparationReport) {
      const projectSummaryDatas = new ProjectSummaryModel(
        appDatas,
        'preparationReport',
      );
      return projectSummaryDatas.displayDatas;
    } else {
      return undefined;
    }
  }

  getProjectLogsDatas(): ProjectLogModel[] {
    const appDatas = this.appService.getDatas().datas;
    let logs;

    if (appDatas.logs) {
      logs = [];
      for (let i = 0; i < appDatas.logs.length; i++) {
        for (let j = 0; j < appDatas.logs[i].messages.length; j++) {
          const log = new ProjectLogModel(
            appDatas.logs[i],
            appDatas.logs[i].messages[j],
          );
          logs.push(log);
        }
      }
    }

    return logs;
  }
}
