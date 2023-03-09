import { Component, OnInit } from '@angular/core'
import { AppConfig } from 'src/environments/environment'
import { AppService } from '@khiops-covisualization/providers/app.service'
import pjson from 'package.json';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component'
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service'
import { ClustersService } from '@khiops-covisualization/providers/clusters.service'
import { AnnotationService } from '@khiops-covisualization/providers/annotation.service'
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service'
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service'

@Component({
	selector: 'app-project-view',
	templateUrl: './project-view.component.html',
	styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent extends SelectableTabComponent
	implements OnInit {
	appDatas: any
	projectSummaryDatas: any[any]
	onFileLoaderDataChangedCb: Function
	appName: any

	// managed by selectable-tab component
	tabIndex = 0
	tabConfig = AppConfig.covisualizationCommon.HOME

	constructor(
		private appService: AppService,
		private clustersService: ClustersService,
		private annotationService: AnnotationService,
		private importExtDatasService: ImportExtDatasService,
		private treenodesService: TreenodesService,
		private dimensionsDatasService: DimensionsDatasService,
	) {
		super()

		this.appDatas = this.appService.getDatas()
		if (pjson) {
			this.appName = pjson.name
		}

		this.projectSummaryDatas = this.appService.getProjectSummaryDatas()
	}

	ngOnInit() {
		this.onFileLoaderDataChangedCb = (obj) => this.onFileLoaderDataChanged(obj)
		this.dimensionsDatasService.initialize()
		this.clustersService.initialize()
		this.annotationService.initialize()
		this.treenodesService.initialize()
	}

	onFileLoaderDataChanged(datas) {
		this.appService.setFileDatas(datas)

		if (datas) {
			this.dimensionsDatasService.initialize()
			this.importExtDatasService.initExtDatasFiles()
		}
	}
}
