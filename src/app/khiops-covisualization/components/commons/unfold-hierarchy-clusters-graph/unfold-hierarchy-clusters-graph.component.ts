import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'kl-unfold-hierarchy-clusters-graph',
  templateUrl: './unfold-hierarchy-clusters-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UnfoldHierarchyClustersGraphComponent {
  @Input() legend: any;
  @Input() colorSetClusterPerDim: any;
  @Input() clustersPerDimDatas: any;
  @Input() selectedLineChartItem: any;
  @Input() clustersPerDimDatasChartOptions: any;

  @Output() legendItemClicked = new EventEmitter<any>();

  highlightChartLine(event: any) {
    this.legendItemClicked.emit(event);
  }
}
