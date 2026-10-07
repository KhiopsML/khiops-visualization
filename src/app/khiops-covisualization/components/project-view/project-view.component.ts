/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProjectDatasService } from '@khiops-covisualization/providers/project-datas.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { ProjectLogModel } from '@khiops-library/model/project-log.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectViewComponent
  extends SelectableTabComponent
  implements OnInit
{
  // managed by selectable-tab component
  override tabIndex = 0;
  public projectLogsDatas?: ProjectLogModel[];
  private fileLoadedSub?: Subscription;

  constructor(
    private trackerService: TrackerService,
    private fileLoaderService: FileLoaderService,
    public projectDatasService: ProjectDatasService,
  ) {
    super();
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'project');
  }

  ngAfterViewInit() {
    this.fileLoadedSub = this.fileLoaderService.fileLoaded$.subscribe(
      (datas) => {
        if (datas) {
          this.projectLogsDatas =
            this.projectDatasService.getProjectLogsDatas();
        }
      },
    );
  }

  ngOnDestroy(): void {
    this.fileLoadedSub?.unsubscribe();
  }
}
