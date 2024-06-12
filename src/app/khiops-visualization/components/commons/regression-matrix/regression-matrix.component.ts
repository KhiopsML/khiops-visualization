import {
  Component,
  Input,
  Output,
  SimpleChanges,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
} from '@angular/core';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { deepEqual } from 'fast-equals';
import { MatrixCanvasComponent } from '@khiops-library/components/matrix-canvas/matrix-canvas.component';
import { AppService } from '@khiops-visualization/providers/app.service';
import { PreparationVariableVO } from '@khiops-visualization/model/preparation-variable-vo';
import { Preparation2dDatasVO } from '@khiops-visualization/model/preparation2d-datas-vo';
import { MatrixOptionsI } from '@khiops-library/interfaces/matrix-options';
import { MatrixModesI } from '@khiops-library/interfaces/matrix-modes';
import { MatrixRangeValuesI } from '@khiops-visualization/interfaces/matrix-range-values';
import { CellVO } from '@khiops-library/model/cell-vo';
import { Preparation2dVariableVO } from '@khiops-visualization/model/preparation2d-variable-vo';

/**
 * Test it with irisR file
 */
@Component({
  selector: 'app-regression-matrix',
  templateUrl: './regression-matrix.component.html',
  styleUrls: ['./regression-matrix.component.scss'],
})
export class RegressionMatrixComponent implements AfterViewInit, OnChanges {
  @ViewChild('matrixCanvas', {
    static: false,
  })
  matrixCanvas: MatrixCanvasComponent;

  @Output() selectedCellChanged: EventEmitter<number> = new EventEmitter();
  @Input() selectedVariable: PreparationVariableVO;
  @Input() selectedCell: number;
  @Input() preparationSource: string;
  preparation2dDatas: Preparation2dDatasVO;
  isFullscreen = false;

  matrixOptions: MatrixOptionsI = new MatrixOptionsI();
  matrixModes: MatrixModesI = new MatrixModesI();

  minMaxValues: MatrixRangeValuesI;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private appService: AppService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
  }

  ngAfterViewInit() {
    const variable = this.preparationDatasService.getVariablesDatas(
      this.preparationSource,
    );
    this.minMaxValues =
      this.preparation2dDatasService.getGlobalMinAndMax2dValues(variable);
    this.preparation2dDatasService.getMatrixCanvasDatas(
      this.preparation2dDatas.selectedVariable,
    );

    // Check if there is a saved selected cell into json
    const defaultCellIndex =
      this.appService.getSavedDatas('selected2dCell') || 0;
    this.preparation2dDatasService.setSelectedCellIndex(defaultCellIndex);

    this.preparation2dDatasService.getCurrentCellDatas();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.selectedVariable?.currentValue &&
      !deepEqual(
        changes.selectedVariable.currentValue,
        changes.selectedVariable.previousValue,
      )
    ) {
      // For regression matrix, Define names based on current name and target variable
      const currentVar: Preparation2dVariableVO =
        changes.selectedVariable.currentValue;
      currentVar.name1 = currentVar.nameX = currentVar.name;
      currentVar.name2 = currentVar.nameY =
        this.preparationDatasService.getTargetVariable(this.preparationSource);

      // Set the variable
      this.preparation2dDatasService.setSelectedRegressionVariable(currentVar);

      this.constructModeSelectBox();
      this.preparation2dDatasService.getMatrixCanvasDatas(
        this.preparation2dDatas.selectedVariable,
      );
      this.preparation2dDatasService.setSelectedCellIndex(0);
      this.preparation2dDatasService.getCurrentCellDatas();
    }

    if (changes.selectedCell && changes.selectedCell.currentValue >= 0) {
      // Matrix regression case : on click on distribution graph bar
      this.preparation2dDatasService.setSelectedCellIndex(
        changes.selectedCell.currentValue,
      );
    }
  }

  constructModeSelectBox() {
    const varName1 = this.preparation2dDatas.selectedVariable.nameX;
    const varName2 = this.preparation2dDatas.selectedVariable.nameY;

    this.matrixModes.types = [
      {
        mode: 'MUTUAL_INFO',
        title: 'I (' + varName1 + ' , ' + varName2 + ')',
      },
      {
        mode: 'FREQUENCY',
        title: 'Frequency',
      },
      {
        mode: 'PROB_CELL',
        title: 'P (' + varName2 + ' | ' + varName1 + ')',
      },
      {
        mode: 'PROB_CELL_REVERSE',
        title: 'P (' + varName1 + ' | ' + varName2 + ')',
      },
    ];
    this.matrixModes = { ...this.matrixModes };
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.matrixCanvas.drawMatrix();
    });
  }

  onMatrixAxisInverted() {
    this.preparation2dDatasService.toggleIsAxisInverted();
    this.constructModeSelectBox();
  }

  onCellSelected(event: { datas: CellVO }) {
    if (event.datas) {
      const currentIndex = event.datas.index;
      this.preparation2dDatasService.setSelectedCell(event.datas);
      this.preparation2dDatasService.getCurrentCellDatas();
      this.selectedCellChanged.emit(currentIndex);
    }
  }
}
