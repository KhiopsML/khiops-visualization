/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns.interface';
import { ProjectLogModel } from '@khiops-library/model/project-log.model';
import { ProjectDatasService } from '@khiops-visualization/providers/project-datas.service';
import { TranslateService } from '@ngstack/translate';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { GravityCellComponent } from './gravity-cell/gravity-cell.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { KhiopsLibraryModule } from '@khiops-library/khiops-library.module';

@Component({
  selector: 'app-project-logs',
  templateUrl: './project-logs.component.html',
  styleUrls: ['./project-logs.component.scss'],
  imports: [FlexLayoutModule, KhiopsLibraryModule],
})
export class ProjectLogsComponent {
  private readonly fileLoaderService = inject(FileLoaderService);
  private readonly projectDatasService = inject(ProjectDatasService);
  private readonly translate = inject(TranslateService);

  public readonly projectLogsDatas = signal<ProjectLogModel[] | undefined>(
    undefined,
  );
  public readonly logsTitle = signal(this.translate.get('GLOBAL.LOGS'));
  public readonly logsDisplayedColumns = signal<GridColumnsI[]>([
    {
      headerName: this.translate.get('GLOBAL.TASK'),
      field: 'task',
    },
    {
      headerName: this.translate.get('GLOBAL.GRAVITY'),
      field: 'gravity',
      cellRenderer: GravityCellComponent,
    },
    {
      headerName: this.translate.get('GLOBAL.MESSAGE'),
      field: 'message',
    },
  ]);

  constructor() {
    this.fileLoaderService.fileLoaded$
      .pipe(takeUntilDestroyed())
      .subscribe((datas) => {
        if (datas) {
          this.projectLogsDatas.set(
            this.projectDatasService.getProjectLogsDatas(),
          );
        }
      });
  }
}
