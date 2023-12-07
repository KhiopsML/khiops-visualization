export class ChartDatasetVO {
	label: string;
	data: any = [];
	extra = [];
	minBarLength: number = 3;
	fill: boolean = false;
	borderSkipped: boolean = false;
	type: string; // By default
	borderWidth: number;
	maxBarThickness: any;
	barThickness: any;
	barPercentage: number;
	categoryPercentage: number;
	pointRadius?: number;
	pointHitRadius?: number;
	pointHoverRadius?: number;
	backgroundColor?: string[];
	borderColor?: string[];

	constructor(label?, type?) {
		this.label = label || "";
		this.type = type || "bar"; // By default
	}

}
