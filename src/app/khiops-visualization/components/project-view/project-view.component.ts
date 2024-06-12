import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppConfig } from 'src/environments/environment';
import { AppService } from '@khiops-visualization/providers/app.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { TranslateService } from '@ngstack/translate';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ProjectLogVO } from '@khiops-library/model/project-log-vo';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';

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
  projectSummaryDatas: InfosDatasI[];
  projectLogsDatas: ProjectLogVO[];
  onFileLoaderDataChangedCb: Function;
  appName = 'khiops-visualization';
  logsTitle: string;
  sizes: any;

  // managed by selectable-tab component
  override tabIndex = 0;

  debugFile = AppConfig.debugFile;

  logsDisplayedColumns: GridColumnsI[] = [
    {
      headerName: this.translate.get('GLOBAL.TASK'),
      field: 'task',
    },
    {
      headerName: this.translate.get('GLOBAL.MESSAGE'),
      field: 'message',
    },
  ];

  constructor(
    private appService: AppService,
    private translate: TranslateService,
    private trackerService: TrackerService,
  ) {
    super();
    this.initialize();
  }

  public initialize() {
    this.appDatas = this.appService.getDatas();

    if (this.appDatas.datas) {
      this.sizes = this.appService.getViewSplitSizes('projectView');

      this.logsTitle = this.translate.get('GLOBAL.LOGS');
      this.projectSummaryDatas = this.appService.getProjectSummaryDatas();
      this.projectLogsDatas = this.appService.getProjectLogsDatas();
    }
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'project');
    this.onFileLoaderDataChangedCb = (obj) => this.projectFileChanged.emit(obj);
  }

  onSplitDragEnd(event: any, item: string) {
    this.appService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'projectView',
    );
  }
}
