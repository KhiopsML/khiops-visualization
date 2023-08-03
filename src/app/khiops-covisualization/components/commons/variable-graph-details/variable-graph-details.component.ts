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
	SimpleChanges,
} from "@angular/core";
import { DimensionVO } from "@khiops-library/model/dimension-vo";
import { TranslateService } from "@ngstack/translate";
import { KhiopsLibraryService } from "@khiops-library/providers/khiops-library.service";
import { DistributionGraphCanvasComponent } from "@khiops-library/components/distribution-graph-canvas/distribution-graph-canvas.component";
import { EventsService } from "@khiops-covisualization/providers/events.service";
import { TreenodesService } from "@khiops-covisualization/providers/treenodes.service";
import { ChartColorsSetI } from "@khiops-library/interfaces/chart-colors-set";
import { DimensionsDatasService } from "@khiops-covisualization/providers/dimensions-datas.service";
import { ChartDatasetVO } from "@khiops-library/model/chartDataset-vo";
import { ClustersService } from "@khiops-covisualization/providers/clusters.service";
import { MatrixCanvasService } from "@khiops-library/components/matrix-canvas/matrix-canvas.service";

@Component({
	selector: "app-variable-graph-details",
	templateUrl: "./variable-graph-details.component.html",
	styleUrls: ["./variable-graph-details.component.scss"],
})
export class VariableGraphDetailsComponent
	implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
	@ViewChild("distributionGraph", {
		static: false,
	})
	distributionGraph: DistributionGraphCanvasComponent;

	@Input() selectedNode;
	@Output() selectedItemChanged: EventEmitter<any> = new EventEmitter();
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
		types: ["GLOBAL.COVERAGE", "GLOBAL.FREQUENCY"],
		selected: undefined,
	};
	activeEntries: string;
	title: string;
	legend: any;
	colorSet: ChartColorsSetI;
	isFullscreen: boolean = false;
	// isLoadingDistribution: boolean;

	prevSelectedNode;

	constructor(
		private translate: TranslateService,
		private dimensionsDatasService: DimensionsDatasService,
		private treenodesService: TreenodesService,
		private eventsService: EventsService,
		private khiopsLibraryService: KhiopsLibraryService
	) {
		this.colorSet = this.khiopsLibraryService.getGraphColorSet()[2];

		this.treeCollapseChangedSub =
			this.eventsService.treeCollapseChanged.subscribe((dimension) => {
				this.getFilteredDistribution(this.dimensionsTree, true);
			});
		this.treeSelectedNodeChangedSub =
			this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
				if (
					(e.selectedNode &&
						e.hierarchyName === this.selectedDimension.name) ||
					!this.graphDetails ||
					this.dimensionsDatasService.isContextDimension(
						e.hierarchyName
					)
				) {
					// Only compute distribution of the other node
					this.getFilteredDistribution(this.dimensionsTree);
					this.prevSelectedNode = e.selectedNode;
				}
			});
		this.treeNodeNameChangedSub =
			this.eventsService.treeNodeNameChanged.subscribe((e) => {
				this.getFilteredDistribution(this.dimensionsTree, true);
			});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.selectedNode && changes.selectedNode.currentValue) {
			// get active entries index from name
			if (this.graphDetails) {
				this.activeEntries = this.graphDetails.labels.findIndex(
					(e) => e === this.selectedNode.name
				);
			}
		}
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.getFilteredDistribution(this.dimensionsTree);
	}

	updateGraphTitle() {
		const currentIndex = this.position === 0 ? 1 : 0;
		let otherIndex = 0;
		if (currentIndex === 0) {
			otherIndex = 1;
		}

		this.title =
			this.translate.get("GLOBAL.DISTRIBUTION") +
			" " +
			this.translate.get("GLOBAL.OF") +
			" " +
			this.selectedDimensions[currentIndex].name +
			" " +
			this.translate.get("GLOBAL.OVER") +
			" " +
			this.selectedDimensions[otherIndex].name;
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

	getFilteredDistribution(dimensionsTree, force = false) {
		if (dimensionsTree && this.selectedNode) {
			if (this.prevSelectedNode !== this.selectedNode || force) {
				if (this.position === 0) {
				}
				this.graphDetails = this.v2();

				if (this.graphDetails && this.graphDetails.labels) {
					this.activeEntries = this.graphDetails.labels.findIndex(
						(e) => e === this.selectedNode.shortDescription
					);
					this.legend = this.graphDetails.datasets[0].label;
				}
				this.updateGraphTitle();
			}
			this.prevSelectedNode = this.selectedNode;
		}
	}

	v2() {
		let filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
			this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[0]
		);
		let selectedNode =
			this.dimensionsDatasService.dimensionsDatas.selectedNodes[0];

		let otherselectedNode =
			this.dimensionsDatasService.dimensionsDatas.selectedNodes[1];

		if (this.position === 1) {
			filteredDimensionsClusters = this.getCurrentClusterDetailsFromNode(
				this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[1]
			);
			selectedNode =
				this.dimensionsDatasService.dimensionsDatas.selectedNodes[1];
			otherselectedNode =
				this.dimensionsDatasService.dimensionsDatas.selectedNodes[0];
		}

		selectedNode.getChildrenList();
		otherselectedNode.getChildrenList();

		let distributionsGraphLabelsInit = [];
		let distributionsGraphLabels = [];

		distributionsGraphLabelsInit = filteredDimensionsClusters.map(
			(e) => e.name
		);
		distributionsGraphLabels = filteredDimensionsClusters.map(
			(e) => e.shortDescription
		);

		let [
			matrixFreqsValues,
			matrixValues,
			globalMatrixValues,
			matrixExtras,
			matrixExpectedFreqsValues,
		] = MatrixCanvasService.computeMatrixValues(
			{
				mode: "FREQUENCY",
			},
			this.dimensionsDatasService.dimensionsDatas.matrixDatas,
			this.dimensionsDatasService.dimensionsDatas.contextSelection,
			-1
		);

		const currentDataSet = new ChartDatasetVO(
			this.treenodesService.getSelectedNodes()[
				this.position
			].shortDescription
		);

		let distributionsGraphDetails = {
			datasets: [],
			labels: [],
		};
		const currentDataSetData = [];

		let filteredList;
		if (selectedNode.isLeaf || selectedNode.isCollapsed) {
			filteredList = selectedNode.name;
		} else {
			// not collapsed node remove the node of children list
			filteredList = selectedNode.childrenList;
			filteredList.shift();
		}

		let axisPartName = "yaxisPart";
		let otheraxisPartName = "xaxisPart";
		if (this.position === 0) {
			axisPartName = "xaxisPart";
			otheraxisPartName = "yaxisPart";
		}
		let filteredotherList =
			this.dimensionsDatasService.dimensionsDatas.matrixDatas.matrixCellDatas.map(
				(e) => e[axisPartName]
			);
		filteredotherList = [...new Set(filteredotherList)]; // keep uniq

		const matrixCellDataMap =
			this.dimensionsDatasService.dimensionsDatas.matrixDatas.matrixCellDatas.reduce(
				(map, data, index) => {
					const key = `${data.yaxisPart}-${data.xaxisPart}`;
					map[key] = index;
					return map;
				},
				{}
			);

		for (let i = 0; i < otherselectedNode.childrenList.length; i++) {
			const element = otherselectedNode.childrenList[i];

			for (let j = 0; j < filteredotherList.length; j++) {
				const otherelement = filteredotherList[j];
				const labelIndex =
					distributionsGraphLabelsInit.indexOf(otherelement);

				const key =
					this.position === 1
						? `${otherelement}-${element}`
						: `${element}-${otherelement}`;

				const cell = matrixCellDataMap[key];

				if (cell !== undefined) {
					if (!currentDataSetData[labelIndex]) {
						currentDataSetData[labelIndex] = matrixValues[cell];
					} else {
						currentDataSetData[labelIndex] += matrixValues[cell];
					}
				}
			}
		}

		distributionsGraphDetails.labels.push(...distributionsGraphLabels);
		currentDataSet.data.push(...currentDataSetData);

		distributionsGraphDetails.datasets.push(currentDataSet);

		// Init obj if error or no value
		if (distributionsGraphDetails.labels.length === 0) {
			distributionsGraphDetails = undefined;
		}
		return distributionsGraphDetails;
	}

	getCurrentClusterDetailsFromNode(
		nodes,
		currentClusterDetailsFromNode = []
	): any {
		const nodesLength = nodes.length;
		for (let i = 0; i < nodesLength; i++) {
			const currentNode: any = nodes[i];
			if (currentNode.isLeaf) {
				currentClusterDetailsFromNode.push(currentNode);
			} else {
				if (currentNode.isCollapsed) {
					currentClusterDetailsFromNode.push(currentNode);
				} else {
					this.getCurrentClusterDetailsFromNode(
						currentNode.children,
						currentClusterDetailsFromNode
					);
				}
			}
		}
		return currentClusterDetailsFromNode;
	}

	onSelectBarChanged(index: any) {
		this.activeEntries = index;

		const [currentIndex, otherIndex] = this.invertDimensionsPositions();

		// Find node name from index
		const currentNodeName = this.graphDetails.labels[index];
		this.treenodesService.setSelectedNode(
			this.selectedDimensions[currentIndex].name,
			currentNodeName
		);
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
