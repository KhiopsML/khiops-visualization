import { ChartDatasetVO } from "../model/chartDataset-vo";

export class ChartDatasI {
	datasets: ChartDatasetVO[] = [];
	labels: string[] = [];

	emptyLabels() {
		this.labels.push("");
	}
}
