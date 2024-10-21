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

  appDatas: any = undefined;
  initialDatas: any = undefined;
  activeTabIndex = 0;

  constructor(
    private khiopsLibraryService: KhiopsLibraryService,
    private Ls: Ls,
    private layoutService: LayoutService,
  ) {
    // Render Ls static methods with current instance
    AppService.Ls = this.Ls;

    this.initialize();
  }

  setActiveTabIndex(activeTab: number) {
    this.activeTabIndex = activeTab;
  }

  getActiveTabIndex(): number {
    return this.activeTabIndex;
  }

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

  setCroppedFileDatas(datas: any): any {
    this.appDatas.datas = datas;
    this.setSavedDatas(datas);
  }

  setFileDatas(datas: any): any {
    this.appDatas.datas = datas;
    this.initialDatas.datas = _.cloneDeep(datas);
    this.setSavedDatas(datas);
  }

  getSavedDatas(type): any {
    if (this.appDatas?.datas?.savedDatas?.[type] !== undefined) {
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

  getInitialDatas(): any {
    return this.initialDatas;
  }

  isCompatibleJson(datas): boolean {
    return (
      datas && datas.tool === 'Khiops Coclustering' && datas.coclusteringReport
    );
  }

  isCollidingJson(datas): boolean {
    return datas && datas.khiops_encoding === 'colliding_ansi_utf8';
  }

  isBigJsonFile(): boolean {
    return this.appDatas?.datas?.coclusteringReport?.summary?.cells > 10000;
  }

  initGlobalConfigVariables() {
    AppConfig.common = {
      ...AppConfig.covisualizationCommon,
    };
    this.khiopsLibraryService.setAppConfig(AppConfig);
  }
}
