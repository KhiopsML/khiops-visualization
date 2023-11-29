import {
	Injectable
} from "@angular/core";
import {
	AppService
} from "@khiops-covisualization/providers/app.service";
import {
	DimensionsDatasService
} from "@khiops-covisualization/providers/dimensions-datas.service";
import {
	TreenodesService
} from "./treenodes.service";
import {
	SaveService
} from "./save.service";
import {
	DimensionVO
} from "@khiops-library/model/dimension-vo";

@Injectable({
	providedIn: "root",
})
export class HierarchyService {
	dimensionsDatas: any;
	hierarchyFold: any = {};

	constructor(
		private appService: AppService,
		private saveService: SaveService,
		private dimensionsDatasService: DimensionsDatasService,
		private treenodesService: TreenodesService
	) {}

	initialize() {
		this.dimensionsDatas = this.dimensionsDatasService.getDatas();
		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			if (
				this.hierarchyFold[this.dimensionsDatas.dimensions[i].name] !==
				undefined
			) {
				this.dimensionsDatas.dimensions[i].setHierarchyFold(
					this.hierarchyFold[this.dimensionsDatas.dimensions[i].name]
				);
			}
		}
	}

	toggleDimensionHierarchyFold(dimensionName: string, state: boolean) {
		this.hierarchyFold[dimensionName] = state;

		const dimension: DimensionVO = this.dimensionsDatas.dimensions.find(
			(e) => e.name === dimensionName
		);
		dimension.setHierarchyFold(state);
	}

	unfoldHierarchy(currentRank) {

		const collapsedNodes =
			this.treenodesService.getLeafNodesForARank(currentRank);

		for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
			// Remove dimension if unchecked
			if (this.dimensionsDatas.dimensions[i].hierarchyFold === false) {
				delete collapsedNodes[this.dimensionsDatas.dimensions[i].name];
			}

			// if (i > 1) {
			// 	delete collapsedNodes[this.dimensionsDatas.dimensions[i].name];
			// }
		}
		this.treenodesService.setSavedCollapsedNodes(collapsedNodes);

		let datas =
			this.saveService.constructSavedHierarchyToSave(collapsedNodes);
		this.appService.setCroppedFileDatas(datas);

		this.dimensionsDatas = this.dimensionsDatasService.getDatas();
		this.dimensionsDatasService.getDimensions();
		this.dimensionsDatasService.initSelectedDimensions();
		this.dimensionsDatasService.saveInitialDimension();

		// datas.savedDatas.collapsedNodes = collapsedNodesToSave

		this.dimensionsDatasService.constructDimensionsTrees();

		this.dimensionsDatasService.getMatrixDatas();


	}
}
