import { Component, OnInit } from "@angular/core";
import { AppService } from "@khiops-covisualization/providers/app.service";
import { MatDialogRef } from "@angular/material/dialog";
import { DimensionsDatasService } from "@khiops-covisualization/providers/dimensions-datas.service";
import { ViewLayoutVO } from "@khiops-covisualization/model/view-layout-vo";
import * as _ from "lodash"; // Important to import lodash in karma
import { DimensionsDatasVO } from "@khiops-covisualization/model/dimensions-data-vo";

@Component({
	selector: "app-manage-views",
	templateUrl: "./manage-views.component.html",
	styleUrls: ["./manage-views.component.scss"],
})
export class ManageViewsComponent implements OnInit {
	viewsLayout: ViewLayoutVO;
	dimensionsDatas: DimensionsDatasVO;
	isDimVisible: boolean[];
	isContextView = true;

	matRippleColor = "rgba(80, 124, 182, .4)";

	constructor(
		private appService: AppService,
		private dimensionsService: DimensionsDatasService,
		private dialogRef: MatDialogRef<ManageViewsComponent>,
	) {
		this.dimensionsDatas = this.dimensionsService.getDatas();
		this.viewsLayout = _.cloneDeep(this.appService.getViewsLayout());
		this.isContextView = this.appService.getActiveTabIndex() === 1;

		this.isDimVisible = new Array(
			this.viewsLayout.dimensionsViewsLayoutsVO.length,
		).fill(true);
		for (
			let i = 0;
			i < this.viewsLayout.dimensionsViewsLayoutsVO.length;
			i++
		) {
			if (this.appService.getActiveTabIndex() === 0 && i >= 2) {
				// Hide views layouts of contexts
				this.isDimVisible[i] = false;
			} else if (this.appService.getActiveTabIndex() === 1 && i < 2) {
				// Hide views layouts of selected dimensions
				this.isDimVisible[i] = false;
			}
		}
	}

	ngOnInit() {}

	onClickOnSave() {
		this.appService.saveViewsLayout(this.viewsLayout);
		this.dialogRef.close();
	}

	onClickOnCancel() {
		this.dialogRef.close();
	}

	toggleDimension(dimensionLayout): boolean {
		dimensionLayout.isChecked = !dimensionLayout.isChecked;
		return false;
	}
}
