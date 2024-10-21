import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ProjectDatasService } from '@khiops-covisualization/providers/project-datas.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
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

  onFileLoaderDataChangedCb: Function;

  // managed by selectable-tab component
  override tabIndex = 0;
  isElectron: boolean = false;

  constructor(
    private trackerService: TrackerService,
    private configService: ConfigService,
    public projectDatasService: ProjectDatasService,
  ) {
    super();
    this.isElectron = this.configService.isElectron;
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'project');
    this.onFileLoaderDataChangedCb = (obj) => this.projectFileChanged.emit(obj);
  }
}
