import {
	Component,
	SimpleChanges,
	Input,
	ViewChild,
	EventEmitter,
	Output,
	OnChanges,
	OnInit
} from '@angular/core';
import {
	PreparationDatasService
} from '@khiops-visualization/providers/preparation-datas.service';
import {
	DistributionDatasService
} from '@khiops-visualization/providers/distribution-datas.service';
import {
	DistributionGraphCanvasComponent
} from '@khiops-library/components/distribution-graph-canvas/distribution-graph-canvas.component';
import {
	TargetDistributionGraphCanvasComponent
} from '@khiops-visualization/components/commons/target-distribution-graph-canvas/target-distribution-graph-canvas.component';
import {
	TreePreparationDatasService
} from '@khiops-visualization/providers/tree-preparation-datas.service';
import {
	AppConfig
} from 'src/environments/environment';

@Component({
	selector: 'app-variable-graph-details',
	templateUrl: './variable-graph-details.component.html',
	styleUrls: ['./variable-graph-details.component.scss']
})
export class VariableGraphDetailsComponent implements OnInit, OnChanges {

	@ViewChild('distributionGraph', {
		static: false
	}) distributionGraph: DistributionGraphCanvasComponent;

	@ViewChild('targetDistributionGraph', {
		static: false
	}) targetDistributionGraph: TargetDistributionGraphCanvasComponent;

	@Input() showTargetDistributionGraph = true;
	@Input() showDistributionGraph = true;
	@Input() selectedVariable;
	@Input() selectedGraphItemIndex = 0;
	@Input() preparationSource;
	@Input() position = 0; // in case of multiple component in the same page

	@Output() selectedItemChanged: EventEmitter < any > = new EventEmitter();

	preparationDatas: any;
	distributionDatas: any;
	distributionGraphScrollPosition: any;
	scrollPosition = 0;
	scaleValue: any;
	distributionGraphType: any;
	distributionGraphTypeX: any;
	targetDistributionGraphType: any;

	isLoadingGraphDatas: boolean;
	activeEntries = 0;
	isFullscreen: boolean;
	histogramDatas: any

	constructor(
		private preparationDatasService: PreparationDatasService,
		private treePreparationDatasService: TreePreparationDatasService,
		private distributionDatasService: DistributionDatasService) {
		this.targetDistributionGraphType = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'TARGET_DISTRIBUTION_GRAPH_OPTION');
	}

	ngOnInit() {
		this.distributionDatas = this.distributionDatasService.getDatas();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.selectedVariable && changes.selectedVariable.currentValue) {
			this.isLoadingGraphDatas = true;

			this.selectedGraphItemIndex = 0;
			this.initActiveEntries(this.selectedGraphItemIndex);

			setTimeout(() => {
				this.distributionDatasService.setPreparationSource(this.preparationSource);
				if (this.showTargetDistributionGraph) {
					this.distributionDatasService.getTargetDistributionGraphDatas(this.selectedVariable);
				}
				if (this.showDistributionGraph) {
					this.distributionDatasService.getdistributionGraphDatas(this.selectedVariable);
					this.histogramDatas =
						this.distributionDatasService.getHistogramGraphDatas(
							this.selectedVariable
						);
				}

				if (this.preparationSource === 'treePreparationReport') {
					this.treePreparationDatasService.getCurrentIntervalDatas();
				} else {
					this.preparationDatasService.getCurrentIntervalDatas(this.preparationSource);
				}

				this.isLoadingGraphDatas = false;

			}); // do it async to dont freeze during graph rendering
		}
		if (changes.selectedGraphItemIndex && changes.selectedGraphItemIndex.currentValue !== undefined) {
			this.initActiveEntries(this.selectedGraphItemIndex);
		}

	}

	resize() {
		if (this.distributionGraph) {
			this.distributionGraph.resizeGraph();
		}
		if (this.targetDistributionGraph) {
			this.targetDistributionGraph.resizeGraph();
		}
	}

	onScrollPositionChanged(position: number) {
		this.scrollPosition = position;
	}

	onToggleFullscreen(isFullscreen: any) {
		this.isFullscreen = isFullscreen;
		setTimeout(() => {
			this.resize();
		});
	}

	onScaleValueChanged(value: any) {
		this.scaleValue = value;
	}

	onTargetDistributionGraphDisplayedValuesChanged(displayedValues) {
		this.distributionDatasService.setTargetDistributionDisplayedValues(displayedValues);
		this.distributionDatasService.getTargetDistributionGraphDatas(this.getCurrentVariable(), this.targetDistributionGraphType);
		this.initActiveEntries();
	}

	onTargetDistributionGraphTypeChanged(type: any) {
		this.targetDistributionGraphType = type;
		this.distributionDatasService.getTargetDistributionGraphDatas(this.getCurrentVariable(), this.targetDistributionGraphType, false);
		this.initActiveEntries(this.selectedGraphItemIndex);
	}

	onDistributionGraphTypeChanged(type: any) {
		this.distributionGraphType = type;
		this.distributionDatasService.getdistributionGraphDatas(this.getCurrentVariable(), this.distributionGraphType, false);
		this.initActiveEntries(this.selectedGraphItemIndex);
	}

	onDistributionGraphTypeXChanged(typeX: any) {
		this.distributionGraphTypeX = typeX;
		this.distributionDatasService.getdistributionGraphDatas(this.getCurrentVariable(), this.distributionGraphType, false, this.distributionGraphTypeX);
		this.initActiveEntries(this.selectedGraphItemIndex);
	}

	getCurrentVariable() {
		let selectedVariable = this.preparationDatasService.getSelectedVariable(this.preparationSource);
		if (this.preparationSource === 'treePreparationReport') {
			selectedVariable = this.treePreparationDatasService.getSelectedVariable();
		}
		return selectedVariable;
	}

	initActiveEntries(index = 0) {
		this.activeEntries = index;
	}

	onSelectedDistributionGraphItemChanged(index: any) {
		this.activeEntries = index;

		// launch event to parent to manage interval table datas or matrix selection
		this.selectedItemChanged.emit(index);
	}

	onSelectedTargetDistributionGraphItemChanged(index: any) {
		this.activeEntries = index;

		// launch event to parent to manage interval table datas or matrix selection
		this.selectedItemChanged.emit(index);
	}

}
