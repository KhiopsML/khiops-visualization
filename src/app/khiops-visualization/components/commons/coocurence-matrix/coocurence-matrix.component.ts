/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

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
import { deepEqual } from 'fast-equals';
import { MatrixComponent } from '@khiops-library/components/matrix/matrix.component';
import { AppService } from '@khiops-visualization/providers/app.service';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { Preparation2dVariableModel } from '@khiops-visualization/model/preparation2d-variable.model';
import { CoocurenceCellsModel } from '@khiops-visualization/model/coocurence-cells.model';
import { MatrixModesModel } from '@khiops-library/model/matrix-modes.model';
import { MatrixTargetsModel } from '@khiops-library/model/matrix-targets.model';
import { MatrixOptionsModel } from '@khiops-library/model/matrix-options.model';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { ConfigService } from '@khiops-library/providers/config.service';
import { MatrixRangeValuesI } from '@khiops-visualization/interfaces/matrix-range-values';
import { LS } from '@khiops-library/enum/ls';
import { CoocurenceMatrixConfigService } from './coocurence-matrix-config.service';

/**
 * Test it with iris2d file
 */
@Component({
  selector: 'app-coocurence-matrix',
  templateUrl: './coocurence-matrix.component.html',
  styleUrls: ['./coocurence-matrix.component.scss'],
  standalone: false,
})
export class CoocurenceMatrixComponent implements OnChanges, AfterViewInit {
  @ViewChild('matrix', {
    static: false,
  })
  private matrix?: MatrixComponent;

  public preparation2dDatas?: Preparation2dDatasModel;
  @Input() selectedVariable?: Preparation2dVariableModel; // used to detect var change
  @Output() private selectCellRowChanged: EventEmitter<number> =
    new EventEmitter();

  public matrixOptions: MatrixOptionsModel = new MatrixOptionsModel();
  public matrixModes: MatrixModesModel = new MatrixModesModel();
  public matrixTargets: MatrixTargetsModel = new MatrixTargetsModel();
  public matrixCells?: CoocurenceCellsModel;
  public minMaxValues?: MatrixRangeValuesI;
  public isFullscreen = false;

  private readonly DEFAULT_CELL_INDEX = 0;
  private readonly CELLS_TAB_INDEX = 1;

  constructor(
    public selectableService: SelectableService,
    private configService: ConfigService,
    private appService: AppService,
    private preparation2dDatasService: Preparation2dDatasService,
    private coocurenceMatrixConfigService: CoocurenceMatrixConfigService,
  ) {
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();
  }

  /**
   * Initialize the component with the selected variable
   */
  ngAfterViewInit() {
    this.minMaxValues =
      this.preparation2dDatasService.getGlobalMinAndMax2dValues(
        this.preparation2dDatasService.getVariablesd2Datas(),
      );
    this.preparation2dDatasService.getMatrixDatas(
      this.preparation2dDatas?.selectedVariable!,
    );

    // Check if there is a saved selected cell into json
    const defaultCellIndex =
      this.appService.getSavedDatas('selected2dCell') ||
      this.DEFAULT_CELL_INDEX;
    this.preparation2dDatasService.setSelectedCellIndex(defaultCellIndex);

    this.preparation2dDatasService.getCurrentCellDatas();
  }

  /**
   * Initialize the component with the selected variable
   */
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
      this.preparation2dDatasService.getMatrixDatas(
        this.preparation2dDatas?.selectedVariable!,
      );
      this.preparation2dDatasService.setSelectedCellIndex(
        this.DEFAULT_CELL_INDEX,
      );

      this.preparation2dDatasService.getCurrentCellDatas();

      this.matrixCells =
        this.preparation2dDatasService.getMatrixCoocurenceCellsDatas();

      // initialize with first cell index
      this.onCellSelected({
        datas: {
          index: this.DEFAULT_CELL_INDEX,
        },
      });
    }
  }

  /**
   * Handle fullscreen toggle event
   * @param isFullscreen True if fullscreen mode is activated
   */
  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.matrix?.drawMatrix();
    });
  }

  /**
   * Handle tab selection change event
   * @param e The event containing the selected tab index
   */
  onSelectedMatrixTabChanged(e: { index: number }) {
    const matrixOptionsToggle = this.configService
      .getRootElementDom()
      .querySelector<HTMLElement>('#matrix-option-toggle');

    if (e.index === this.CELLS_TAB_INDEX) {
      matrixOptionsToggle!.style.display = 'none';
    } else {
      matrixOptionsToggle!.style.display = 'flex';

      // Redraw matrix otherwise it is empty
      this.matrix?.drawMatrix();
    }
  }

  /**
   * Change the matrix mode and update options
   * @param _mode The new mode to set
   */
  changeMatrixMode(_mode: MatrixModeI) {
    this.constructTargetSelectBox();
    this.selectTargetSelectBox(this.matrixTargets.selected);
  }

  /**
   * Change the matrix target and update options
   * @param target The new target to set
   */
  changeMatrixTarget(target: string) {
    this.matrixTargets.selected = target;
    AppService.Ls.set(LS.MATRIX_TARGET_OPTION, target);
  }

  /**
   * Handle matrix axis inversion event
   */
  onMatrixAxisInverted() {
    this.preparation2dDatasService.toggleIsAxisInverted();
    this.constructModeSelectBox();
    this.selectCellRowChanged.emit(this.DEFAULT_CELL_INDEX);
  }

  /**
   * Handle cell selection event
   * @param event The event containing the selected cell index
   */
  onCellSelected(event: { datas?: { index: number } }) {
    // event type can change
    if (event.datas) {
      const currentIndex = event.datas.index;
      this.updateSelectedCell(currentIndex);
    }
  }

  /**
   * Handle cell row selection change event
   * @param rowItem The selected row item containing the cell index
   */
  onSelectCellRowChanged(rowItem: { id: number }) {
    // event type can change
    const currentIndex = rowItem.id;
    this.updateSelectedCell(currentIndex);
  }

  /**
   * Update the selected cell index and current cell data
   * @param index The cell index to select
   */
  private updateSelectedCell(index: number): void {
    this.preparation2dDatasService.setSelectedCellIndex(index);
    this.preparation2dDatasService.getCurrentCellDatas();
    this.selectCellRowChanged.emit(index);
  }

  /**
   * Construct the mode select box based on current targets and variables
   */
  private constructModeSelectBox() {
    this.matrixModes =
      this.coocurenceMatrixConfigService.constructModeSelectBox(
        this.matrixModes,
        this.matrixTargets,
        this.preparation2dDatas,
      );
  }

  /**
   * Construct the target select box based on available targets
   */
  private constructTargetSelectBox() {
    this.coocurenceMatrixConfigService.constructTargetSelectBox(
      this.matrixTargets,
    );
  }

  /**
   * Select the target in the select box based on previous selection or first available target
   * @param selected The previously selected target or undefined
   */
  private selectTargetSelectBox(selected?: string) {
    this.coocurenceMatrixConfigService.selectTargetSelectBox(
      this.matrixTargets,
      this.matrixModes,
      selected,
    );
  }
}
