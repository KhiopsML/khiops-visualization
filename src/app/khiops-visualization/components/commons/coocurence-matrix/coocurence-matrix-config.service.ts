/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { AppService } from '@khiops-visualization/providers/app.service';
import { Preparation2dDatasModel } from '@khiops-visualization/model/preparation2d-datas.model';
import { MatrixModesModel } from '@khiops-library/model/matrix-modes.model';
import { MatrixTargetsModel } from '@khiops-library/model/matrix-targets.model';
import { LS } from '@khiops-library/enum/ls';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';

/**
 * Service for managing coocurrence matrix configuration including modes and targets
 */
@Injectable({
  providedIn: 'root',
})
export class CoocurenceMatrixConfigService {
  constructor(
    private translate: TranslateService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {}

  /**
   * Get variable names considering axis inversion
   * @param preparation2dDatas The preparation 2D data model
   * @returns Object with varName1 and varName2
   */
  getVariableNames(preparation2dDatas?: Preparation2dDatasModel): {
    varName1?: string;
    varName2?: string;
  } {
    let varName1 = preparation2dDatas?.selectedVariable?.name1;
    let varName2 = preparation2dDatas?.selectedVariable?.name2;

    if (this.preparation2dDatasService.isAxisInverted()) {
      varName1 = preparation2dDatas?.selectedVariable?.name2;
      varName2 = preparation2dDatas?.selectedVariable?.name1;
    }

    return { varName1, varName2 };
  }

  /**
   * Create matrix modes for components with targets
   * @param varName1 First variable name
   * @param varName2 Second variable name
   * @returns Array of matrix mode configurations
   */
  createMatrixModesWithTargets(
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
  createMatrixModesWithoutTargets(
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
   * @param matrixModes The matrix modes model
   * @returns True if target selection is required
   */
  isTargetSelectionRequired(matrixModes: MatrixModesModel): boolean {
    const targetRequiredModes = [
      MATRIX_MODES.FREQUENCY_CELL,
      MATRIX_MODES.PROB_TARGET_WITH_CELL,
      MATRIX_MODES.MUTUAL_INFO_TARGET_WITH_CELL,
      MATRIX_MODES.PROB_CELL_WITH_TARGET,
    ];

    return targetRequiredModes.includes(
      matrixModes.selected?.mode as MATRIX_MODES,
    );
  }

  /**
   * Construct the mode select box based on current targets and variables
   * @param matrixModes The matrix modes model to update
   * @param matrixTargets The matrix targets model
   * @param preparation2dDatas The preparation 2D data model
   */
  constructModeSelectBox(
    matrixModes: MatrixModesModel,
    matrixTargets: MatrixTargetsModel,
    preparation2dDatas?: Preparation2dDatasModel,
  ): MatrixModesModel {
    const { varName1, varName2 } = this.getVariableNames(preparation2dDatas);

    if (matrixTargets.targets!.length > 0) {
      matrixModes.types = this.createMatrixModesWithTargets(varName1, varName2);
    } else {
      matrixModes.types = this.createMatrixModesWithoutTargets(
        varName1,
        varName2,
      );
    }

    return { ...matrixModes };
  }

  /**
   * Construct the target select box based on available targets
   * @param matrixTargets The matrix targets model to update
   */
  constructTargetSelectBox(matrixTargets: MatrixTargetsModel): void {
    // Add optional targets if available
    if (this.preparation2dDatasService.getTargetsIfAvailable()) {
      matrixTargets.targets =
        this.preparation2dDatasService.getTargetsIfAvailable();
    } else {
      matrixTargets.targets = [];
      matrixTargets.selected = undefined;
    }
  }

  /**
   * Select the target in the select box based on previous selection or first available target
   * @param matrixTargets The matrix targets model to update
   * @param matrixModes The matrix modes model
   * @param selected The previously selected target or undefined
   */
  selectTargetSelectBox(
    matrixTargets: MatrixTargetsModel,
    matrixModes: MatrixModesModel,
    selected?: string,
  ): void {
    // Add optional targets if available
    if (
      this.preparation2dDatasService.getTargetsIfAvailable() &&
      this.isTargetSelectionRequired(matrixModes)
    ) {
      // Get previous selected target if compatible
      const previousSelectedTarget = AppService.Ls.get(LS.MATRIX_TARGET_OPTION);
      if (
        previousSelectedTarget &&
        matrixTargets.targets?.includes(previousSelectedTarget)
      ) {
        matrixTargets.selected = previousSelectedTarget;
      }
      // Keep last selected target if defined
      matrixTargets.selected =
        selected || previousSelectedTarget || matrixTargets.targets?.[0];
    } else {
      matrixTargets.selected = undefined;
    }
  }
}
