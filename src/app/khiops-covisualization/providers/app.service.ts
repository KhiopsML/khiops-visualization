import { Injectable } from '@angular/core';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { AppConfig } from 'src/environments/environment';
import * as _ from 'lodash'; // Important to import lodash in karma
import { Ls } from '@khiops-library/providers/ls.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { VIEW_LAYOUT } from '@khiops-covisualization/config/view-layout';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  static Ls: Ls;

  private appDatas: any = undefined;
  private initialDatas: any = undefined;
  private activeTabIndex = 0;

  constructor(
    private khiopsLibraryService: KhiopsLibraryService,
    private ls: Ls,
    private layoutService: LayoutService,
  ) {
    // Render Ls static methods with current instance
    AppService.Ls = this.ls;

    this.initialize();
  }

  /**
   * Sets the active tab index.
   * @param activeTab - The index of the active tab.
   */
  setActiveTabIndex(activeTab: number) {
    this.activeTabIndex = activeTab;
  }

  /**
   * Gets the active tab index.
   * @returns The index of the active tab.
   */
  getActiveTabIndex(): number {
    return this.activeTabIndex;
  }

  /**
   * Initializes the application by setting global configuration variables,
   * initializing the layout service, and setting initial data structures.
   */
  initialize() {
    this.initGlobalConfigVariables();
    this.layoutService.initialize(VIEW_LAYOUT);
    this.appDatas = {
      datas: undefined,
    };

    this.initialDatas = {
      datas: undefined,
    };
  }

  /**
   * Sets the cropped file data and saves it.
   * @param datas - The cropped file data.
   */
  setCroppedFileDatas(datas: any): any {
    this.appDatas.datas = datas;
    this.setSavedDatas(datas);
  }

  /**
   * Sets the file data and saves it. Also clones the initial data.
   * @param datas - The file data.
   */
  setFileDatas(datas: any): any {
    this.appDatas.datas = datas;
    this.initialDatas.datas = _.cloneDeep(datas);
    this.setSavedDatas(datas);
  }

  /**
   * Gets the saved data of a specific type.
   * @param type - The type of saved data to retrieve.
   * @returns The saved data of the specified type.
   */
  getSavedDatas(type): any {
    if (this.appDatas?.datas?.savedDatas?.[type] !== undefined) {
      return this.appDatas.datas.savedDatas[type];
    }
  }

  /**
   * Sets the saved data and updates the layout split sizes if available.
   * @param datas - The data to save.
   */
  setSavedDatas(datas: any) {
    if (datas?.savedDatas) {
      if (datas.savedDatas.splitSizes) {
        this.layoutService.setSplitSizes(datas.savedDatas.splitSizes);
      }
    }
  }

  /**
   * Gets the current application data.
   * @returns The current application data.
   */
  getDatas(): any {
    return this.appDatas;
  }

  /**
   * Gets the initial application data.
   * @returns The initial application data.
   */
  getInitialDatas(): any {
    return this.initialDatas;
  }

  /**
   * Checks if the provided data is compatible JSON.
   * @param datas - The data to check.
   * @returns True if the data is compatible JSON, false otherwise.
   */
  isCompatibleJson(datas): boolean {
    return (
      datas && datas.tool === 'Khiops Coclustering' && datas.coclusteringReport
    );
  }

  /**
   * Checks if the provided data is colliding JSON.
   * @param datas - The data to check.
   * @returns True if the data is colliding JSON, false otherwise.
   */
  isCollidingJson(datas): boolean {
    return datas && datas.khiops_encoding === 'colliding_ansi_utf8';
  }

  /**
   * Checks if the current JSON file is large.
   * @returns True if the JSON file is large, false otherwise.
   */
  isBigJsonFile(): boolean {
    return this.appDatas?.datas?.coclusteringReport?.summary?.cells > 10000;
  }

  /**
   * Initializes global configuration variables by merging common configuration
   * with covisualization-specific settings and sets the application configuration
   * in the KhiopsLibraryService.
   */
  initGlobalConfigVariables() {
    AppConfig.common = {
      ...AppConfig.covisualizationCommon,
    };
    this.khiopsLibraryService.setAppConfig(AppConfig);
  }
}
