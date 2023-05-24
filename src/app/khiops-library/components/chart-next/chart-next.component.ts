import {
	Component,
	Input,
	EventEmitter,
	Output,
	OnInit,
	AfterViewInit,
	OnChanges,
	SimpleChanges,
	ViewChild,
	ElementRef
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

@Component({
	selector: 'kl-chart-next',
	templateUrl: './chart-next.component.html',
	styleUrls: ['./chart-next.component.scss'],
	providers: [ToPrecisionPipe]
})
export class ChartNextComponent implements OnInit, AfterViewInit, OnChanges {

	@Input() canvasIdContainer = 'kl-chart-canvas'; // May be updated if multiple graph
	@Input() inputDatas: any;
	@Input() activeEntries: any;
	@Input() type: any = 'bar';
	@Input() chartOptions: ChartOptions;
	@Input() colorSet: ChartColorsSetI;
	@Input() enableSelection = true;
	@Input() selectedLineChartItem: string = undefined;

	@Output() selectBarIndex: EventEmitter < any > = new EventEmitter();

	@ViewChild('chartJsElement') chartJsElement: ElementRef < HTMLCanvasElement > ;

	ctx: any;
	chart: any;

	constructor(private khiopsLibraryService: KhiopsLibraryService, private toPrecision: ToPrecisionPipe, ) {
		this.colorSet = this.khiopsLibraryService.getGraphColorSet()[0];
	}

	ngOnInit() {}

	ngAfterViewInit(): void {
		this.initChart();
	}

	initChart() {

		this.ctx = this.chartJsElement ?
			this.chartJsElement.nativeElement :
			undefined;

		if (this.ctx) {

			// Destroy old chart if exists
			// Do it even if canvas is undefined to remove other canvas ids
			try {
				this.chart.destroy();
			} catch (e) {}

			let options: any = {
				grid: {
					color: '#eeeeee'
				},
				plugins: {
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
				spanGaps: true,
				maintainAspectRatio: false,
				onClick: this.graphClickEvent.bind(this),
				scales: {
					y: {
						grid: {
							drawBorder: true,
							borderColor: '#e5e5e5',
							color: '#e5e5e5'
						},
						beginAtZero: true,
						min: 0,
						ticks: {
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
							drawBorder: true,
							borderColor: '#e5e5e5',
							color: '#e5e5e5'
						},
						min: 0,
						ticks: {
							autoSkip: true,
							autoSkipPadding: 5,
							maxRotation: 0,
							minRotation: 0,
							fontSize: 11
						},
						gridLines: {
							display: false
						}
					}
				}
			};

			// Chart.scaleService.updateScaleDefaults('category', {
			// 	ticks: {
			// 		callback: (tick) => {
			// 			if (tick.length > this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_X_LABEL_LENGTH) {
			// 				return tick.substring(0, this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_X_LABEL_LENGTH) + ' ...';
			// 			} else {
			// 				return tick;
			// 			}
			// 		}
			// 	}
			// });

			// Merge chart options
			options = UtilsService.mergeDeep(options, this.chartOptions);
			// @ts-ignore
			ChartJs.Chart.register.apply(null, Object.values(ChartJs).filter((chartClass) => (chartClass.id)));

			const data: any = {};
			this.chart = new ChartJs.Chart(this.ctx, {
				type: this.type,
				data: data,
				options: options
			});

		}
	}

	ngOnChanges(changes: SimpleChanges) {

		if (changes.selectedLineChartItem && changes.selectedLineChartItem.currentValue !== undefined) { // can be ''
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
			if (this.inputDatas) {
				// Update datas
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
				const dataset = this.chart.data.datasets[i];
				dataset.borderColor[index] = 'rgba(0, 0, 0, 1)';
				dataset.borderSkipped = false;
				// dataset.borderWidth = {
				// 	top: 2,
				// 	right: 2,
				// 	bottom: 0,
				// 	left: 2
				// }
				dataset.borderWidth = 2;
			}
		}
	}

	colorize() {
		for (let i = 0; i < this.chart.data.datasets.length; i++) {
			const dataset = this.chart.data.datasets[i];
			if (!dataset.borderWidth) {
				dataset.borderSkipped = false;
				// dataset.borderWidth = {
				// 	top: 2,
				// 	right: 2,
				// 	bottom: 0,
				// 	left: 2
				// };
				dataset.borderWidth = 2;
			}

			dataset.backgroundColor =
				new Array(this.inputDatas.labels.length).fill(UtilsService.hexToRGBa(this.colorSet.domain[i], 0.8));
			const defaultGroupIndex = dataset.extra.findIndex(e => e.defaultGroupIndex);
			if (defaultGroupIndex !== -1) {
				dataset.backgroundColor[defaultGroupIndex] = UtilsService.hexToRGBa(this.colorSet.domain[i], 0.15);
			}

			// const chartLineOpacity = dataset.type === 'bar' ? 0.1 : 1; // 0.1 for bar to improve selection opacity

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
