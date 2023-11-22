import {
	Component,
	Input,
	Output,
	SimpleChanges,
	EventEmitter,
	ViewChild,
	AfterViewInit,
	OnChanges
} from '@angular/core';
import {
	PreparationDatasService
} from '@khiops-visualization/providers/preparation-datas.service';
import {
	Preparation2dDatasService
} from '@khiops-visualization/providers/preparation2d-datas.service';
import {
	AppConfig
} from 'src/environments/environment';
import _ from 'lodash';
import {
	deepEqual
} from 'fast-equals';
import {
	MatrixCanvasComponent
} from '@khiops-library/components/matrix-canvas/matrix-canvas.component';
import {
	AppService
} from '@khiops-visualization/providers/app.service';
import {
	PreparationVariableVO
} from '@khiops-visualization/model/preparation-variable-vo';
import {
	Preparation2dDatasVO
} from '@khiops-visualization/model/preparation2d-datas-vo';
import {
	MatrixOptionsI
} from '@khiops-library/interfaces/matrix-options';
import {
	MatrixModesI
} from '@khiops-library/interfaces/matrix-modes';
import {
	MatrixModeI
} from '@khiops-library/interfaces/matrix-mode';

/**
 * Test it with irisR file
 */
@Component({
	selector: 'app-regression-matrix',
	templateUrl: './regression-matrix.component.html',
	styleUrls: ['./regression-matrix.component.scss']
})
export class RegressionMatrixComponent implements AfterViewInit, OnChanges {

	@ViewChild('matrixCanvas', {
		static: false
	}) matrixCanvas: MatrixCanvasComponent;

	@Output() selectedCellChanged: EventEmitter < number > = new EventEmitter();
	@Input() selectedVariable: PreparationVariableVO;
	@Input() selectedCell: number;
	@Input() preparationSource;
	preparation2dDatas: Preparation2dDatasVO;
	isFullscreen = false;

	matrixOptions: MatrixOptionsI = new MatrixOptionsI();
	matrixModes: MatrixModesI = new MatrixModesI();

	minMaxValues: any; // dynamic and complex value object

	constructor(
		private preparationDatasService: PreparationDatasService,
		private appService: AppService,
		private preparation2dDatasService: Preparation2dDatasService) {
		this.preparation2dDatas = this.preparation2dDatasService.getDatas();
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.minMaxValues = this.preparation2dDatasService.getGlobalMinAndMax2dValues(this.preparationDatasService.getVariablesDatas(this.preparationSource));
		this.matrixOptions.selected = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_TYPE_OPTION') || this.matrixOptions.types[0];
		this.preparation2dDatasService.getMatrixCanvasDatas(this.preparation2dDatas.selectedVariable);

		// Check if there is a saved selected cell into json
		const defaultCellIndex = this.appService.getSavedDatas('selected2dCell') || 0;
		this.preparation2dDatasService.setSelectedCellIndex(defaultCellIndex);

		this.preparation2dDatasService.getCurrentCellDatas();

	}

	ngOnChanges(changes: SimpleChanges) {

		if (changes.selectedVariable &&
			changes.selectedVariable.currentValue &&
			!deepEqual(changes.selectedVariable.currentValue, changes.selectedVariable.previousValue)) {

			// For regression matrix, Define names based on current name and target variable
			const currentVar: PreparationVariableVO = changes.selectedVariable.currentValue;
			currentVar.name1 = currentVar.nameX = currentVar.name;
			currentVar.name2 = currentVar.nameY = this.preparationDatasService.getTargetVariable(this.preparationSource);

			// Set the variable
			this.preparation2dDatasService.setSelectedRegressionVariable(currentVar);

			this.constructModeSelectBox();
			this.preparation2dDatasService.getMatrixCanvasDatas(this.preparation2dDatas.selectedVariable);
			this.preparation2dDatasService.setSelectedCellIndex(0);
			this.preparation2dDatasService.getCurrentCellDatas();

		}

		if (changes.selectedCell && changes.selectedCell.currentValue >= 0) {
			// Matrix regression case : on click on distribution graph bar
			this.preparation2dDatasService.setSelectedCellIndex(changes.selectedCell.currentValue);
		}
	}

	constructModeSelectBox() {

		const varName1 = this.preparation2dDatas.selectedVariable.nameX;
		const varName2 = this.preparation2dDatas.selectedVariable.nameY;

		this.matrixModes.types = [{
				mode: 'MUTUAL_INFO',
				title: 'I (' + varName1 + ' , ' + varName2 + ')'
			},
			{
				mode: 'FREQUENCY',
				title: 'Frequency'
			},
			{
				mode: 'PROB_CELL',
				title: 'P (' + varName2 + ' | ' + varName1 + ')'
			},
			{
				mode: 'PROB_CELL_REVERSE',
				title: 'P (' + varName1 + ' | ' + varName2 + ')'
			}
		];
		if (!this.matrixModes.selected) {
			// Get previous selected target if compatible
			const previousSelectedModeIndex = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_MODE_OPTION_INDEX');
			if (previousSelectedModeIndex) {
				this.matrixModes.selected = this.matrixModes.types[previousSelectedModeIndex];
				this.matrixModes.selectedIndex = previousSelectedModeIndex;
			} else {
				// Select first by default
				this.matrixModes.selected = this.matrixModes.types[0];
				this.matrixModes.selectedIndex = 0;
			}
		} else {
			// In case of variable selection change
			// We must update the combobox
			this.matrixModes.selected = this.matrixModes.types[this.matrixModes.selectedIndex];
		}
	}

	changeMatrixType(type: string) {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_type', type);
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_TYPE_OPTION', type);
		this.matrixOptions.selected = type;
	}

	onToggleFullscreen(isFullscreen: any) {
		this.isFullscreen = isFullscreen;
		setTimeout(() => {
			this.matrixCanvas.drawMatrix();
		});
	}

	changeMatrixMode(mode: MatrixModeI) {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_mode', mode.mode);
		this.matrixModes.selected = mode;
		this.matrixModes.selectedIndex = this.matrixModes.types.findIndex(e => e.mode === mode.mode);
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_MODE_OPTION_INDEX', this.matrixModes.selectedIndex.toString());
	}

	onMatrixAxisInverted() {
		this.preparation2dDatasService.toggleIsAxisInverted();
		this.constructModeSelectBox();
	}

	onCellSelected(event: any) {
		if (event.datas) {
			const currentIndex = event.datas.index;
			this.preparation2dDatasService.setSelectedCell(event.datas);
			this.preparation2dDatasService.getCurrentCellDatas();
			this.selectedCellChanged.emit(currentIndex);
		}
	}
}
