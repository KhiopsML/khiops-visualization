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
import { TranslateService } from '@ngstack/translate';
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
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';

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
    private translate: TranslateService,
    private configService: ConfigService,
    private appService: AppService,
    private preparation2dDatasService: Preparation2dDatasService,
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
   * Get variable names considering axis inversion
   * @returns Object with varName1 and varName2
   */
  private getVariableNames(): { varName1?: string; varName2?: string } {
    let varName1 = this.preparation2dDatas?.selectedVariable?.name1;
    let varName2 = this.preparation2dDatas?.selectedVariable?.name2;

    if (this.preparation2dDatasService.isAxisInverted()) {
      varName1 = this.preparation2dDatas?.selectedVariable?.name2;
      varName2 = this.preparation2dDatas?.selectedVariable?.name1;
    }

    return { varName1, varName2 };
  }

  /**
   * Create matrix modes for components with targets
   * @param varName1 First variable name
   * @param varName2 Second variable name
   * @returns Array of matrix mode configurations
   */
  private createMatrixModesWithTargets(
    varName1?: string,
    varName2?: string,
  ): Array<{ mode: string; title: string }> {
    const targetLabel = this.translate.get('GLOBAL.TARGET');
    const frequencyLabel = this.translate.get('GLOBAL.FREQUENCY');
    const cellsInterestsLabel = this.translate.get('GLOBAL.CELLS_INTERESTS');

    return [
      {
        mode: MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL,
        title: `I (${targetLabel} | ${varName2} , ${varName1})`,
      },
      {
        mode: MATRIX_MODES.FREQUENCY,
        title: frequencyLabel,
      },
      {
        mode: MATRIX_MODES.FREQUENCY_CELL,
        title: `${frequencyLabel} (${targetLabel} | ${varName2} , ${varName1})`,
      },
      {
        mode: MATRIX_MODES.PROB_TARGET_WITH_CELL,
        title: `P (${targetLabel} | ${varName2} , ${varName1})`,
      },
      {
        mode: MATRIX_MODES.PROB_CELL_WITH_TARGET,
        title: `P (${varName2} , ${varName1} | ${targetLabel})`,
      },
      {
        mode: MATRIX_MODES.CELL_INTEREST,
        title: cellsInterestsLabel,
      },
    ];
  }

  /**
   * Create matrix modes for components without targets
   * @param varName1 First variable name
   * @param varName2 Second variable name
   * @returns Array of matrix mode configurations
   */
  private createMatrixModesWithoutTargets(
    varName1?: string,
    varName2?: string,
  ): Array<{ mode: string; title: string }> {
    const frequencyLabel = this.translate.get('GLOBAL.FREQUENCY');

    return [
      {
        mode: MATRIX_MODES.MUTUAL_INFO,
        title: `I (${varName1} , ${varName2})`,
      },
      {
        mode: MATRIX_MODES.FREQUENCY,
        title: frequencyLabel,
      },
      {
        mode: MATRIX_MODES.PROB_CELL,
        title: `P (${varName2} | ${varName1})`,
      },
      {
        mode: MATRIX_MODES.PROB_CELL_REVERSE,
        title: `P (${varName1} | ${varName2})`,
      },
    ];
  }

  /**
   * Check if current matrix mode requires target selection
   * @returns True if target selection is required
   */
  private isTargetSelectionRequired(): boolean {
    const targetRequiredModes = [
      MATRIX_MODES.FREQUENCY_CELL,
      MATRIX_MODES.PROB_TARGET_WITH_CELL,
      MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL,
      MATRIX_MODES.PROB_CELL_WITH_TARGET,
    ];

    return targetRequiredModes.includes(
      this.matrixModes.selected?.mode as MATRIX_MODES,
    );
  }

  /**
   * Construct the mode select box based on current targets and variables
   */
  private constructModeSelectBox() {
    const { varName1, varName2 } = this.getVariableNames();

    if (this.matrixTargets.targets!.length > 0) {
      this.matrixModes.types = this.createMatrixModesWithTargets(
        varName1,
        varName2,
      );
    } else {
      this.matrixModes.types = this.createMatrixModesWithoutTargets(
        varName1,
        varName2,
      );
    }

    this.matrixModes = { ...this.matrixModes };
  }

  /**
   * Construct the target select box based on available targets
   */
  private constructTargetSelectBox() {
    // Add optional targets if available
    if (this.preparation2dDatasService.getTargetsIfAvailable()) {
      this.matrixTargets.targets =
        this.preparation2dDatasService.getTargetsIfAvailable();
    } else {
      this.matrixTargets.targets = [];
      this.matrixTargets.selected = undefined;
    }
  }

  /**
   * Select the target in the select box based on previous selection or first available target
   * @param selected The previously selected target or undefined
   */
  private selectTargetSelectBox(selected?: string) {
    // Add optional targets if available
    if (
      this.preparation2dDatasService.getTargetsIfAvailable() &&
      this.isTargetSelectionRequired()
    ) {
      // Get previous selected target if compatible
      const previousSelectedTarget = AppService.Ls.get(LS.MATRIX_TARGET_OPTION);
      if (
        previousSelectedTarget &&
        this.matrixTargets.targets?.includes(previousSelectedTarget)
      ) {
        this.matrixTargets.selected = previousSelectedTarget;
      }
      // Keep last selected target if defined
      this.matrixTargets.selected =
        selected || previousSelectedTarget || this.matrixTargets.targets?.[0];
    } else {
      this.matrixTargets.selected = undefined;
    }
  }
}
