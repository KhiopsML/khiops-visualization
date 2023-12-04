import {
	TestBed
} from '@angular/core/testing';

import {
	DistributionDatasService
} from '@khiops-visualization/providers/distribution-datas.service';
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
import {
	TreePreparationDatasService
} from '@khiops-visualization/providers/tree-preparation-datas.service';

let distributionDatasService: DistributionDatasService;
let preparationDatasService: PreparationDatasService;
let treePreparationDatasService: TreePreparationDatasService;
let appService: AppService;

describe('Visualization', () => {
describe('DistributionDatasService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
			]
		});

		// Inject services
		distributionDatasService = TestBed.inject(DistributionDatasService);
		preparationDatasService = TestBed.inject(PreparationDatasService);
		treePreparationDatasService = TestBed.inject(TreePreparationDatasService);
		distributionDatasService.setPreparationSource('preparationReport');
		appService = TestBed.inject(AppService);
	});

	it('should be created', () => {
		expect(distributionDatasService).toBeTruthy();
	});

	it('appService should be created', () => {
		expect(appService).toBeTruthy();
	});

	it('getTargetDistributionGraphDatas should return valid datas [C100_AllReports, Numerical, R1]', () => {

		const fileDatas = require('../mocks/visualization/C100_AllReports.json');
		appService.setFileDatas(fileDatas);

		preparationDatasService.initialize();
		distributionDatasService.initialize();
		distributionDatasService.setPreparationSource('preparationReport');

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[0], 'preparationReport');
		const selectedVariable = preparationDatasService.getSelectedVariable('preparationReport');
		const res = distributionDatasService.getTargetDistributionGraphDatas(selectedVariable);

		expect(res.datasets[0].data[0]).toEqual(45.101424849088026);

	});

	it('getTargetDistributionGraphDatas should return valid datas [C100_AllReports, Numerical, R41]', () => {

		const fileDatas = require('../mocks/visualization/C100_AllReports.json');
		appService.setFileDatas(fileDatas);

		preparationDatasService.initialize();
		distributionDatasService.initialize();
		distributionDatasService.setPreparationSource('preparationReport');

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[40], 'preparationReport');
		const selectedVariable = preparationDatasService.getSelectedVariable('preparationReport');
		const res = distributionDatasService.getTargetDistributionGraphDatas(selectedVariable, 'GLOBAL.LIFT');

		expect(res.datasets[0].data[0]).toEqual(1.0250084657655503);

	});

	it('getdistributionGraphDatas should return valid datas [C100_AllReports, Numerical, R2]', () => {

		const fileDatas = require('../mocks/visualization/C100_AllReports.json');
		appService.setFileDatas(fileDatas);

		preparationDatasService.initialize();
		distributionDatasService.initialize();
		distributionDatasService.setPreparationSource('preparationReport');

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[1], 'preparationReport');
		const selectedVariable = preparationDatasService.getSelectedVariable('preparationReport');
		const res = distributionDatasService.getdistributionGraphDatas(selectedVariable);
		expect(res.datasets[0].data[0]).toEqual(50.012209523809524);

	});

	it('getdistributionGraphDatas should return valid datas [defaultGroup, Numerical, R1, Missing informations Non supervised]', () => {

		const fileDatas = require('../mocks/visualization/defaultGroup.json');
		appService.setFileDatas(fileDatas);

		preparationDatasService.initialize();
		distributionDatasService.initialize();
		distributionDatasService.setPreparationSource('preparationReport');

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[0], 'preparationReport');
		const selectedVariable = preparationDatasService.getSelectedVariable('preparationReport');
		const res = distributionDatasService.getHistogramGraphDatas(selectedVariable);

		expect(res[0].frequency).toEqual(1263);
		expect(res[0].logValue).toEqual(-5.167337100368651);
		expect(res[0].partition).toEqual([1000, 11550]);
		expect(res[0].value).toEqual(0.0000068024114898816155);
	});

	it('getdistributionGraphDatas should return valid datas [C100_AllReports, Numerical, R15]', () => {

		const fileDatas = require('../mocks/visualization/C100_AllReports.json');
		appService.setFileDatas(fileDatas);

		preparationDatasService.initialize();
		distributionDatasService.initialize();
		distributionDatasService.setPreparationSource('preparationReport');

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[14], 'preparationReport');
		const selectedVariable = preparationDatasService.getSelectedVariable('preparationReport');
		const res = distributionDatasService.getdistributionGraphDatas(selectedVariable);
		expect(res.datasets[0].data[0]).toEqual(49.042657142857145);
	});

	it('getdistributionGraphDatas should return valid datas [irisU, Categorical, R1]', () => {

		const fileDatas = require('../mocks/visualization/irisU.json');
		appService.setFileDatas(fileDatas);

		preparationDatasService.initialize();
		distributionDatasService.initialize();
		distributionDatasService.setPreparationSource('preparationReport');

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[0], 'preparationReport');
		const selectedVariable = preparationDatasService.getSelectedVariable('preparationReport');
		const res = distributionDatasService.getdistributionGraphDatas(selectedVariable);
		expect(res.datasets[0].data[0]).toEqual(37.37373737373738);

	});

	it('getdistributionGraphDatas should return valid datas [new-hyper-tree, treePreparationReport, R1]', () => {

		const fileDatas = require('../mocks/visualization/new-hyper-tree.json');
		appService.setFileDatas(fileDatas);

		preparationDatasService.initialize();
		distributionDatasService.initialize();
		distributionDatasService.setPreparationSource('treePreparationReport');

		preparationDatasService.setSelectedVariable(fileDatas.preparationReport.variablesStatistics[0], 'preparationReport');
		const selectedVariable = preparationDatasService.getSelectedVariable('preparationReport');
		const res = distributionDatasService.getdistributionGraphDatas(selectedVariable);
		expect(res.datasets[0].data[0]).toEqual(27.55896295429274);

	});

	it('getTreeNodeTargetDistributionGraphDatas should return valid datas [new-hyper-tree, treePreparationReport, R1]', () => {

		const fileDatas = require('../mocks/visualization/new-hyper-tree.json');
		appService.setFileDatas(fileDatas);

		treePreparationDatasService.initialize();
		distributionDatasService.initialize();
		distributionDatasService.setPreparationSource('treePreparationReport');

		treePreparationDatasService.setSelectedVariable(fileDatas.treePreparationReport.variablesStatistics[0]);
		treePreparationDatasService.initSelectedNodes();
		const selectedNode = treePreparationDatasService.getSelectedNode();
		const res = distributionDatasService.getTreeNodeTargetDistributionGraphDatas(selectedNode);
		expect(res.datasets[0].extra[0].extra.value).toEqual(5074);
	});


	it('getTreeNodeTargetDistributionGraphDatas should return valid datas [tree-education_AllReports, R1, L16]', () => {

		const fileDatas = require('../mocks/visualization/tree-education_AllReports.json');
		appService.setFileDatas(fileDatas);

		treePreparationDatasService.initialize();
		distributionDatasService.initialize();
		distributionDatasService.setPreparationSource('treePreparationReport');

		treePreparationDatasService.setSelectedVariable(fileDatas.treePreparationReport.variablesStatistics[0]);
		treePreparationDatasService.initSelectedNodes();
		const nodeToSelect = treePreparationDatasService.getNodeFromName('L16');
		treePreparationDatasService.setSelectedNode(nodeToSelect, true);
		const selectedNode = treePreparationDatasService.getSelectedNode();
		const res = distributionDatasService.getTreeNodeTargetDistributionGraphDatas(selectedNode);
		// First value (9th) must be at index 6
		// https://github.com/khiopsrelease/kv-release/issues/46
		expect(res.datasets[6].extra[0].extra.value).toEqual(1);

	});

});
});
