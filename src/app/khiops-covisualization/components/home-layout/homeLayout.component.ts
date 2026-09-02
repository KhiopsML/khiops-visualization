/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  MatTabGroup,
  MatTabHeader,
  MatTab,
  MatTabChangeEvent,
} from '@angular/material/tabs';
import { AppConfig } from '../../../../environments/environment';
import { FileLoaderComponent } from '@khiops-library/components/file-loader/file-loader.component';
import { AppService } from '@khiops-covisualization/providers/app.service';
import pjson from '../../../../../package.json';
import { ConfigService } from '@khiops-library/providers/config.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { Subscription } from 'rxjs';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { CovisualizationDatas } from '@khiops-covisualization/interfaces/app-datas.interface';
import { DialogService } from '@khiops-library/providers/dialog.service';
import {
  HomeInitializationFacade,
  HomeInitializationState,
} from '@khiops-covisualization/components/home-layout/homeLayout-initialization.facade';
import { TabNavigationService } from '@khiops-covisualization/components/home-layout/homeLayout-tab-navigation.service';

@Component({
  selector: 'app-home-layout',
  templateUrl: './homeLayout.component.html',
  styleUrls: ['./homeLayout.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HomeLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  private static readonly NAV_DRAWER_ANIM_DELAY_MS = 250;
  private static readonly DEBUG_FILE_LOAD_DELAY_MS = 100;
  private static readonly VIEW_RELOAD_DEFER_DELAY_MS = 0;

  public showProjectTab: boolean | undefined = true;
  public showLogo: boolean | undefined = false;
  public selectTabName: string | undefined;
  public get appDatas(): CovisualizationDatas | undefined {
    return this.appService.appDatas;
  }
  @Input()
  public set appDatas(datas: CovisualizationDatas) {
    this.isCompatibleJson = this.appService.isCompatibleJson(datas);
    this.appService.setFileDatas(datas);
  }
  public get activeTab(): number {
    return this.tabNavigationService.activeTab;
  }
  @ViewChild('fileLoader', {
    static: false,
  })
  public fileLoader: FileLoaderComponent | undefined;
  private currentDatas?: CovisualizationDatas;

  public appTitle: string = '';
  public isContextDimensions = false;
  public appVersion: string = '';
  public opened = false;
  public get openContextView(): boolean {
    return this.tabNavigationService.openContextView;
  }
  public get selectedTab(): MatTabChangeEvent | undefined {
    return this.tabNavigationService.selectedTab;
  }
  public isCompatibleJson: boolean = false;

  private tabsMenu: MatTabGroup | undefined; // Hack to override click on tab
  @ViewChild('tabsMenu', {
    static: false,
  })
  set content(content: MatTabGroup) {
    this.tabsMenu = content;
    if (this.tabsMenu) {
      this.tabsMenu._handleClick = this.interceptTabChange.bind(this);
    }
  }
  private importedDatasChangedSub?: Subscription;
  private fileLoadedSub?: Subscription;

  constructor(
    private configService: ConfigService,
    private appService: AppService,
    private trackerService: TrackerService,
    private dialogService: DialogService,
    private fileLoaderService: FileLoaderService,
    private homeInitializationFacade: HomeInitializationFacade,
    private tabNavigationService: TabNavigationService,
  ) {
    if (pjson) {
      this.appTitle = pjson.title.covisualization;
      this.appVersion = pjson.version;
    }
  }

  ngOnInit() {
    this.subscribeToImportedDatasChanges();
    this.trackerService.trackEvent('page_view', 'axis');
    this.trackerService.trackEvent('page_view', 'visit', this.appVersion);
  }

  ngAfterViewInit() {
    if (AppConfig.debugFile) {
      setTimeout(() => {
        this.fileLoader?.loadDebugFile();
      }, HomeLayoutComponent.DEBUG_FILE_LOAD_DELAY_MS);
    }
    this.fileLoadedSub = this.fileLoaderService.fileLoaded$.subscribe(
      (datas) => {
        this.initialize(datas);
      },
    );
  }

  checkEmptyMessageVisibility(): boolean {
    return !this.appDatas || UtilsService.isEmpty(this.appDatas);
  }

  ngOnDestroy() {
    this.fileLoadedSub?.unsubscribe();
    this.importedDatasChangedSub?.unsubscribe();
  }

  showAxisView() {
    return this.tabNavigationService.showAxisView(this.isContextDimensions);
  }

  showProjectView() {
    return this.tabNavigationService.showProjectView(
      this.isContextDimensions,
      this.showProjectTab,
    );
  }

  /**
   * Intercepts Material tab clicks to reset view state before tab activation.
   */
  private interceptTabChange(
    _tab: MatTab,
    _tabHeader: MatTabHeader,
    index: number,
  ) {
    return this.tabNavigationService.interceptTabChange(
      _tab,
      _tabHeader,
      index,
      this.tabsMenu,
      this.isContextDimensions,
      this.resetAllFullscreenStates.bind(this),
    );
  }

  onSelectedTabChanged(e: MatTabChangeEvent) {
    this.tabNavigationService.onSelectedTabChanged(
      e,
      this.isContextDimensions,
      this.resetAllFullscreenStates.bind(this),
    );
  }

  onToggleNavDrawerChanged(mustReload: boolean) {
    this.opened = !this.opened;

    if (mustReload) {
      this.reloadView();
    }
  }

  /**
   * Reloads current data after the nav drawer CSS animation has completed.
   */
  private async reloadView() {
    const currentDatas = this.currentDatas;
    // Keep delay so reset starts after the nav drawer closing animation ends.
    await this.wait(HomeLayoutComponent.NAV_DRAWER_ANIM_DELAY_MS);
    this.initialize();
    this.applyHomeInitializationState(
      this.homeInitializationFacade.initializeHome(
        undefined,
        this.closeFile.bind(this),
      ),
    );
    await this.wait(HomeLayoutComponent.VIEW_RELOAD_DEFER_DELAY_MS);
    this.initialize(currentDatas);
  }

  /**
   * Restores the initial selected tab from saved data or configuration.
   */
  private selectFirstTab() {
    this.tabNavigationService.selectFirstTab(
      this.selectTabName,
      this.isContextDimensions,
      this.showProjectTab,
    );
  }

  private initialize(datas: CovisualizationDatas | undefined = undefined) {
    this.currentDatas = datas;
    this.homeInitializationFacade.initialize(datas);
    if (datas && !UtilsService.isEmpty(datas)) {
      this.applyHomeInitializationState(
        this.homeInitializationFacade.initializeHome(
          datas,
          this.closeFile.bind(this),
        ),
      );
      this.selectFirstTab();
    }
  }

  private applyHomeInitializationState(state: HomeInitializationState) {
    this.isCompatibleJson = state.isCompatibleJson;
    this.isContextDimensions = state.isContextDimensions;
    this.selectTabName = state.selectTabName;
    this.showLogo = state.showLogo;
    this.showProjectTab = state.showProjectTab;
  }

  closeFile() {
    this.dialogService.closeDialog();
    this.fileLoader?.closeFile();
  }

  private wait(delayMs: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }

  private subscribeToImportedDatasChanges() {
    this.importedDatasChangedSub =
      this.homeInitializationFacade.subscribeToImportedDatasChanges();
  }

  /**
   * Reset all fullscreen states by removing the fullscreen class from all elements
   */
  private resetAllFullscreenStates() {
    const rootElement = this.configService.getRootElementDom();
    if (rootElement) {
      const fullscreenElements = rootElement.querySelectorAll('.fullscreen');
      fullscreenElements.forEach((element: Element) => {
        element.classList.remove('fullscreen');
      });
    }
  }
}
