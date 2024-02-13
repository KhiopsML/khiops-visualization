import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { AppService } from "@khiops-covisualization/providers/app.service";
import { DimensionViewLayoutVO } from "@khiops-covisualization/model/view-layout-vo";
import { VariableGraphDetailsComponent } from "../variable-graph-details/variable-graph-details.component";
import { DimensionVO } from "@khiops-library/model/dimension-vo";
import { TreeNodeVO } from "@khiops-covisualization/model/tree-node-vo";
import { CompositionVO } from "@khiops-covisualization/model/composition-vo";
import { DimensionsDatasVO } from "@khiops-covisualization/model/dimensions-data-vo";

@Component({
	selector: "app-axis",
	templateUrl: "./axis.component.html",
	styleUrls: ["./axis.component.scss"],
})
export class AxisComponent implements OnInit {
	@ViewChild("appVariableGraphDetails", {
		static: false,
	})
	appVariableGraphDetails: VariableGraphDetailsComponent;

	@Input() viewId: string;
	@Input() sizeId: string;
	@Input() position: number;
	@Input() dimensionsDatas: DimensionsDatasVO;
	@Input() axisLayout: DimensionViewLayoutVO;
	sizes: any;

	selectedDimension: DimensionVO;
	selectedNode: DimensionVO;
	dimensionsTree: TreeNodeVO[];
	dimensionsClusters: TreeNodeVO[][];

	column0Index = 0;
	column1Index = 1;
	column2Index = 2;
	column3Index = 3;
	column4Index = 4;

	viewLayout: DimensionViewLayoutVO;
	invertedPosition: number;
	selectedComposition: CompositionVO;

	constructor(private appService: AppService) {}

	ngOnInit() {
		this.initializeView();
	}

	initializeView() {
		this.sizes = this.appService.getViewSplitSizes(this.viewId);
		this.computeComponentsSizes();
		this.invertedPosition = this.position === 0 ? 1 : 0;
	}

	onSplitDragEnd(event, item) {
		if (event && item) {
			this.appService.resizeAndSetSplitSizes(
				item,
				this.sizes,
				event.sizes,
				this.viewId,
				true,
			);
			this.computeComponentsSizes();
		}

		// Resize to update graphs dimensions
		if (this.appVariableGraphDetails) {
			this.appVariableGraphDetails.resize();
		}
	}

	/**
	 * Compute the index of visible components
	 * to get correct width split value from local storage
	 * because sizes[sizeId] is an array of visible components length
	 */
	computeComponentsSizes() {
		this.viewLayout =
			this.appService.getViewsLayout().dimensionsViewsLayoutsVO[
				this.position
			];
		if (this.viewLayout) {
			let i = 0;
			if (this.viewLayout.isHierarchyChecked) {
				this.column0Index = i;
				i++;
			}
			if (this.viewLayout.isClustersChecked) {
				this.column1Index = i;
				i++;
			}
			if (
				this.viewLayout.isAnnotationChecked ||
				this.viewLayout.isCompositionChecked
			) {
				this.column2Index = i;
				i++;
			}
			if (this.viewLayout.isExternalDataChecked) {
				this.column3Index = i;
				i++;
			}
			if (this.viewLayout.isDistributionChecked) {
				this.column4Index = i;
				i++;
			}
		}
	}

	selectedCompositionChanged(composition: CompositionVO) {
		this.selectedComposition = composition;
	}
}
