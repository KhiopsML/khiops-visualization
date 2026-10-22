import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { TranslateService } from '@ngstack/translate';
import { TreeLineagePathComponent } from '../tree-lineage-path/tree-lineage-path.component';

@Component({
  selector: 'app-tree-node-details',
  templateUrl: './tree-node-details.component.html',
  styleUrls: ['./tree-node-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TreeNodeDetailsComponent extends SelectableComponent {
  private static nextId = 0;
  private readonly translate = inject(TranslateService);

  @HostBinding('attr.id')
  public override id = `tree-node-details-${TreeNodeDetailsComponent.nextId++}`;

  @Input() selectedNode?: TreeNodeModel;
  @Input() treeRoot?: TreeNodeModel;
  @Input() minLeafTotalFreqs?: number;
  @Input() maxLeafTotalFreqs?: number;
  @Input() theme: 'default' | 'dark' = 'default';
  @Output() lineageNodeSelected = new EventEmitter<string>();
  @ViewChild(TreeLineagePathComponent)
  private lineagePathComponent?: TreeLineagePathComponent;

  public componentType = COMPONENT_TYPES.INFORMATIONS;

  override onClick(event: MouseEvent): void {
    super.onClick(event);
    event.stopPropagation();
  }

  get title(): string {
    return this.translate.get('GLOBAL.HYPER_TREE_SELECTION');
  }

  get inputDatas(): { title: string; value: string | number }[] {
    if (!this.selectedNode) {
      return [];
    }

    const rows: { title: string; value: string | number }[] = [
      {
        title: 'GLOBAL.HYPER_TREE_SELECTION',
        value:
          this.lineagePathComponent?.lineagePath
            .map((node) => node.label)
            .join(' > ') ||
          this.selectedNode.nodeId ||
          this.selectedNode.id ||
          '-',
      },
    ];

    if (this.selectedNode.totalFreqs !== undefined) {
      rows.push({
        title: 'GLOBAL.POPULATION',
        value: `${this.selectedNode.totalFreqs} (min: ${this.minLeafTotalFreqs ?? '-'}, max: ${this.maxLeafTotalFreqs ?? '-'})`,
      });
      if (this.selectedNode.purity !== undefined) {
        rows.push({
          title: 'GLOBAL.PURITY',
          value: this.selectedNode.purity,
        });
      }
    }

    return rows;
  }
}
