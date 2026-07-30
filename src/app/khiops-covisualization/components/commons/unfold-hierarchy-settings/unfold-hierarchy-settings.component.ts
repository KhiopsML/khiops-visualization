/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  input,
  output,
} from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngstack/translate';
import { ToPrecisionPipe } from '@khiops-library/pipes/to-precision.pipe';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'kl-unfold-hierarchy-settings',
  templateUrl: './unfold-hierarchy-settings.component.html',
  styleUrls: ['./unfold-hierarchy-settings.component.scss'],
  imports: [
    FlexLayoutModule,
    TranslateModule,
    ToPrecisionPipe,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
  ],
})
export class UnfoldHierarchySettingsComponent {
  readonly currentUnfoldHierarchy = input.required<number>();
  readonly hierarchyDatas = input<{
    totalClusters: number;
    minClusters: number;
  } | null>(null);
  readonly currentCellsPerCluster = input.required<number>();
  readonly currentInformationPerCluster = input.required<number>();
  readonly cyInput = input<string>('');

  readonly hierarchyChanged = output<number>();
  readonly increase = output<void>();
  readonly decrease = output<void>();
  readonly cyInputSet = output<string>();

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
