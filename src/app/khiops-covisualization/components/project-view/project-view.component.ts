import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { AppConfig } from "src/environments/environment";
import { AppService } from "@khiops-covisualization/providers/app.service";
import { SelectableTabComponent } from "@khiops-library/components/selectable-tab/selectable-tab.component";
import { InfosDatasI } from "@khiops-library/interfaces/infos-datas";

@Component({
	selector: "app-project-view",
	templateUrl: "./project-view.component.html",
	styleUrls: ["./project-view.component.scss"],
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
	tabIndex = 0;

	constructor(private appService: AppService) {
		super();
		this.initialize();
	}
	public initialize() {
		this.appDatas = this.appService.getDatas();
		if (this.appDatas.datas) {
			this.projectSummaryDatas = this.appService.getProjectSummaryDatas();
		}
	}

	ngOnInit() {
		this.onFileLoaderDataChangedCb = (obj) =>
			this.projectFileChanged.emit(obj);

	}

}
