import {
	Component,
	Input,
	Output,
	NgZone,
	OnInit,
	EventEmitter
} from '@angular/core';
import {
	SelectableService
} from '../selectable/selectable.service';
import {
	ScrollableGraphCanvasComponent
} from '../scrollable-graph-canvas/scrollable-graph-canvas.component';
import {
	KhiopsLibraryService
} from '../../providers/khiops-library.service';
import {
	ToPrecisionPipe
} from '../../pipes/toPrecision.pipe';
import * as _ from 'lodash'; // Important to import lodash in karma
import {
	ChartColorsSetI
} from '../../interfaces/chart-colors-set';
import {
	ChartOptions
} from 'chart.js';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TYPES } from '@khiops-library/enum/types';

@Component({
	selector: 'kl-distribution-graph-canvas',
	templateUrl: './distribution-graph-canvas.component.html',
	styleUrls: ['./distribution-graph-canvas.component.scss'],
	providers: [ToPrecisionPipe]
})
export class DistributionGraphCanvasComponent extends ScrollableGraphCanvasComponent implements OnInit {

	@Input() position = 0;
	@Input() inputDatas: any = undefined;
	@Input() graphOptions: any;
	@Input() activeEntries: any;
	@Input() isLoadingDatas = false;
	@Input() hideGraphOptions = false;

	@Output() graphTypeChanged: EventEmitter < any > = new EventEmitter();
	@Output() selectedItemChanged: EventEmitter < any > = new EventEmitter();
	componentType = '1dBarChart'; // needed to copy datas

	labels = [];
	datas = [];
	title: string;

	graphIdContainer = undefined;
	colorSet: ChartColorsSetI;
	legend: any;
	chartOptions: ChartOptions;
	scaleType: string;
	maxScale: number = 0;
	minScale: number = 0;

	constructor(public selectableService: SelectableService,
		private toPrecision: ToPrecisionPipe,
		private khiopsLibraryService: KhiopsLibraryService,
		public ngzone: NgZone,
		public configService: ConfigService) {

		super(selectableService, ngzone, configService);

		this.colorSet = this.khiopsLibraryService.getGraphColorSet()[2];

		// Needed for scroll component
		this.maxScale = this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_SCALE;
		this.minScale = this.khiopsLibraryService.getAppConfig().common.GLOBAL.MIN_GRAPH_SCALE;

		// Keep this into ref to access it into tick callback
		// We can not use arrox function to access native getLabelForValue function
		let self = this;

		// Override tooltip infos
		this.chartOptions = {
			plugins: {
				tooltip: {
					callbacks: {
						label: (items: any): string => {
							if (items && items.dataset) {
								if (!this.hideGraphOptions && this.graphOptions && this.graphOptions.selected === TYPES.COVERAGE) {
									return this.toPrecision.transform(items.dataset.extra[items.dataIndex].extra.coverageValue);
								} else if (!this.hideGraphOptions && this.graphOptions.selected === TYPES.FREQUENCY) {
									return this.toPrecision.transform(items.dataset.extra[items.dataIndex].extra.value);
								} else if (this.graphOptions.selected === 'yLog') {
									return this.toPrecision.transform(items.dataset.extra[items.dataIndex].extra.value);
								} else {
									return this.toPrecision.transform(items.dataset.data[items.dataIndex]);
								}
							}
						},
						afterLabel: (items: any): string => {
							if (items && items.dataset) {
								if (!this.hideGraphOptions && this.graphOptions && this.graphOptions.selected === TYPES.COVERAGE) {
									if (items.dataset.extra[items.dataIndex].extra.percent) {
										return this.toPrecision.transform(items.dataset.extra[items.dataIndex].extra.percent) + '%';
									} else {
										return this.toPrecision.transform(items.dataset.extra[items.dataIndex].extra.value);
									}
								}
							}
						}
					}
				}
			},
			scales: {
				y: {
					ticks: {
						callback: (value) => {
							if (!this.hideGraphOptions && this.graphOptions && this.graphOptions.selected === TYPES.FREQUENCY) {
								// Frequency log mode
								if (value.toString().charAt(0) === '0' || value.toString().charAt(0) === '1') {
									return value.toLocaleString();
								} else {
									return '';
								}
							} else {
								if (this.graphOptions.selected === 'yLog') {
									if (typeof value === 'number') {
										const datas = this.inputDatas.datasets[0];
										return -(-datas.base - value);
									}
								} else {
									if (typeof value === 'number') {
										return Math.round(value * 100) / 100;
									} else {
										return value;
									}
								}
							}
						}
					}
				},
				x: {
					ticks: {
						callback: function (value: number, index: number, e) {
							// Default chartjs
							return this.getLabelForValue(value);
						},
					}
				}
			}

		};
	}

	ngOnInit() {
		this.graphIdContainer = 'distribution-graph-canvas-comp-' + this.position;
		this.title = 'Distribution';
	}

	onSelectBarChanged(e) {
		// pass event from chart to parent
		this.selectedItemChanged.emit(e);
	}

	changeGraphType(type) {
		// this.khiopsLibraryService.trackEvent('click', 'distribution_graph_type', this.graphOptions.selected);

		localStorage.setItem(this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID + 'DISTRIBUTION_GRAPH_OPTION', type);
		this.chartOptions.scales.y.max = undefined;
		this.chartOptions.scales.y.min = undefined;

		this.graphOptions.selected = type;
		this.graphTypeChanged.emit(type);
		this.chartOptions.scales.y.type = this.graphOptions.selected === TYPES.FREQUENCY ? TYPES.LOGARITHMIC : TYPES.LINEAR;

		const minValue = Math.min(...this.inputDatas.datasets[0].data);
		if (minValue > 0 || this.graphOptions.selected === 'yLog') {
			this.chartOptions.scales.y.min = 0;
		} else {
			this.chartOptions.scales.y.min = minValue;
		}
		this.chartOptions = _.cloneDeep(this.chartOptions);

	}

}
