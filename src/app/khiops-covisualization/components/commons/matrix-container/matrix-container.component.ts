import {
	Component,
	OnInit,
	ViewChild,
	OnDestroy,
	Input,
} from "@angular/core";
import {
	AppService
} from "@khiops-covisualization/providers/app.service";
import {
	DimensionsDatasService
} from "@khiops-covisualization/providers/dimensions-datas.service";
import {
	MatrixCanvasComponent
} from "@khiops-library/components/matrix-canvas/matrix-canvas.component";
import {
	ViewLayoutVO
} from "@khiops-covisualization/model/view-layout-vo";
import {
	EventsService
} from "@khiops-covisualization/providers/events.service";
import {
	TreenodesService
} from "@khiops-covisualization/providers/treenodes.service";
import {
	AppConfig
} from "src/environments/environment";
import {
	Subscription
} from "rxjs";
import {
	DimensionsDatasVO
} from "@khiops-covisualization/model/dimensions-data-vo";
import {
	MatrixModesI
} from '@khiops-library/interfaces/matrix-modes';
import {
	MatrixOptionsI
} from '@khiops-library/interfaces/matrix-options';
import {
	MatrixModeI
} from "@khiops-library/interfaces/matrix-mode";
import {
	CellVO
} from "@khiops-library/model/cell-vo";

@Component({
	selector: "app-matrix-container",
	templateUrl: "./matrix-container.component.html",
	styleUrls: ["./matrix-container.component.scss"],
})
export class MatrixContainerComponent implements OnInit, OnDestroy {
	@ViewChild("matrixCanvas", {
		static: false,
	})
	matrixCanvas: MatrixCanvasComponent;

	@Input() viewId: string;
	@Input() sizeId: string;
	@Input() dimensionsDatas: DimensionsDatasVO;
	@Input() viewsLayout: ViewLayoutVO;

	sizes: any;

	matrixModes: MatrixModesI = new MatrixModesI();
	matrixOptions: MatrixOptionsI = new MatrixOptionsI();

	isFullscreen = false;
	treeSelectedNodeChangedSub: Subscription;
	viewsLayoutChangedSub: Subscription;
	initNodesEvents = 0; // improve draw matrix perf
	isFirstLoad = true;

	constructor(
		private appService: AppService,
		private treenodesService: TreenodesService,
		private eventsService: EventsService,
		private dimensionsService: DimensionsDatasService
	) {
		this.treeSelectedNodeChangedSub =
			this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
				this.initNodesEvents++;
				if (this.isFirstLoad) {
					// At first launch collapse saved collapsed nodes
					this.isFirstLoad = false;
				} else {
					// check if it's a context selection to redraw matrix
					const isContextDimension =
						this.dimensionsService.isContextDimension(
							e.hierarchyName
						);

					if (
						(!e.stopPropagation &&
							this.initNodesEvents ===
							this.dimensionsDatas.dimensions.length) ||
						isContextDimension
					) {
						this.matrixCanvas.drawMatrix();
					} else if (
						!e.stopPropagation &&
						this.initNodesEvents >
						this.dimensionsDatas.dimensions.length
					) {
						this.matrixCanvas.drawSelectedNodes();
					}
				}
			});

		this.viewsLayoutChangedSub =
			this.appService.viewsLayoutChanged.subscribe((viewsLayout) => {
				this.viewsLayout = viewsLayout;

				// Redraw matrix event to resize cells
				setTimeout(() => {
					window.dispatchEvent(new Event("resize"));
				});
			});
	}

	ngOnInit() {
		this.sizes = this.appService.getViewSplitSizes(this.viewId);
		this.dimensionsDatas = this.dimensionsService.getDatas();
		this.constructModeSelectBox();
		this.constructOptionsSelectBox();
	}

	ngOnDestroy() {
		this.viewsLayoutChangedSub ?.unsubscribe();
		this.treeSelectedNodeChangedSub ?.unsubscribe();
	}

	onToggleFullscreen(isFullscreen: boolean) {
		this.isFullscreen = isFullscreen;
		setTimeout(() => {
			this.matrixCanvas.drawMatrix();
		});
	}

	constructOptionsSelectBox() {
		this.matrixOptions.selected =
			this.dimensionsDatas.matrixOption ||
			localStorage.getItem(
				AppConfig.covisualizationCommon.GLOBAL.LS_ID +
				"MATRIX_TYPE_OPTION"
			) ||
			this.matrixOptions.types[0];
	}

	constructModeSelectBox() {
		const varName1 = this.dimensionsDatas.matrixDatas.variable.nameX;
		const varName2 = this.dimensionsDatas.matrixDatas.variable.nameY;

		this.matrixModes.types = [{
				mode: "MUTUAL_INFO",
				title: "I (" + varName1 + " , " + varName2 + ")",
			},
			{
				mode: "FREQUENCY",
				title: "Frequency",
			},
			{
				mode: "PROB_CELL",
				title: "P (" + varName2 + " | " + varName1 + ")",
			},
			{
				mode: "PROB_CELL_REVERSE",
				title: "P (" + varName1 + " | " + varName2 + ")",
			},
			{
				mode: "HELLINGER",
				title: "H (" + varName1 + " , " + varName2 + ")",
			},
		];
		if (!this.matrixModes.selectedIndex) {
			// Select MUTUAL_INFO by default
			this.matrixModes.selected = this.matrixModes.types[0];
			this.matrixModes.selectedIndex = 0;
		} else {
			// In case of dimension selection change
			// We must update the combobox
			this.matrixModes.selected =
				this.matrixModes.types[this.matrixModes.selectedIndex];
		}

		// Check if saved into json
		if (this.dimensionsDatas.matrixMode !== undefined && this.dimensionsDatas.matrixMode < this.matrixModes.types.length) {
			this.matrixModes.selected = this.matrixModes.types[this.dimensionsDatas.matrixMode];
			this.matrixModes.selectedIndex = this.dimensionsDatas.matrixMode;
		}

	}

	onSplitDragEnd(event, item) {
		this.appService.resizeAndSetSplitSizes(
			item,
			this.sizes,
			event.sizes,
			this.viewId
		);
	}

	onCellSelected(event: {
		datas: CellVO
	}) {
		this.treenodesService.setSelectedNode(
			event.datas.xnamePart,
			event.datas.xaxisPart,
			true
		);
		this.treenodesService.setSelectedNode(
			event.datas.ynamePart,
			event.datas.yaxisPart,
			true
		);
	}

	onMatrixAxisInverted() {
		this.dimensionsService.toggleIsAxisInverted();
	}

	changeMatrixType(type: string) {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_type', type);
		localStorage.setItem(
			AppConfig.covisualizationCommon.GLOBAL.LS_ID + "MATRIX_TYPE_OPTION",
			type
		);
		this.dimensionsDatas.matrixOption = type; // Save it into the global model to keep it into saved datas
		this.matrixOptions.selected = type;
	}

	changeMatrixMode(mode: MatrixModeI) {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_mode', mode.mode);
		this.matrixModes.selected = mode;
		this.matrixModes.selectedIndex = this.matrixModes.types.findIndex(
			(e) => e.mode === mode.mode
		);
		this.dimensionsDatas.matrixMode = this.matrixModes.selectedIndex; // Save it into the global model to keep it into saved datas
	}

	changeConditionalOnContext() {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_conditionnal_on_context');
		this.dimensionsDatas.conditionalOnContext = !this.dimensionsDatas.conditionalOnContext;
		this.treenodesService.initConditionalOnContextNodes();
	}
}
