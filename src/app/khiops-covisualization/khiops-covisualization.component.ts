/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
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
import { AppService } from './providers/app.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TreenodesService } from './providers/treenodes.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { CovisualizationDatas } from './interfaces/app-datas.interface';
import { ConfigModel } from '@khiops-library/model/config.model';
import { SaveService } from './providers/save.service';
import { InAppOverlayContainer } from '@khiops-library/overlay/in-app-overlay-provider';
import { AppConfig } from '../../environments/environment';
import { BaseDragDropComponent } from '@khiops-library/components/base-drag-drop/base-drag-drop.component';
import { UtilsService } from '../khiops-library/providers/utils.service';
import { CopyDatasService } from '@khiops-library/providers/copy.datas.service';
import { CopyImageService } from '@khiops-library/providers/copy.image.service';
import { Ls } from '@khiops-library/providers/ls.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { AnnotationService } from './providers/annotation.service';
import { ClustersService } from './providers/clusters.service';
import { CompositionService } from './providers/composition.service';
import { DimensionsDatasService } from './providers/dimensions-datas.service';
import { EventsService } from './providers/events.service';
import { HierarchyService } from './providers/hierarchy.service';
import { ImportExtDatasService } from './providers/import-ext-datas.service';
import { ImportFileLoaderService } from '@khiops-library/components/import-file-loader/import-file-loader.service';
import { ProjectDatasService } from './providers/project-datas.service';
import { VariableSearchService } from './providers/variable-search.service';
import { ViewManagerService } from './providers/view-manager.service';
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { ConfirmDialogComponent } from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'app-root-covisualization',
  styleUrls: ['./khiops-covisualization.component.scss'],
  templateUrl: './khiops-covisualization.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
  providers: [
    AnnotationService,
    ClustersService,
    CompositionService,
    EventsService,
    HierarchyService,
    VariableSearchService,
    AppService,
    SaveService,
    TreenodesService,
    DimensionsDatasService,
    ProjectDatasService,
    ViewManagerService,
    ImportExtDatasService,
    ImportFileLoaderService,

    // Lib services
    ConfigService,
    CopyImageService,
    CopyDatasService,
    DialogService,
    FileLoaderService,
    Ls,
    KhiopsLibraryService,
    LayoutService,

    // Overlay
    InAppOverlayContainer,
    { provide: OverlayContainer, useExisting: InAppOverlayContainer },
    Overlay,
  ],
})
export class AppComponent
  extends BaseDragDropComponent
  implements AfterViewInit
{
  appdatas: CovisualizationDatas | undefined;

  @ViewChild('appElement', {
    static: false,
  })
  appElement: ElementRef<HTMLElement> | undefined;

  constructor(
    private overlayContainer: InAppOverlayContainer,
    ngzone: NgZone,
    private appService: AppService,
    private snackBar: MatSnackBar,
    private trackerService: TrackerService,
    private dialogService: DialogService,
    configService: ConfigService,
    private translate: TranslateService,
    fileLoaderService: FileLoaderService,
    private treenodesService: TreenodesService,
    private saveService: SaveService,
    private element: ElementRef,
    private copyImageService: CopyImageService,
    private copyDatasService: CopyDatasService,
    private ls: Ls,
  ) {
    super(ngzone, fileLoaderService, configService);
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

    // Force the creation of the overlay container early so dialogs can be displayed
    // This must be done before any dialog is opened (e.g., in openSaveBeforeQuitDialog)
    this.overlayContainer.createContainer();

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
      try {
        this.ngzone.run(() => {
          try {
            const dialogRef = this.dialogService.openDialog(
              ConfirmDialogComponent,
              {
                width: '400px',
                height: 'auto',
                disableClose: true,
              },
              {
                displayCancelBtn: true,
                displayRejectBtn: true,
                confirmTranslation: this.translate.get('GLOBAL.SAVE'),
                title: this.translate.get('GLOBAL.SAVE_BEFORE_QUIT'),
              },
            );
            dialogRef.afterClosed().subscribe((result) => {
              cb(result || 'reject');
            });
          } catch (error) {
            console.error('Error opening save confirmation dialog:', error);
            cb('reject');
          }
        });
      } catch (error) {
        console.error('Error in openSaveBeforeQuitDialog:', error);
        cb('reject');
      }
    };
    this.element.nativeElement.openChannelDialog = (cb: Function) => {
      this.ngzone.run(() => {
        setTimeout(() => {
          cb(true);
        }, 100);
      });
    };

    this.element.nativeElement.rightClick = (e: any, cb?: Function) => {
      UtilsService.processRightClick(e.x, e.y);
      cb && cb(e);
    };
    this.element.nativeElement.copyImage = (_e: any, _cb?: Function) => {
      this.copyImageService.copyImage();
    };
    this.element.nativeElement.copyDatas = (_e: any, _cb?: Function) => {
      this.copyDatasService.copyDatas();
    };

    this.element.nativeElement.constructDatasToSave = () => {
      return this.saveService.constructDatasToSave();
    };
    this.element.nativeElement.constructPrunedDatasToSave = () => {
      const collapsedNodes = this.treenodesService.getSavedCollapsedNodes();
      // #142 Remove collapsed nodes because datas are truncated
      return this.saveService.constructSavedJson(collapsedNodes);
    };
    this.element.nativeElement.setConfig = (config: ConfigModel) => {
      this.configService.setConfig(config);

      AppService.Ls.getAll().then(() => {
        // Don't reinitialize as it clears data - just init tracker
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
