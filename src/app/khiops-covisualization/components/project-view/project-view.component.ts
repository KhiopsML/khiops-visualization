/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit } from '@angular/core';
import { ProjectDatasService } from '@khiops-covisualization/providers/project-datas.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { AppConfig } from '../../../../environments/environment';

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
  // managed by selectable-tab component
  override tabIndex = 0;
  isElectron: boolean = false;
  public debugFile = AppConfig.debugFile;
  public showOpenFileBtn: boolean | undefined = false;

  constructor(
    private trackerService: TrackerService,
    private configService: ConfigService,
    public projectDatasService: ProjectDatasService,
  ) {
    super();
    this.isElectron = this.configService.isElectron;
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'project');
    this.showOpenFileBtn = this.configService.getConfig().showOpenFileBtn;
  }
}
