import { Injectable } from '@angular/core';
import { AppConfig } from 'src/environments/environment';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { REPORT } from '@khiops-library/enum/report';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';
import { EnrichDatasService } from './enrich-datas.service';
import { LayoutService } from '../../khiops-library/providers/layout.service';
import { VIEW_LAYOUT } from '@khiops-visualization/config/view-layout';
import {
  AppDatasI,
  VisualizationDatas,
} from '@khiops-visualization/interfaces/app-datas';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  static Ls: Ls;
  private appDatas: AppDatasI = undefined;

  constructor(
    private layoutService: LayoutService,
    private khiopsLibraryService: KhiopsLibraryService,
    private ls: Ls,
  ) {
    // Render Ls static methods with current instance
    AppService.Ls = this.ls;

    this.initialize();
  }

  /**
   * Initializes the application by setting up global configuration variables,
   * session variables, and initializing the layout service.
   */
  initialize() {
    this.initGlobalConfigVariables();
    this.initSessionVariables();
    this.layoutService.initialize(VIEW_LAYOUT);

    this.appDatas = {
      datas: undefined,
    };
  }

  /**
   * Initializes global configuration variables from local storage or defaults.
   */
  initGlobalConfigVariables() {
    AppConfig.visualizationCommon.GLOBAL.TO_FIXED =
      parseInt(this.ls.get(LS.SETTING_NUMBER_PRECISION) || '', 10) ||
      AppConfig.visualizationCommon.GLOBAL.TO_FIXED;
    AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST =
      parseInt(this.ls.get(LS.SETTING_MATRIX_CONTRAST) || '', 10) ||
      AppConfig.visualizationCommon.GLOBAL.MATRIX_CONTRAST;

    AppConfig.common = {
      ...AppConfig.visualizationCommon,
    };

    this.khiopsLibraryService.setAppConfig(AppConfig);
  }

  /**
   * Initializes session variables by deleting specific keys from local storage.
   */
  initSessionVariables() {
    this.ls.del(LS.MATRIX_MODE_OPTION_INDEX);
    this.ls.del(LS.MATRIX_TYPE_OPTION);
    this.ls.del(LS.TARGET_DISTRIBUTION_GRAPH_OPTION);
    this.ls.del(LS.MATRIX_MODE_OPTION);
    this.ls.del(LS.MATRIX_TARGET_OPTION);
    this.ls.del(LS.TARGET_LIFT);
    this.ls.del(LS.SELECTED_TRAIN_PREDICTOR);
    this.ls.del(LS.DISTRIBUTION_GRAPH_OPTION_X);
    this.ls.del(LS.DISTRIBUTION_GRAPH_OPTION_Y);
  }

  /**
   * Sets the file data, enriches it, and removes missing information for numerical variables.
   * @param datas - The data to be set and processed.
   */
  setFileDatas(datas: VisualizationDatas) {
    this.initSessionVariables();
    this.appDatas.datas = datas;
    this.appDatas.datas = EnrichDatasService.enrichJsonDatas(
      this.appDatas.datas,
    );

    // #86 Remove missing informations for numerical variables
    this.appDatas.datas = EnrichDatasService.ignoreMissingPartitionForNumerical(
      this.appDatas.datas,
      REPORT.PREPARATION_REPORT,
    );
    this.appDatas.datas = EnrichDatasService.ignoreMissingPartitionForNumerical(
      this.appDatas.datas,
      REPORT.TEXT_PREPARATION_REPORT,
    );
    this.setSavedDatas(this.appDatas.datas);
  }

  /**
   * Retrieves saved data of a specific type.
   * @param type - The type of saved data to retrieve.
   * @returns The saved data of the specified type.
   */
  getSavedDatas(type): any {
    if (this.appDatas?.datas?.savedDatas?.[type]) {
      return this.appDatas.datas.savedDatas[type];
    }
  }

  /**
   * Sets the saved data and updates the layout service with split sizes if available.
   * @param datas - The data to be saved.
   */
  setSavedDatas(datas: VisualizationDatas) {
    if (datas?.savedDatas) {
      if (datas.savedDatas.splitSizes) {
        this.layoutService.setSplitSizes(datas.savedDatas.splitSizes);
      }
    }
  }

  /**
   * Retrieves the current application data.
   * @returns The current application data.
   */
  getDatas(): AppDatasI {
    return this.appDatas;
  }

  /**
   * Checks if the provided JSON data is compatible with the application.
   * @param datas - The data to be checked.
   * @returns True if the data is compatible, false otherwise.
   */
  isCompatibleJson(datas: VisualizationDatas): boolean {
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
}
