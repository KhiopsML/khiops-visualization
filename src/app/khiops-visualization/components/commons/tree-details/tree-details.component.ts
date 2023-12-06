import {
	Component,
	NgZone,
	OnChanges,
	SimpleChanges,
	Input,
} from "@angular/core";
import _ from "lodash";
import { SelectableService } from "@khiops-library/components/selectable/selectable.service";
import { GridDatasI } from "@khiops-library/interfaces/grid-datas";
import { TranslateService } from "@ngstack/translate";
import { TreePreparationDatasService } from "@khiops-visualization/providers/tree-preparation-datas.service";
import { TreeNodeVO } from "@khiops-visualization/model/tree-node-vo";

@Component({
	selector: "app-tree-details",
	templateUrl: "./tree-details.component.html",
	styleUrls: ["./tree-details.component.scss"],
})
export class TreeDetailsComponent
	implements OnChanges
{
	@Input() selectedNodes: TreeNodeVO[];
	@Input() selectedNode: TreeNodeVO;

	treeDetails: GridDatasI;

	constructor(
		public ngzone: NgZone,
		public selectableService: SelectableService,
		private treePreparationDatasService: TreePreparationDatasService,
		public translate: TranslateService
	) {}

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
