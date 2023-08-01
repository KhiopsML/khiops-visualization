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
	isLoadingDistribution: boolean;

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
				this.getFilteredDistribution(this.dimensionsTree);
			});
		this.treeSelectedNodeChangedSub =
			this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
				if (
					(e.selectedNode &&
						e.hierarchyName === this.selectedDimension.name) ||
					!this.graphDetails
				) {
					// Only compute distribution of the other node
					this.getFilteredDistribution(this.dimensionsTree);
				}
			});
		this.treeNodeNameChangedSub =
			this.eventsService.treeNodeNameChanged.subscribe((e) => {
				this.getFilteredDistribution(this.dimensionsTree);
			});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.selectedNode && changes.selectedNode.currentValue) {
			// get active entries index from name
			if (this.graphDetails) {
				this.activeEntries = this.graphDetails.labels.findIndex(
					(e) => e === this.selectedNode.shortDescription
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

	async getFilteredDistribution(dimensionsTree) {
		setTimeout(() => {
			if (dimensionsTree && this.selectedNode) {
				// EVOL we want to interchange distribution graphs
				// so we interchange otherIndex and currentIndex
				const [currentIndex, otherIndex] =
					this.invertDimensionsPositions();

				this.isLoadingDistribution = true;
				setTimeout(() => {
					// Do not display computing message for small computings (> 100ms)
					if (this.isLoadingDistribution) {
						this.graphDetails = undefined;
					}
				}, 100);

				this.isLoadingDistribution = false;
				const mapDatas =
					this.dimensionsDatasService.dimensionsDatas.matrixDatas.matrixCellDatas.map(
						({ yaxisPart, xaxisPart, displayedFreqValue }) => ({
							yaxisPart,
							xaxisPart,
							displayedFreqValue,
						})
					);

				this.graphDetails = this.getDistributionDetailsFromNode(
					this.dimensionsDatasService.dimensionsDatas.selectedNodes,
					this.dimensionsDatasService.dimensionsDatas.dimensionsTrees[
						currentIndex
					],
					mapDatas,
					currentIndex,
					otherIndex
				);

				if (this.graphDetails && this.graphDetails.labels) {
					this.activeEntries = this.graphDetails.labels.findIndex(
						(e) => e === this.selectedNode.shortDescription
					);
					this.legend = this.graphDetails.datasets[0].label;
				}
				this.updateGraphTitle();
			}
		});
	}

	getDistributionDetailsFromNode(
		selectedNodes,
		dimensionsTree,
		matrixCellDatas,
		currentIndex,
		otherIndex
	) {
		let distributionsGraphDetails = {
			datasets: [],
			labels: [],
		};
		const t0 = performance.now();
		if (selectedNodes.length >= 2) {
			let currentYpart = selectedNodes[0].name;
			let currentDisplayYpart = selectedNodes[0].shortDescription;

			if (currentIndex === 0) {
				currentYpart = selectedNodes[1].name;
				currentDisplayYpart = selectedNodes[1].shortDescription;
			}

			const currentDataSet = new ChartDatasetVO(currentDisplayYpart);
			const filteredDimensionsClusters =
				this.getCurrentClusterDetailsFromNode(dimensionsTree);

			const isNodeAndCollapsed =
				!selectedNodes[otherIndex].isLeaf &&
				!selectedNodes[otherIndex].isCollapsed;

			if (!isNodeAndCollapsed) {
				let filterDatas = matrixCellDatas.filter(
					(e) =>
						e.yaxisPart === currentYpart ||
						e.xaxisPart === currentYpart
				);
				for (let i = 0; i < filteredDimensionsClusters.length; i++) {
					const currentXpart = filteredDimensionsClusters[i].name;
					const currentDisplayXpart =
						filteredDimensionsClusters[i].shortDescription;
					distributionsGraphDetails.labels.push(currentDisplayXpart);
					let currentDataValue = 0;
					let cell: any;
					// leaf
					if (currentIndex === 0) {
						cell = filterDatas.find(
							(e) => e.xaxisPart === currentXpart
						);
					} else {
						cell = filterDatas.find(
							(e) => e.yaxisPart === currentXpart
						);
					}
					if (cell) {
						currentDataValue = cell.displayedFreqValue || 0;
					}
					currentDataSet.data.push(currentDataValue);
				}
			} else {
				const currentDataSetData = [];
				const distributionsGraphLabels = [];
				const childrenLeafSet = new Set(
					selectedNodes[otherIndex].childrenLeafList
				);

				const matrixCellDataMap = matrixCellDatas.reduce(
					(map, data) => {
						const key = `${data.yaxisPart}-${data.xaxisPart}`;
						map[key] = data;
						return map;
					},
					{}
				);
				for (const filteredDimensionCluster of filteredDimensionsClusters) {
					const currentXpart = filteredDimensionCluster.name;
					const currentDisplayXpart =
						filteredDimensionCluster.shortDescription;
					distributionsGraphLabels.push(currentDisplayXpart);

					let currentDataValue = 0;

					for (const currentChild of childrenLeafSet) {
						const key =
							currentIndex === 0
								? `${currentChild}-${currentXpart}`
								: `${currentXpart}-${currentChild}`;
						const cell = matrixCellDataMap[key];
						if (cell) {
							currentDataValue += cell.displayedFreqValue || 0;
						}
					}

					currentDataSetData.push(currentDataValue);
				}

				distributionsGraphDetails.labels.push(
					...distributionsGraphLabels
				);
				currentDataSet.data.push(...currentDataSetData);
			}

			distributionsGraphDetails.datasets.push(currentDataSet);
		}

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
