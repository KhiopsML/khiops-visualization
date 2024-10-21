import { Injectable } from '@angular/core';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ProjectSummaryModel } from '@khiops-library/model/project-summary.model';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectDatasService {
  constructor(private appService: AppService) {}

  getProjectSummaryDatas(): InfosDatasI[] {
    const appDatas = this.appService.getDatas().datas;
    if (appDatas.coclusteringReport) {
      const projectSummaryDatas = new ProjectSummaryModel(
        appDatas,
        'coclusteringReport',
      );
      return projectSummaryDatas.displayDatas;
    } else {
      return undefined;
    }
  }
}
