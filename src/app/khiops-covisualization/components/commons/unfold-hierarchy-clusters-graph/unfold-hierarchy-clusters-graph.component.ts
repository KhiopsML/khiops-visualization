import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'kl-unfold-hierarchy-clusters-graph',
  templateUrl: './unfold-hierarchy-clusters-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UnfoldHierarchyClustersGraphComponent extends SelectableComponent {
  @Input() legend: { series: { name: string }[] }[] | undefined;
  @Input() colorSetClusterPerDim: ChartColorsSetI | undefined;

  private _clustersPerDimDatas: ChartDatasModel | undefined;
  datas: ChartDatasModel | undefined;

  @Input()
  set clustersPerDimDatas(value: ChartDatasModel | undefined) {
    this._clustersPerDimDatas = value;
    this.datas = value; // Automatic assignment
  }

  get clustersPerDimDatas(): ChartDatasModel | undefined {
    return this._clustersPerDimDatas;
  }

  @Input() selectedLineChartItem = '';
  @Input() chartOptions: ChartOptions | undefined;

  @Output() legendItemClicked = new EventEmitter<any>();

  public componentType = COMPONENT_TYPES.ND_LINE_CHART; // needed to copy datas

  highlightChartLine(event: any) {
    this.legendItemClicked.emit(event);
  }
}
