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
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AppService } from './providers/app.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TreenodesService } from './providers/treenodes.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { CovisualizationDatas } from './interfaces/app-datas';
import { ConfigModel } from '@khiops-library/model/config.model';
import { SaveService } from './providers/save.service';
import { InAppOverlayContainer } from '@khiops-library/overlay/in-app-overlay-provider';
import { AppConfig } from '../../environments/environment';

@Component({
  selector: 'app-root-covisualization',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
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
  ) {
    // Set LS_ID first before any initialization that uses localStorage
    AppService.Ls.setLsId(AppConfig.covisualizationCommon.GLOBAL.LS_ID);
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
        this.appdatas = {
          ...datas,
        };
        this.element.nativeElement.value = datas;
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
      AppService.Ls.setLsId(config.lsId);
      this.configService.setConfig(config);

      AppService.Ls.getAll().then(() => {
        // Initialize with preserveData=true to avoid clearing existing app data
        this.appService.initialize(true);
        this.trackerService.initTracker();
      });

      // Force the creation of the overlay container
      // when reinstantiating the visualization component #32
      this.overlayContainer.createContainer();
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
  }
}
