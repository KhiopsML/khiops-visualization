import {
	Component,
	OnInit,
	NgZone,
	OnDestroy,
	OnChanges,
	SimpleChanges,
	AfterViewInit,
	Input,
} from "@angular/core";
import _ from "lodash";
import { SelectableService } from "@khiops-library/components/selectable/selectable.service";
import { GridDatasI } from "@khiops-library/interfaces/grid-datas";
import { TranslateService } from "@ngstack/translate";
import { TreePreparationDatasService } from "@khiops-visualization/providers/tree-preparation-datas.service";

@Component({
	selector: "app-tree-details",
	templateUrl: "./tree-details.component.html",
	styleUrls: ["./tree-details.component.scss"],
})
export class TreeDetailsComponent
	implements OnInit, AfterViewInit, OnChanges, OnDestroy {
	@Input() selectedNodes: any;
	@Input() selectedNode: any;

	treeDetails: GridDatasI;

	constructor(
		public ngzone: NgZone,
		public selectableService: SelectableService,
		private treePreparationDatasService: TreePreparationDatasService,
		public translate: TranslateService
	) { }

	ngOnInit() { }

	ngAfterViewInit() { }

	ngOnDestroy() { }

	ngOnChanges(changes: SimpleChanges) {
		if (changes.selectedNodes && changes.selectedNodes.currentValue) {
			this.treeDetails =
				this.treePreparationDatasService.getTreeDetails();
		}
	}

	onSelectListItemChanged(item: any) {
		this.treePreparationDatasService.setSelectedNode(item, true);
	}
}
