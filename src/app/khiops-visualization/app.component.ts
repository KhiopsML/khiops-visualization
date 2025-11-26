/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import { AppService } from './providers/app.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { SaveService } from './providers/save.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { VisualizationDatas } from './interfaces/app-datas';
import { ConfigModel } from '@khiops-library/model/config.model';
import { InAppOverlayContainer } from '@khiops-library/overlay/in-app-overlay-provider';
import { AppConfig } from '../../environments/environment';
import { Ls } from '@khiops-library/providers/ls.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { DistributionDatasService } from './providers/distribution-datas.service';
import { EvaluationDatasService } from './providers/evaluation-datas.service';
import { ModelingDatasService } from './providers/modeling-datas.service';
import { PreparationDatasService } from './providers/preparation-datas.service';
import { Preparation2dDatasService } from './providers/preparation2d-datas.service';
import { ProjectDatasService } from './providers/project-datas.service';
import { TreePreparationDatasService } from './providers/tree-preparation-datas.service';
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { EnrichDatasService } from './providers/enrich-datas.service';
import { VariableScaleSettingsService } from './providers/variable-scale-settings.service';
import { Distribution2dDatasService } from './providers/distribution2d-datas.service';
import { CopyDatasService } from '@khiops-library/providers/copy-datas.service';
import { DialogService } from '@khiops-library/providers/dialog.service';
@Component({
  selector: 'app-root-visualization',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
  providers: [
    AppService,
    SaveService,
    InAppOverlayContainer,
    Distribution2dDatasService,
    VariableScaleSettingsService,
    EnrichDatasService,
    PreparationDatasService,
    Preparation2dDatasService,
    TreePreparationDatasService,
    ModelingDatasService,
    EvaluationDatasService,
    DistributionDatasService,
    ProjectDatasService,

    // Lib services
    ConfigService,
    CopyDatasService,
    DialogService,
    FileLoaderService,
    Ls,
    KhiopsLibraryService,
    LayoutService,

    // Overlay
    InAppOverlayContainer,
    { provide: OverlayContainer, useClass: InAppOverlayContainer },
    Overlay,
  ],
})
export class AppComponent implements AfterViewInit {
  appdatas: VisualizationDatas | undefined;

  @ViewChild('appElement', {
    static: false,
  })
  appElement: ElementRef<HTMLElement> | undefined;

  constructor(
    private overlayContainer: InAppOverlayContainer,
    private dialogRef: MatDialog,
    private ngzone: NgZone,
    private dialog: MatDialog,
    private appService: AppService,
    private translate: TranslateService,
    private configService: ConfigService,
    private saveService: SaveService,
    private trackerService: TrackerService,
    private fileLoaderService: FileLoaderService,
    private element: ElementRef,
    private ls: Ls,
  ) {
    // Set LS_ID with unique instance identifier to prevent collision between tabs
    const instanceId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const lsId = `${AppConfig.visualizationCommon.GLOBAL.LS_ID}_${instanceId}`;
    this.ls.setLsId(lsId);
    AppService.Ls = this.ls;
    // Now we can safely initialize the app service
    this.appService.initialize();
  }

  ngAfterViewInit(): void {
    this.configService.setRootElement(this.appElement!);
    this.element.nativeElement.getDatas = () =>
      this.saveService.constructDatasToSave();
    this.element.nativeElement.setDatas = (
      datas: VisualizationDatas | undefined,
    ) => {
      // Set data into ngzone to detect change into another context (electron for instance)
      this.ngzone.run(() => {
        // Don't clean, just set the new data
        // @ts-ignore
        this.appdatas = {
          ...datas,
        };
        this.element.nativeElement.value = datas;
        // Set data to both services - appService manages the data state
        this.appService.setFileDatas(datas);
        this.fileLoaderService.setDatas(datas);
      });
    };
    this.element.nativeElement.openChannelDialog = (cb: Function) => {
      this.dialogRef.closeAll();
      this.ngzone.run(() => {
        const config = new MatDialogConfig();
        const dialogRef: MatDialogRef<ConfirmDialogComponent> =
          this.dialog.open(ConfirmDialogComponent, config);
        dialogRef.componentInstance.title = this.translate.get(
          'GLOBAL.ENABLE_BETA_VERSIONS',
        );
        dialogRef.componentInstance.message = this.translate.get(
          'GLOBAL.BETA_VERSIONS_WARNING',
        );
        dialogRef.afterClosed().subscribe((e) => {
          cb(e);
        });
      });
    };
    this.element.nativeElement.setConfig = (config: ConfigModel) => {
      this.configService.setConfig(config);
    };
    this.element.nativeElement.clean = () => {
      this.ngzone.run(() => {
        this.clean();
      });
    };

    setTimeout(() => {
      AppService.Ls.getAll().then(() => {
        // Don't reinitialize as it clears data - just init tracker
        this.trackerService.initTracker();
      });

      // Force the creation of the overlay container
      // when reinstantiating the visualization component #32
      this.overlayContainer.createContainer();
    });
  }

  clean() {
    this.appdatas = undefined;
    this.appService.initialize();
  }
}
