import {
	Component,
	ViewChild,
} from '@angular/core';
import {
	AppService
} from '@khiops-visualization/providers/app.service';
import {
	Preparation2dDatasService
} from '@khiops-visualization/providers/preparation2d-datas.service';
import {
	TargetDistributionGraphCanvasComponent
} from '../target-distribution-graph-canvas/target-distribution-graph-canvas.component';
import {
	AppConfig
} from 'src/environments/environment';
import {
	Distribution2dDatasService
} from '@khiops-visualization/providers/distribution2d-datas.service';
import { Preparation2dDatasVO } from '@khiops-visualization/model/preparation2d-datas-vo';
import { DistributionDatasVO } from '@khiops-visualization/model/distribution-datas-vo';

@Component({
	selector: 'app-var-details-preparation-2d',
	templateUrl: './var-details-preparation-2d.component.html',
	styleUrls: ['./var-details-preparation-2d.component.scss']
})
export class VarDetailsPreparation2dComponent {

	@ViewChild('targetDistributionGraphCanvas', {
		static: false
	}) targetDistributionGraphCanvas: TargetDistributionGraphCanvasComponent;

	appDatas: any;
	sizes: any;

	preparation2dDatas: Preparation2dDatasVO;
	distribution2dDatas: DistributionDatasVO;
	scaleValue = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SCALE_VALUE') || AppConfig.visualizationCommon.GLOBAL.DEFAULT_GRAPH_SCALE;
	currentCellIndex: number;
	targetDistributionGraphType: string

	constructor(
		private distribution2dDatasService: Distribution2dDatasService,
		private preparation2dDatasService: Preparation2dDatasService,
		private appService: AppService) {

		this.targetDistributionGraphType = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'TARGET_DISTRIBUTION_GRAPH_OPTION');

		this.appDatas = this.appService.getDatas().datas;
		this.preparation2dDatas = this.preparation2dDatasService.getDatas();
		this.distribution2dDatas = this.distribution2dDatasService.getDatas();

		this.sizes = this.appService.getViewSplitSizes('preparation2dView');
		this.distribution2dDatasService.getTargetDistributionGraphDatas(this.targetDistributionGraphType);
	}

	onSplitDragEnd(event: any, item: string) {
		this.appService.resizeAndSetSplitSizes(item, this.sizes, event.sizes, 'preparation2dView');
		this.resizeTargetDistributionGraph();
	}

	onSelectCellRowChanged(index: number) {
		this.currentCellIndex = index;
		this.distribution2dDatasService.getTargetDistributionGraphDatas(this.targetDistributionGraphType);
		this.resizeTargetDistributionGraph();
	}

	resizeTargetDistributionGraph() {
		setTimeout(() => {
			// Resize to update graphs dimensions
			if (this.targetDistributionGraphCanvas) {
				this.targetDistributionGraphCanvas.resizeGraph();
			}
		}); // do it after view dom complete
	}

	onTargetDistributionGraphTypeChanged(type: string) {
		this.targetDistributionGraphType = type;
		this.distribution2dDatasService.getTargetDistributionGraphDatas(this.targetDistributionGraphType);
	}

}
