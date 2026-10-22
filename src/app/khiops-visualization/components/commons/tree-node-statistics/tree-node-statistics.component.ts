import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

@Component({
  selector: 'app-tree-node-statistics',
  templateUrl: './tree-node-statistics.component.html',
  styleUrls: ['./tree-node-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TreeNodeStatisticsComponent {
  @Input() selectedNode?: TreeNodeModel;
  @Input() minLeafTotalFreqs?: number;
  @Input() maxLeafTotalFreqs?: number;
  @Input() theme: 'default' | 'dark' = 'default';

  get populationPercent(): number {
    const totalFreqs = Number(this.selectedNode?.totalFreqs);
    const maximum = Number(this.maxLeafTotalFreqs);
    if (
      !Number.isFinite(totalFreqs) ||
      !Number.isFinite(maximum) ||
      maximum <= 0
    ) {
      return 0;
    }
    return Math.max(0, Math.min(100, (totalFreqs / maximum) * 100));
  }
}
