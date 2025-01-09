/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ProjectLogModel } from '@khiops-library/model/project-log.model';
import { ProjectDatasService } from '@khiops-visualization/providers/project-datas.service';
import { TranslateService } from '@ngstack/translate';
import { Subscription } from 'rxjs';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';

@Component({
  selector: 'app-project-logs',
  templateUrl: './project-logs.component.html',
  styleUrls: ['./project-logs.component.scss'],
})
export class ProjectLogsComponent {
  public projectLogsDatas?: ProjectLogModel[];
  public logsTitle: string;
  public logsDisplayedColumns: GridColumnsI[] = [];
  private fileLoadedSub?: Subscription;

  constructor(
    private fileLoaderService: FileLoaderService,
    private projectDatasService: ProjectDatasService,
    private translate: TranslateService,
  ) {
    this.logsTitle = this.translate.get('GLOBAL.LOGS');

    this.logsDisplayedColumns = [
      {
        headerName: this.translate.get('GLOBAL.TASK'),
        field: 'task',
      },
      {
        headerName: this.translate.get('GLOBAL.MESSAGE'),
        field: 'message',
      },
    ];
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
