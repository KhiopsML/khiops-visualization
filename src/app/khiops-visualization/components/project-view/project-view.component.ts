import {
	Component,
	OnInit
} from '@angular/core';
import {
	AppConfig
} from 'src/environments/environment';
import {
	AppService
} from '@khiops-visualization/providers/app.service';
import {
	DistributionDatasService
} from '@khiops-visualization/providers/distribution-datas.service';
import {
	ModelingDatasService
} from '@khiops-visualization/providers/modeling-datas.service';
import {
	EvaluationDatasService
} from '@khiops-visualization/providers/evaluation-datas.service';
import {
	PreparationDatasService
} from '@khiops-visualization/providers/preparation-datas.service';
import pjson from "package.json";
import {
	SelectableTabComponent
} from '@khiops-library/components/selectable-tab/selectable-tab.component';
import {
	Preparation2dDatasService
} from '@khiops-visualization/providers/preparation2d-datas.service';
import {
	TreePreparationDatasService
} from '@khiops-visualization/providers/tree-preparation-datas.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	GridColumnsI
} from '@khiops-library/interfaces/grid-columns';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';

@Component({
	selector: 'app-project-view',
	templateUrl: './project-view.component.html',
	styleUrls: ['./project-view.component.scss']
})
export class ProjectViewComponent extends SelectableTabComponent implements OnInit {

	appDatas: any;
	projectSummaryDatas: any[any];
	projectInformationsDatas: any[any];
	projectLogsDatas: any[any];
	onFileLoaderDataChangedCb: Function;
	appName: any;
	logsTitle: string;
	sizes: any;

	// managed by selectable-tab component
	tabIndex = 0;
	tabConfig = AppConfig.visualizationCommon.HOME;

	logsDisplayedColumns: GridColumnsI[] = [{
		headerName: 'Task',
		field: 'task'
	}, {
		headerName: 'Message',
		field: 'message'
	}];

	constructor(private appService: AppService,
		private translate: TranslateService,
		private khiopsLibraryService: KhiopsLibraryService,
		private distributionDatasService: DistributionDatasService,
		private modelingDatasService: ModelingDatasService,
		private evaluationDatasService: EvaluationDatasService,
		private treePreparationDatasService: TreePreparationDatasService,
		private preparationDatasService: PreparationDatasService,
		private preparation2dDatasService: Preparation2dDatasService) {

		super();
		this.initialize();
	}

	public initialize() {
		this.appDatas = this.appService.getDatas();

		if (this.appDatas.datas) {
			if (pjson) {
				this.appName = pjson.name;
			}
			this.sizes = this.appService.getViewSplitSizes('projectView');

			this.logsTitle = this.translate.get('GLOBAL.LOGS');
			this.projectSummaryDatas = this.appService.getProjectSummaryDatas();
			this.projectLogsDatas = this.appService.getProjectLogsDatas();
			this.projectInformationsDatas = this.appService.getProjectInformationsDatas();
		}

	}

	ngOnInit() {
		this.khiopsLibraryService.trackEvent('page_view', 'project');
		this.onFileLoaderDataChangedCb = obj => this.onFileLoaderDataChanged(obj);
	}

	onSplitDragEnd(event: any, item: any) {
		this.appService.resizeAndSetSplitSizes(item, this.sizes, event.sizes, 'projectView');
	}

	onFileLoaderDataChanged(datas) {

		this.appService.setFileDatas(datas);

		if (datas) {
			this.preparationDatasService.initialize();
			this.treePreparationDatasService.initialize();
			this.preparation2dDatasService.initialize();
			this.distributionDatasService.initialize();
			this.evaluationDatasService.initialize();
			this.modelingDatasService.initialize();
		}
		this.initialize();

	}

}
