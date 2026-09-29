/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

interface LineageNodeEntry {
  id: string;
  label: string;
}

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
  @Output() public lineageNodeSelected = new EventEmitter<string>();
  public lineagePath: LineageNodeEntry[] = [];

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

  public onLineageChipClick(pathNode: LineageNodeEntry): void {
    if (!pathNode?.id) {
      return;
    }

    this.lineageNodeSelected.emit(pathNode.id);
  }

  private computeLineagePath(): LineageNodeEntry[] {
    const selectedIdentifier = this.getNodeId(this.selectedNode);
    if (!selectedIdentifier) {
      return [];
    }

    if (this.treeRoot) {
      const path = this.findLineagePath(this.treeRoot, selectedIdentifier, []);
      if (path.length > 0) {
        const lastPathNode = path[path.length - 1];
        if (lastPathNode?.id !== selectedIdentifier) {
          const selectedNodeEntry = this.toLineageNodeEntry(this.selectedNode);
          if (selectedNodeEntry) {
            return [...path, selectedNodeEntry];
          }
        }
        return path;
      }
    }

    const selectedNodeEntry = this.toLineageNodeEntry(this.selectedNode);
    return selectedNodeEntry ? [selectedNodeEntry] : [];
  }

  private findLineagePath(
    node: TreeNodeModel,
    selectedIdentifier: string,
    parentPath: LineageNodeEntry[],
  ): LineageNodeEntry[] {
    const currentIdentifier = this.getNodeId(node);
    const currentNodeEntry = this.toLineageNodeEntry(node);
    const currentPath = currentNodeEntry
      ? [...parentPath, currentNodeEntry]
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

  private toLineageNodeEntry(node?: TreeNodeModel): LineageNodeEntry | null {
    const id = this.getNodeId(node);
    if (!id) {
      return null;
    }

    return {
      id,
      label: node?.nodeId || id,
    };
  }

  private getNodeId(node?: TreeNodeModel): string {
    return node?.id || node?.nodeId || '';
  }
}
