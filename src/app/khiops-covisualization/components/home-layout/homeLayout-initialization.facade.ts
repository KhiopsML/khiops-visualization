/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../../environments/environment';
import { CovisualizationDatas } from '@khiops-covisualization/interfaces/app-datas.interface';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { ViewManagerService } from '@khiops-covisualization/providers/view-manager.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { LoadExtDatasComponent } from '../commons/load-ext-datas/load-ext-datas.component';

export interface HomeInitializationState {
  isCompatibleJson: boolean;
  isContextDimensions: boolean;
  selectTabName: string | undefined;
  showLogo: boolean | undefined;
  showProjectTab: boolean | undefined;
}

@Injectable()
export class HomeInitializationFacade {
  private static readonly SNACK_SUCCESS_DURATION_MS = 2000;
  private static readonly SNACK_ERROR_DURATION_MS = 4000;
  private static readonly SNACK_WARNING_DURATION_MS = 10000;

  constructor(
    private configService: ConfigService,
    private appService: AppService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private importExtDatasService: ImportExtDatasService,
    private dimensionsDatasService: DimensionsDatasService,
    private viewManagerService: ViewManagerService,
    private treenodesService: TreenodesService,
    private eventsService: EventsService,
    private dialogService: DialogService,
  ) {}

  initialize(datas: CovisualizationDatas | undefined): void {
    this.appService.setFileDatas(datas);
  }

  initializeHome(
    datas: CovisualizationDatas | undefined,
    closeFile: () => void,
  ): HomeInitializationState {
    // Close dialogs when opening new file #148
    this.dialogService.closeDialog();

    const isCompatibleJson = this.appService.isCompatibleJson(datas!);
    const isCollidingJson = this.appService.isCollidingJson(datas!);

    this.appService.resetSearch();

    let showProjectTab = this.configService.getConfig().showProjectTab;
    if (showProjectTab === undefined) {
      showProjectTab = true;
    }
    let showLogo = this.configService.getConfig().showLogo;
    if (showLogo === undefined) {
      showLogo = true;
    }
    const selectTabName = this.configService.getConfig().selectTabName;

    if (datas && !UtilsService.isEmpty(datas)) {
      const basename = UtilsService.getFileBasename(datas);
      if (!isCompatibleJson) {
        closeFile();
        this.snackBar.open(
          basename
            ? this.translate.get('SNACKS.FILE_OPEN_ERROR', {
                filename: basename,
              })
            : this.translate.get('SNACKS.OPEN_FILE_ERROR'),
          undefined,
          {
            duration: HomeInitializationFacade.SNACK_ERROR_DURATION_MS,
            panelClass: 'error',
          },
        );
      } else {
        this.snackBar.open(
          basename
            ? this.translate.get('SNACKS.FILE_LOADED', { filename: basename })
            : this.translate.get('SNACKS.DATAS_LOADED'),
          undefined,
          {
            duration: HomeInitializationFacade.SNACK_SUCCESS_DURATION_MS,
            panelClass: 'success',
          },
        );
      }
      if (isCollidingJson) {
        this.snackBar.open(
          this.translate.get('SNACKS.COLLIDING_FILE'),
          undefined,
          {
            duration: HomeInitializationFacade.SNACK_WARNING_DURATION_MS,
            panelClass: 'warning',
          },
        );
      }
    }

    return {
      isCompatibleJson,
      isContextDimensions: this.initializeServices(),
      selectTabName,
      showLogo,
      showProjectTab,
    };
  }

  /**
   * Initializes domain services after data and configuration are ready.
   */
  initializeServices(): boolean {
    this.dimensionsDatasService.initialize();
    this.importExtDatasService.initExtDatasFiles();
    // Loading local files is forbidden in js
    if (this.configService.isElectron) {
      this.openLoadExternalDataDialog();
    }
    return this.dimensionsDatasService.isContextDimensions();
  }

  subscribeToImportedDatasChanges(): Subscription {
    return this.eventsService.importedDatasChanged.subscribe((event: unknown) => {
      const dimensionName = this.getFirstImportedDimensionName(event);
      if (!dimensionName) {
        return;
      }

      this.dimensionsDatasService.constructDimensionsTrees();
      const dimIndex =
        this.dimensionsDatasService.getDimensionPositionFromName(dimensionName);
      const selectedDimension =
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions[dimIndex];
      const selectedNode =
        this.dimensionsDatasService.dimensionsDatas.selectedNodes[dimIndex];

      if (selectedDimension && selectedNode) {
        // Update selected nodes ext datas
        this.treenodesService.setSelectedNode(
          selectedDimension.name,
          selectedNode._id,
          false,
        );
        // Enable ext datas view if not displayed
        this.viewManagerService.enableExtDatasView(dimensionName);
      }
    });
  }

  private getFirstImportedDimensionName(event: unknown): string | undefined {
    if (!Array.isArray(event)) {
      return undefined;
    }

    const firstDimensionName = event[0];
    return typeof firstDimensionName === 'string'
      ? firstDimensionName
      : undefined;
  }

  private openLoadExternalDataDialog(): void {
    this.dialogService.openDialog(LoadExtDatasComponent, {
      width: AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH,
      maxWidth: AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH,
      height: '500px',
      disableClose: true,
      hidden: true,
    });
  }
}
