import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	Input,
	QueryList,
	SimpleChanges,
	ViewChild,
	ViewChildren,
} from "@angular/core";
import * as d3 from "d3";
import { HistogramService } from "./histogram.service";
import { format } from "mathjs";
import { HistogramUIService } from "./histogram.ui.service";
import { HistogramBarVO } from "./histogram.bar-vo";
import { ResizedEvent } from "angular-resize-event";
import { DistributionDatasVO } from "@khiops-visualization/model/distribution-datas-vo";
import { DistributionDatasService } from "@khiops-visualization/providers/distribution-datas.service";
import { KhiopsLibraryService } from "@khiops-library/providers/khiops-library.service";

@Component({
	selector: "app-histogram",
	templateUrl: "./histogram.component.html",
	styleUrls: ["./histogram.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramComponent {
	@ViewChild("chart", { static: false })
	chart!: ElementRef;
	@ViewChild("chartTooltip", { static: false })
	chartTooltip!: ElementRef;
	@ViewChildren("rects") private rects: QueryList<ElementRef>;

	svg: any;
	tooltip!: any;
	errorMessage = false;

	// Dynamic values
	@Input() datas: any;
	@Input() fullScreen: boolean = false;
	h: number = 220;
	w: number = 1000;
	xPadding = 30;
	yPadding = 50;

	// Static config values
	xTickCount = 12;
	yTicksCount = 10;
	tickSize = 0;
	minBarHeight = 4;

	// Local variables
	rangeXLog: any;
	rangeXLin: any;
	rangeYLin: any;
	rangeYLog: any;

	ratioY = 0;

	formatOpts = { lowerExp: -2, upperExp: 2 };
	ratio: number = 0;
	distributionDatas: DistributionDatasVO;

	colorSet: string[];

	constructor(
		private distributionDatasService: DistributionDatasService,
		private khiopsLibraryService: KhiopsLibraryService,
		private histogramService: HistogramService
	) {
		this.colorSet = HistogramUIService.getColors();
		d3.selection.prototype.moveToFront = function () {
			return this.each(function () {
				this.parentNode.appendChild(this);
			});
		};
	}

	ngOnInit(): void {
		this.distributionDatas = this.distributionDatasService.getDatas();
	}

	changeGraphTypeX(type) {
		// this.khiopsLibraryService.trackEvent('click', 'distribution_graph_type_x', this.graphOptions.selected);
		localStorage.setItem(
			this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
				"DISTRIBUTION_GRAPH_OPTION_X",
			type
		);
		this.distributionDatas.distributionGraphOptionsX.selected = type;
		this.datas && this.init();
	}

	changeGraphType(type) {
		// this.khiopsLibraryService.trackEvent('click', 'distribution_graph_type_x', this.graphOptions.selected);
		localStorage.setItem(
			this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
				"DISTRIBUTION_GRAPH_OPTION",
			type
		);
		this.distributionDatas.distributionGraphOptions.selected = type;
		this.datas && this.init();
	}

	onResized(event: ResizedEvent) {
		this.h = this.chart.nativeElement.offsetHeight + 10 - 60; // graph header = 60, +10 to take more height
		this.w = this.chart.nativeElement.offsetWidth;
		this.datas && this.init();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes?.["datas"]) {
			if (!changes?.["datas"]?.currentValue) {
				this.errorMessage = true;
			} else {
				this.errorMessage = false;
			}
		}
		if (changes?.["datas"]) {
			this.datas && this.init();
		}
	}

	ngAfterViewInit(): void {}

	initSpecs(datas: any) {
		this.datas = datas;
	}

	init() {
		if (this.chart) {
			this.chart.nativeElement.innerHTML = "";
			if (this.datas) {
				if (
					this.distributionDatas.distributionGraphOptions.selected ===
					"yLog"
				) {
					this.rangeYLog = this.histogramService.getLogRangeY(
						this.datas
					);
					this.ratioY = this.histogramService.getLogRatioY(
						this.h,
						this.yPadding
					);
				} else {
					this.rangeYLin = this.histogramService.getLinRangeY(
						this.datas
					);
					this.ratioY = this.histogramService.getLinRatioY(
						this.h,
						this.yPadding
					);
				}

				this.drawChart(this.w);
				this.addTooltip();

				[this.rangeXLin, this.rangeXLog] =
					this.histogramService.getRangeX(this.datas);

				this.drawYAxis();
				this.drawHistogram(this.datas);

				if (
					this.distributionDatas.distributionGraphOptionsX
						.selected === "xLin"
				) {
					let shift = 0;
					let width = this.w - 2 * this.xPadding;
					let domain = [this.rangeXLin.min, this.rangeXLin.max];
					let tickValues = this.datas.map((e: any) => e.partition[0]);
					tickValues.push(
						this.datas[this.datas.length - 1].partition[1]
					);
					this.drawXAxis(domain, shift, width, tickValues);
				} else {
					// Draw positive axis
					let shift = 0;
					let width = 0;
					let domain: any = [];

					if (
						this.rangeXLog.posStart !== this.rangeXLog.max &&
						this.rangeXLog.posValuesCount
					) {
						width = this.w - 2 * this.xPadding;
						domain = [this.rangeXLog.posStart, this.rangeXLog.max];

						let shiftInf = 2;
						if (this.rangeXLog.inf && !this.rangeXLog.negStart) {
							shiftInf = 1;
						}
						if (this.rangeXLog.negValuesCount === 0) {
							shiftInf = 0; // only positive values
						}
						shift +=
							((this.w - 2 * this.xPadding) / this.ratio) *
							Math.log10(this.rangeXLog.middlewidth) *
							shiftInf;

						if (this.rangeXLog.negValuesCount !== 0) {
							shift +=
								((this.w - 2 * this.xPadding) / this.ratio) *
								Math.log10(Math.abs(this.rangeXLog.min));
							shift -=
								((this.w - 2 * this.xPadding) / this.ratio) *
								Math.log10(Math.abs(this.rangeXLog.negStart));
						}
						width = this.w - 2 * this.xPadding - shift;
						this.drawXAxis(domain, shift, width, domain);
					}

					// Draw -Inf axis
					if (this.rangeXLog.inf) {
						if (this.rangeXLog.posValuesCount) {
							let middleShift =
								shift -
								((this.w - 2 * this.xPadding) / this.ratio) *
									Math.log10(this.rangeXLog.middlewidth);
							domain = [1];
							this.drawXAxis(
								domain,
								middleShift - 0.1,
								1,
								domain
							);
						} else {
							let middleShift = this.w - 2 * this.xPadding;
							domain = [1];
							this.drawXAxis(
								domain,
								middleShift - 0.1,
								1,
								domain
							); // 1 to make bigger line
						}
					}

					// Draw negative axis
					if (
						// this.rangeXLog.inf ||
						this.rangeXLog.negStart !== this.rangeXLog.min &&
						this.rangeXLog.negValuesCount
					) {
						width = this.w - 2 * this.xPadding - width;
						domain = [this.rangeXLog.min, this.rangeXLog.negStart];

						if (this.rangeXLog.posValuesCount) {
							// If there is pos and neg values
							width =
								width -
								((this.w - 2 * this.xPadding) / this.ratio) *
									Math.log10(this.rangeXLog.middlewidth) *
									2;
						} else {
							if (this.rangeXLog.inf) {
								width =
									width -
									((this.w - 2 * this.xPadding) /
										this.ratio) *
										Math.log10(this.rangeXLog.middlewidth);
							}
						}
						this.drawXAxis(domain, 0, width, domain);
					}
				}
			}
		}
	}

	drawChart(chartW: number) {
		this.svg = d3
			.select(this.chart.nativeElement)
			.append("svg")
			.attr("width", chartW)
			.attr("height", this.h + this.yPadding);
	}

	addTooltip() {
		this.chartTooltip!.nativeElement.innerHTML = "";
		this.tooltip = d3
			.select(this.chartTooltip!.nativeElement)
			.append("div")
			.attr("class", "tooltip");
	}

	drawRect(d: any, i: number, bar: HistogramBarVO, ratio = 0) {
		var self = this;
		let barX: any, barH, barW: any;

		if (
			this.distributionDatas.distributionGraphOptionsX.selected === "xLin"
		) {
			barX = ((this.w - 2 * this.xPadding) / ratio) * bar.barXlin;
			barW = ((this.w - 2 * this.xPadding) / ratio) * bar.barWlin;
		} else {
			barX = ((this.w - 2 * this.xPadding) / ratio) * bar.barXlog;
			barW = ((this.w - 2 * this.xPadding) / ratio) * bar.barWlog;
		}

		const onclickRect = function (bar: HistogramBarVO) {
			//@ts-ignore
			d3.select(this.parentNode)
				.selectAll("rect")
				.style("stroke", bar.color);

			//@ts-ignore
			d3.select(this).style("stroke", "black");
			//@ts-ignore
			d3.select(this).moveToFront();
		};
		const mouseover = function (e: any) {
			//@ts-ignore
			self.tooltip.style("display", "block").style("width", "140px");

			//@ts-ignore
			d3.select(this.parentNode)
				.selectAll("rect")
				.style("fill-opacity", "0.65");

			//@ts-ignore
			d3.select(this).style("fill-opacity", "0.9");
		};
		const mousemove = (e: any) => {
			const tooltipText = HistogramUIService.generateTooltip(d);
			//@ts-ignore
			self.tooltip.html(tooltipText);

			let left = e.offsetX - 70;
			let top = e.offsetY + 40 - self.h / 2;
			if (self.fullScreen) {
				top = e.offsetY - 60;
			}

			if (left < 10) {
				left = 10;
			}
			if (left > this.w - 170) {
				left = this.w - 170;
			}
			if (top < 10) {
				top = 10;
			}

			//@ts-ignore
			self.tooltip.style("margin-left", left + "px");
			//@ts-ignore
			self.tooltip.style("margin-top", top + "px");
		};
		const mouseleave = function (e: any) {
			//@ts-ignore
			self.tooltip
				.style("display", "none")
				.style("margin-left", "0px")
				.style("margin-top", "0px");

			//@ts-ignore
			d3.select(this.parentNode)
				.selectAll("rect")
				.style("fill-opacity", "0.65");
		};

		if (
			this.distributionDatas.distributionGraphOptions.selected === "yLin"
		) {
			barH = d.value * this.ratioY;
		} else {
			if (d.logValue !== 0) {
				let shift = Math.abs(this.rangeYLog.max);
				barH = Math.abs(d.logValue) * this.ratioY - shift * this.ratioY;
				barH = this.h - this.yPadding / 2 - barH;
			} else {
				barH = 0;
			}
		}
		if (barH !== 0 && barH < this.minBarHeight) {
			barH = this.minBarHeight;
		}

		this.svg
			.append("rect")
			.attr("id", "rect-" + i)
			.attr("x", barX + this.xPadding + this.xPadding / 2)
			.attr("y", this.h - barH)
			.attr("stroke", bar.color)
			.attr("stroke-width", "2px")
			.on("click", onclickRect)
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseleave", mouseleave)
			.attr("width", barW - 2) // -2 to remove stroke width (outer and cannot be inner)
			.attr("height", barH)
			.attr("fill-opacity", "0.65")
			.attr("fill", bar.color);
	}

	drawHistogram(datasSet: any) {
		let bars: HistogramBarVO[] =
			this.histogramService.computeXbarDimensions(
				datasSet,
				this.distributionDatas.distributionGraphOptionsX.selected
			);
		this.ratio = 0;
		if (
			this.distributionDatas.distributionGraphOptionsX.selected === "xLin"
		) {
			this.ratio =
				bars[bars.length - 1].barXlin + bars[bars.length - 1].barWlin;
		} else {
			this.ratio =
				bars[bars.length - 1].barXlog + bars[bars.length - 1].barWlog;
		}
		datasSet.forEach((d: any, i: number) => {
			this.drawRect(d, i, bars[i], this.ratio);
		});
	}

	drawXAxis(domain: any, shift: number, width: number, tickValues: any) {
		if (width !== 0) {
			let xAxis;
			let tickCount = this.xTickCount;
			if (
				this.distributionDatas.distributionGraphOptionsX.selected ===
					"xLog" &&
				domain.length !== 1
			) {
				tickCount = domain[1] / domain[0];
				if (tickCount > 10) {
					tickCount = 10;
				}
			}

			shift = shift + this.xPadding;

			if (
				this.distributionDatas.distributionGraphOptionsX.selected ===
				"xLin"
			) {
				xAxis = d3.scaleLinear().domain(domain).range([0, width]); // This is where the axis is placed: from 100px to 800px
			} else {
				xAxis = d3.scaleLog().base(10).domain(domain).range([0, width]);
			}

			//@ts-ignore
			const axis: d3.Axis<d3.NumberValue> = d3
				.axisBottom(xAxis)
				// .tickValues(tickValues)
				// .ticks(tickCount)
				.tickSize(-this.h + this.yPadding / 2)
				//@ts-ignore
				.tickFormat((d, i) => {
					//@ts-ignore
					let val: any = d;
					if (
						this.distributionDatas.distributionGraphOptionsX
							.selected === "xLin"
					) {
						return "" + format(val);
					} else {
						if (domain.length === 1) {
							// return "-Inf (0)";
							return "-Inf";
						} else {
							return this.formatTick(val);
						}
					}
				});

			if (
				this.distributionDatas.distributionGraphOptionsX.selected ===
				"xLin"
			) {
				// @ts-ignore
				axis.ticks = tickCount;
			} else {
				// @ts-ignore
				axis.tickValues = tickValues;
			}

			this.svg
				.insert("g", ":first-child")
				.attr("class", "barXlog axis-grid")
				.attr(
					"transform",
					"translate(" +
						(shift + this.xPadding / 2) +
						"," +
						this.h +
						") "
				) // This controls the vertical position of the Axis
				.call(axis)
				.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-0.4em")
				.attr("dy", "1em")
				.attr("transform", "rotate(-35)");
		}
	}

	formatTick(val: number) {
		const tick = Math.round(Math.log10(Math.abs(val)) * 100) / 100;
		// return format(val, this.formatOpts) + " (" + tick + ")";
		return format(val, this.formatOpts);
	}

	drawYAxis() {
		let y;

		// Create the scale
		if (
			this.distributionDatas.distributionGraphOptions.selected === "yLin"
		) {
			y = d3
				.scaleLinear()
				.domain([0, this.rangeYLin]) // This is what is written on the Axis: from 0 to 100
				.range([this.h - this.yPadding / 2, 0]); // Note it is reversed
		} else {
			y = d3
				.scaleLinear()
				// .base(10)
				// .domain([this.rangeYLog.min, -1]) // This is what is written on the Axis: from 0 to 100
				// .domain([this.rangeYLog.min, this.rangeYLog.max]) // This is what is written on the Axis: from 0 to 100
				.domain([this.rangeYLog.max, this.rangeYLog.min]) // This is what is written on the Axis: from 0 to 100
				// .domain([0, this.rangeYLog.min]) // This is what is written on the Axis: from 0 to 100
				.range([0, this.h - this.yPadding / 2]); // Note it is reversed
		}

		let shift = this.xPadding;
		this.tickSize = -(this.w - this.xPadding * 2);

		// Draw the axis
		const axis = d3
			.axisLeft(y)
			.tickSize(this.tickSize)
			.tickPadding(10)
			.ticks(this.yTicksCount);
		this.svg
			.append("g")
			.attr("class", "y axis-grid")
			.attr(
				"transform",
				"translate(" +
					(shift + this.xPadding / 2) +
					"," +
					this.yPadding / 2 +
					")"
			) // This controls the vertical position of the Axis
			.call(axis);
	}
}