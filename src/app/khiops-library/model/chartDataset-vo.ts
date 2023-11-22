export class ChartDatasetVO {
	label: string;
	data = [];
	extra = [];
	minBarLength = 3;
	fill = false;
	type: string; // By default
	borderWidth: number;
	maxBarThickness: any;
	barThickness: any;
	setPercentage: number[] | undefined;
	barPercentage: number;
	categoryPercentage: number;

	constructor(label?, type?) {
		this.label = label || "";
		this.type = type || "bar"; // By default
		this.setPercentage = undefined;
	}

	removeBar() {
		this.minBarLength = 0;
	}

	initHistogram() {
		this.setPercentage = [];
		this.barPercentage = 1.0;
		this.categoryPercentage = 1.0;
	}
}
