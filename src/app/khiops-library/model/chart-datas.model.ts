import { ChartDatasetModel } from './chart-dataset.model';

export class ChartDatasModel {
  datasets: ChartDatasetModel[] = [];
  labels: string[] = [];

  emptyLabels() {
    this.labels.push('');
  }
}
