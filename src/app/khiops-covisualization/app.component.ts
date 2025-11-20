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
import { ConfirmDialogComponent } from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngstack/translate';
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { AppService } from './providers/app.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { AppConfig } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TreenodesService } from './providers/treenodes.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { CovisualizationDatas } from './interfaces/app-datas';
import { ConfigModel } from '@khiops-library/model/config.model';
import { SaveService } from './providers/save.service';
import { InAppOverlayContainer } from '@khiops-library/overlay/in-app-overlay-provider';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { Ls } from '@khiops-library/providers/ls.service';
import { DimensionsDatasService } from './providers/dimensions-datas.service';
import { ProjectDatasService } from './providers/project-datas.service';
import { EventsService } from './providers/events.service';
import { ViewManagerService } from './providers/view-manager.service';
import { ImportExtDatasService } from './providers/import-ext-datas.service';

@Component({
  selector: 'app-root-covisualization',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
  providers: [
    AppService,
    SaveService,
    FileLoaderService,
    ConfigService,
    TreenodesService,
    InAppOverlayContainer,
    LayoutService,
    KhiopsLibraryService,
    Ls,
    DimensionsDatasService,
    ProjectDatasService,
    EventsService,
    ViewManagerService,
    ImportExtDatasService,
  ],
})
export class AppComponent implements AfterViewInit {
  appdatas: CovisualizationDatas | undefined;

  @ViewChild('appElement', {
    static: false,
  })
  appElement: ElementRef<HTMLElement> | undefined;

  constructor(
    private overlayContainer: InAppOverlayContainer,
    private ngzone: NgZone,
    private dialogRef: MatDialog,
    private appService: AppService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private trackerService: TrackerService,
    private configService: ConfigService,
    private translate: TranslateService,
    private fileLoaderService: FileLoaderService,
    private treenodesService: TreenodesService,
    private saveService: SaveService,
    private element: ElementRef,
    private ls: Ls,
  ) {
    // Set LS_ID with unique instance identifier to prevent collision between tabs
    const instanceId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const lsId = `${AppConfig.covisualizationCommon.GLOBAL.LS_ID}_${instanceId}`;
    this.ls.setLsId(lsId);
    AppService.Ls = this.ls;
    // Now we can safely initialize the app service
    this.appService.initialize();
  }

  ngAfterViewInit(): void {
    this.configService.setRootElement(this.appElement);
    this.element.nativeElement.getDatas = () =>
      this.saveService.constructDatasToSave();
    this.element.nativeElement.setDatas = (datas: CovisualizationDatas) => {
      // Set data into ngzone to detect change into another context (electron for instance)
      this.ngzone.run(() => {
        // Don't clean, just set the new data
        this.appdatas = {
          ...datas,
        };
        this.element.nativeElement.value = datas;
        // Set data to both services - appService manages the data state
        this.appService.setFileDatas(datas);
        this.fileLoaderService.setDatas(datas);
      });
    };
    this.element.nativeElement.openSaveBeforeQuitDialog = (cb: Function) => {
      this.dialogRef.closeAll();
      this.ngzone.run(() => {
        const config = new MatDialogConfig();
        const dialogRef: MatDialogRef<ConfirmDialogComponent> =
          this.dialog.open(ConfirmDialogComponent, config);
        dialogRef.componentInstance.message = this.translate.get(
          'GLOBAL.SAVE_BEFORE_QUIT',
        );
        dialogRef.componentInstance.displayRejectBtn = true;

        dialogRef.afterClosed().subscribe((e) => {
          cb(e);
        });
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
    this.element.nativeElement.constructDatasToSave = () => {
      return this.saveService.constructDatasToSave();
    };
    this.element.nativeElement.constructPrunedDatasToSave = () => {
      const collapsedNodes = this.treenodesService.getSavedCollapsedNodes();
      // #142 Remove collapsed nodes because datas are truncated
      return this.saveService.constructSavedJson(collapsedNodes, true);
    };
    this.element.nativeElement.setConfig = (config: ConfigModel) => {
      this.configService.setConfig(config);
    };
    this.element.nativeElement.snack = (
      title: string,
      duration: number,
      panelClass: string,
    ) => {
      this.ngzone.run(() => {
        this.snackBar.open(title, undefined, {
          duration: duration,
          panelClass: panelClass,
        });
      });
    };
    this.element.nativeElement.clean = () => (this.appdatas = undefined);

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
}
