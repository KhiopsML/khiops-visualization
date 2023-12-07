import {
	Component,
	Input,
	EventEmitter,
	Output,
	OnInit,
	AfterViewInit,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import * as ChartJs from 'chart.js';

import {
	UtilsService
} from '../../providers/utils.service';
import {
	KhiopsLibraryService
} from '../../providers/khiops-library.service';
import {
	ToPrecisionPipe
} from '../../pipes/toPrecision.pipe';
import {
	ChartColorsSetI
} from '../../interfaces/chart-colors-set';
import {
	ChartOptions
} from 'chart.js';
import {
	ConfigService
} from '@khiops-library/providers/config.service';
import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';
import { ChartDatasetVO } from '@khiops-library/model/chartDataset-vo';

@Component({
	selector: 'kl-chart-next',
	templateUrl: './chart-next.component.html',
	styleUrls: ['./chart-next.component.scss'],
	providers: [ToPrecisionPipe]
})
export class ChartNextComponent implements OnInit, AfterViewInit, OnChanges {

	@Input() canvasIdContainer = 'kl-chart-canvas'; // May be updated if multiple graph
	@Input() inputDatas: ChartDatasVO;
	@Input() activeEntries: number;
	@Input() type: ChartJs.ChartType = 'bar';
	@Input() chartOptions: ChartOptions;
	@Input() colorSet: ChartColorsSetI;
	@Input() enableSelection = true;
	@Input() selectedLineChartItem: string = undefined;

	@Output() selectBarIndex: EventEmitter < number > = new EventEmitter();

	AppConfig = this.khiopsLibraryService.getAppConfig().common;

	ctx: ChartJs.ChartItem;
	chart: ChartJs.Chart;
	color: string = localStorage.getItem(this.AppConfig.GLOBAL.LS_ID + 'THEME_COLOR') === 'dark' ? '#555' : '#e5e5e5';
	barColor: string = localStorage.getItem(this.AppConfig.GLOBAL.LS_ID + 'THEME_COLOR') === 'dark' ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)';
	fontColor: string = '#999';

	constructor(private configService: ConfigService,
		private khiopsLibraryService: KhiopsLibraryService) {
		this.colorSet = this.khiopsLibraryService.getGraphColorSet()[0];
	}

	ngOnInit() {}

	ngAfterViewInit(): void {
		this.initChart();
	}

	initChart() {

		this.ctx = <ChartJs.ChartItem>this.configService.getRootElementDom().querySelector < HTMLElement > ('#' + this.canvasIdContainer)

		if (this.ctx) {

			// Destroy old chart if exists
			// Do it even if canvas is undefined to remove other canvas ids
			try {
				this.chart.destroy();
			} catch (e) {}

			const chartAreaBorder = {
				id: 'chartAreaBorder',
				beforeDraw(chart, args, options) {
					const {
						ctx,
						chartArea: {
							left,
							top,
							width,
							height
						}
					} = chart;
					ctx.save();
					ctx.strokeStyle = options.borderColor;
					ctx.lineWidth = options.borderWidth;
					ctx.setLineDash(options.borderDash || []);
					ctx.lineDashOffset = options.borderDashOffset;
					ctx.strokeRect(left, top, width, height);
					ctx.restore();
				}
			};

			let options: ChartOptions | any = {
				plugins: {
					chartAreaBorder: {
						borderColor: this.color,
						borderWidth: 1,
					},
					tooltip: {
						callbacks: {
							title: (items) => {
								if (items && items[0]) {
									return items[0].label;
								}
							},
							label: (items) => {
								if (items && items[0]) {
									return items[0].dataset.label;
								} else if (items && items.dataset) {
									return items.dataset.label;
								}
							}
						},
						backgroundColor: 'rgba(27, 36, 67, 0.9)'
					},
					legend: {
						display: false
					},
				},
				interaction: {
					mode: 'point'
				},
				animation: false,
				responsive: true,
				maintainAspectRatio: false,
				onClick: this.graphClickEvent.bind(this),
				scales: {
					y: {
						grid: {
							color: this.color,
						},
						beginAtZero: true,
						min: 0,
						ticks: {
							color: this.fontColor,
							maxTicksLimit: 7,
							callback: function (value, index, values) {
								// Fix axis labels display on responsive small size
								// For example 50 is displayed 50,00000000000
								return value;
							}
						}
					},
					x: {
						grid: {
							color: this.color
						},
						min: 0,
						ticks: {
							color: this.fontColor,
							autoSkip: true,
							autoSkipPadding: 5,
							maxRotation: 0,
							minRotation: 0,
						},
					}
				}
			};

			// Merge chart options
			options = UtilsService.mergeDeep(options, this.chartOptions);
			// @ts-ignore
			ChartJs.Chart.register.apply(null, Object.values(ChartJs).filter((chartClass) => (chartClass.id)));

			const data: ChartJs.ChartData = undefined;
			const config : ChartJs.ChartConfiguration = {
				type: this.type,
				data: data,
				options: options,
				plugins: [chartAreaBorder]
			}
			this.chart = new ChartJs.Chart(this.ctx, config);

		}
	}

	ngOnChanges(changes: SimpleChanges) {

		if (this.chart && changes.selectedLineChartItem && changes.selectedLineChartItem.currentValue !== undefined) { // can be ''
			this.colorize();
			this.chart.update();
		}

		if (changes.inputDatas && changes.inputDatas.currentValue) {
			this.updateGraph();
		}

		if (changes.chartOptions && changes.chartOptions.currentValue) {
			// We must reconstruct the chart if the scale change
			this.initChart();
		}

		if (changes.activeEntries && changes.activeEntries.currentValue !== undefined) { // can be 0
			this.updateGraph();
		}

		if (changes.scaleValue && changes.scaleValue.currentValue && !changes.scaleValue.firstChange) {
			this.updateGraph();
		}
	}

	updateGraph() {
		setTimeout(() => {
			if (this.inputDatas && this.chart) {
				// Update datas
				// @ts-ignore force khiops VO into Chart dataset
				this.chart.data.datasets = this.inputDatas.datasets;
				this.chart.data.labels = this.inputDatas.labels;

				this.colorize();
				if (this.activeEntries !== undefined) { // can be 0
					// Select previous value if set
					this.selectCurrentBarIndex(this.activeEntries);
				}
				this.chart.update();
			}
		});
	}

	graphClickEvent(e, items) {
		if (this.enableSelection) {
			const l = items.length;
			if (l > 0) {
				for (let i = 0; i < l; i++) {
					// undefined if click outside bar
					const selectedIndex = items[i].index;
					this.selectCurrentBarIndex(selectedIndex);
					this.selectBarIndex.emit(items[i].index);
					this.chart.update();
				}

			}
		}
	}

	selectCurrentBarIndex(index) {
		if (this.chart && this.enableSelection) {
			this.colorize();
			for (let i = 0; i < this.chart.data.datasets.length; i++) {
				const dataset = <ChartDatasetVO>this.chart.data.datasets[i];
				dataset.borderColor[index] = this.barColor;
				dataset.borderSkipped = false;
				dataset.borderWidth = 2;
			}
		}
	}

	colorize() {
		for (let i = 0; i < this.chart.data.datasets.length; i++) {
			const dataset: ChartDatasetVO = <ChartDatasetVO>this.chart.data.datasets[i];
			if (!dataset.borderWidth) {
				dataset.borderSkipped = false;
				dataset.borderWidth = 2;
			}

			dataset.backgroundColor =
				new Array(this.inputDatas.labels.length).fill(UtilsService.hexToRGBa(this.colorSet.domain[i], 0.8));
			const defaultGroupIndex = dataset.extra ?.findIndex(e => e.defaultGroupIndex);
			if (defaultGroupIndex !== -1) {
				dataset.backgroundColor[defaultGroupIndex] = UtilsService.hexToRGBa(this.colorSet.domain[i], 0.15);
			}

			let borderOpacity = 1;
			if (dataset.type === 'line') {

				// hide non selected lines
				if (this.selectedLineChartItem === '') {
					dataset.borderWidth = 2;
				}
				if (this.selectedLineChartItem && this.selectedLineChartItem !== '') {
					if (this.selectedLineChartItem !== dataset.label) {
						borderOpacity = 0.35;
					} else {
						dataset.borderWidth = 4;
					}
				}
			}

			dataset.borderColor =
				new Array(this.inputDatas.labels.length).fill(UtilsService.hexToRGBa(this.colorSet.domain[i], borderOpacity));
		}
	}

	onKeyUp(event: KeyboardEvent) {
		if (this.activeEntries !== undefined) { // can be 0
			if (event.key === 'ArrowLeft' && this.activeEntries > 0) {
				this.activeEntries = this.activeEntries - 1;
			}
			if (event.code === 'ArrowRight' && this.activeEntries < this.inputDatas.labels.length - 1) {
				this.activeEntries = this.activeEntries + 1;
			}
			this.selectCurrentBarIndex(this.activeEntries);
			this.chart.update();
			this.selectBarIndex.emit(this.activeEntries);
		}
	}

}
