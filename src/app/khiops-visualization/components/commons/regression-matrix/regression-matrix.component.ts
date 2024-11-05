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
import { MatrixComponent } from '@khiops-library/components/matrix/matrix.component';
import { AppService } from '@khiops-visualization/providers/app.service';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { MatrixOptionsModel } from '@khiops-library/model/matrix-options.model';
import { MatrixModesModel } from '@khiops-library/model/matrix-modes.model';
import { MatrixRangeValuesI } from '@khiops-visualization/interfaces/matrix-range-values';
import { CellModel } from '@khiops-library/model/cell.model';
import { Preparation2dVariableModel } from '@khiops-visualization/model/preparation2d-variable.model';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
import { REPORT } from '@khiops-library/enum/report';

/**
 * Test it with irisR file
 */
@Component({
  selector: 'app-regression-matrix',
  templateUrl: './regression-matrix.component.html',
  styleUrls: ['./regression-matrix.component.scss'],
})
export class RegressionMatrixComponent implements AfterViewInit, OnChanges {
  @ViewChild('matrix', {
    static: false,
  })
  private matrix?: MatrixComponent;

  @Output() private selectedCellChanged: EventEmitter<number> =
    new EventEmitter();
  @Input() selectedVariable?: PreparationVariableModel;
  @Input() selectedCell?: number;
  @Input() private preparationSource?: string;
  public preparation2dDatas?: Preparation2dDatasModel;
  public isFullscreen = false;
  public matrixOptions: MatrixOptionsModel = new MatrixOptionsModel();
  public matrixModes: MatrixModesModel = new MatrixModesModel();
  public minMaxValues?: MatrixRangeValuesI;

  constructor(
    private preparationDatasService: PreparationDatasService,
    private appService: AppService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
  }

  ngAfterViewInit() {
    const variable = this.preparationDatasService.getVariablesDatas(
      this.preparationSource!,
    );
    this.minMaxValues =
      this.preparation2dDatasService.getGlobalMinAndMax2dValues(variable);
    this.preparation2dDatasService.getMatrixDatas(
      this.preparation2dDatas?.selectedVariable!,
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
      const currentVar: Preparation2dVariableModel =
        changes.selectedVariable.currentValue;
      currentVar.name1 = currentVar.nameX = currentVar.name;
      currentVar.name2 = currentVar.nameY =
        this.preparationDatasService.getTargetVariable(
          this.preparationSource!,
        ) || '';

      // Set the variable
      this.preparation2dDatasService.setSelectedRegressionVariable(currentVar);

      this.constructModeSelectBox();
      this.preparation2dDatasService.getMatrixDatas(
        this.preparation2dDatas?.selectedVariable!,
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

  private constructModeSelectBox() {
    const varName1 = this.preparation2dDatas?.selectedVariable?.nameX;
    const varName2 = this.preparation2dDatas?.selectedVariable?.nameY;

    this.matrixModes.types = [
      {
        mode: MATRIX_MODES.MUTUAL_INFO,
        title: 'I (' + varName1 + ' , ' + varName2 + ')',
      },
      {
        mode: MATRIX_MODES.FREQUENCY,
        title: 'Frequency',
      },
      {
        mode: MATRIX_MODES.PROB_CELL,
        title: 'P (' + varName2 + ' | ' + varName1 + ')',
      },
      {
        mode: MATRIX_MODES.PROB_CELL_REVERSE,
        title: 'P (' + varName1 + ' | ' + varName2 + ')',
      },
    ];
    this.matrixModes = { ...this.matrixModes };
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.matrix?.drawMatrix();
    });
  }

  onMatrixAxisInverted() {
    this.preparation2dDatasService.toggleIsAxisInverted();
    this.constructModeSelectBox();
  }

  onCellSelected(event: { datas: CellModel }) {
    if (event.datas) {
      const currentIndex = event.datas.index;
      this.preparation2dDatasService.setSelectedCell(event.datas);
      this.preparation2dDatasService.getCurrentCellDatas();
      this.selectedCellChanged.emit(currentIndex);
    }
  }
}
