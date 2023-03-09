import {
	Component,
	ViewChild
} from '@angular/core';
import {
	MatDialog,
	MatDialogRef,
	MatDialogConfig
} from '@angular/material/dialog';
import {
	Preparation2dDatasService
} from '@khiops-visualization/providers/preparation2d-datas.service';
import {
	AppConfig
} from 'src/environments/environment';
import {
	AppService
} from '@khiops-visualization/providers/app.service';
import {
	SelectableTabComponent
} from '@khiops-library/components/selectable-tab/selectable-tab.component';
import {
	PreparationDatasService
} from '@khiops-visualization/providers/preparation-datas.service';
import {
	LevelDistributionGraphCanvasComponent
} from '@khiops-visualization/components/commons/level-distribution-graph-canvas/level-distribution-graph-canvas.component';
import {
	TargetDistributionGraphCanvasComponent
} from '@khiops-visualization/components/commons/target-distribution-graph-canvas/target-distribution-graph-canvas.component';
import {
	ModelingDatasService
} from '@khiops-visualization/providers/modeling-datas.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	Distribution2dDatasService
} from '@khiops-visualization/providers/distribution2d-datas.service';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';

@Component({
	selector: 'app-preparation-2d-view',
	templateUrl: './preparation-2d-view.component.html',
	styleUrls: ['./preparation-2d-view.component.scss']
})
export class Preparation2dViewComponent extends SelectableTabComponent {

	@ViewChild('targetDistributionGraphCanvas', {
		static: false
	}) targetDistributionGraphCanvas: TargetDistributionGraphCanvasComponent;

	preparation2dDatas: any;
	appDatas: any;
	sizes: any;
	summaryDatas: any[any];
	informationsDatas: any[any];
	targetVariableStatsDatas: any[];
	currentIntervalDatas: any;
	targetDistributionGraphDisplayedValues: [];
	targetDistributionGraphType: string;
	targetDistributionGraphTitle: string;

	variablesDisplayedColumns: GridColumnsI[] = [{
		headerName: 'Rank',
		field: 'rank',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.RANK')
	}, {
		headerName: 'Name 1',
		field: 'name1',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.NAME1')
	}, {
		headerName: 'Name 2',
		field: 'name2',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.NAME2')
	}, {
		headerName: 'Level',
		field: 'level',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.LEVEL')
	}, {
		headerName: 'Level1',
		field: 'level1',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.LEVEL1'),
		show: this.preparation2dDatasService.isSupervised()
	}, {
		headerName: 'Level2',
		field: 'level2',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.LEVEL2'),
		show: this.preparation2dDatasService.isSupervised()
	}, {
		headerName: 'Variables',
		field: 'variables',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.VARIABLES')
	}, {
		headerName: 'Parts1',
		field: 'parts1',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.PARTS1')
	}, {
		headerName: 'Parts2',
		field: 'parts2',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.PARTS2')
	}, {
		headerName: 'Cells',
		field: 'cells',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.CELLS')
	}, {
		headerName: 'Delta Level',
		field: 'deltaLevel',
		tooltip: this.translate.get('TOOLTIPS.PREPARATION_2D.VARIABLES.DELTALEVEL'),
		show: this.preparation2dDatasService.isSupervised()
	}];

	// managed by selectable-tab component
	tabIndex = 2;
	tabConfig = AppConfig.visualizationCommon.HOME;
	currentCellIndex: any;
	variables2dDatas: any;
	targetDistributionGraphDatas: any;
	levelDistributionTitle: string;

	constructor(
		private preparationDatasService: PreparationDatasService,
		private khiopsLibraryService: KhiopsLibraryService,
		private translate: TranslateService,
		private dialog: MatDialog,
		private modelingDatasService: ModelingDatasService,
		private distribution2dDatasService: Distribution2dDatasService,
		private preparation2dDatasService: Preparation2dDatasService,
		private appService: AppService) {

		super();

		this.appDatas = this.appService.getDatas().datas;
		this.preparation2dDatas = this.preparation2dDatasService.getDatas();
		this.sizes = this.appService.getViewSplitSizes('preparation2dView');
		this.summaryDatas = this.preparationDatasService.getSummaryDatas();
		this.targetVariableStatsDatas = this.preparationDatasService.getTargetVariableStatsDatas();
		this.variables2dDatas = this.preparation2dDatasService.getVariablesd2Datas();
		this.levelDistributionTitle = this.preparation2dDatasService.isSupervised() ? this.translate.get('GLOBAL.DELTA_LEVEL_DISTRIBUTION') : undefined;
	}

	ngOnInit() {
		this.khiopsLibraryService.trackEvent('page_view', 'preparation2d');
	}

	onSplitDragEnd(event: any, item: any) {
		this.appService.resizeAndSetSplitSizes(item, this.sizes, event.sizes, 'preparation2dView');
		this.resizeTargetDistributionGraph();
	}

	onSelectListItemChanged(item: any) {
		this.preparation2dDatasService.setSelectedVariable(item);
		const modelingVariable = this.preparation2dDatasService.getVariableFromNames(item.name1, item.name2);
		this.modelingDatasService.setSelectedVariable(modelingVariable);
		this.targetDistributionGraphDatas = this.distribution2dDatasService.getTargetDistributionGraphDatas(this.targetDistributionGraphType);
	}

	onShowLevelDistributionGraph(datas: any) {
		const config = new MatDialogConfig();
		config.width = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
		config.height = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
		const dialogRef: MatDialogRef<LevelDistributionGraphCanvasComponent> = this.dialog.open(LevelDistributionGraphCanvasComponent, config);
		dialogRef.componentInstance.levelDistributionTitle = this.levelDistributionTitle;
		dialogRef.componentInstance.datas = datas;
	}

	resizeTargetDistributionGraph() {
		setTimeout(() => {
			// Resize to update graphs dimensions
			if (this.targetDistributionGraphCanvas) {
				this.targetDistributionGraphCanvas.resizeGraph();
			}
		}); // do it after view dom complete
	}

}
