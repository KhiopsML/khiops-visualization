/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { AppConfig } from '../../../environments/environment';
import * as _ from 'lodash'; // Important to import lodash in karma
import { Ls } from '@khiops-library/providers/ls.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { VIEW_LAYOUT } from '@khiops-covisualization/config/view-layout';
import {
  AppDatasI,
  CovisualizationDatas,
} from '@khiops-covisualization/interfaces/app-datas';

import rfdc from 'rfdc';
const clone = rfdc();

@Injectable({
  providedIn: 'root',
})
export class AppService {
  static Ls: Ls;

  private _appDatas: AppDatasI | undefined;
  private _initialDatas: AppDatasI | undefined;
  private activeTabIndex = 0;

  constructor(
    private khiopsLibraryService: KhiopsLibraryService,
    private ls: Ls,
    private layoutService: LayoutService,
  ) {
    // Render Ls static methods with current instance
    AppService.Ls = this.ls;
  }

  get appDatas(): CovisualizationDatas | undefined {
    return this._appDatas?.datas;
  }

  get initialDatas(): CovisualizationDatas | undefined {
    return this._initialDatas?.datas;
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
    this.resetSearch();
    this.initGlobalConfigVariables();
    this.layoutService.initialize(VIEW_LAYOUT);
    this._appDatas = {
      datas: undefined,
    };

    this._initialDatas = {
      datas: undefined,
    };
  }

  resetSearch() {
    // #127, #201 Reset grid search on file change
    this.ls.delStartWith('OPTIONS_AG_GRID_SEARCH_');
  }

  /**
   * Sets the cropped file data and saves it.
   * @param datas - The cropped file data.
   */
  setCroppedFileDatas(datas: CovisualizationDatas) {
    // Initialize _appDatas if it's undefined
    if (!this._appDatas) {
      this._appDatas = {
        datas: undefined,
      };
    }
    this._appDatas.datas = datas;
    this.setSavedDatas(datas);
  }

  /**
   * Sets the file data and saves it. Also clones the initial data.
   * @param datas - The file data.
   */
  setFileDatas(datas: CovisualizationDatas | undefined) {
    // Initialize _appDatas if it's undefined
    if (!this._appDatas) {
      this._appDatas = {
        datas: undefined,
      };
    }

    // Initialize _initialDatas if it's undefined
    if (!this._initialDatas) {
      this._initialDatas = {
        datas: undefined,
      };
    }

    this._appDatas.datas = datas;
    this._initialDatas.datas = clone(datas);
    this.setSavedDatas(datas);
  }

  /**
   * Gets the saved data of a specific type.
   * @param type - The type of saved data to retrieve.
   * @returns The saved data of the specified type.
   */
  getSavedDatas(type: string) {
    if (this._appDatas?.datas?.savedDatas?.[type] !== undefined) {
      return this._appDatas.datas.savedDatas[type];
    }
  }

  /**
   * Sets the saved data and updates the layout split sizes if available.
   * @param datas - The data to save.
   */
  setSavedDatas(datas: CovisualizationDatas | undefined) {
    if (datas?.savedDatas) {
      if (datas.savedDatas.splitSizes) {
        this.layoutService.setSplitSizes(datas.savedDatas.splitSizes);
      }
    }
  }

  /**
   * Checks if the provided data is compatible JSON.
   * @param datas - The data to check.
   * @returns True if the data is compatible JSON, false otherwise.
   */
  isCompatibleJson(datas: CovisualizationDatas): boolean {
    return (
      !!datas &&
      datas.tool === 'Khiops Coclustering' &&
      !!datas.coclusteringReport
    );
  }

  /**
   * Checks if the provided data is colliding JSON.
   * @param datas - The data to check.
   * @returns True if the data is colliding JSON, false otherwise.
   */
  isCollidingJson(datas: CovisualizationDatas): boolean {
    return datas && datas?.khiops_encoding === 'colliding_ansi_utf8';
  }

  /**
   * Checks if the current JSON file is large.
   * @returns True if the JSON file is large, false otherwise.
   */
  isBigJsonFile(): boolean {
    return (this.appDatas?.coclusteringReport?.summary?.cells ?? 0) > 10000;
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
