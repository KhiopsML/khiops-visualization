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
@Component({
  selector: 'app-root-visualization',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
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
  ) {
    // Set LS_ID first before any initialization that uses localStorage
    AppService.Ls.setLsId(AppConfig.visualizationCommon.GLOBAL.LS_ID);
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
        this.clean();
        // @ts-ignore
        this.appdatas = {
          ...datas,
        };
        this.element.nativeElement.value = datas;
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
        this.appService.initialize();
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
