import {
	Injectable
} from '@angular/core';
import * as _ from 'lodash'; // Important to import lodash in karma
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	BarVO
} from '../model/bar-vo';
import {
	DistributionDatasService
} from './distribution-datas.service';
import {
	MatrixUtilsDatasService
} from '@khiops-library/providers/matrix-utils-datas.service';
import {
	VariableDetailsVO
} from '../model/variableDetails-vo';
import {
	ChartDatasetVO
} from '@khiops-library/model/chartDataset-vo';
import {
	Preparation2dDatasService
} from './preparation2d-datas.service';
import {
	AppService
} from './app.service';
import {
	DistributionDatasVO
} from '../model/distribution-datas-vo';

@Injectable({
	providedIn: 'root'
})
export class Distribution2dDatasService {

	distributionDatas: DistributionDatasVO;

	constructor(
		private distributionDatasService: DistributionDatasService,
		private preparation2dDatasService: Preparation2dDatasService,
		private appService: AppService
	) {
		this.initialize();
	}

	initialize(): any {
		const appDatas = this.appService.getDatas().datas;
		this.distributionDatas = new DistributionDatasVO(appDatas);

		return this.distributionDatas;
	}

	getDatas(): DistributionDatasVO {
		return this.distributionDatas;
	}

	getTargetDistributionGraphDatas(type ? ): any {

		this.distributionDatas.initTargetDistributionGraphDatas();
		this.distributionDatas.setTargetDistributionType(type);

		// const datas: any = {};
		const selectedVariable = this.preparation2dDatasService.getSelectedVariable();
		const preparation2dDatas = this.preparation2dDatasService.getDatas();
		const variablesDetails: VariableDetailsVO = this.preparation2dDatasService.getVariableDetails(preparation2dDatas.selectedVariable && preparation2dDatas.selectedVariable.rank);

		this.distributionDatas.targetDistributionGraphDatas.labels = [''];

		if (variablesDetails && variablesDetails.dataGrid.cellTargetFrequencies) {

			const computedCellTargetFreqs = MatrixUtilsDatasService.getCellFrequencies(
				[selectedVariable.parts1, selectedVariable.parts2],
				variablesDetails.dataGrid.cellPartIndexes,
				variablesDetails.dataGrid.cellTargetFrequencies
			);

			const currentDatas: any = computedCellTargetFreqs[preparation2dDatas.selectedCellIndex];
			const targets = this.preparation2dDatasService.getTargetsIfAvailable();
			if (currentDatas && targets) {

				const modalityCounts = this.distributionDatasService.computeModalityCounts(computedCellTargetFreqs);

				for (let i = 0; i < currentDatas.length; i++) {

					const el = currentDatas[i];

					const graphItem: BarVO = new BarVO();
					graphItem.name = targets[i];

					if (type && type === 'GLOBAL.LIFT') {
						// compute lift
						graphItem.value = el / UtilsService.arraySum(currentDatas) / modalityCounts.totalProbability[i];
					} else {
						graphItem.value = el * 100 / UtilsService.arraySum(currentDatas);
					}

					graphItem.extra.value = el;
					graphItem.extra.percent = el * 100 / UtilsService.arraySum(currentDatas);

					const currentDataSet = new ChartDatasetVO(graphItem.name);
					currentDataSet.data.push(graphItem.value);
					currentDataSet.extra.push(graphItem);
					this.distributionDatas.targetDistributionGraphDatas.datasets.push(currentDataSet);

				}

			}
		}

		if (this.distributionDatas.targetDistributionGraphDatas.datasets.length === 0) {
			this.distributionDatas.targetDistributionGraphDatas = undefined;
		}

		return this.distributionDatas.targetDistributionGraphDatas;
	}

}
