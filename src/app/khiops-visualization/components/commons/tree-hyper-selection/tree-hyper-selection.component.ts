/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

@Component({
  selector: 'app-tree-hyper-selection',
  templateUrl: './tree-hyper-selection.component.html',
  styleUrls: ['./tree-hyper-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TreeHyperSelectionComponent {
  @Input() public selectedNode?: TreeNodeModel;
  @Input() public theme: 'default' | 'dark' = 'default';
  @Input() public minLeafTotalFreqs?: number;
  @Input() public maxLeafTotalFreqs?: number;

  public get isDarkTheme(): boolean {
    return this.theme === 'dark';
  }

  public get populationPercent(): number {
    const totalFreqs = Number(this.selectedNode?.totalFreqs);
    const maxLeafTotalFreqs = Number(this.maxLeafTotalFreqs);

    if (
      !Number.isFinite(totalFreqs) ||
      !Number.isFinite(maxLeafTotalFreqs) ||
      maxLeafTotalFreqs <= 0
    ) {
      return 0;
    }

    const percent = (totalFreqs / maxLeafTotalFreqs) * 100;
    return Math.max(0, Math.min(100, percent));
  }
}
