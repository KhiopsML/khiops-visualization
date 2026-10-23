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
} from '@angular/core';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { color } from 'd3';

interface LineageNodeEntry {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tree-lineage-path',
  templateUrl: './tree-lineage-path.component.html',
  styleUrls: ['./tree-lineage-path.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TreeLineagePathComponent implements OnChanges {
  @Input() selectedNode?: TreeNodeModel;
  @Input() treeRoot?: TreeNodeModel;
  @Input() theme: 'default' | 'dark' = 'default';
  @Output() lineageNodeSelected = new EventEmitter<string>();
  lineagePath: LineageNodeEntry[] = [];
  selectedTextColor: string | null = null;

  ngOnChanges(): void {
    this.selectedTextColor = this.getTextColor(this.selectedNode?.color);
    const selectedIdentifier = this.getNodeId(this.selectedNode);
    if (!selectedIdentifier) {
      this.lineagePath = [];
      return;
    }
    this.lineagePath = this.treeRoot
      ? this.findLineagePath(this.treeRoot, selectedIdentifier, [])
      : [];
    if (!this.lineagePath.length) {
      this.lineagePath = [
        {
          id: selectedIdentifier,
          label: this.selectedNode?.nodeId || selectedIdentifier,
        },
      ];
    }
  }

  private getTextColor(background?: string): string | null {
    const parsedColor = background ? color(background) : null;
    if (!parsedColor) {
      return null;
    }
    const { r: red, g: green, b: blue } = parsedColor.rgb();
    const [linearRed, linearGreen, linearBlue] = [red, green, blue].map(
      (channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      },
    );
    const luminance =
      0.2126 * linearRed! + 0.7152 * linearGreen! + 0.0722 * linearBlue!;
    const whiteContrast = 1.05 / (luminance + 0.05);
    const blackContrast = (luminance + 0.05) / 0.05;
    return blackContrast > whiteContrast ? '#000000' : '#ffffff';
  }

  private findLineagePath(
    node: TreeNodeModel,
    selectedIdentifier: string,
    parentPath: LineageNodeEntry[],
  ): LineageNodeEntry[] {
    const identifier = this.getNodeId(node);
    const path = identifier
      ? [...parentPath, { id: identifier, label: node.nodeId || identifier }]
      : parentPath;
    if (identifier === selectedIdentifier) {
      return path;
    }
    for (const child of node.children || []) {
      if (child) {
        const childPath = this.findLineagePath(child, selectedIdentifier, path);
        if (childPath.length) {
          return childPath;
        }
      }
    }
    return [];
  }

  private getNodeId(node?: TreeNodeModel): string {
    return node?.id || node?.nodeId || '';
  }
}
