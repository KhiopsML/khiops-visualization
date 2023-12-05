import {
	TestBed
} from '@angular/core/testing';
import {
	AppService
} from '@khiops-visualization/providers/app.service';
import {
	Preparation2dDatasService
} from '@khiops-visualization/providers/preparation2d-datas.service';
import {
	HttpClientModule
} from '@angular/common/http';

let appService: AppService;
let preparation2dDatasService: Preparation2dDatasService;

let cells;

describe('Visualization', () => {
describe('Matrix Datas : WITH target [adult-bivar file]', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule
			]
		});

		// Inject services
		preparation2dDatasService = TestBed.inject(Preparation2dDatasService);
		appService = TestBed.inject(AppService);

		const fileDatas = require('../../assets/mocks/kv/adult-bivar.json');
		appService.setFileDatas(fileDatas);

		preparation2dDatasService.initialize();
		preparation2dDatasService.setSelectedVariable(fileDatas.bivariatePreparationReport.variablesPairsStatistics[11]);
		const preparation2dDatas = preparation2dDatasService.getDatas();
		const result = preparation2dDatasService.getMatrixCanvasDatas(preparation2dDatas.selectedVariable);
		cells = result.matrixCellDatas;
	});

	it('Cell[0] cellFreq should return valid datas', () => {
		expect(cells[0].cellFreq).toEqual(6746);
	});
	it('Cell[0] w.standard should return valid datas', () => {
		expect(cells[0].w.standard).toEqual(63.888888888888886);
	});
	it('Cell[0] w.frequency should return valid datas', () => {
		expect(cells[0].w.frequency).toEqual(96.15497161584831);
	});
	it('Cell[0] cellFreqs should return valid datas', () => {
		expect(cells[0].cellFreqs).toEqual([5824, 922]);
	});
	it('Cell[0] cellProbs should return valid datas', () => {
		expect(cells[0].cellProbs).toEqual([0.22375902873828185, 0.11318438497422048]);
	});
	it('Cell[0] cellProbsRev should return valid datas', () => {
		expect(cells[0].cellProbsRev).toEqual([0.8633264156537207, 0.13667358434627927]);
	});

});
});
