import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

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

  ngOnChanges(): void {
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
