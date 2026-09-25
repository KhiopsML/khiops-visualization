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

  public get isDarkTheme(): boolean {
    return this.theme === 'dark';
  }
}
