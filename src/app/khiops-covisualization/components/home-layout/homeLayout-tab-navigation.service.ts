/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import {
  MatTab,
  MatTabChangeEvent,
  MatTabGroup,
  MatTabHeader,
} from '@angular/material/tabs';
import { AppConfig } from '../../../../environments/environment';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';

@Injectable()
export class TabNavigationService {
  public activeTab = AppConfig.covisualizationCommon.HOME.ACTIVE_TAB_INDEX;
  public openContextView = false;
  public selectedTab: MatTabChangeEvent | undefined;

  constructor(
    private appService: AppService,
    private selectableService: SelectableService,
    private trackerService: TrackerService,
  ) {}

  showAxisView(isContextDimensions: boolean): boolean {
    return (
      this.activeTab === 0 || (this.activeTab === 1 && isContextDimensions)
    );
  }

  showProjectView(
    isContextDimensions: boolean,
    _showProjectTab: boolean | undefined,
  ): boolean {
    return (
      ((this.activeTab === 1 && !isContextDimensions) ||
        (this.activeTab === 2 && isContextDimensions))
    );
  }

  /**
   * Intercepts Material tab clicks to reset view state before tab activation.
   */
  interceptTabChange(
    tab: MatTab,
    tabHeader: MatTabHeader,
    index: number,
    tabsMenu: MatTabGroup | undefined,
    isContextDimensions: boolean,
    resetAllFullscreenStates: () => void,
  ): void {
    resetAllFullscreenStates();

    if (index === 1 && isContextDimensions) {
      this.openContextView = true;
      this.trackerService.trackEvent('page_view', 'context');
    } else if (index === 0) {
      this.trackerService.trackEvent('page_view', 'axis');
      this.openContextView = false;
    }

    MatTabGroup.prototype._handleClick.apply(tabsMenu, [
      tab,
      tabHeader,
      index,
    ]);
  }

  onSelectedTabChanged(
    event: MatTabChangeEvent,
    isContextDimensions: boolean,
    resetAllFullscreenStates: () => void,
  ): void {
    if (event.index === 0 || (event.index === 1 && !isContextDimensions)) {
      this.openContextView = false;
    }

    resetAllFullscreenStates();
    this.selectableService.initialize();
    this.selectedTab = event;
    this.activeTab = event.index;
    this.appService.setActiveTabIndex(this.activeTab);
  }

  /**
   * Resolves the tab index for the currently visible covisualization tabs.
   */
  getTabIndexByName(
    name: string,
    isContextDimensions: boolean,
    showProjectTab: boolean | undefined,
  ): number {
    const visibleTabs: string[] = ['AXIS'];
    if (isContextDimensions) visibleTabs.push('CONTEXT');
    if (showProjectTab) visibleTabs.push('PROJECT');
    const index = visibleTabs.findIndex(
      (tabName) => tabName.toLowerCase() === name.toLowerCase(),
    );
    return index >= 0 ? index : 0;
  }

  /**
   * Restores the initial selected tab from saved data or configuration.
   */
  selectFirstTab(
    selectTabName: string | undefined,
    isContextDimensions: boolean,
    showProjectTab: boolean | undefined,
  ): void {
    this.openContextView = false;
    this.selectedTab = undefined;

    const savedActiveTabIndex = this.appService.getSavedDatas('activeTabIndex');
    if (savedActiveTabIndex !== undefined && savedActiveTabIndex !== null) {
      this.activeTab = savedActiveTabIndex;
    } else if (selectTabName) {
      this.activeTab = this.getTabIndexByName(
        selectTabName,
        isContextDimensions,
        showProjectTab,
      );
    } else {
      this.activeTab = 0;
    }

    if (this.activeTab === 1 && isContextDimensions) {
      this.openContextView = true;
    }
    this.appService.setActiveTabIndex(this.activeTab);
  }
}
