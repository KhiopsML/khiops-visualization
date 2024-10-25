import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  Input,
} from '@angular/core';

import { FileLoaderComponent } from '@khiops-library/components/file-loader/file-loader.component';
import { AppConfig } from 'src/environments/environment';
import { TranslateService } from '@ngstack/translate';
import { AppService } from '@khiops-visualization/providers/app.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import pjson from 'package.json';
import { ConfigService } from '@khiops-library/providers/config.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import {
  AppDatasI,
  VisualizationDatas,
} from '@khiops-visualization/interfaces/app-datas';

@Component({
  selector: 'app-home-layout',
  templateUrl: './homeLayout.component.html',
  styleUrls: ['./homeLayout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeLayoutComponent implements OnInit {
  @ViewChild('mainTabGroup') public mainTabGroup!: MatTabGroup;
  @Input()
  public get appDatas(): AppDatasI {
    return this.appService.getDatas();
  }
  public set appDatas(datas: VisualizationDatas) {
    this.appService.setFileDatas(datas);
  }
  public showProjectTab: boolean = true;
  public activeTab = AppConfig.visualizationCommon.HOME.ACTIVE_TAB_INDEX;
  public appTitle: string;
  public appVersion: string;
  public opened = false;
  public selectedTab: Object | undefined;
  public isCompatibleJson: boolean;

  @ViewChild('fileLoader', {
    static: false,
  })
  private fileLoader: FileLoaderComponent;
  private currentDatas: VisualizationDatas;
  private fileLoadedSub?: Subscription;

  constructor(
    private configService: ConfigService,
    private translate: TranslateService,
    private dialogRef: MatDialog,
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
  ) {
    if (pjson) {
      this.appTitle = pjson.title.visualization;
      this.appVersion = pjson.version;
    }
  }

  onSelectedTabChanged(e) {
    // init selected area to undefined
    this.selectableService.initialize();
    this.selectedTab = e;
  }

  checkEmptyMessageVisibility(): boolean {
    return (
      !this.appDatas ||
      !this.appDatas?.datas ||
      UtilsService.isEmpty(this.appDatas?.datas)
    );
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'visit', this.appVersion);
  }

  ngAfterViewInit() {
    if (AppConfig.debugFile) {
      setTimeout(() => {
        this.fileLoader.loadDebugFile();
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

  private initialize(datas: VisualizationDatas = undefined) {
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
    UtilsService.resetSearch(AppConfig.visualizationCommon.GLOBAL.LS_ID);

    this.showProjectTab = this.configService.getConfig().showProjectTab || true;
    if (this.showProjectTab === undefined) {
      this.showProjectTab = true;
    }

    if (!this.isCompatibleJson) {
      this.closeFile();
      this.snackBar.open(
        this.translate.get('SNACKS.OPEN_FILE_ERROR'),
        undefined,
        {
          duration: 400000,
          panelClass: 'error',
        },
      );
    } else {
      this.snackBar.open(this.translate.get('SNACKS.DATAS_LOADED'), undefined, {
        duration: 2000,
        panelClass: 'success',
      });
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
    this.dialogRef.closeAll();
    this.fileLoader.closeFile();
  }

  private selectFirstTab() {
    setTimeout(() => {
      this.selectedTab = undefined;
      this.activeTab = 0;
      this.mainTabGroup.selectedIndex = 0;
    });
  }
}
