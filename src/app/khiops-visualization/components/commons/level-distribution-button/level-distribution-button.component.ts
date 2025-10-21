/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { TYPES } from '@khiops-library/enum/types';
import { DistributionType } from '@khiops-visualization/types/distribution-type';

@Component({
  selector: 'app-level-distribution-button',
  templateUrl: './level-distribution-button.component.html',
  styleUrls: ['./level-distribution-button.component.scss'],
  standalone: false,
})
export class LevelDistributionButtonComponent {
  @Input() title: string = '';
  @Input() isSmallDiv: boolean = false;
  @Input() searchFormVisible: boolean = false;
  @Input() distributionType: DistributionType = 'level';
  @Output() openLevelDistribution: EventEmitter<void> = new EventEmitter();

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    if (this.title === '' || this.title === undefined) {
      if (this.distributionType === 'level') {
        this.title = this.translate.get(TYPES.LEVEL_DISTRIBUTION);
      } else {
        this.title = this.translate.get(TYPES.IMPORTANCE_DISTRIBUTION);
      }
    }
  }

  onOpenLevelDistribution() {
    this.openLevelDistribution.emit();
  }

  get ariaLabel(): string {
    return this.distributionType === 'level'
      ? 'ARIA.AG_GRID.OPEN_LEVEL_DISTRIBUTION'
      : 'ARIA.AG_GRID.OPEN_IMPORTANCE_DISTRIBUTION';
  }

  get tooltipKey(): string {
    return this.distributionType === 'level'
      ? 'GLOBAL.LEVEL_DISTRIBUTION'
      : 'GLOBAL.IMPORTANCE_DISTRIBUTION';
  }
}
