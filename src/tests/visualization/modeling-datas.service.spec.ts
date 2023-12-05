import {
	TestBed
} from '@angular/core/testing';

import {
	ModelingDatasService
} from '@khiops-visualization/providers/modeling-datas.service';
import {
	HttpClientModule
} from '@angular/common/http';
import {
	AppService
} from '@khiops-visualization/providers/app.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import {
	PreparationDatasService
} from '@khiops-visualization/providers/preparation-datas.service';

let modelingDatasService: ModelingDatasService;
let preparationDatasService: PreparationDatasService;
let appService: AppService;

describe('Visualization', () => {
describe('ModelingDatasService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
			]
		});

		// Inject services
		modelingDatasService = TestBed.inject(ModelingDatasService);
		preparationDatasService = TestBed.inject(PreparationDatasService);
		appService = TestBed.inject(AppService);
	});

	it('should be created', () => {
		expect(modelingDatasService).toBeTruthy();
	});

	it('appService should be created', () => {
		expect(appService).toBeTruthy();
	});

	it('getVariableFromName should return valid datas [C100_AllReports, Numerical, Mean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5, R6]', () => {

		const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
		appService.setFileDatas(fileDatas);

		preparationDatasService.initialize();
		modelingDatasService.initialize();

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[5], 'preparationReport');
		const res = JSON.stringify(modelingDatasService.getVariableFromName('Mean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5'));

		const expectedRes = {
			preparedName: 'PMean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5',
			name: 'Mean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5',
			level: 0.00631521,
			weight: 0.128841
		};
		expect(res).toEqual(JSON.stringify(expectedRes));
	});

	it('setSelectedPredictor and getTrainedPredictorDisplayedColumns should return valid datas [C100_AllReports, R2]', () => {

		const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
		appService.setFileDatas(fileDatas);

		preparationDatasService.initialize();
		modelingDatasService.initialize();

		modelingDatasService.setSelectedPredictor({
			rank: 'R2',
			type: 'Classifier',
			family: 'Selective Naive Bayes',
			name: 'Selective Naive Bayes',
			variables: 100
		});
		modelingDatasService.getTrainedPredictorListDatas();
		const res = JSON.stringify(modelingDatasService.getTrainedPredictorDisplayedColumns());

		const expectedRes = [{
			'headerName': 'name',
			'field': 'name',
			'tooltip': 'TOOLTIPS.MODELING.VARIABLES.NAME'
		}, {
			'headerName': 'level',
			'field': 'level',
			'tooltip': 'TOOLTIPS.MODELING.VARIABLES.LEVEL'
		}, {
			'headerName': 'weight',
			'field': 'weight',
			'tooltip': 'TOOLTIPS.MODELING.VARIABLES.WEIGHT'
		}, {
			'headerName': 'map',
			'field': 'map',
			'tooltip': 'TOOLTIPS.MODELING.VARIABLES.MAP'
		}];
		expect(res).toEqual(JSON.stringify(expectedRes));
	});

});
});
