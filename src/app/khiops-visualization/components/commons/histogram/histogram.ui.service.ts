import { Injectable } from "@angular/core";
import { TranslateService } from "@ngstack/translate";
import * as d3 from "d3";
import { HistogramType } from "./histogram.types";

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

	static generateTooltip(d: any, xType: string) {
		let bounds = "";
		if (xType === HistogramType.XLIN) {
			bounds = JSON.stringify(d.partition);
		} else {
			if (d.partition[0] === 0) {
				bounds = "[-Inf, ";
			} else {
				bounds =
					"[" +
					this.getSign(d.partition[0]) +
					d3.format(".0e")(Math.abs(d.partition[0])) +
					", ";
			}
			if (d.partition[1] === 0) {
				bounds += "-Inf]";
			} else {
				bounds +=
					this.getSign(d.partition[1]) +
					d3.format(".0e")(Math.abs(d.partition[1])) +
					"]";
			}
		}

		return (
			this.translate.get("GLOBAL.DENSITY") +
			": " +
			d3.format(".3e")(d.value) +
			"<br>" +
			this.translate.get("GLOBAL.FREQUENCY") +
			": " +
			d.frequency +
			"<br>" +
			this.translate.get("GLOBAL.BOUNDS") +
			": " +
			bounds
		);
	}

	static getSign(input: number) {
		return Math.log10(input) > 0 ? "" : "-";
	}
}
