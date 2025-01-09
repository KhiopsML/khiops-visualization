/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { TranslateService } from '@ngstack/translate';
import { EventsService } from '@khiops-covisualization/providers/events.service';

@Component({
  selector: 'app-load-ext-datas',
  templateUrl: './load-ext-datas.component.html',
  styleUrls: ['./load-ext-datas.component.scss'],
})
export class LoadExtDatasComponent implements OnInit {
  loadingDatasStatus: string = '';
  loadingDatasPercent = 0;

  constructor(
    private eventsService: EventsService,
    private importExtDatasService: ImportExtDatasService,
    public translate: TranslateService,
    private dialogRef: MatDialogRef<LoadExtDatasComponent>,
  ) {}

  ngOnInit() {
    this.importExtDatasService
      .loadSavedExternalDatas((e: any, percent: any) => {
        this.loadingDatasPercent = percent;
        this.loadingDatasStatus = e;
      })
      .then((e) => {
        this.eventsService.emitImportedDatasChanged(e);
        this.dialogRef.close();
      });
  }
}
