import { Injectable, EventEmitter } from '@angular/core';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { AppConfig } from 'src/environments/environment';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { ViewLayoutVO } from '../model/view-layout-vo';
import * as _ from 'lodash'; // Important to import lodash in karma
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ProjectSummaryVO } from '@khiops-library/model/project-summary-vo';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  splitSizes: any;
  appDatas: any = undefined;
  initialDatas: any = undefined;
  viewsLayout: ViewLayoutVO;
  activeTabIndex = 0;
  viewsLayoutChanged: EventEmitter<any> = new EventEmitter();

  constructor(private khiopsLibraryService: KhiopsLibraryService) {
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

    this.appDatas = {
      datas: undefined,
    };

    this.initialDatas = {
      datas: undefined,
    };

    this.splitSizes = {
      axisView: {
        col: [70, 30],
        col0Row: [50, 50],
        col1Row: [20, 80],
        col0Row0Col: [25, 25, 25, 25],
        col0Row0Col2Row: [50, 50],
        col0Row1Col: [25, 25, 25, 25],
        col0Row1Col2Row: [30, 70],
      },
      contextView: {
        col: [70, 30],
        col0Row0Col: [25, 25, 25, 25],
        col0Row0Col2Row: [30, 70],
      },
    };

    const storedSplitValues = localStorage.getItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SPLIT_SIZES',
    );

    // Set default split sizes if not into local storage
    this.splitSizes = UtilsService.setDefaultLSValues(
      storedSplitValues,
      this.splitSizes,
    );
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

  checkCollapsedNodesIntegrity(collapsedNodes) {
    if (collapsedNodes) {
      for (const [key, value] of Object.entries(collapsedNodes)) {
        const dimIndex =
          this.appDatas.datas.coclusteringReport.dimensionHierarchies.findIndex(
            (e) => e.name === key,
          );
        if (dimIndex === -1) {
          // broken saved data
          delete collapsedNodes[key];
        }
        for (let k = collapsedNodes?.[key]?.length - 1; k >= 0; k--) {
          const node = value[k];
          const nodeDetails =
            this.appDatas.datas.coclusteringReport.dimensionHierarchies?.[
              dimIndex
            ]?.clusters?.find((e) => e.cluster === node);
          if (!nodeDetails /*|| nodeDetails?.isLeaf*/) {
            // it's a leaf or it's a broken leaf name
            collapsedNodes[key].splice(collapsedNodes[key][k], 1);
          }
        }
      }
    }
    return collapsedNodes;
  }

  setSavedDatas(datas: any) {
    if (datas?.savedDatas) {
      if (datas.savedDatas.splitSizes) {
        this.setSplitSizes(datas.savedDatas.splitSizes);
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

  getViewSplitSizes(view) {
    return this.splitSizes[view];
  }

  getSplitSizes() {
    return this.splitSizes;
  }

  setViewSplitSizes(view, sizes) {
    this.splitSizes[view] = sizes;
    this.setSplitSizes(this.splitSizes);
  }

  setSplitSizes(splitSizes) {
    this.splitSizes = splitSizes;
    localStorage.setItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SPLIT_SIZES',
      JSON.stringify(this.splitSizes),
    );
  }

  resizeAndSetSplitSizes(item, sizes, itemSize, view, dispatchEvent?) {
    if (dispatchEvent !== false) {
      window.dispatchEvent(new Event('resize'));
    }
    if (item) {
      sizes[item] = itemSize;
      this.setViewSplitSizes(view, sizes);
    }
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
      const projectSummaryDatas = new ProjectSummaryVO(
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
      const lsStorage = localStorage.getItem(
        AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'VIEWS_LAYOUT',
      );
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
      const lsStorage = localStorage.getItem(
        AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'VIEWS_LAYOUT',
      );
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
    localStorage.setItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'VIEWS_LAYOUT',
      JSON.stringify(this.viewsLayout),
    );
    this.viewsLayoutChanged.emit(this.viewsLayout);
  }

  switchSplitSizes(oldPosition, newPosition) {
    const oldView =
      oldPosition === 0 || oldPosition === 1 ? 'axisView' : 'contextView';
    const newView =
      newPosition === 0 || newPosition === 1 ? 'axisView' : 'contextView';

    // All contexts have same layout
    if (newView === 'contextView') {
      newPosition = 0;
    }
    if (oldPosition > 1) {
      oldPosition = 0;
    }

    // Maybe split view sizes managment needs a deep refactoring
    [
      this.splitSizes[oldView]['col0Row' + oldPosition + 'Col'],
      this.splitSizes[newView]['col0Row' + newPosition + 'Col'],
    ] = [
      this.splitSizes[newView]['col0Row' + newPosition + 'Col'],
      this.splitSizes[oldView]['col0Row' + oldPosition + 'Col'],
    ];
    [
      this.splitSizes[oldView]['col0Row' + oldPosition + 'Col2Row'],
      this.splitSizes[newView]['col0Row' + newPosition + 'Col2Row'],
    ] = [
      this.splitSizes[newView]['col0Row' + newPosition + 'Col2Row'],
      this.splitSizes[oldView]['col0Row' + oldPosition + 'Col2Row'],
    ];
  }

  /**
   * #127 Reset grid search on file change
   */
  resetSearch() {
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      if (
        key.startsWith(
          AppConfig.covisualizationCommon.GLOBAL.LS_ID +
            'OPTIONS_AG_GRID_SEARCH_',
        )
      ) {
        localStorage.removeItem(key);
        // Decrement i to avoid skipping a key because the length of localStorage has decreased.
        i--;
      }
    }
  }
}
