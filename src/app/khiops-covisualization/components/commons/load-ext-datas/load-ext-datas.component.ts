import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from '@khiops-covisualization/providers/events.service';

@Component({
  selector: 'app-load-ext-datas',
  templateUrl: './load-ext-datas.component.html',
  styleUrls: ['./load-ext-datas.component.scss'],
})
export class LoadExtDatasComponent implements OnInit {
  loadingDatasStatus: string;
  loadingDatasPercent = 0;

  constructor(
    private eventsService: EventsService,
    private importExtDatasService: ImportExtDatasService,
    public translate: TranslateService,
    private dialogRef: MatDialogRef<LoadExtDatasComponent>,
  ) {}

  ngOnInit() {
    this.importExtDatasService
      .loadSavedExternalDatas((e, percent) => {
        this.loadingDatasPercent = percent;
        this.loadingDatasStatus = e;
      })
      .then((e) => {
        this.eventsService.emitImportedDatasChanged(e);
        this.dialogRef.close();
      });
  }
}
