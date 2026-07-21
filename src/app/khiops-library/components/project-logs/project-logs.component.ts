/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns.interface';
import { ProjectLogModel } from '@khiops-library/model/project-log.model';
import { TranslateService } from '@ngstack/translate';
import { GravityCellComponent } from './gravity-cell/gravity-cell.component';

@Component({
  selector: 'kl-project-logs',
  templateUrl: './project-logs.component.html',
  styleUrls: ['./project-logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProjectLogsComponent {
  @Input() public projectLogsDatas?: ProjectLogModel[];

  public logsTitle: string;
  public logsDisplayedColumns: GridColumnsI[] = [];

  constructor(private translate: TranslateService) {
    this.logsTitle = this.translate.get('GLOBAL.LOGS');

    this.logsDisplayedColumns = [
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
    ];
  }
}
