/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kl-unfold-hierarchy-settings',
  templateUrl: './unfold-hierarchy-settings.component.html',
  styleUrls: ['./unfold-hierarchy-settings.component.scss'],
  standalone: false,
})
export class UnfoldHierarchySettingsComponent {
  @Input() currentUnfoldHierarchy!: number;
  @Input() hierarchyDatas: {
    totalClusters: number;
    minClusters: number;
  } | null = null;
  @Input() currentCellsPerCluster!: number;
  @Input() currentInformationPerCluster!: number;
  @Input() cyInput: string = '';

  @Output() hierarchyChanged = new EventEmitter<number>();
  @Output() increase = new EventEmitter<void>();
  @Output() decrease = new EventEmitter<void>();
  @Output() cyInputSet = new EventEmitter<string>();

  onHierarchyChanged(event: Event) {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.hierarchyChanged.emit(value);
  }

  increaseUnfoldHierarchy() {
    this.increase.emit();
  }

  decreaseUnfoldHierarchy() {
    this.decrease.emit();
  }

  setCypressInput(value: string) {
    this.cyInputSet.emit(value);
  }
}
