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
import { AppConfig } from 'src/environments/environment';
import { LS } from '@khiops-library/enum/ls';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { THEME } from '@khiops-library/enum/theme';
import { VisualizationDatas } from './interfaces/app-datas';
import { ConfigModel } from '@khiops-library/model/config.model';

@Component({
  selector: 'app-root-visualization',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class AppComponent implements AfterViewInit {
  appdatas: VisualizationDatas | undefined;

  @ViewChild('appElement', {
    static: false,
  })
  appElement: ElementRef<HTMLElement> | undefined;

  theme: string;

  constructor(
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
    AppService.Ls.setLsId(AppConfig.visualizationCommon.GLOBAL.LS_ID);
    this.theme = AppService.Ls.get(LS.THEME_COLOR) || THEME.LIGHT;
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
      this.trackerService.initTracker();
    };
    this.element.nativeElement.clean = () => {
      this.ngzone.run(() => {
        this.clean();
      });
    };
    this.setTheme();
  }

  clean() {
    this.appdatas = undefined;
    this.appService.initialize();
  }

  setTheme() {
    setTimeout(() => {
      let themeColor = AppService.Ls.get(LS.THEME_COLOR, THEME.LIGHT);
      document.documentElement.setAttribute('data-color-scheme', themeColor);
      this.configService?.getConfig()?.onThemeChanged?.(themeColor);
    });
  }
}
