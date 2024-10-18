import { ChartDatasetModel } from './chartDataset.model';

export class ChartDatasModel {
  datasets: ChartDatasetModel[] = [];
  labels: string[] = [];

  emptyLabels() {
    this.labels.push('');
  }
}
