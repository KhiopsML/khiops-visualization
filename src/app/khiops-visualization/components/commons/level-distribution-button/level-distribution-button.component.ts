/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, computed, inject, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngstack/translate';
import { TYPES } from '@khiops-library/enum/types';
import { DistributionType } from '@khiops-visualization/types/distribution-type';

@Component({
  selector: 'app-level-distribution-button',
  templateUrl: './level-distribution-button.component.html',
  styleUrls: ['./level-distribution-button.component.scss'],
  imports: [
    NgClass,
    FlexModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class LevelDistributionButtonComponent {
  private readonly translate = inject(TranslateService);

  readonly title = input<string>('');
  readonly isSmallDiv = input<boolean>(false);
  readonly searchFormVisible = input<boolean>(false);
  readonly distributionType = input<DistributionType>('level');
  readonly openLevelDistribution = output<void>();

  readonly displayTitle = computed(() => {
    const title = this.title();

    if (title !== '' && title !== undefined) {
      return title;
    }

    return this.distributionType() === 'level'
      ? this.translate.get(TYPES.LEVEL_DISTRIBUTION)
      : this.translate.get(TYPES.IMPORTANCE_DISTRIBUTION);
  });

  readonly ariaLabel = computed(() =>
    this.distributionType() === 'level'
      ? 'ARIA.AG_GRID.OPEN_LEVEL_DISTRIBUTION'
      : 'ARIA.AG_GRID.OPEN_IMPORTANCE_DISTRIBUTION',
  );

  readonly tooltipKey = computed(() =>
    this.distributionType() === 'level'
      ? 'GLOBAL.LEVEL_DISTRIBUTION'
      : 'GLOBAL.IMPORTANCE_DISTRIBUTION',
  );

  onOpenLevelDistribution() {
    this.openLevelDistribution.emit();
  }
}
