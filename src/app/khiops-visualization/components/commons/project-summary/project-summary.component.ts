import { Component } from '@angular/core';
import { ProjectDatasService } from '@khiops-visualization/providers/project-datas.service';
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
  projectSummaryDatas: InfosDatasI[];

  constructor(
    private fileLoaderService: FileLoaderService,
    private projectDatasService: ProjectDatasService,
  ) {}

  ngAfterViewInit() {
    this.fileLoadedSub = this.fileLoaderService.fileLoaded$.subscribe(() => {
      this.projectSummaryDatas =
        this.projectDatasService.getProjectSummaryDatas();
    });
  }

  ngOnDestroy(): void {
    this.fileLoadedSub?.unsubscribe();
  }
}
