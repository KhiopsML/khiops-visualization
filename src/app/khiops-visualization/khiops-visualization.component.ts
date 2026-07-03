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
  ChangeDetectionStrategy,
} from '@angular/core';

import { AppService } from './providers/app.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { SaveService } from './providers/save.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { VisualizationDatas } from './interfaces/app-datas.interface';
import { ConfigModel } from '@khiops-library/model/config.model';
import { InAppOverlayContainer } from '@khiops-library/overlay/in-app-overlay-provider';
import { AppConfig } from '../../environments/environment';
import { BaseDragDropComponent } from '@khiops-library/components/base-drag-drop/base-drag-drop.component';
import { UtilsService } from '../khiops-library/providers/utils.service';
import { CopyDatasService } from '@khiops-library/providers/copy.datas.service';
import { CopyImageService } from '@khiops-library/providers/copy.image.service';
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
import { DialogService } from '@khiops-library/providers/dialog.service';
import { TargetLiftGraphService } from './components/commons/target-lift-graph/target-lift-graph.service';
import { TreeHyperService } from './components/commons/tree-hyper/tree-hyper.service';
import { HistogramService } from './components/commons/histogram/histogram.service';
import { HistogramUIService } from './components/commons/histogram/histogram.ui.service';
import { HistogramRendererService } from './components/commons/histogram/histogram-renderer.service';
import { CooccurrenceMatrixConfigService } from './components/commons/cooccurrence-matrix/cooccurrence-matrix-config.service';
import { TreePreparationStore } from './stores/tree-preparation.store';

@Component({
  selector: 'app-root-visualization',
  styleUrls: ['./khiops-visualization.component.scss'],
  templateUrl: './khiops-visualization.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
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
    TargetLiftGraphService,
    TreeHyperService,
    HistogramService,
    HistogramUIService,
    HistogramRendererService,
    CooccurrenceMatrixConfigService,

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
    { provide: OverlayContainer, useClass: InAppOverlayContainer },
    Overlay,

    // NgRx ComponentStore - provided at component level for multi-instance support
    TreePreparationStore,
  ],
})
export class AppComponent
  extends BaseDragDropComponent
  implements AfterViewInit
{
  appdatas: VisualizationDatas | undefined;

  @ViewChild('appElement', {
    static: false,
  })
  appElement: ElementRef<HTMLElement> | undefined;

  constructor(
    private overlayContainer: InAppOverlayContainer,
    ngzone: NgZone,
    private appService: AppService,
    configService: ConfigService,
    private saveService: SaveService,
    private trackerService: TrackerService,
    fileLoaderService: FileLoaderService,
    private element: ElementRef,
    private copyImageService: CopyImageService,
    private copyDatasService: CopyDatasService,
    private ls: Ls,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    super(ngzone, fileLoaderService, configService);
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

    // Force the creation of the overlay container early so dialogs can be displayed
    this.overlayContainer.createContainer();

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
        this.appService.setFileDatas(datas);
        this.fileLoaderService.setDatas(datas);
      });
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

    this.element.nativeElement.openSaveBeforeQuitDialog = (cb: Function) => {
      // For visualization component, quit directly without confirmation
      cb('reject');
    };
    this.element.nativeElement.setConfig = (config: ConfigModel) => {
      AppService.Ls.setLsId(
        config.lsId ||
          AppConfig.visualizationCommon.GLOBAL.LS_ID ||
          'KHIOPS_VISUALIZATION_',
      );

      this.configService.setConfig(config);

      AppService.Ls.getAll().then(() => {
        this.trackerService.initTracker();
      });

      // Force the creation of the overlay container
      // when reinstantiating the visualization component #32
      this.overlayContainer.createContainer();
    };

    // Called by the desktop when this tab becomes active.
    // Restores the per-tab Ls reference and re-applies this tab's settings to AppConfig.
    this.element.nativeElement.activate = () => {
      AppService.Ls = this.ls;
      this.appService.initGlobalConfigVariables();
    };
    this.element.nativeElement.clean = () => {
      this.ngzone.run(() => {
        this.clean();
      });
    };

    this.element.nativeElement.constructDatasToSave = () => {
      return this.saveService.constructDatasToSave();
    };

    // Auto-save settings to Electron storage when changed
    this.khiopsLibraryService.saveFileRequested$.subscribe(() => {
      const settings: Record<string, any> = {
        SETTING_NUMBER_PRECISION: AppService.Ls.get('SETTING_NUMBER_PRECISION'),
        SETTING_MATRIX_CONTRAST: AppService.Ls.get('SETTING_MATRIX_CONTRAST'),
        SETTING_AUTO_SCALE: AppService.Ls.get('SETTING_AUTO_SCALE'),
        SETTING_AUTO_SCALE_FACTOR: AppService.Ls.get(
          'SETTING_AUTO_SCALE_FACTOR',
        ),
        DISTRIBUTION_GRAPH_OPTION_X: AppService.Ls.get(
          'DISTRIBUTION_GRAPH_OPTION_X',
        ),
        DISTRIBUTION_GRAPH_OPTION_Y: AppService.Ls.get(
          'DISTRIBUTION_GRAPH_OPTION_Y',
        ),
      };
      this.element.nativeElement.dispatchEvent(
        new CustomEvent('save-file-requested', {
          bubbles: true,
          detail: settings,
        }),
      );
    });
  }

  clean() {
    this.appdatas = undefined;
    // Don't preserve data when explicitly cleaning
    this.appService.initialize(false);
  }
}
