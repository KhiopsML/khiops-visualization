/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { FileLoaderComponent } from '@khiops-library/components/file-loader/file-loader.component';
import { TranslateService } from '@ngstack/translate';
import { AppService } from '@khiops-visualization/providers/app.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import pjson from '../../../../../package.json';
import { ConfigService } from '@khiops-library/providers/config.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { Subscription } from 'rxjs';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas.interface';
import { AppConfig } from '../../../../environments/environment';
import { REPORT } from '@khiops-library/enum/report';
import { DialogService } from '@khiops-library/providers/dialog.service';

@Component({
  selector: 'app-home-layout',
  templateUrl: './homeLayout.component.html',
  styleUrls: ['./homeLayout.component.scss'],
  standalone: false,
})
export class HomeLayoutComponent implements OnInit {
  @ViewChild('mainTabGroup') public mainTabGroup!: MatTabGroup;
  @Input()
  public get appDatas(): VisualizationDatas | undefined {
    return this.appService.appDatas;
  }
  public set appDatas(datas: VisualizationDatas) {
    this.appService.setFileDatas(datas);
  }
  public showProjectTab: boolean | undefined = true;
  public showLogo: boolean | undefined = false;
  public selectTabName: string | undefined;
  public activeTab = AppConfig.visualizationCommon.HOME.ACTIVE_TAB_INDEX;
  public appTitle?: string;
  public appVersion?: string;
  public opened = false;
  public selectedTab: MatTabChangeEvent | undefined;
  public isCompatibleJson?: boolean;
  public isLoading: boolean = true;
  public REPORT = REPORT;

  @ViewChild('fileLoader', {
    static: false,
  })
  private fileLoader?: FileLoaderComponent;
  private currentDatas?: VisualizationDatas;
  private fileLoadedSub?: Subscription;

  constructor(
    private configService: ConfigService,
    private translate: TranslateService,
    private appService: AppService,
    private snackBar: MatSnackBar,
    public khiopsLibraryService: KhiopsLibraryService,
    public selectableService: SelectableService,
    private distributionDatasService: DistributionDatasService,
    private modelingDatasService: ModelingDatasService,
    private trackerService: TrackerService,
    private evaluationDatasService: EvaluationDatasService,
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
    private fileLoaderService: FileLoaderService,
    private dialogService: DialogService,
  ) {
    if (pjson) {
      this.appTitle = pjson.title.visualization;
      this.appVersion = pjson.version;
    }
  }

  onSelectedTabChanged(e: MatTabChangeEvent) {
    // init selected area to undefined
    this.selectableService.initialize();
    this.selectedTab = e;
    this.appService.setActiveTabIndex(e.index);
  }

  checkEmptyMessageVisibility(): boolean {
    return !this.appDatas || UtilsService.isEmpty(this.appDatas);
  }

  ngOnInit() {
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

  ngOnDestroy() {
    this.fileLoadedSub?.unsubscribe();
  }

  onToggleNavDrawerChanged(mustReload: boolean) {
    this.opened = !this.opened;

    if (mustReload) {
      this.reloadView();
    }
  }

  private initialize(datas: VisualizationDatas | undefined = undefined) {
    this.isLoading = true;
    this.isCompatibleJson = false;
    this.currentDatas = datas;
    this.appService.setFileDatas(datas);
    if (datas && !UtilsService.isEmpty(datas)) {
      this.initializeHome(datas);
      this.selectFirstTab();
    }
  }

  private initializeHome(datas: VisualizationDatas) {
    this.isCompatibleJson = this.appService.isCompatibleJson(datas);
    this.appService.resetSearch();

    this.showProjectTab = this.configService.getConfig().showProjectTab;
    if (this.showProjectTab === undefined) {
      this.showProjectTab = true;
    }
    this.showLogo = this.configService.getConfig().showLogo;
    if (this.showLogo === undefined) {
      this.showLogo = true;
    }
    this.selectTabName = this.configService.getConfig().selectTabName;
    if (!this.isCompatibleJson) {
      this.closeFile();
      const basename = UtilsService.getFileBasename(datas);
      this.snackBar.open(
        basename
          ? this.translate.get('SNACKS.FILE_OPEN_ERROR', { filename: basename })
          : this.translate.get('SNACKS.OPEN_FILE_ERROR'),
        undefined,
        {
          duration: 4000,
          panelClass: 'error',
        },
      );
      const config = this.configService.getConfig();
      if (config?.onFileError) {
        config.onFileError((datas as any).filename);
      }
    } else {
      const basename = UtilsService.getFileBasename(datas);
      this.snackBar.open(
        basename
          ? this.translate.get('SNACKS.FILE_LOADED', { filename: basename })
          : this.translate.get('SNACKS.DATAS_LOADED'),
        undefined,
        {
          duration: 2000,
          panelClass: 'success',
        },
      );
    }

    // Init services
    this.preparationDatasService.initialize();
    this.treePreparationDatasService.initialize();
    this.preparation2dDatasService.initialize();
    this.distributionDatasService.initialize();
    this.evaluationDatasService.initialize();
    this.modelingDatasService.initialize();
  }

  private reloadView() {
    const currentDatas = this.currentDatas;
    setTimeout(() => {
      this.initialize();
      setTimeout(() => {
        this.initialize(currentDatas);
      }); // do it after timeout to be launched
    }, 250); // do it after nav drawer anim
  }

  private closeFile() {
    this.dialogService.closeDialog();
    this.fileLoader?.closeFile();
  }

  private getTabIndexByName(name: string): number {
    const visibleTabs: string[] = [];
    if (this.appDatas?.preparationReport) visibleTabs.push('PREPARATION');
    if (this.appDatas?.textPreparationReport)
      visibleTabs.push('TEXT_PREPARATION');
    if (this.appDatas?.treePreparationReport)
      visibleTabs.push('TREE_PREPARATION');
    if (this.appDatas?.bivariatePreparationReport)
      visibleTabs.push('PREPARATION_2D');
    if (this.appDatas?.modelingReport) visibleTabs.push('MODELING');
    if (
      this.appDatas?.trainEvaluationReport ||
      this.appDatas?.evaluationReport ||
      this.appDatas?.testEvaluationReport
    )
      visibleTabs.push('EVALUATION');
    if (this.showProjectTab) visibleTabs.push('PROJECT');
    const index = visibleTabs.findIndex(
      (t) => t.toLowerCase() === name.toLowerCase(),
    );
    return index >= 0 ? index : 0;
  }

  private selectFirstTab() {
    setTimeout(() => {
      this.selectedTab = undefined;

      // Restore active tab: savedDatas takes priority, then config, then default
      const savedActiveTabIndex =
        this.appService.getSavedDatas('activeTabIndex');
      if (savedActiveTabIndex !== undefined && savedActiveTabIndex !== null) {
        this.activeTab = savedActiveTabIndex;
      } else if (this.selectTabName) {
        this.activeTab = this.getTabIndexByName(this.selectTabName);
      } else {
        this.activeTab = 0;
      }

      this.mainTabGroup.selectedIndex = this.activeTab;
      this.appService.setActiveTabIndex(this.activeTab);
      // Beware, the distribution chart fails to resize on init for some files #134, so we need to DOUBLE set loading to false after a delay to let the chart resize before displaying it
      setTimeout(() => {
        this.isLoading = false; // Distribution chart fails to resize on init for some files #134
      });
      setTimeout(() => {
        this.isLoading = false;
      }, 250); // simce important to avoid white screen on some freeze during loadings
    });
  }
}
