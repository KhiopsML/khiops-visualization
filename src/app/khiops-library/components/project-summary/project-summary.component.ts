import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';

@Component({
  selector: 'app-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss'],
})
export class ProjectSummaryComponent {
  private fileLoadedSub?: Subscription;
  @Input() private projectDatasService: any;
  public projectSummaryDatas: InfosDatasI[];

  constructor(private fileLoaderService: FileLoaderService) {}

  ngAfterViewInit() {
    this.fileLoadedSub = this.fileLoaderService.fileLoaded$.subscribe(
      (datas) => {
        if (datas) {
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
