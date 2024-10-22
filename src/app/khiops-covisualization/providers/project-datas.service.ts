import { Injectable } from '@angular/core';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ProjectSummaryModel } from '@khiops-library/model/project-summary.model';
import { AppService } from './app.service';
import { REPORTS } from '@khiops-library/enum/reports';

@Injectable({
  providedIn: 'root',
})
export class ProjectDatasService {
  constructor(private appService: AppService) {}

  /**
   * Retrieves project summary data from the application service.
   * If the coclustering report is available, it creates a new ProjectSummaryModel
   * and returns its display data. Otherwise, it returns undefined.
   *
   * @returns {InfosDatasI[] | undefined} The project summary data or undefined if not available.
   */
  getProjectSummaryDatas(): InfosDatasI[] {
    const appDatas = this.appService.getDatas().datas;
    if (appDatas.coclusteringReport) {
      const projectSummaryDatas = new ProjectSummaryModel(
        appDatas,
        REPORTS.COCLUSTERING_REPORT,
      );
      return projectSummaryDatas.displayDatas;
    } else {
      return undefined;
    }
  }
}
