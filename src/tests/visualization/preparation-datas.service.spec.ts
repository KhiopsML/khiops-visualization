import {
	TestBed
} from '@angular/core/testing';

import {
	PreparationDatasService
} from '@khiops-visualization/providers/preparation-datas.service';
import {
	HttpClientModule
} from '@angular/common/http';
import {
	AppService
} from '@khiops-visualization/providers/app.service';
import * as _ from 'lodash'; // Important to import lodash in karma

let preparationDatasService: PreparationDatasService;
let appService: AppService;

describe('Visualization', () => {
describe('PreparationDatasService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
			]
		});

		// Inject services
		preparationDatasService = TestBed.inject(PreparationDatasService);
		appService = TestBed.inject(AppService);
	});

	it('preparationDatasService should be created', () => {
		expect(preparationDatasService).toBeTruthy();
	});

	it('appService should be created', () => {
		expect(appService).toBeTruthy();
	});

	it('getTargetVariableStatsDatas should return valid datas [bi2, Categorical]', () => {

		const fileDatas = require('../mocks/visualization/bi2.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		const intervalDatas = preparationDatasService.getTargetVariableStatsDatas();

		expect(intervalDatas).not.toBeDefined();
	});

	it('getTargetVariableStatsDatas should return valid datas [C100_AllReports, Numerical]', () => {

		const fileDatas = require('../mocks/visualization/C100_AllReports.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		preparationDatasService.getSummaryDatas();
		preparationDatasService.getInformationsDatas('preparationReport');
		const intervalDatas = JSON.stringify(preparationDatasService.getTargetVariableStatsDatas());

		const expectedRes = {
			'datasets': [{
				'data': [0.4700365714285714],
				'extra': [{
					"defaultGroupIndex": false,
					'name': '0',
					'value': 0.4700365714285714,
					'extra': {
						'value': 4935384,
						'percent': 47.00365714285714
					}
				}],
				'minBarLength': 3,
				'fill': false,
				'label': '0',
				'type': 'bar'
			}, {
				'data': [0.5299634285714285],
				'extra': [{
					"defaultGroupIndex": false,
					'name': '1',
					'value': 0.5299634285714285,
					'extra': {
						'value': 5564616,
						'percent': 52.99634285714286
					}
				}],
				'minBarLength': 3,
				'fill': false,
				'label': '1',
				'type': 'bar'
			}],
			'labels': ['']
		};
		expect(intervalDatas).toEqual(JSON.stringify(expectedRes));
	});

	it('getTargetVariableStatsDatas should return valid datas [adult-bivar, Numerical]', () => {

		const fileDatas = require('../mocks/visualization/adult-bivar.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		preparationDatasService.getSummaryDatas();
		preparationDatasService.getInformationsDatas('preparationReport');
		const intervalDatas = JSON.stringify(preparationDatasService.getTargetVariableStatsDatas());

		const expectedRes = {
			'datasets': [{
				'data': [0.7616316497922397],
				'extra': [{
					"defaultGroupIndex": false,
					'name': 'less',
					'value': 0.7616316497922397,
					'extra': {
						'value': 26028,
						'percent': 76.16316497922398
					}
				}],
				'minBarLength': 3,
				'fill': false,
				'label': 'less',
				'type': 'bar'
			}, {
				'data': [0.2383683502077603],
				'extra': [{
					"defaultGroupIndex": false,
					'name': 'more',
					'value': 0.2383683502077603,
					'extra': {
						'value': 8146,
						'percent': 23.83683502077603
					}
				}],
				'minBarLength': 3,
				'fill': false,
				'label': 'more',
				'type': 'bar'
			}],
			'labels': ['']
		};
		expect(intervalDatas).toEqual(JSON.stringify(expectedRes));
	});

	it('getCurrentIntervalDatas should return valid datas [C100_AllReports, Numerical, var = R1, index = undefined]', () => {

		const fileDatas = require('../mocks/visualization/C100_AllReports.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[0], 'preparationReport');
		const intervalDatas = preparationDatasService.getCurrentIntervalDatas('preparationReport');

		const expectedRes = {
			'title': 'GLOBAL.CURRENT_INTERVAL',
			'values': [{
				'interval': '[0.0002370088478,0.3074067]'
			}],
			'displayedColumns': [{
				'headerName': 'GLOBAL.INTERVAL_OFMean(LLFields.missing energy magnitude)',
				'field': 'interval'
			}]
		};

		expect(intervalDatas).toEqual(expectedRes);
	});

	it('getCurrentIntervalDatas should return valid datas [C100_AllReports, Numerical, var = R2, index = 15]', () => {

		const fileDatas = require('../mocks/visualization/C100_AllReports.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[1], 'preparationReport');
		const intervalDatas = preparationDatasService.getCurrentIntervalDatas('preparationReport', 15);

		const expectedRes = {
			'title': 'GLOBAL.CURRENT_INTERVAL',
			'values': [{
				'interval': ']2.049679,2.23972]'
			}],
			'displayedColumns': [{
				'headerName': 'GLOBAL.INTERVAL_OFMean(LLFields.missing energy magnitude) where jet 2 pt > 0.8902',
				'field': 'interval'
			}]
		};

		expect(intervalDatas).toEqual(expectedRes);
	});

	it('getCurrentIntervalDatas should return valid datas [adult-bivar, Categorical, var = R1, index = undefined]', () => {

		const fileDatas = require('../mocks/visualization/adult-bivar.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[0], 'preparationReport');
		const intervalDatas = preparationDatasService.getCurrentIntervalDatas('preparationReport');

		const expectedRes = {
			'title': 'GLOBAL.CURRENT_GROUP',
			'values': [{
				'values': 'Husband',
				'frequency': 13781
			}, {
				'values': 'Wife',
				'frequency': 1648
			}],
			'displayedColumns': [{
				'headerName': 'GLOBAL.VALUES_OFrelationship',
				'field': 'values'
			}, {
				'headerName': 'GLOBAL.FREQUENCY',
				'field': 'frequency'
			}]
		};

		expect(intervalDatas).toEqual(jasmine.objectContaining(expectedRes));
	});

	it('getCurrentIntervalDatas should return valid datas [adult-bivar, Categorical, var = R1, index = 1]', () => {

		const fileDatas = require('../mocks/visualization/adult-bivar.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[0], 'preparationReport');
		const intervalDatas = preparationDatasService.getCurrentIntervalDatas('preparationReport', 1);

		const expectedRes = {
			'title': 'GLOBAL.CURRENT_GROUP',
			'values': [{
				'values': 'Not-in-family',
				'frequency': 8787
			}],
			'displayedColumns': [{
				'headerName': 'GLOBAL.VALUES_OFrelationship',
				'field': 'values'
			}, {
				'headerName': 'GLOBAL.FREQUENCY',
				'field': 'frequency'
			}]
		};

		expect(intervalDatas).toEqual(jasmine.objectContaining(expectedRes));
	});

	it('getCurrentIntervalDatas should return valid datas [bi2, Numerical, var = R2, index = 1]', () => {

		const fileDatas = require('../mocks/visualization/bi2.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[1], 'preparationReport');
		const intervalDatas = preparationDatasService.getCurrentIntervalDatas('preparationReport', 1);

		const expectedRes = {
			'title': 'GLOBAL.CURRENT_INTERVAL',
			'values': [{
				'interval': ']24.5,31.5]'
			}],
			'displayedColumns': [{
				'headerName': 'GLOBAL.INTERVAL_OFage',
				'field': 'interval'
			}]
		};

		expect(intervalDatas).toEqual(jasmine.objectContaining(expectedRes));
	});

	it('getCurrentIntervalDatas should return valid datas [bi2, Categorical, var = R6, index = 3]', () => {

		const fileDatas = require('../mocks/visualization/bi2.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[5], 'preparationReport');
		const intervalDatas = preparationDatasService.getCurrentIntervalDatas('preparationReport', 3);

		const expectedRes = {
			'title': 'GLOBAL.CURRENT_GROUP',
			'values': [{
				'values': 'Prof-school',
				'frequency': 834
			}, {
				'values': '9th',
				'frequency': 756
			}, {
				'values': '12th',
				'frequency': 657
			}, {
				'values': 'Doctorate',
				'frequency': 594
			}, {
				'values': '5th-6th',
				'frequency': 509
			}, {
				'values': '1st-4th',
				'frequency': 247
			}, {
				'values': 'Preschool',
				'frequency': 83
			}],
			'displayedColumns': [{
				'headerName': 'GLOBAL.VALUES_OFeducation',
				'field': 'values'
			}, {
				'headerName': 'GLOBAL.FREQUENCY',
				'field': 'frequency'
			}]
		};

		expect(intervalDatas).toEqual(jasmine.objectContaining(expectedRes));
	});

	it('getCurrentIntervalDatas should return valid datas [Essai_1_AllReports, Categorical, var = R055, index = 0]', () => {

		const fileDatas = require('../mocks/visualization/Essai_1_AllReports.json');
		appService.setFileDatas(fileDatas);
		preparationDatasService.initialize();

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[56], 'preparationReport');
		const intervalDatas = preparationDatasService.getCurrentIntervalDatas('preparationReport', 0);

		const expectedRes = {
			'title': 'GLOBAL.CURRENT_GROUP',
			'values': [{
				'values': 'SAMSUNG',
				'frequency': 9321
			}, {
				'values': 'APPLE',
				'frequency': 6124
			}, {
				'values': 'HUAWEI',
				'frequency': 2549
			}, {
				'values': 'SONY',
				'frequency': 775
			}, {
				'values': 'DORO',
				'frequency': 662
			}, {
				'values': 'WIKO',
				'frequency': 597
			}, {
				'values': 'NOKIA',
				'frequency': 513
			}, {
				'values': 'XIAOMI',
				'frequency': 483
			}, {
				'values': 'ORANGE',
				'frequency': 361
			}, {
				'values': 'HONOR',
				'frequency': 294
			}, {
				'values': 'ASUS',
				'frequency': 172
			}, {
				'values': 'LG',
				'frequency': 146
			}, {
				'values': 'ALCATEL',
				'frequency': 134
			}, {
				'values': 'CROSSCALL',
				'frequency': 127
			}, {
				'values': 'ONEPLUS',
				'frequency': 125
			}, {
				'values': 'MOTOROLA',
				'frequency': 114
			}, {
				'values': 'HTC',
				'frequency': 75
			}, {
				'values': 'OPPO',
				'frequency': 46
			}, {
				'values': 'LOGICOM',
				'frequency': 36
			}, {
				'values': 'ARCHOS',
				'frequency': 34
			}, {
				'values': 'BLACKBERRY',
				'frequency': 32
			}, {
				'values': 'THOMSON',
				'frequency': 28
			}, {
				'values': 'SONY-ERICSSON',
				'frequency': 21
			}, {
				'values': 'ECHO',
				'frequency': 19
			}, {
				'values': 'GOOGLE',
				'frequency': 19
			}, {
				'values': 'TELIT',
				'frequency': 19
			}, {
				'values': 'BLACKVIEW',
				'frequency': 17
			}, {
				'values': 'KONROW',
				'frequency': 16
			}, {
				'values': 'SAGEM',
				'frequency': 15
			}, {
				'values': 'DANEW',
				'frequency': 10
			}, {
				'values': 'SFR',
				'frequency': 10
			}, {
				'values': 'YEZZ',
				'frequency': 10
			}, {
				'values': 'ACER',
				'frequency': 8
			}, {
				'values': 'CINTERION',
				'frequency': 8
			}, {
				'values': 'DOOGEE',
				'frequency': 8
			}, {
				'values': 'EDENWOOD',
				'frequency': 6
			}, {
				'values': 'HISENSE',
				'frequency': 6
			}, {
				'values': 'PEUGEOT',
				'frequency': 6
			}, {
				'values': 'GRETEL',
				'frequency': 5
			}, {
				'values': 'HAIER',
				'frequency': 5
			}, {
				'values': 'ZTE',
				'frequency': 5
			}, {
				'values': 'EMPORIA',
				'frequency': 4
			}, {
				'values': 'SIEMENS',
				'frequency': 4
			}, {
				'values': 'TELEFUNKEN',
				'frequency': 4
			}, {
				'values': 'VIETTEL',
				'frequency': 4
			}, {
				'values': 'AG-TEL',
				'frequency': 3
			}, {
				'values': 'CATERPILLAR',
				'frequency': 3
			}, {
				'values': 'LENOVO',
				'frequency': 3
			}, {
				'values': 'NAIDE',
				'frequency': 3
			}, {
				'values': 'ADVAN',
				'frequency': 2
			}, {
				'values': 'CAT',
				'frequency': 2
			}, {
				'values': 'CONDOR',
				'frequency': 2
			}, {
				'values': 'FLY',
				'frequency': 2
			}, {
				'values': 'Fujitsu',
				'frequency': 2
			}, {
				'values': 'ICE-PHONE',
				'frequency': 2
			}, {
				'values': 'MAXIMUS',
				'frequency': 2
			}, {
				'values': 'NANHO',
				'frequency': 2
			}, {
				'values': 'NEXUS',
				'frequency': 2
			}, {
				'values': 'RUGGEAR',
				'frequency': 2
			}, {
				'values': 'SIERRA',
				'frequency': 2
			}, {
				'values': 'TP-LINK',
				'frequency': 2
			}, {
				'values': 'VERNEE',
				'frequency': 2
			}, {
				'values': 'WAVECOM',
				'frequency': 2
			}, {
				'values': 'Autoliv Electronics',
				'frequency': 1
			}, {
				'values': ' * ',
				'frequency': 19
			}],
			'displayedColumns': [{
				'headerName': 'GLOBAL.VALUES_OFMarque dernier terminal mobile utilis�',
				'field': 'values'
			}, {
				'headerName': 'GLOBAL.FREQUENCY',
				'field': 'frequency'
			}]
		};

		expect(intervalDatas).toEqual(jasmine.objectContaining(expectedRes));
	});

});
});
