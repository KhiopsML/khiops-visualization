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
import { MatrixOptionsModel } from '@khiops-library/model/matrix-options.model';
import { Ls } from '@khiops-library/providers/ls.service';

@Component({
  selector: 'kl-matrix-toggle',
  templateUrl: './matrix-toggle.component.html',
  styleUrls: ['./matrix-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MatrixToggleComponent implements OnChanges {
  @Input() public matrixOptions: MatrixOptionsModel = new MatrixOptionsModel();
  @Input() private lsId: string = LS.MATRIX_TYPE_OPTION;
  @Output() private matrixOptionChange = new EventEmitter<string>();

  constructor(private ls: Ls) {}

  ngOnChanges() {
    // may has been set by saved datas
    if (!this.matrixOptions.selected) {
      this.matrixOptions.selected = this.ls.get(
        this.lsId,
        this.matrixOptions.types[0],
      );
    }
  }

  changeMatrixType(type: string) {
    // this.trackerService.trackEvent('click', 'matrix_type', type);
    this.ls.set(this.lsId, type);
    this.matrixOptions.selected = type;
    this.matrixOptionChange.emit(type);
  }
}
