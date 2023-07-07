import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class HistogramUIService {
	static chartColors: string[] = ["#6e93d5", "#ffbe46"];

	constructor() {}

	static getColor(i: number): string {
		return this.chartColors[i];
	}

	static getColors(): string[] {
		return this.chartColors;
	}

	static generateTooltip(d: any) {
		let logRange =
			"[" +
			this.getSign(d.partition[0]) +
			Math.abs(
				Math.round(Math.log10(Math.abs(d.partition[0])) * 100) / 100
			) +
			", ";
		logRange +=
			this.getSign(d.partition[1]) +
			Math.abs(
				Math.round(Math.log10(Math.abs(d.partition[1])) * 100) / 100
			) +
			"]";

		return (
			"Value: " +
			d.value.toFixed(6) +
			"<br>" +
			// "log value: " +
			// d.logValue.toFixed(6) +
			// "<br>" +
			"Range: " +
			JSON.stringify(d.partition) +
			"<br>" +
			"Log: " +
			logRange
		);
	}

	static getSign(input: number) {
		return Math.log10(input) > 0 ? "" : "-";
	}
}
