import {
	ViewChild,
	Component,
} from '@angular/core';
import _ from 'lodash';
import {
	MatDialog,
	MatDialogRef,
	MatDialogConfig
} from '@angular/material/dialog';
import {
	AppService
} from '../../providers/app.service';
import {
	ModelingDatasService
} from 'src/app/providers/modeling-datas.service';
import {
	PreparationDatasService
} from 'src/app/providers/preparation-datas.service';
import {
	AppConfig
} from 'src/environments/environment';
import {
	SelectableTabComponent
} from '@khiops-library/components/selectable-tab/selectable-tab.component';
import {
	EvaluationDatasService
} from 'src/app/providers/evaluation-datas.service';
import {
	Preparation2dDatasService
} from 'src/app/providers/preparation2d-datas.service';
import {
	LevelDistributionGraphCanvasComponent
} from '../commons/level-distribution-graph-canvas/level-distribution-graph-canvas.component';
import {
	VariableGraphDetailsComponent
} from '../commons/variable-graph-details/variable-graph-details.component';
import {
	TargetDistributionGraphCanvasComponent
} from '../commons/target-distribution-graph-canvas/target-distribution-graph-canvas.component';
import {
	TreePreparationDatasService
} from 'src/app/providers/tree-preparation-datas.service';
import {
	Distribution2dDatasService
} from 'src/app/providers/distribution2d-datas.service';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';

@Component({
	selector: 'app-modeling-view',
	templateUrl: './modeling-view.component.html',
	styleUrls: ['./modeling-view.component.scss']
})
export class ModelingViewComponent extends SelectableTabComponent {

	@ViewChild('appVariableGraphDetails', {
		static: false
	}) appVariableGraphDetails: VariableGraphDetailsComponent;

	@ViewChild('targetDistributionGraphCanvas', {
		static: false
	}) targetDistributionGraphCanvas: TargetDistributionGraphCanvasComponent;

	preparationSource = this.preparationDatasService.getAvailablePreparationReport();

	appDatas: any;
	sizes: any;
	summaryDatas: any;
	targetVariableStatsDatas: any;
	trainedPredictorsSummaryDatas: any;
	trainedPredictorsListDatas: any;
	modelingDatas: any;
	matrixRegSelectedCell = 0;
	distributionSelectedBarIndex = 0;
	trainedPredictorsDisplayedColumns: string[];

	// managed by selectable-tab component
	tabIndex = 3;
	tabConfig = AppConfig.common.HOME;
	isRegressionOrExplanatoryAnalysis: boolean;
	preparation2dDatas: any;

	currentCellIndex: any;
	targetDistributionGraphDisplayedValues: [];
	targetDistributionGraphType: string;
	targetDistributionGraphTitle: string;

	scaleValue = localStorage.getItem(AppConfig.common.GLOBAL.LS_ID + 'SCALE_VALUE') || AppConfig.common.GLOBAL.DEFAULT_GRAPH_SCALE;
	targetDistributionGraphDatas: any;
	targetDistribution2dGraphDatas: any;
	treePreparationDatas: any;
	preparationVariable: any;
	currentIntervalDatas: any;
	targetVariableStatsInformations: any;

	constructor(private modelingDatasService: ModelingDatasService,
		private evaluationDatasService: EvaluationDatasService,
		private khiopsLibraryService: KhiopsLibraryService,
		private preparation2dDatasService: Preparation2dDatasService,
		private appService: AppService,
		private dialog: MatDialog,
		private distribution2dDatasService: Distribution2dDatasService,
		private preparationDatasService: PreparationDatasService,
		private treePreparationDatasService: TreePreparationDatasService) {

		super();

	}

	ngOnInit() {
		this.khiopsLibraryService.trackEvent('page_view', 'modeling');

		this.appDatas = this.appService.getDatas();
		this.modelingDatas = this.modelingDatasService.getDatas();
		this.treePreparationDatas = this.treePreparationDatasService.getDatas();
		this.preparation2dDatas = this.preparation2dDatasService.getDatas();
		this.sizes = this.appService.getViewSplitSizes('modelingView');

		this.summaryDatas = this.modelingDatasService.getSummaryDatas();
		this.targetVariableStatsDatas = this.preparationDatasService.getTargetVariableStatsDatas();
		this.targetVariableStatsInformations = this.preparationDatasService.getTargetVariableStatsInformations();
		this.trainedPredictorsSummaryDatas = this.modelingDatasService.getTrainedPredictorsSummaryDatas();

		this.isRegressionOrExplanatoryAnalysis = this.preparationDatasService.isExplanatoryAnalysis() || this.evaluationDatasService.isRegressionAnalysis();
	}

	onSplitDragEnd(event, item ? ) {
		this.appService.resizeAndSetSplitSizes(item, this.sizes, event.sizes, 'modelingView');

		// Resize to update graphs dimensions
		if (this.appVariableGraphDetails) {
			this.appVariableGraphDetails.resize();
		}
		this.resizeTargetDistributionGraph();
	}

	onSelectedPredictorChanged(value) {
		this.modelingDatasService.setSelectedPredictor(value);
		this.modelingDatasService.getTrainedPredictorListDatas();
		this.trainedPredictorsDisplayedColumns = this.modelingDatasService.getTrainedPredictorDisplayedColumns();

		// Check if selected variable from another tab is available into current modeling datas.
		// Otherwise, select a new one
		if (this.modelingDatas.trainedPredictorsListDatas && this.modelingDatas.selectedVariable) {
			const isVarAvailable = this.modelingDatas.trainedPredictorsListDatas.find(e => e.name === this.modelingDatas.selectedVariable.name);
			if (!isVarAvailable) {
				this.onSelectListItemChanged(this.modelingDatas.trainedPredictorsListDatas[0]);
			}
		} else {
			// no modeling datas
			this.modelingDatasService.removeSelectedVariable();
		}

	}

	onSelectListItemChanged(item: any) {
		// setTimeout(() => { // is it usefull ? appears with tree hyper view

		// Get var from name
		if (item.name && item.name.includes('Tree_')) {
			this.preparationSource = 'treePreparationReport';
			this.preparationVariable = this.treePreparationDatasService.setSelectedVariable(item);
			this.currentIntervalDatas = this.treePreparationDatasService.getCurrentIntervalDatas(this.distributionSelectedBarIndex);
		} else {
			this.preparationSource = this.preparationDatasService.getPreparationSourceFromVariable(item);
			if (item.name && item.name.includes('`')) {
				// Check the case of 2d variable : names are separated by `
				item.name1 = item.name.split('`')[0];
				item.name2 = item.name.split('`')[1];
				this.preparationVariable = this.preparation2dDatasService.setSelectedVariable(item);
			} else {
				this.preparationVariable = this.preparationDatasService.setSelectedVariable(item, this.preparationSource);
			}
			this.currentIntervalDatas = this.preparationDatasService.getCurrentIntervalDatas(this.preparationSource, this.distributionSelectedBarIndex);
		}

		this.modelingDatasService.setSelectedVariable(this.preparationVariable);

		// check if current variable is explanatory on change
		this.isRegressionOrExplanatoryAnalysis = this.preparationDatasService.isExplanatoryAnalysis() ||
			this.evaluationDatasService.isRegressionAnalysis();

		// do it async if previous var was not 2d and chart was not initialized
		this.targetDistributionGraphDatas = this.distribution2dDatasService.getTargetDistributionGraphDatas(this.targetDistributionGraphType);
		// });

	}

	onShowLevelDistributionGraph(datas: any) {
		const config = new MatDialogConfig();
		config.width = AppConfig.common.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
		config.height = AppConfig.common.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
		const dialogRef: MatDialogRef < LevelDistributionGraphCanvasComponent > = this.dialog.open(LevelDistributionGraphCanvasComponent, config);
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
