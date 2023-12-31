import {
	Component,
	ViewChild
} from '@angular/core';
import {
	AppConfig
} from 'src/environments/environment';
import {
	AppService
} from '../../providers/app.service';
import {
	SelectableTabComponent
} from '@khiops-library/components/selectable-tab/selectable-tab.component';
import {
	ModelingDatasService
} from '@khiops-visualization/providers/modeling-datas.service';
import {
	MatDialog,
	MatDialogRef,
	MatDialogConfig
} from '@angular/material/dialog';
import {
	LevelDistributionGraphCanvasComponent
} from '../commons/level-distribution-graph-canvas/level-distribution-graph-canvas.component';
import {
	VariableGraphDetailsComponent
} from '../commons/variable-graph-details/variable-graph-details.component';
import {
	TreePreparationDatasService
} from '@khiops-visualization/providers/tree-preparation-datas.service';
import {
	DistributionDatasService
} from '@khiops-visualization/providers/distribution-datas.service';
import {
	TreeLeafDetailsComponent
} from '../commons/tree-leaf-details/tree-leaf-details.component';
import {
	GridColumnsI
} from '@khiops-library/interfaces/grid-columns';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	ChartDatasVO
} from '@khiops-library/model/chart-datas-vo';
import {
	GridDatasI
} from '@khiops-library/interfaces/grid-datas';
import {
	InfosDatasI
} from '@khiops-library/interfaces/infos-datas';
import {
	VariableVO
} from '@khiops-visualization/model/variable-vo';
import {
	Preparation2dDatasVO
} from '@khiops-visualization/model/preparation2d-datas-vo';
import {
	DistributionDatasVO
} from '@khiops-visualization/model/distribution-datas-vo';
import {
	PreparationDatasVO
} from '@khiops-visualization/model/preparation-datas-vo';
import {
	TreePreparationDatasVO
} from '@khiops-visualization/model/tree-preparation-datas-vo';
import {
	TreePreparationVariableVO
} from '@khiops-visualization/model/tree-preparation-variable-vo';
import {
	ChartToggleValuesI
} from '@khiops-visualization/interfaces/chart-toggle-values';

@Component({
	selector: 'app-tree-preparation-view',
	templateUrl: './tree-preparation-view.component.html',
	styleUrls: ['./tree-preparation-view.component.scss']
})
export class TreePreparationViewComponent extends SelectableTabComponent {

	@ViewChild('appVariableGraphDetails', {
		static: false
	}) appVariableGraphDetails: VariableGraphDetailsComponent;

	@ViewChild('appTreeLeafDetails', {
		static: false
	}) appTreeLeafDetails: TreeLeafDetailsComponent;

	appDatas: any;
	sizes: any;

	summaryDatas: InfosDatasI[];
	informationsDatas: InfosDatasI[];
	targetVariableStatsDatas: ChartDatasVO;
	currentIntervalDatas: GridDatasI;
	matrixRegSelectedCell = 0;
	selectedBarIndex = 0;
	variablesDatas: VariableVO[];
	targetVariableStatsInformations: InfosDatasI[];
	preparation2dDatas: Preparation2dDatasVO;
	treePreparationDatas: TreePreparationDatasVO;
	preparationDatas: PreparationDatasVO;
	distributionDatas: DistributionDatasVO;

	// managed by selectable-tab component
	tabIndex = 5;

	variablesDisplayedColumns: GridColumnsI[] = [{
		headerName: 'Rank',
		field: 'rank'
	}, {
		headerName: 'Name',
		field: 'name'
	}, {
		headerName: 'Level',
		field: 'level'
	}, {
		headerName: 'Parts',
		field: 'parts'
	}, {
		headerName: 'Values',
		field: 'values'
	}, {
		headerName: 'Type',
		field: 'type'
	}, {
		headerName: 'Mode',
		field: 'mode',
		show: false
	}];

	constructor(
		private treePreparationDatasService: TreePreparationDatasService,
		private dialog: MatDialog,
		private khiopsLibraryService: KhiopsLibraryService,
		private distributionDatasService: DistributionDatasService,
		private appService: AppService,
		private modelingDatasService: ModelingDatasService) {

		super();

	}

	ngOnInit() {
		this.khiopsLibraryService.trackEvent('page_view', 'treePreparation');

		this.appDatas = this.appService.getDatas().datas;
		this.treePreparationDatas = this.treePreparationDatasService.getDatas();
		this.sizes = this.appService.getViewSplitSizes('treePreparationView');
		this.summaryDatas = this.treePreparationDatasService.getSummaryDatas();
		this.informationsDatas = this.treePreparationDatasService.getInformationsDatas();
		this.targetVariableStatsDatas = this.treePreparationDatasService.getTargetVariableStatsDatas();
		this.targetVariableStatsInformations = this.treePreparationDatasService.getTargetVariableStatsInformations();
		this.variablesDatas = this.treePreparationDatasService.getVariablesDatas();
		this.treePreparationDatasService.getCurrentIntervalDatas();
		this.distributionDatas = this.distributionDatasService.getDatas();
	}

	onSplitDragEnd(event: any, item: string) {
		this.appService.resizeAndSetSplitSizes(item, this.sizes, event.sizes, 'treePreparationView');

		// Resize to update graphs dimensions
		if (this.appVariableGraphDetails) {
			this.appVariableGraphDetails.resize();
		}
	}

	onSelectedVariableChanged(variable: any) {
		this.selectedBarIndex = 0;
	}

	onSelectListItemChanged(item: TreePreparationVariableVO) {
		const modelingVariable = this.treePreparationDatasService.setSelectedVariable(item);
		this.modelingDatasService.setSelectedVariable(modelingVariable);
		this.treePreparationDatasService.getCurrentIntervalDatas(this.selectedBarIndex);
	}

	onShowLevelDistributionGraph(datas: any) {
		const config = new MatDialogConfig();
		config.width = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
		config.height = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
		const dialogRef: MatDialogRef < LevelDistributionGraphCanvasComponent > = this.dialog.open(LevelDistributionGraphCanvasComponent, config);
		dialogRef.componentInstance.datas = datas;
	}


	onSelectTreeItemChanged(item: {
		id: string,
		isLeaf: boolean
	}) {
		const [index, nodesToSelect] = this.treePreparationDatasService.getNodesLinkedToOneNode(item.id);
		this.selectedBarIndex = index;
		this.treePreparationDatasService.getCurrentIntervalDatas(this.selectedBarIndex);
	}

	onSelectedGraphItemChanged(index: number) {
		// Keep in memory to keep bar charts index on type change
		this.selectedBarIndex = index;
		const currentIntervalDatas = this.treePreparationDatasService.getCurrentIntervalDatas(this.selectedBarIndex);
		const currentValues = currentIntervalDatas.values.map(e => e.values);
		this.treePreparationDatasService.setSelectedNodes(currentValues, currentValues[0]);
	}

	onTreeNodeTargetDistributionGraphDisplayedValuesChanged(displayedValues: ChartToggleValuesI[]) {
		if (this.appTreeLeafDetails) {
			this.appTreeLeafDetails.onTreeNodeTargetDistributionGraphDisplayedValuesChanged(displayedValues);
		}
	}

	onTreeHyperDisplayedValuesChanged(displayedValues: ChartToggleValuesI[]) {
		if (this.appTreeLeafDetails) {
			this.appTreeLeafDetails.onTreeHyperValuesChanged(displayedValues);
		}
	}

}
