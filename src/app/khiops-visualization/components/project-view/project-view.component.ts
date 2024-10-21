import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppConfig } from 'src/environments/environment';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { ProjectDatasService } from '@khiops-visualization/providers/project-datas.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { Subscription } from 'rxjs';

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
  @Output() projectFileChanged: EventEmitter<any> = new EventEmitter<any>();

  appDatas: any;
  onFileLoaderDataChangedCb: Function;
  sizes: any;
  isElectron: boolean = false;

  // managed by selectable-tab component
  override tabIndex = 0;

  debugFile = AppConfig.debugFile;

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
    this.onFileLoaderDataChangedCb = (obj) => this.projectFileChanged.emit(obj);
  }

  ngAfterViewInit() {
    this.fileLoadedSub = this.fileLoaderService.fileLoaded$.subscribe(() => {
      this.sizes = this.layoutService.getViewSplitSizes('projectView');
    });
  }

  ngOnDestroy(): void {
    this.fileLoadedSub?.unsubscribe();
  }

  onSplitDragEnd(event: any, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'projectView',
    );
  }
}
