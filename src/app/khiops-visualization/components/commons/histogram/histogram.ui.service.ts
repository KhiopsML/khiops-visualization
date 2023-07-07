import { Injectable } from "@angular/core";
import { TranslateService } from "@ngstack/translate";

@Injectable({
	providedIn: "root",
})
export class HistogramUIService {
	static chartColors: string[] = ["#6e93d5", "#ffbe46"];
	static translate: TranslateService;

	constructor() {}

	static setTranslationService(translate: TranslateService) {
		this.translate = translate;
	}

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
			this.translate.get("GLOBAL.VALUE") +
			": " +
			d.value.toFixed(6) +
			"<br>" +
			// "log value: " +
			// d.logValue.toFixed(6) +
			// "<br>" +
			this.translate.get("GLOBAL.PARTITION") +
			": " +
			JSON.stringify(d.partition)
			// +
			// "<br>" +
			// this.translate.get("GLOBAL.LOG_RANGE") +
			// ": " +
			// logRange
		);
	}

	static getSign(input: number) {
		return Math.log10(input) > 0 ? "" : "-";
	}
}
