/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { TYPES } from '@khiops-library/enum/types';

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
  @Output() openLevelDistribution: EventEmitter<void> = new EventEmitter();

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    if (this.title === '' || this.title === undefined) {
      this.title = this.translate.get(TYPES.LEVEL_DISTRIBUTION);
    }
  }

  onOpenLevelDistribution() {
    this.openLevelDistribution.emit();
  }
}
