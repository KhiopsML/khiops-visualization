/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { UtilsService } from '../../providers/utils.service';
import { CellModel } from '@khiops-library/model/cell.model';
import { MATRIX_MODES } from '@khiops-library/enum/matrix-modes';
import { CellStatsI } from '@khiops-library/interfaces/cell-stats.interface';

@Component({
  selector: 'kl-cell-stats',
  templateUrl: './cell-stats.component.html',
  styleUrls: ['./cell-stats.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellStatsComponent {
  readonly selectedCells = input<CellModel[]>([]);

  readonly cellStats = computed<CellStatsI | undefined>(() =>
    this.computeCellStats(this.selectedCells()),
  );

  private computeCellStats(selectedCells: CellModel[]): CellStatsI | undefined {
    if (!selectedCells?.length) {
      return undefined;
    }

    const isMutualInfoMode =
      selectedCells[0]?.displayedValue?.type === MATRIX_MODES.MUTUAL_INFO;

    return {
      F: UtilsService.arraySum(
        selectedCells.map((cell) => cell.displayedFreqValue),
      ),
      EF: UtilsService.arraySum(
        selectedCells.map((cell) => cell.displayedValue?.ef),
      ),
      I: isMutualInfoMode
        ? UtilsService.arraySum(
            selectedCells.map((cell) => cell.displayedValue?.value),
          )
        : undefined,
      Total: isMutualInfoMode
        ? UtilsService.arraySum(
            selectedCells.map((cell) => cell.displayedValue?.extra),
          )
        : undefined,
    };
  }
}
