import { Injectable } from '@angular/core';
import { AppConfig } from 'src/environments/environment';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { ProjectLogModel } from '@khiops-library/model/project-log.model';
import { REPORTS } from '@khiops-library/enum/reports';
import { ProjectSummaryModel } from '@khiops-library/model/project-summary.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';
import { EnrichDatasService } from './enrich-datas.service';
import { LayoutService } from '../../khiops-library/providers/layout.service';
import { VIEW_LAYOUT } from '@khiops-visualization/config/view-layout';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  static Ls: Ls;
  appDatas: any;

  constructor(
    private layoutService: LayoutService,
    private khiopsLibraryService: KhiopsLibraryService,
    private Ls: Ls,
  ) {
    // Render Ls static methods with current instance
    AppService.Ls = this.Ls;

    this.initialize();
  }

  initialize() {
    this.initGlobalConfigVariables();
    this.initSessionVariables();
    this.layoutService.initialize(VIEW_LAYOUT);

    this.appDatas = {
      datas: undefined,
    };
  }

  initGlobalConfigVariables() {
    AppConfig.visualizationCommon.GLOBAL.TO_FIXED =
      parseInt(this.Ls.get(LS.SETTING_NUMBER_PRECISION) || '', 10) ||
      AppConfig.visualizationCommon.GLOBAL.TO_FIXED;
    AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST =
      parseInt(this.Ls.get(LS.SETTING_MATRIX_CONTRAST) || '', 10) ||
      AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;

    AppConfig.common = {
      ...AppConfig.visualizationCommon,
    };

    this.khiopsLibraryService.setAppConfig(AppConfig);
  }

  initSessionVariables() {
    this.Ls.del(LS.MATRIX_MODE_OPTION_INDEX);
    this.Ls.del(LS.MATRIX_TYPE_OPTION);
    this.Ls.del(LS.TARGET_DISTRIBUTION_GRAPH_OPTION);
    this.Ls.del(LS.MATRIX_MODE_OPTION);
    this.Ls.del(LS.MATRIX_TARGET_OPTION);
    this.Ls.del(LS.TARGET_LIFT);
    this.Ls.del(LS.SELECTED_TRAIN_PREDICTOR);
    this.Ls.del(LS.DISTRIBUTION_GRAPH_OPTION_X);
    this.Ls.del(LS.DISTRIBUTION_GRAPH_OPTION_Y);
  }

  setFileDatas(datas: any) {
    this.initSessionVariables();
    this.appDatas.datas = datas;
    this.appDatas.datas = EnrichDatasService.enrichJsonDatas(
      this.appDatas.datas,
    );

    // #86 Remove missing informations for numerical variables
    this.appDatas.datas = EnrichDatasService.ignoreMissingPartitionForNumerical(
      this.appDatas.datas,
      REPORTS.PREPARATION_REPORT,
    );
    this.appDatas.datas = EnrichDatasService.ignoreMissingPartitionForNumerical(
      this.appDatas.datas,
      REPORTS.TEXT_PREPARATION_REPORT,
    );
    this.setSavedDatas(this.appDatas.datas);
  }

  getSavedDatas(type): any {
    if (this.appDatas?.datas?.savedDatas?.[type]) {
      return this.appDatas.datas.savedDatas[type];
    }
  }

  setSavedDatas(datas: any) {
    if (datas?.savedDatas) {
      if (datas.savedDatas.splitSizes) {
        this.layoutService.setSplitSizes(datas.savedDatas.splitSizes);
      }
    }
  }

  getDatas(): any {
    return this.appDatas;
  }

  isCompatibleJson(datas): boolean {
    if (datas) {
      if (
        datas.tool === 'Khiops' &&
        (datas.preparationReport ||
          datas.textPreparationReport ||
          datas.treePreparationReport ||
          datas.bivariatePreparationReport ||
          datas.evaluationReport ||
          datas.trainEvaluationReport ||
          datas.testEvaluationReport)
      ) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  getProjectSummaryDatas(): InfosDatasI[] {
    const appDatas = this.appDatas.datas;
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
    const appDatas = this.appDatas.datas;
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
