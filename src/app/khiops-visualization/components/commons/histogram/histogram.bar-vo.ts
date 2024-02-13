import { HistogramUIService } from "../histogram/histogram.ui.service";
import { HistogramValuesI } from "./histogram.interfaces";
import { HistogramType } from "./histogram.types";

export class HistogramBarVO {
	barWlog: number = 0;
	barXlog: number = 0;
	barWlin: number = 0;
	barXlin: number = 0;
	color: string = HistogramUIService.getColor(1);
	partition = [];

	constructor(d: HistogramValuesI, middlewidth: number, xType: string) {
		this.partition = d.partition;
		if (xType === HistogramType.XLIN) {
			let barWlin = 0;
			if (this.partition[0] < 0 && this.partition[1] > 0) {
				barWlin =
					Math.abs(this.partition[0]) + Math.abs(this.partition[1]);
			} else {
				barWlin =
					Math.abs(this.partition[0]) - Math.abs(this.partition[1]);
			}
			this.barWlin = Math.abs(barWlin);
		} else {
			let barWlog = 0;
			if (d.partition[0] === 0 || d.partition[1] === 0) {
				barWlog = Math.log10(middlewidth);
				this.color = HistogramUIService.getColor(0);
			} else {
				barWlog =
					Math.log10(Math.abs(this.partition[0])) -
					Math.log10(Math.abs(this.partition[1]));

				if (this.partition[0] < 0 && this.partition[1] > 0) {
					barWlog = Math.log10(middlewidth) * 2;
					this.color = HistogramUIService.getColor(0);
				}
			}
			this.barWlog = Math.abs(barWlog);
		}
	}

	computeXLog(bars: HistogramBarVO[]) {
		let sum = bars.reduce(
			(partialSum: number, a: HistogramBarVO) =>
				Math.abs(partialSum) + Math.abs(a.barWlog),
			0,
		);
		this.barXlog = sum || 0;
	}

	computeXLin(bars: HistogramBarVO[]) {
		let sum = bars.reduce(
			(partialSum: number, a: HistogramBarVO) =>
				Math.abs(partialSum) + Math.abs(a.barWlin),
			0,
		);
		this.barXlin = sum || 0;
	}
}
