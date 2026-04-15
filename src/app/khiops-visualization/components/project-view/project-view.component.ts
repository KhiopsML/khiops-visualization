/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit, Type } from '@angular/core';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ProjectDatasService } from '@khiops-visualization/providers/project-datas.service';
import { DockviewReadyEvent } from 'dockview-angular';
import { AppConfig } from '../../../../environments/environment';
import { ProjectSummaryPanelComponent } from './panels/project-summary-panel.component';
import { FileLoaderPanelComponent } from './panels/file-loader-panel.component';
import { ProjectLogsPanelComponent } from './panels/project-logs-panel.component';
import { themeLightSpaced } from 'dockview-core';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
  standalone: false,
})
export class ProjectViewComponent
  extends SelectableTabComponent
  implements OnInit
{
  public isElectron: boolean = false;
  public debugFile = AppConfig.debugFile;
  public showOpenFileBtn: boolean | undefined = false;

  public override tabIndex = 0;

  public dockviewComponents: Record<string, Type<any>> = {
    projectSummary: ProjectSummaryPanelComponent,
    fileLoader: FileLoaderPanelComponent,
    projectLogs: ProjectLogsPanelComponent,
  };

  constructor(
    private configService: ConfigService,
    private trackerService: TrackerService,
    public projectDatasService: ProjectDatasService,
  ) {
    super();
    this.isElectron = this.configService.isElectron;
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'project');
    this.showOpenFileBtn = this.configService.getConfig().showOpenFileBtn;
  }

  onDockviewReady(event: DockviewReadyEvent) {
    // Apply theme with custom gap via updateOptions (theme is not an Angular @Input)
    event.api.updateOptions({
      theme: { ...themeLightSpaced, gap: 10 },
      tabAnimation: 'default',
    });
    const summaryPanel = event.api.addPanel({
      id: 'project-summary',
      component: 'projectSummary',
      initialWidth: 500,
      title: 'Project Summary',
    });

    if ((this.debugFile && !this.isElectron) || this.showOpenFileBtn) {
      event.api.addPanel({
        id: 'file-loader',
        component: 'fileLoader',
        title: 'Load Data',
        position: { referencePanel: summaryPanel, direction: 'right' },
        maximumWidth: 200,
      });
    }

    event.api.addPanel({
      id: 'project-logs',
      component: 'projectLogs',
      title: 'Logs',
      position: { referencePanel: summaryPanel, direction: 'below' },
      initialHeight: 300,
    });
  }
}
