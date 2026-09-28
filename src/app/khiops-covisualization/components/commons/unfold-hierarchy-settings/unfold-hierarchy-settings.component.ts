/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'kl-unfold-hierarchy-settings',
  templateUrl: './unfold-hierarchy-settings.component.html',
  styleUrls: ['./unfold-hierarchy-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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

  // Computes 4 evenly spaced reference marks (min, 2 intermediate, max)
  // displayed below the slider, based on minClusters and totalClusters
  get sliderMarks(): number[] {
    const min = this.hierarchyDatas?.minClusters ?? 0;
    const max = this.hierarchyDatas?.totalClusters ?? 0;

    if (max <= min) {
      return [min, min, min, max];
    }

    const step = (max - min) / 3;
    return [min, Math.round(min + step), Math.round(min + step * 2), max];
  }

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
