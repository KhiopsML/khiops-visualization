/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

@Component({
  selector: 'app-tree-hyper-selection',
  templateUrl: './tree-hyper-selection.component.html',
  styleUrls: ['./tree-hyper-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TreeHyperSelectionComponent implements OnChanges {
  @Input() public selectedNode?: TreeNodeModel;
  @Input() public treeRoot?: TreeNodeModel;
  @Input() public theme: 'default' | 'dark' = 'default';
  @Input() public minLeafTotalFreqs?: number;
  @Input() public maxLeafTotalFreqs?: number;
  public lineagePath: string[] = [];

  ngOnChanges(_changes: SimpleChanges): void {
    this.lineagePath = this.computeLineagePath();
  }

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

  private computeLineagePath(): string[] {
    const selectedIdentifier = this.getNodeIdentifier(this.selectedNode);
    if (!selectedIdentifier) {
      return [];
    }

    if (this.treeRoot) {
      const path = this.findLineagePath(this.treeRoot, selectedIdentifier, []);
      if (path.length > 0) {
        const lastPathNode = path[path.length - 1];
        if (lastPathNode !== selectedIdentifier) {
          return [...path, selectedIdentifier];
        }
        return path;
      }
    }

    return [selectedIdentifier];
  }

  private findLineagePath(
    node: TreeNodeModel,
    selectedIdentifier: string,
    parentPath: string[],
  ): string[] {
    const currentIdentifier = this.getNodeIdentifier(node);
    const currentPath = currentIdentifier
      ? [...parentPath, currentIdentifier]
      : parentPath;

    if (currentIdentifier === selectedIdentifier) {
      return currentPath;
    }

    const children = node.children || [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child) {
        const path = this.findLineagePath(
          child,
          selectedIdentifier,
          currentPath,
        );
        if (path.length > 0) {
          return path;
        }
      }
    }

    return [];
  }

  private getNodeIdentifier(node?: TreeNodeModel): string {
    return node?.nodeId || node?.id || '';
  }
}
