/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';

@Component({
    selector: 'app-project-summary',
    templateUrl: './project-summary.component.html',
    styleUrls: ['./project-summary.component.scss'],
    standalone: false
})
export class ProjectSummaryComponent implements OnInit {
  private fileLoadedSub?: Subscription;
  @Input() private projectDatasService: any;
  public projectSummaryDatas?: InfosDatasI[];

  constructor(private fileLoaderService: FileLoaderService) {}

  ngOnInit() {
    this.fileLoadedSub = this.fileLoaderService.fileLoaded$.subscribe(
      (datas) => {
        if (this.projectDatasService && datas) {
          this.projectSummaryDatas =
            this.projectDatasService.getProjectSummaryDatas();
        }
      },
    );
  }

  ngOnDestroy(): void {
    this.fileLoadedSub?.unsubscribe();
  }
}
