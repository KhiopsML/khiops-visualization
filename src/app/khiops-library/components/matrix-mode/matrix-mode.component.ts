/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';
import { LS } from '@khiops-library/enum/ls';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { MatrixModesModel } from '@khiops-library/model/matrix-modes.model';
import { Ls } from '@khiops-library/providers/ls.service';

@Component({
    selector: 'kl-matrix-mode',
    templateUrl: './matrix-mode.component.html',
    styleUrls: ['./matrix-mode.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MatrixModeComponent implements OnChanges {
  @Input() public matrixModes: MatrixModesModel = new MatrixModesModel();
  @Output() private matrixModeChange = new EventEmitter<MatrixModeI>();

  constructor(private ls: Ls) {}

  ngOnChanges() {
    if (!this.matrixModes.selected) {
      // Get previous selected target if compatible
      const previousSelectedModeIndex = this.ls.get(
        LS.MATRIX_MODE_OPTION_INDEX,
      );
      if (previousSelectedModeIndex) {
        this.matrixModes.selected =
          this.matrixModes.types[previousSelectedModeIndex];
        this.matrixModes.selectedIndex = Number(previousSelectedModeIndex);
      } else {
        // Select first by default
        this.matrixModes.selected = this.matrixModes.types[0];
        this.matrixModes.selectedIndex = 0;
      }
    } else {
      // In case of variable selection change
      // We must update the combobox
      this.matrixModes.selected =
        this.matrixModes.types[this.matrixModes.selectedIndex!];
    }
    this.matrixModeChange.emit(this.matrixModes.selected);
  }

  changeMatrixMode(mode: MatrixModeI) {
    this.matrixModes.selected = mode;
    this.matrixModes.selectedIndex = this.matrixModes.types.findIndex(
      (e) => e.mode === mode.mode,
    );
    this.ls.set(LS.MATRIX_MODE_OPTION_INDEX, this.matrixModes.selectedIndex);

    this.matrixModeChange.emit(this.matrixModes.selected);
  }
}
