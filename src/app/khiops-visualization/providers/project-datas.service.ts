/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ProjectLogModel } from '@khiops-library/model/project-log.model';
import { ProjectSummaryModel } from '@khiops-library/model/project-summary.model';
import { AppService } from './app.service';
import { REPORT } from '@khiops-library/enum/report';

@Injectable({
  providedIn: 'root',
})
export class ProjectDatasService {
  constructor(private appService: AppService) {}

  /**
   * Retrieves project summary data.
   * @returns {InfosDatasI[]} An array of project summary data or undefined if no preparation report is available.
   */
  getProjectSummaryDatas(): InfosDatasI[] | undefined {
    if (this.appService.appDatas?.preparationReport) {
      const projectSummaryDatas = new ProjectSummaryModel(
        this.appService.appDatas,
        REPORT.PREPARATION_REPORT,
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
  getProjectLogsDatas(): ProjectLogModel[] | undefined {
    let logs;
    if (this.appService.appDatas?.logs) {
      logs = [];
      for (let i = 0; i < this.appService.appDatas.logs.length; i++) {
        const currentLog = this.appService.appDatas.logs[i];
        if (currentLog) {
          for (let j = 0; j < currentLog.messages.length; j++) {
            const message = currentLog.messages[j];
            if (message) {
              const log = new ProjectLogModel(currentLog, message);
              logs.push(log);
            }
          }
        }
      }
    }

    return logs;
  }
}
