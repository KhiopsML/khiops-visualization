import {
	Component,
	OnInit
} from '@angular/core';
import {
	AppConfig
} from 'src/environments/environment';
import {
	AppService
} from 'src/app/providers/app.service';
let pjson;
try {
	pjson = require('../../../../package.json');
} catch (e) {
	console.warn('Can not access pjson on browser', e);
}
import {
	SelectableTabComponent
} from '@khiops-library/components/selectable-tab/selectable-tab.component';
import {
	DimensionsDatasService
} from 'src/app/providers/dimensions-datas.service';
import {
	ClustersService
} from 'src/app/providers/clusters.service';
import {
	AnnotationService
} from 'src/app/providers/annotation.service';
import {
	TreenodesService
} from 'src/app/providers/treenodes.service';
import {
	ImportExtDatasService
} from 'src/app/providers/import-ext-datas.service';

@Component({
	selector: 'app-project-view',
	templateUrl: './project-view.component.html',
	styleUrls: ['./project-view.component.scss']
})
export class ProjectViewComponent extends SelectableTabComponent implements OnInit {

	appDatas: any;
	projectSummaryDatas: any[any];
	onFileLoaderDataChangedCb: Function;
	appName: any;

	// managed by selectable-tab component
	tabIndex = 0;
	tabConfig = AppConfig.common.HOME;

	constructor(
		private appService: AppService,
		private clustersService: ClustersService,
		private annotationService: AnnotationService,
		private importExtDatasService: ImportExtDatasService,
		private treenodesService: TreenodesService,
		private dimensionsDatasService: DimensionsDatasService
	) {

		super();

		this.appDatas = this.appService.getDatas();
		if (pjson) {
			this.appName = pjson.name;
		}

		this.projectSummaryDatas = this.appService.getProjectSummaryDatas();
	}

	ngOnInit() {
		this.onFileLoaderDataChangedCb = obj => this.onFileLoaderDataChanged(obj);
		this.dimensionsDatasService.initialize();
		this.clustersService.initialize();
		this.annotationService.initialize();
		this.treenodesService.initialize();
	}

	onFileLoaderDataChanged(datas) {

		this.appService.setFileDatas(datas);

		if (datas) {
			this.dimensionsDatasService.initialize();
			this.importExtDatasService.initExtDatasFiles();
		}

	}

}
