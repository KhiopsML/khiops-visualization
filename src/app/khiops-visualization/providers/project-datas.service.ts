import { Injectable } from '@angular/core';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ProjectLogModel } from '@khiops-library/model/project-log.model';
import { ProjectSummaryModel } from '@khiops-library/model/project-summary.model';
import { AppService } from './app.service';
import { REPORTS } from '@khiops-library/enum/reports';

@Injectable({
  providedIn: 'root',
})
export class ProjectDatasService {
  constructor(private appService: AppService) {}

  /**
   * Retrieves project summary data.
   * @returns {InfosDatasI[]} An array of project summary data or undefined if no preparation report is available.
   */
  getProjectSummaryDatas(): InfosDatasI[] {
    const appDatas = this.appService.getDatas().datas;
    if (appDatas.preparationReport) {
      const projectSummaryDatas = new ProjectSummaryModel(
        appDatas,
        REPORTS.PREPARATION_REPORT,
      );
      return projectSummaryDatas.displayDatas;
    } else {
      return undefined;
    }
  }

  /**
   * Retrieves project logs data.
   * @returns {ProjectLogModel[]} An array of project log models.
   */
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
