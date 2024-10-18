import { ChartDatasetVO } from './chartDataset.model';

export class ChartDatasVO {
  datasets: ChartDatasetVO[] = [];
  labels: string[] = [];

  emptyLabels() {
    this.labels.push('');
  }
}
