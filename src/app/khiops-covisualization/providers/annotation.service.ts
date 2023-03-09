import {
	Injectable
} from '@angular/core';
import {
	TreeNodeVO
} from '../model/tree-node-vo';
import {
	AppService
} from '@khiops-covisualization/providers/app.service';
import {
	DimensionsDatasService
} from '@khiops-covisualization/providers/dimensions-datas.service';

@Injectable({
	providedIn: 'root'
})
export class AnnotationService {

	dimensionsDatas: any;
	annotationsToSave: any = {};

	constructor(private appService: AppService, private dimensionsDatasService: DimensionsDatasService) {
		this.initialize();
	}

	initialize() {
		this.dimensionsDatas = this.dimensionsDatasService.getDatas();
	}

	setNodeAnnotation(node: TreeNodeVO, annotation) {

		const appDatas = this.appService.getDatas().datas;

		// update the model directly
		// Find current dim position
		const currentIndex: any = this.dimensionsDatas.selectedDimensions.find(e => {
			return node.hierarchy === e.name;
		}).startPosition;

		let currentCluster;

		// update dimensionHierarchies json datas
		const currentDimensionHierarchy: any = appDatas.coclusteringReport.dimensionHierarchies[currentIndex];
		currentCluster = currentDimensionHierarchy.clusters.find(e => {
			return node.name === e.cluster;
		});
		currentCluster.description = annotation;

	}

}
