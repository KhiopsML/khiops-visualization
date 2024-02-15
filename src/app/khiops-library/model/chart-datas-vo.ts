import { ChartDatasetVO } from './chartDataset-vo';

export class ChartDatasVO {
  datasets: ChartDatasetVO[] = [];
  labels: string[] = [];
  intervals?: string[] = [];

  emptyLabels() {
    this.labels.push('');
  }
}
