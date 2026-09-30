/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ChangeDetectorRef, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';

const LEVEL_RELATIVE_VALUE = false; // Set to true to display the level as a percentage of the maximum level, false to display it as a percentage of 1.0

interface LevelCellRendererParams extends ICellRendererParams {
  maxLevel: number;
}

@Component({
  selector: 'kl-level-cell',
  templateUrl: './level-cell.component.html',
  styleUrls: ['./level-cell.component.scss'],
  imports: [MatProgressBarModule],
})
export class LevelCellComponent implements AgRendererComponent {
  public params!: LevelCellRendererParams;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {}

  agInit(params: LevelCellRendererParams): void {
    this.params = params;
  }

  refresh(params: LevelCellRendererParams): boolean {
    this.params = params;
    this.changeDetectorRef.detectChanges();
    return true;
  }

  get formattedLevel(): string {
    if (
      this.params.value === null ||
      this.params.value === undefined ||
      this.params.value === ''
    ) {
      return '';
    }

    return String(
      UtilsService.getPrecisionNumber(
        Number(this.params.value),
        this.khiopsLibraryService.getAppConfig().common.GLOBAL.TO_FIXED,
      ),
    );
  }

  get progressValue(): number {
    const level = Number(this.params.value);

    if (!Number.isFinite(level)) {
      return 0;
    }

    if (!LEVEL_RELATIVE_VALUE) {
      return Math.min(100, Math.max(0, level * 100));
    }

    const maxLevel = this.params.maxLevel;
    if (!Number.isFinite(maxLevel) || maxLevel <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, (level / maxLevel) * 100));
  }
}
