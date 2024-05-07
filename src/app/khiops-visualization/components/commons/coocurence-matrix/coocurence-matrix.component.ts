import {
  Component,
  SimpleChanges,
  Input,
  OnChanges,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from 'src/environments/environment';
import { deepEqual } from 'fast-equals';
import { MatrixCanvasComponent } from '@khiops-library/components/matrix-canvas/matrix-canvas.component';
import { AppService } from '@khiops-visualization/providers/app.service';
import { Preparation2dDatasVO } from '@khiops-visualization/model/preparation2d-datas-vo';
import { Preparation2dVariableVO } from '@khiops-visualization/model/preparation2d-variable-vo';
import { CoocurenceCellsVO } from '@khiops-visualization/model/coocurence-cells-vo';
import { MatrixModesI } from '@khiops-library/interfaces/matrix-modes';
import { MatrixTargetsI } from '@khiops-library/interfaces/matrix-targets';
import { MatrixOptionsI } from '@khiops-library/interfaces/matrix-options';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { ConfigService } from '@khiops-library/providers/config.service';
import { MatrixRangeValuesI } from '@khiops-visualization/interfaces/matrix-range-values';

/**
 * Test it with iris2d file
 */
@Component({
  selector: 'app-coocurence-matrix',
  templateUrl: './coocurence-matrix.component.html',
  styleUrls: ['./coocurence-matrix.component.scss'],
})
export class CoocurenceMatrixComponent implements OnChanges, AfterViewInit {
  @ViewChild('matrixCanvas', {
    static: false,
  })
  matrixCanvas: MatrixCanvasComponent;

  preparation2dDatas: Preparation2dDatasVO;
  @Input() selectedVariable: Preparation2dVariableVO;
  @Output() selectCellRowChanged: EventEmitter<any> = new EventEmitter();

  matrixOptions: MatrixOptionsI = new MatrixOptionsI();
  matrixModes: MatrixModesI = new MatrixModesI();
  matrixTargets: MatrixTargetsI = new MatrixTargetsI();
  matrixCells: CoocurenceCellsVO;
  minMaxValues: MatrixRangeValuesI;
  isFullscreen = false;

  constructor(
    public selectableService: SelectableService,
    private translate: TranslateService,
    private configService: ConfigService,
    private appService: AppService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
    this.minMaxValues =
      this.preparation2dDatasService.getGlobalMinAndMax2dValues(
        this.preparation2dDatasService.getVariablesd2Datas(),
      );
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // Avoid ExpressionChangedAfterItHasBeenCheckedError
      this.preparation2dDatasService.getMatrixCanvasDatas(
        this.preparation2dDatas.selectedVariable,
      );

      // Check if there is a saved selected cell into json
      const defaultCellIndex =
        this.appService.getSavedDatas('selected2dCell') || 0;
      this.preparation2dDatasService.setSelectedCellIndex(defaultCellIndex);

      this.preparation2dDatasService.getCurrentCellDatas();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.selectedVariable?.currentValue &&
      !deepEqual(
        changes.selectedVariable.currentValue,
        changes.selectedVariable.previousValue,
      )
    ) {
      this.constructTargetSelectBox();
      this.constructModeSelectBox();
      this.selectTargetSelectBox();
      this.preparation2dDatasService.getMatrixCanvasDatas(
        this.preparation2dDatas.selectedVariable,
      );
      this.preparation2dDatasService.setSelectedCellIndex(0);

      this.preparation2dDatasService.getCurrentCellDatas();

      this.matrixCells =
        this.preparation2dDatasService.getMatrixCoocurenceCellsDatas();

      // initialize with first cell index
      this.onCellSelected({
        datas: {
          index: 0,
        },
      });
    }
  }

  constructModeSelectBox() {
    let varName1 = this.preparation2dDatas.selectedVariable.name1;
    let varName2 = this.preparation2dDatas.selectedVariable.name2;
    if (this.preparation2dDatasService.isAxisInverted()) {
      varName1 = this.preparation2dDatas.selectedVariable.name2;
      varName2 = this.preparation2dDatas.selectedVariable.name1;
    }

    if (this.matrixTargets.targets.length > 0) {
      this.matrixModes.types = [
        {
          mode: 'MUTUAL_INFO_TARGET_WITH_CELL',
          title:
            'I (' +
            this.translate.instant('GLOBAL.TARGET') +
            ' | ' +
            varName2 +
            ' , ' +
            varName1 +
            ')',
        },
        {
          mode: 'FREQUENCY',
          title: 'Frequency',
        },
        {
          mode: 'FREQUENCY_CELL',
          title:
            'Frequency (' +
            this.translate.instant('GLOBAL.TARGET') +
            ' | ' +
            varName2 +
            ' , ' +
            varName1 +
            ')',
        },
        {
          mode: 'PROB_TARGET_WITH_CELL',
          title:
            'P (' +
            this.translate.instant('GLOBAL.TARGET') +
            ' | ' +
            varName2 +
            ' , ' +
            varName1 +
            ')',
        },
        {
          mode: 'PROB_CELL_WITH_TARGET',
          title:
            'P (' +
            varName2 +
            ' , ' +
            varName1 +
            ' | ' +
            this.translate.instant('GLOBAL.TARGET') +
            ')',
        },
        {
          mode: 'CELL_INTEREST',
          title: 'Cells Interests',
        },
      ];
    } else {
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
    }
    this.matrixModes = { ...this.matrixModes };
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.matrixCanvas.drawMatrix();
    });
  }

  onSelectedMatrixTabChanged(e) {
    const matrixOptionsToggle = this.configService
      .getRootElementDom()
      .querySelector<HTMLElement>('#matrix-option-toggle');
    if (e.index === 1) {
      // this.trackerService.trackEvent('click', 'matrix_tab', 'cells');
      matrixOptionsToggle.style.display = 'none';
    } else {
      // this.trackerService.trackEvent('click', 'matrix_tab', 'matrix');

      matrixOptionsToggle.style.display = 'flex';

      // Redraw matrix otherwise it is empty
      this.matrixCanvas.drawMatrix();
    }
  }

  constructTargetSelectBox() {
    // Add optional targets if available
    if (this.preparation2dDatasService.getTargetsIfAvailable()) {
      this.matrixTargets.targets =
        this.preparation2dDatasService.getTargetsIfAvailable();
    } else {
      this.matrixTargets.targets = [];
      this.matrixTargets.selected = undefined;
    }
  }

  selectTargetSelectBox(selected = null) {
    // Add optional targets if available
    if (
      this.preparation2dDatasService.getTargetsIfAvailable() &&
      (this.matrixModes.selected?.mode === 'FREQUENCY_CELL' ||
        this.matrixModes.selected?.mode === 'PROB_TARGET_WITH_CELL' ||
        this.matrixModes.selected?.mode === 'MUTUAL_INFO_TARGET_WITH_CELL' ||
        this.matrixModes.selected?.mode === 'PROB_CELL_WITH_TARGET')
    ) {
      // Get previous selected target if compatible
      const previousSelectedTarget = localStorage.getItem(
        AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_TARGET_OPTION',
      );
      if (
        previousSelectedTarget &&
        this.matrixTargets.targets.includes(previousSelectedTarget)
      ) {
        this.matrixTargets.selected = previousSelectedTarget;
      }
      // Keep last selected target if defined
      this.matrixTargets.selected =
        selected || previousSelectedTarget || this.matrixTargets.targets[0];
    } else {
      this.matrixTargets.selected = undefined;
    }
  }

  changeMatrixMode(mode: MatrixModeI) {
    // this.trackerService.trackEvent('click', 'matrix_mode', mode.mode);
    this.constructTargetSelectBox();
    this.selectTargetSelectBox(this.matrixTargets.selected);
  }

  changeMatrixTarget(target: string) {
    // this.trackerService.trackEvent('click', 'matrix_target');
    this.matrixTargets.selected = target;
    localStorage.setItem(
      AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_TARGET_OPTION',
      target,
    );
  }

  onMatrixAxisInverted() {
    this.preparation2dDatasService.toggleIsAxisInverted();
    this.constructModeSelectBox();
    this.selectCellRowChanged.emit(0);
  }

  onCellSelected(event: any) {
    // event type can change
    if (event.datas) {
      const currentIndex = event.datas.index;
      this.preparation2dDatasService.setSelectedCellIndex(currentIndex);
      this.preparation2dDatasService.getCurrentCellDatas();
      this.selectCellRowChanged.emit(currentIndex);
    }
  }

  onSelectCellRowChanged(rowItem: any) {
    // event type can change
    const currentIndex = rowItem.id;
    this.preparation2dDatasService.setSelectedCellIndex(currentIndex);
    this.preparation2dDatasService.getCurrentCellDatas();
    this.selectCellRowChanged.emit(currentIndex);
  }
}
