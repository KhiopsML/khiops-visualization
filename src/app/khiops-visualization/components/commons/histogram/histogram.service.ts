import { Injectable } from "@angular/core";
import { HistogramBarVO } from "./histogram.bar-vo";

@Injectable({
	providedIn: "root",
})
export class HistogramService {
	rangeXLin: any = {};
	rangeYLin: number = 0;
	rangeYLog = {
		min: 0,
		max: 0,
		realMin: 0,
		realMax: 0,
	};
	rangeXLog: any = {};
	barWlogs: any[] = [];

	constructor() {}

	getRangeX(datas: any) {
		this.rangeXLog.inf = datas.find(function (d: any) {
			return d.partition[0] === 0 || d.partition[1] === 0;
		});

		this.rangeXLog.min = datas[0].partition[0];
		this.rangeXLog.negValuesCount = datas.filter(function (d: any) {
			return d.partition[1] < 0;
		})?.length;
		this.rangeXLog.posValuesCount = datas.filter(function (d: any) {
			return d.partition[1] > 0;
		})?.length;
		if (this.rangeXLog.inf) {
			// 0 exist
			this.rangeXLog.negStart =
				datas.findLast(function (d: any) {
					return d.partition[0] < 0 && d.partition[1] <= 0;
				})?.partition[0] || undefined;
			this.rangeXLog.posStart =
				datas.find(function (d: any) {
					return d.partition[0] > 0 && d.partition[1] > 0;
				})?.partition[0] || undefined;
		} else {
			this.rangeXLog.negStart =
				datas.findLast(function (d: any) {
					return d.partition[0] < 0 && d.partition[1] <= 0;
				})?.partition[1] || undefined;
			this.rangeXLog.posStart =
				datas.find(function (d: any) {
					return d.partition[0] > 0 && d.partition[1] > 0;
				})?.partition[0] || undefined;
		}

		this.rangeXLog.max = datas[datas.length - 1].partition[1];

		this.rangeXLog.middlewidth = 1.2;

		this.rangeXLin.min = datas[0].partition[0];
		this.rangeXLin.max = datas[datas.length - 1].partition[1];

		console.log(
			"file: histogram.service.ts:84 ~ Histogram2Service ~ getRangeX ~ this.rangeXLin, this.rangeXLog:",
			this.rangeXLin,
			this.rangeXLog
		);
		return [this.rangeXLin, this.rangeXLog];
	}

	getLinRangeY(datas: any) {
		const dataValues = datas.map((e: any) => e.value);
		this.rangeYLin = Math.max(...dataValues);
		return this.rangeYLin;
	}

	getLogRangeY(datas: any) {
		const dataValues = datas
			.filter((e: any) => {
				return e.logValue !== 0;
			})
			.map((e: any) => {
				return e.logValue;
			});

		this.rangeYLog.max = Math.ceil(Math.max(...dataValues));
		this.rangeYLog.min = Math.floor(Math.min(...dataValues));
		this.rangeYLog.realMax = Math.max(...dataValues);
		this.rangeYLog.realMin = Math.min(...dataValues);

		return this.rangeYLog;
	}

	getLinRatioY(h: number, padding: number) {
		let ratioY = (h - padding / 2) / this.rangeYLin;
		return ratioY;
	}

	getLogRatioY(h: number, padding: number) {
		let ratioY;
		let shift = Math.abs(this.rangeYLog.min) - Math.abs(this.rangeYLog.max);
		ratioY = (h - padding / 2) / shift;
		return ratioY;
	}

	computeXbarDimensions(datas: any, xType: string) {
		let bars: HistogramBarVO[] = [];

		datas.forEach((d: any, i: number) => {
			let histogramBar = new HistogramBarVO(
				d,
				this.rangeXLog.middlewidth,
				xType
			);
			histogramBar.computeX(bars);
			bars.push(histogramBar);
		});

		return bars;
	}
}
