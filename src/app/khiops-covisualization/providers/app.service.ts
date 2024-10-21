import { Injectable, EventEmitter } from '@angular/core';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { AppConfig } from 'src/environments/environment';
import { ViewLayoutVO } from '../model/view-layout.model';
import * as _ from 'lodash'; // Important to import lodash in karma
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ProjectSummaryModel } from '@khiops-library/model/project-summary.model';
import { LS } from '@khiops-library/enum/ls';
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
  viewsLayout: ViewLayoutVO;
  activeTabIndex = 0;
  viewsLayoutChanged: EventEmitter<any> = new EventEmitter();

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

  initSavedDatas() {
    const viewsLayout = this.getSavedDatas('viewsLayout');
    if (viewsLayout !== undefined) {
      this.viewsLayout = viewsLayout;
    }
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

  getProjectSummaryDatas(): InfosDatasI[] {
    const appDatas = this.appDatas.datas;
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

  initViewsLayout(dimensions): ViewLayoutVO {
    this.viewsLayout = new ViewLayoutVO();
    for (let i = 0; i < dimensions.length; i++) {
      const isContextView = i >= 2;
      this.viewsLayout.addDimensionViewLayout(
        dimensions[i].name,
        isContextView,
      );
    }

    // View manager behavior #129
    // Do not restore LS values because we have a save functionnality
    if (AppConfig.cypress) {
      // Do it only for cypress tests
      const lsStorage = this.Ls.get(LS.VIEWS_LAYOUT);
      if (lsStorage && lsStorage !== 'undefined') {
        const lsValues = JSON.parse(lsStorage);
        // Merge current values with values from LS
        this.viewsLayout.megeWithPreviousValues(lsValues);
      }
    }

    // Then get saved json state
    const savedDatas = this.getSavedDatas('viewsLayout');
    if (savedDatas) {
      // Merge current values with values from LS
      this.viewsLayout.megeWithPreviousValues(savedDatas);
    }

    return this.viewsLayout;
  }

  updateViewsLayout(dimensions): ViewLayoutVO {
    const previousValues = _.cloneDeep(this.viewsLayout);
    if (previousValues) {
      this.viewsLayout = new ViewLayoutVO();
      for (let i = 0; i < dimensions.length; i++) {
        const previousLayout = previousValues.dimensionsViewsLayoutsVO.find(
          (e) => e.name === dimensions[i].name,
        );
        const isContextView = i >= 2;
        this.viewsLayout.addDimensionViewLayout(
          dimensions[i].name,
          isContextView,
          previousLayout,
        );
      }
      const lsStorage = this.Ls.get(LS.VIEWS_LAYOUT);
      if (lsStorage && lsStorage !== 'undefined') {
        const lsValues = JSON.parse(lsStorage);
        // Merge current values with values from LS
        this.viewsLayout.megeWithPreviousValues(lsValues);
      }
    }
    return this.viewsLayout;
  }

  getViewsLayout(): ViewLayoutVO {
    return this.viewsLayout;
  }

  enableExtDatasView(dimension: string) {
    const currentDim = this.viewsLayout?.dimensionsViewsLayoutsVO?.find(
      (e) => e.name === dimension,
    );
    if (currentDim) {
      currentDim.isExternalDataChecked = true;
      this.saveViewsLayout(this.viewsLayout);
    }
  }

  saveViewsLayout(viewsLayout: ViewLayoutVO) {
    this.viewsLayout = viewsLayout;
    this.Ls.set(LS.VIEWS_LAYOUT, JSON.stringify(this.viewsLayout));
    this.viewsLayoutChanged.emit(this.viewsLayout);
  }
}
