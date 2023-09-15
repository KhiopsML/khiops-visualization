import {
	Component,
	OnInit,
	Output,
	ViewChild,
	OnDestroy,
	EventEmitter,
	Input,
} from "@angular/core";
import { SelectableTabComponent } from "@khiops-library/components/selectable-tab/selectable-tab.component";
import { AppConfig } from "src/environments/environment";
import { AppService } from "@khiops-covisualization/providers/app.service";
import { DimensionsDatasService } from "@khiops-covisualization/providers/dimensions-datas.service";
import { ViewLayoutVO } from "@khiops-covisualization/model/view-layout-vo";
import { AxisComponent } from "../commons/axis/axis.component";
import { EventsService } from "@khiops-covisualization/providers/events.service";
import { TreenodesService } from "@khiops-covisualization/providers/treenodes.service";
import { TranslateService } from "@ngstack/translate";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SaveService } from "@khiops-covisualization/providers/save.service";

@Component({
	selector: "app-axis-view",
	templateUrl: "./axis-view.component.html",
	styleUrls: ["./axis-view.component.scss"],
})
export class AxisViewComponent
	extends SelectableTabComponent
	implements OnInit, OnDestroy
{
	@ViewChild("axisAppPos0", {
		static: false,
	})
	axisAppPos0: AxisComponent;

	@ViewChild("axisAppPos1", {
		static: false,
	})
	axisAppPos1: AxisComponent;

	tabConfig = AppConfig.covisualizationCommon.HOME;
	sizes: any;
	dimensionsDatas: any;
	@Output() toggleContext: EventEmitter<any> = new EventEmitter();
	@Input() openContextView = false;
	viewsLayout: ViewLayoutVO;
	viewsLayoutChangedSub: any;
	dimensionsSelectionChangedSub: any;
	dimensionsDatasChangedSub: any;
	isBigJsonFile = false;
	loadingView = false;

	constructor(
		private appService: AppService,
		private treenodesService: TreenodesService,
		private translate: TranslateService,
		private saveService: SaveService,
		private snackBar: MatSnackBar,
		private eventsService: EventsService,
		private dimensionsService: DimensionsDatasService
	) {
		super();
	}
	ngOnInit() {
		this.initialize();
	}

	public initialize() {
		this.loadingView = true;
		this.isBigJsonFile = this.appService.isBigJsonFile();

		setTimeout(() => {
			this.sizes = this.appService.getViewSplitSizes("axisView");
			this.dimensionsDatas = this.dimensionsService.getDatas();
			this.dimensionsService.getDimensions();
			this.dimensionsService.updateDimensions();

			// OPTIM: Unfold auto if computer is too laggy
			// if (this.dimensionsService.isLargeCocluster()) {
			// 	let unfoldState =
			// 		parseInt(
			// 			localStorage.getItem(
			// 				AppConfig.covisualizationCommon.GLOBAL.LS_ID +
			// 					"DEFAULT_LIMIT_HIERARCHY"
			// 			),
			// 			10
			// 		) ||
			// 		AppConfig.covisualizationCommon.UNFOLD_HIERARCHY
			// 			.DEFAULT_UNFOLD;

			// 	const collapsedNodes =
			// 		this.treenodesService.getLeafNodesForARank(unfoldState);
			// 	let datas =
			// 		this.saveService.constructSavedHierarchyToSave(
			// 			collapsedNodes
			// 		);

			// 	this.appService.setFileDatas(datas);

			// 	this.dimensionsDatas = this.dimensionsService.getDatas();
			// 	this.dimensionsService.updateDimensions();
			// 	this.dimensionsService.initSelectedDimensions();

			// 	this.snackBar.open(
			// 		this.translate.get(
			// 			"SNACKS.UNFOLDED_DATAS_PERFORMANCE_WARNING",
			// 			{
			// 				count: unfoldState,
			// 			}
			// 		),
			// 		this.translate.get("GLOBAL.OK"),
			// 		{
			// 			duration: 4000,
			// 			panelClass: "warning",
			// 			verticalPosition: "bottom",
			// 		}
			// 	);
			// }
			this.loadingView = false;

			this.viewsLayout = this.appService.initViewsLayout(
				this.dimensionsDatas.selectedDimensions
			);

			// Listen for view layout changes
			this.viewsLayoutChangedSub =
				this.appService.viewsLayoutChanged.subscribe((viewsLayout) => {
					this.viewsLayout = viewsLayout;
				});

			this.dimensionsSelectionChangedSub =
				this.eventsService.dimensionsSelectionChanged.subscribe(
					(selectedDimensions) => {
						this.viewsLayout =
							this.appService.updateViewsLayout(
								selectedDimensions
							);
						this.sizes =
							this.appService.getViewSplitSizes("axisView");
					}
				);

			// this.dimensionsDatasChangedSub = this.eventsService.dimensionsDatasChanged.subscribe(e => {
			// 	this.treenodesService.collapseNodesSaved();
			// });
		}, 500); // To show loader when big files
	}

	ngOnDestroy() {
		this.viewsLayoutChangedSub?.unsubscribe();
		this.dimensionsSelectionChangedSub?.unsubscribe();
		// this.dimensionsDatasChangedSub.unsubscribe();
	}

	onSplitDragEnd(event, item) {
		this.appService.resizeAndSetSplitSizes(
			item,
			this.sizes,
			event.sizes,
			"axisView"
		);

		// Resize graph when area is resized
		this.axisAppPos0.onSplitDragEnd(null, null);
		this.axisAppPos1.onSplitDragEnd(null, null);
	}

	clickOutsideContext() {
		this.toggleContext.emit();
	}
}
