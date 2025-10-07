import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'kl-unfold-hierarchy-clusters-graph',
  templateUrl: './unfold-hierarchy-clusters-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UnfoldHierarchyClustersGraphComponent {
  @Input() legend: { series: { name: string }[] }[] | undefined;
  @Input() colorSetClusterPerDim: ChartColorsSetI | undefined;
  @Input() clustersPerDimDatas: ChartDatasModel | undefined;
  @Input() selectedLineChartItem = '';
  @Input() clustersPerDimDatasChartOptions: ChartOptions | undefined;

  @Output() legendItemClicked = new EventEmitter<any>();

  highlightChartLine(event: any) {
    this.legendItemClicked.emit(event);
  }
}
