import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/environments/environment';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { ProjectDatasService } from '@khiops-visualization/providers/project-datas.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { Subscription } from 'rxjs';
import { SplitGutterInteractionEvent } from 'angular-split';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent
  extends SelectableTabComponent
  implements OnInit
{
  private fileLoadedSub?: Subscription;

  public sizes: any;
  public isElectron: boolean = false;
  public debugFile = AppConfig.debugFile;

  // managed by selectable-tab component
  public override tabIndex = 0;

  constructor(
    private fileLoaderService: FileLoaderService,
    private configService: ConfigService,
    private trackerService: TrackerService,
    private layoutService: LayoutService,
    public projectDatasService: ProjectDatasService,
  ) {
    super();
    this.isElectron = this.configService.isElectron;
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'project');
  }

  ngAfterViewInit() {
    this.fileLoadedSub = this.fileLoaderService.fileLoaded$.subscribe(
      (datas) => {
        if (datas) {
          this.sizes = this.layoutService.getViewSplitSizes('projectView');
        }
      },
    );
  }

  ngOnDestroy(): void {
    this.fileLoadedSub?.unsubscribe();
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'projectView',
    );
  }
}
