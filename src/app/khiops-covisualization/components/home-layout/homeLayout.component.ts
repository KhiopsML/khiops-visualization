/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import {
  MatTabGroup,
  MatTabHeader,
  MatTab,
  MatTabChangeEvent,
} from '@angular/material/tabs';
import { AppConfig } from '../../../../environments/environment';
import { FileLoaderComponent } from '@khiops-library/components/file-loader/file-loader.component';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { TranslateService } from '@ngstack/translate';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { LoadExtDatasComponent } from '../commons/load-ext-datas/load-ext-datas.component';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import pjson from 'package.json';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { Subscription } from 'rxjs';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { ViewManagerService } from '@khiops-covisualization/providers/view-manager.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { CovisualizationDatas } from '@khiops-covisualization/interfaces/app-datas';

@Component({
  selector: 'app-home-layout',
  templateUrl: './homeLayout.component.html',
  styleUrls: ['./homeLayout.component.scss'],
  standalone: false,
})
export class HomeLayoutComponent implements OnInit, OnDestroy {
  public showProjectTab: boolean | undefined = true;
  public showLogo: boolean | undefined = false;
  public get appDatas(): CovisualizationDatas | undefined {
    return this.appService.appDatas;
  }
  @Input()
  public set appDatas(datas: CovisualizationDatas) {
    this.isCompatibleJson = this.appService.isCompatibleJson(datas);
    this.appService.setFileDatas(datas);
  }
  public activeTab = AppConfig.covisualizationCommon.HOME.ACTIVE_TAB_INDEX;
  @ViewChild('fileLoader', {
    static: false,
  })
  public fileLoader: FileLoaderComponent | undefined;
  public appTitle: string = '';
  public isContextDimensions = false;
  public appVersion: string = '';
  public opened = false;
  public openContextView = false;
  public selectedTab: Object | undefined;
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
  private importedDatasChangedSub: Subscription;
  private fileLoadedSub?: Subscription;

  constructor(
    private configService: ConfigService,
    private appService: AppService,
    private dialogRef: MatDialog,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private trackerService: TrackerService,
    public selectableService: SelectableService,
    private importExtDatasService: ImportExtDatasService,
    private dimensionsDatasService: DimensionsDatasService,
    private viewManagerService: ViewManagerService,
    private treenodesService: TreenodesService,
    private eventsService: EventsService,
    private dialog: MatDialog,
    private fileLoaderService: FileLoaderService,
  ) {
    if (pjson) {
      this.appTitle = pjson.title.covisualization;
      this.appVersion = pjson.version;
    }

    this.importedDatasChangedSub =
      this.eventsService.importedDatasChanged.subscribe((dimName) => {
        if (dimName?.[0]) {
          this.dimensionsDatasService.constructDimensionsTrees();
          const dimIndex =
            this.dimensionsDatasService.getDimensionPositionFromName(
              dimName[0],
            );
          if (
            this.dimensionsDatasService.dimensionsDatas.selectedDimensions[
              dimIndex
            ]
          ) {
            // Update selected nodes ext datas
            this.treenodesService.setSelectedNode(
              this.dimensionsDatasService.dimensionsDatas.selectedDimensions[
                dimIndex
              ].name,
              this.dimensionsDatasService.dimensionsDatas.selectedNodes[
                dimIndex
              ]!._id,
              false,
            );
            // Enable ext datas view if not displayed
            this.viewManagerService.enableExtDatasView(dimName[0]);
          }
        }
      });
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'axis');
    this.trackerService.trackEvent('page_view', 'visit', this.appVersion);
  }

  ngAfterViewInit() {
    if (AppConfig.debugFile) {
      setTimeout(() => {
        this.fileLoader?.loadDebugFile();
      }, 100);
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
    this.importedDatasChangedSub.unsubscribe();
  }

  showAxisView() {
    return (
      this.activeTab === 0 || (this.activeTab === 1 && this.isContextDimensions)
    );
  }

  showProjectView() {
    return (
      (this.activeTab === 1 && !this.isContextDimensions) ||
      (this.activeTab === 2 && this.isContextDimensions)
    );
  }

  private interceptTabChange(
    _tab: MatTab,
    _tabHeader: MatTabHeader,
    index: number,
  ) {
    if (index === 1 && this.isContextDimensions) {
      this.openContextView = true;
      this.trackerService.trackEvent('page_view', 'context');
    } else if (index === 0) {
      this.trackerService.trackEvent('page_view', 'axis');
      this.openContextView = false;
    }
    return MatTabGroup.prototype._handleClick.apply(this.tabsMenu, [
      _tab,
      _tabHeader,
      index,
    ]);
  }

  onSelectedTabChanged(e: MatTabChangeEvent) {
    if (e.index === 0 || (e.index === 1 && !this.isContextDimensions)) {
      this.openContextView = false;
    }

    // init selected area to undefined
    this.selectableService.initialize();
    this.selectedTab = e;
    this.activeTab = e.index;
    this.appService.setActiveTabIndex(this.activeTab);
  }

  onToggleNavDrawerChanged() {
    this.opened = !this.opened;
  }

  private selectFirstTab() {
    this.openContextView = false;
    this.selectedTab = undefined;
    this.activeTab = 0;
    this.appService.setActiveTabIndex(this.activeTab);
  }

  private initialize(datas: CovisualizationDatas | undefined = undefined) {
    this.appService.setFileDatas(datas);
    if (datas && !UtilsService.isEmpty(datas)) {
      this.initializeHome(datas);
      this.selectFirstTab();
    }
  }

  private initializeHome(datas: CovisualizationDatas) {
    // Close dialogs when opening new file #148
    this.dialogRef.closeAll();

    this.isCompatibleJson = this.appService.isCompatibleJson(datas);
    const isCollidingJson = this.appService.isCollidingJson(datas);
    this.appService.resetSearch();

    this.showProjectTab = this.configService.getConfig().showProjectTab;
    if (this.showProjectTab === undefined) {
      this.showProjectTab = true;
    }
    this.showLogo = this.configService.getConfig().showLogo;
    if (this.showLogo === undefined) {
      this.showLogo = true;
    }
    if (!UtilsService.isEmpty(datas)) {
      if (!this.isCompatibleJson) {
        this.closeFile();
        this.snackBar.open(
          this.translate.get('SNACKS.OPEN_FILE_ERROR'),
          undefined,
          {
            duration: 4000,
            panelClass: 'error',
          },
        );
      } else {
        this.snackBar.open(
          this.translate.get('SNACKS.DATAS_LOADED'),
          undefined,
          {
            duration: 2000,
            panelClass: 'success',
          },
        );
      }
      if (isCollidingJson) {
        this.snackBar.open(
          this.translate.get('SNACKS.COLLIDING_FILE'),
          undefined,
          {
            duration: 10000,
            panelClass: 'warning',
          },
        );
      }
    }

    this.initializeServices();
  }

  private initializeServices() {
    this.dimensionsDatasService.initialize();
    this.importExtDatasService.initExtDatasFiles();
    // Loading local files is forbidden in js
    if (this.configService.isElectron) {
      this.openLoadExternalDataDialog();
    }
    this.isContextDimensions =
      this.dimensionsDatasService.isContextDimensions();
  }

  private openLoadExternalDataDialog() {
    const config = new MatDialogConfig();
    config.panelClass = 'hidden';
    config.backdropClass = 'hidden';
    const dialogRef: MatDialogRef<LoadExtDatasComponent> = this.dialog.open(
      LoadExtDatasComponent,
      config,
    );
    dialogRef.disableClose = true;
  }

  closeFile() {
    this.dialogRef.closeAll();
    this.fileLoader?.closeFile();
  }
}
