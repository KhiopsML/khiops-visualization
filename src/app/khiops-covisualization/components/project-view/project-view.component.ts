import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent
  extends SelectableTabComponent
  implements OnInit
{
  @Output() projectFileChanged: EventEmitter<any> = new EventEmitter();

  appDatas: any;
  projectSummaryDatas: InfosDatasI[];
  onFileLoaderDataChangedCb: Function;
  appName = 'khiops-covisualization';

  // managed by selectable-tab component
  override tabIndex = 0;
  isElectron: boolean = false;

  constructor(
    private appService: AppService,
    private trackerService: TrackerService,
    private configService: ConfigService,
  ) {
    super();
    this.isElectron = this.configService.getConfig().appSource === 'ELECTRON';

    this.initialize();
  }
  public initialize() {
    this.appDatas = this.appService.getDatas();
    if (this.appDatas.datas) {
      this.projectSummaryDatas = this.appService.getProjectSummaryDatas();
    }
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'project');
    this.onFileLoaderDataChangedCb = (obj) => this.projectFileChanged.emit(obj);
  }
}
