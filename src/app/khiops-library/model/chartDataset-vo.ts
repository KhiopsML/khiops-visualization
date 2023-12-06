export class ChartDatasetVO {
	label: string;
	data: any = [];
	extra = [];
	minBarLength: number = 3;
	fill: boolean = false;
	type: string; // By default
	borderWidth: number;
	maxBarThickness: any;
	barThickness: any;
	barPercentage: number;
	categoryPercentage: number;
	pointRadius?: number;
	pointHitRadius?: number;
	pointHoverRadius?: number;

	constructor(label?, type?) {
		this.label = label || "";
		this.type = type || "bar"; // By default
	}

	removeBar() {
		this.minBarLength = 0;
	}

	initHistogram() {
		this.barPercentage = 1.0;
		this.categoryPercentage = 1.0;
	}
}
