import {
	Component,
	EventEmitter,
	OnInit,
	Output
} from "@angular/core";
import {
	AppConfig
} from "src/environments/environment";
import {
	AppService
} from "@khiops-visualization/providers/app.service";
import pjson from "package.json";
import {
	SelectableTabComponent
} from "@khiops-library/components/selectable-tab/selectable-tab.component";
import {
	TranslateService
} from "@ngstack/translate";
import {
	GridColumnsI
} from "@khiops-library/interfaces/grid-columns";
import {
	KhiopsLibraryService
} from "@khiops-library/providers/khiops-library.service";
import {
	ProjectLogVO
} from "@khiops-visualization/model/project-log-vo";
import { ProjectSummaryVO } from "@khiops-visualization/model/project-summary-vo";

@Component({
	selector: "app-project-view",
	templateUrl: "./project-view.component.html",
	styleUrls: ["./project-view.component.scss"],
})
export class ProjectViewComponent
extends SelectableTabComponent
implements OnInit {
	@Output() projectFileChanged: EventEmitter < any > = new EventEmitter < any > ();

	appDatas: any;
	projectSummaryDatas: ProjectSummaryVO;
	projectLogsDatas: ProjectLogVO[];
	onFileLoaderDataChangedCb: Function;
	appName = 'khiops-visualization';
	logsTitle: string;
	sizes: any;

	// managed by selectable-tab component
	tabIndex = 0;
	tabConfig = AppConfig.visualizationCommon.HOME;

	debugFile = AppConfig.debugFile;

	logsDisplayedColumns: GridColumnsI[] = [{
			headerName: "Task",
			field: "task",
		},
		{
			headerName: "Message",
			field: "message",
		},
	];

	constructor(
		private appService: AppService,
		private translate: TranslateService,
		private khiopsLibraryService: KhiopsLibraryService
	) {
		super();
		this.initialize();
	}

	public initialize() {
		this.appDatas = this.appService.getDatas();

		if (this.appDatas.datas) {
			this.sizes = this.appService.getViewSplitSizes("projectView");

			this.logsTitle = this.translate.get("GLOBAL.LOGS");
			this.projectSummaryDatas = this.appService.getProjectSummaryDatas();
			this.projectLogsDatas = this.appService.getProjectLogsDatas();
		}
	}

	ngOnInit() {
		this.khiopsLibraryService.trackEvent("page_view", "project");
		this.onFileLoaderDataChangedCb = (obj) =>
			this.projectFileChanged.emit(obj);
	}

	onSplitDragEnd(event: any, item: any) {
		this.appService.resizeAndSetSplitSizes(
			item,
			this.sizes,
			event.sizes,
			"projectView"
		);
	}

}
