import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppConfig } from 'src/environments/environment';
import { AppService } from '@khiops-visualization/providers/app.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { ProjectDatasService } from '@khiops-visualization/providers/project-datas.service';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent
  extends SelectableTabComponent
  implements OnInit
{
  @Output() projectFileChanged: EventEmitter<any> = new EventEmitter<any>();

  appDatas: any;
  onFileLoaderDataChangedCb: Function;
  sizes: any;
  isElectron: boolean = false;

  // managed by selectable-tab component
  override tabIndex = 0;

  debugFile = AppConfig.debugFile;

  constructor(
    private appService: AppService,
    private configService: ConfigService,
    private trackerService: TrackerService,
    private layoutService: LayoutService,
    public projectDatasService: ProjectDatasService,
  ) {
    super();
    this.isElectron = this.configService.isElectron;

    this.initialize();
  }

  public initialize() {
    this.appDatas = this.appService.getDatas();

    if (this.appDatas.datas) {
      this.sizes = this.layoutService.getViewSplitSizes('projectView');
    }
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'project');
    this.onFileLoaderDataChangedCb = (obj) => this.projectFileChanged.emit(obj);
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
