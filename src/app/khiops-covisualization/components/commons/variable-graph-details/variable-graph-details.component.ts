import {
	Component,
	OnInit,
	OnChanges,
	OnDestroy,
	ViewChild,
	AfterViewInit,
	Input,
	Output,
	EventEmitter,
	SimpleChanges
} from '@angular/core';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	TranslateService
} from '@ngstack/translate';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	DistributionGraphCanvasComponent
} from '@khiops-library/components/distribution-graph-canvas/distribution-graph-canvas.component';
import {
	EventsService
} from '@khiops-covisualization/providers/events.service';
import {
	TreenodesService
} from '@khiops-covisualization/providers/treenodes.service';
import {
	ChartColorsSetI
} from '@khiops-library/interfaces/chart-colors-set';
import {
	DimensionsDatasService
} from '@khiops-covisualization/providers/dimensions-datas.service';

@Component({
	selector: 'app-variable-graph-details',
	templateUrl: './variable-graph-details.component.html',
	styleUrls: ['./variable-graph-details.component.scss']
})
export class VariableGraphDetailsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

	@ViewChild('distributionGraph', {
		static: false
	}) distributionGraph: DistributionGraphCanvasComponent;

	@Input() selectedNode;
	@Output() selectedItemChanged: EventEmitter < any > = new EventEmitter();
	@Input() position: number;
	@Input() dimensionsTree: any;
	@Input() selectedDimension: DimensionVO;
	@Input() selectedDimensions: DimensionVO[];

	scrollPosition = 0;
	treeCollapseChangedSub: any;
	treeSelectedNodeChangedSub: any;
	treeNodeNameChangedSub: any;
	dimensionsDatasChangedSub: any;

	isLoadingGraphDatas: boolean;
	scaleValue: any;
	graphDetails: any;
	graphOptions = {
		types: [
			'GLOBAL.COVERAGE', 'GLOBAL.FREQUENCY'
		],
		selected: undefined
	};
	activeEntries: string;
	title: string;
	legend: any;
	colorSet: ChartColorsSetI;
	isFullscreen: boolean = false;
	isLoadingDistribution: boolean;

	constructor(
		private translate: TranslateService,
		private dimensionsDatasService: DimensionsDatasService,
		private treenodesService: TreenodesService,
		private eventsService: EventsService,
		private khiopsLibraryService: KhiopsLibraryService
	) {

		this.colorSet = this.khiopsLibraryService.getGraphColorSet()[2];

		this.treeCollapseChangedSub = this.eventsService.treeCollapseChanged.subscribe(dimension => {
			this.getFilteredDistribution(this.dimensionsTree);
		});
		this.treeSelectedNodeChangedSub = this.eventsService.treeSelectedNodeChanged.subscribe(e => {
			if (e.selectedNode && e.hierarchyName === this.selectedDimension.name || !this.graphDetails) {
				// Only compute distribution of the other node
				this.getFilteredDistribution(this.dimensionsTree);
			}
		});
		this.treeNodeNameChangedSub = this.eventsService.treeNodeNameChanged.subscribe(e => {
			this.getFilteredDistribution(this.dimensionsTree);
		});

	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.selectedNode && changes.selectedNode.currentValue) {
			// get active entries index from name
			if (this.graphDetails) {
				this.activeEntries = this.graphDetails.labels.findIndex(e => e === this.selectedNode.shortDescription);
			}
		}
	}

	ngOnInit() {

	}

	ngAfterViewInit() {
		this.getFilteredDistribution(this.dimensionsTree);
	}

	updateGraphTitle() {

		const currentIndex = this.position === 0 ? 1 : 0;
		let otherIndex = 0;
		if (currentIndex === 0) {
			otherIndex = 1;
		}

		this.title = this.translate.get('GLOBAL.DISTRIBUTION') + ' ' +
			this.translate.get('GLOBAL.OF') + ' ' + this.selectedDimensions[currentIndex].name + ' ' +
			this.translate.get('GLOBAL.OVER') + ' ' + this.selectedDimensions[otherIndex].name;
	}

	resize() {
		if (this.distributionGraph) {
			this.distributionGraph.resizeGraph();
		}
	}

	onToggleFullscreen(isFullscreen: any) {
		this.isFullscreen = isFullscreen;
		setTimeout(() => {
			this.resize();
		});
	}


	ngOnDestroy() {
		this.treeCollapseChangedSub.unsubscribe();
		this.treeSelectedNodeChangedSub.unsubscribe();
		this.treeNodeNameChangedSub.unsubscribe();
	}


	async getFilteredDistribution(dimensionsTree) {
		setTimeout(() => {
			if (dimensionsTree && this.selectedNode) {
				// EVOL we want to interchange distribution graphs
				// so we interchange otherIndex and currentIndex
				const [currentIndex, otherIndex] = this.invertDimensionsPositions();


				this.isLoadingDistribution = true;
				setTimeout(() => {
					// Do not display computing message for small computings (> 100ms)
					if (this.isLoadingDistribution) {
						this.graphDetails = undefined;
					}
				}, 100);

				const worker = new Worker(new URL('./variable-graph-details.worker.ts',
					import.meta.url));
				worker.onmessage = ({
					data
				}) => {
					this.isLoadingDistribution = false
					this.graphDetails = data;
					if (this.graphDetails && this.graphDetails.labels) {
						this.activeEntries = this.graphDetails.labels.findIndex(e => e === this.selectedNode.shortDescription);
						this.legend = this.graphDetails.datasets[0].label;
					}
				};

				const data = {
					selectedNodes: this.dimensionsDatasService.dimensionsDatas.selectedNodes,
					dimensionsTree: this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[currentIndex],
					// Transfert only usefull informations so map it
					matrixCellDatas: this.dimensionsDatasService.dimensionsDatas.matrixDatas.matrixCellDatas.map(e => {
						return {
							yaxisPart: e.yaxisPart,
							xaxisPart: e.xaxisPart,
							displayedFreqValue: e.displayedFreqValue
						}
					}),
					otherIndex: otherIndex,
					currentIndex: currentIndex
				}
				worker.postMessage(data);

				this.updateGraphTitle();

			}
		});

	}

	onSelectBarChanged(index: any) {

		this.activeEntries = index;

		const [currentIndex, otherIndex] = this.invertDimensionsPositions();

		// Find node name from index
		const currentNodeName = this.graphDetails.labels[index];
		this.treenodesService.setSelectedNode(this.selectedDimensions[currentIndex].name, currentNodeName);
	}

	onScaleValueChanged(value: any) {
		this.scaleValue = value;
	}

	onScrollPositionChanged(position: number) {
		this.scrollPosition = position;
	}

	invertDimensionsPositions() {
		const currentIndex = this.position;
		let otherIndex = 0;
		if (currentIndex === 0) {
			otherIndex = 1;
		}
		return [currentIndex, otherIndex];
	}

}
