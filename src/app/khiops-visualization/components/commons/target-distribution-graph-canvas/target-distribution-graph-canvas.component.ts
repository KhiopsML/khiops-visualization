import {
	Component,
	Input,
	OnInit,
	EventEmitter,
	NgZone,
	Output
} from '@angular/core';
import {
	SelectableService
} from '@khiops-library/components/selectable/selectable.service';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	ScrollableGraphCanvasComponent
} from '@khiops-library/components/scrollable-graph-canvas/scrollable-graph-canvas.component';
import _ from 'lodash';
import {
	TranslateService
} from '@ngstack/translate';
import {
	ToPrecisionPipe
} from '@khiops-library/pipes/toPrecision.pipe';
import {
	ChartColorsSetI
} from '@khiops-library/interfaces/chart-colors-set';
import {
	ChartOptions
} from 'chart.js';
import {
	ConfigService
} from '@khiops-library/providers/config.service';
import {
	ResizedEvent
} from 'angular-resize-event';

@Component({
	selector: 'app-target-distribution-graph-canvas',
	templateUrl: './target-distribution-graph-canvas.component.html',
	styleUrls: ['./target-distribution-graph-canvas.component.scss'],
	providers: [ToPrecisionPipe]
})
export class TargetDistributionGraphCanvasComponent extends ScrollableGraphCanvasComponent implements OnInit {

	@Input() position = 0;
	@Input() inputDatas: any = undefined;
	@Input() titleTooltip: string;
	@Input() title: string;
	@Input() activeEntries;
	@Input() scrollPosition = 0;
	@Input() displayedValues: any;
	@Input() isLoadingDatas = false;
	@Input() showFullscreenBtn = false;

	view: any = undefined; // managed into ScrollableGraphComponent

	@Output() graphTypeChanged: EventEmitter < any > = new EventEmitter();
	@Output() targetDistributionGraphDisplayedValuesChanged: EventEmitter < any > = new EventEmitter();
	@Output() selectedItemChanged: EventEmitter < any > = new EventEmitter();

	componentType = 'ndBarChart'; // needed to copy datas

	colorSet: ChartColorsSetI;
	graphOptions = {
		types: [
			'GLOBAL.PROBABILITIES', 'GLOBAL.LIFT'
		],
		selected: undefined
	};
	hideGraph: boolean;
	initialViewCheck = false;
	legend: any[];
	buttonTitle: string;
	chartOptions: ChartOptions;
	maxScale: number = 0;
	minScale: number = 0;
	selectedBarIndex: number;
	isFullscreen = false;
	isSmallDiv = false;

	constructor(
		public selectableService: SelectableService,
		private translate: TranslateService, private toPrecision: ToPrecisionPipe,
		private khiopsLibraryService: KhiopsLibraryService,
		public ngzone: NgZone,
		public configService: ConfigService) {

		super(selectableService, ngzone, configService);
		// Needed for scroll component
		this.maxScale = this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_SCALE;
		this.minScale = this.khiopsLibraryService.getAppConfig().common.GLOBAL.MIN_GRAPH_SCALE;

		this.graphOptions.selected = localStorage.getItem(this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID + 'TARGET_DISTRIBUTION_GRAPH_OPTION') || this.graphOptions.types[0];

		this.colorSet = this.khiopsLibraryService.getGraphColorSet()[1];
		this.hideGraph = true;
		this.buttonTitle = this.translate.get('GLOBAL.VALUES');

		// Override tooltip infos
		this.chartOptions = {
			plugins: {
				tooltip: {
					callbacks: {
						beforeLabel: (items: any) => {
							if (items && items.dataset) {
								return this.toPrecision.transform(items.dataset.extra[items.dataIndex].extra.value);
							}
						},
						afterLabel: (items: any) => {
							if (items && items.dataset) {
								let value = this.toPrecision.transform(items.dataset.data[items.dataIndex]);
								if (this.graphOptions.selected === 'GLOBAL.PROBABILITIES') {
									value = value + '%';
								}
								return value;
							}
						}
					}
				}
			}
		};

	}

	ngOnInit() {
		this.graphIdContainer = 'target-distribution-graph-canvas-comp-' + this.position;
		this.title = this.title || this.translate.get('GLOBAL.TARGET_DISTRIBUTION');
	}


	onResized(event: ResizedEvent) {
		this.isSmallDiv = event?.newRect?.width < 600;
	}

	onToggleFullscreen(isFullscreen: any) {
		this.isFullscreen = isFullscreen;
		setTimeout(() => {
			this.resizeGraph();
		});
	}

	onSelectBarChanged(e) {
		// Debounce each events
		// Each bar of grouped chart launch same event
		if (this.selectedBarIndex !== e) {
			// pass event from chart to parent
			this.selectedItemChanged.emit(e);
		}
		this.selectedBarIndex = e;
	}

	changeGraphType(type: any) {
		// this.khiopsLibraryService.trackEvent('click', 'target_distribution_graph_type', type);
		localStorage.setItem(this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID + 'TARGET_DISTRIBUTION_GRAPH_OPTION', type);

		this.graphOptions.selected = type;
		this.graphTypeChanged.emit(type);
	}

	onSelectToggleButtonChanged(displayedValues: any) {
		this.targetDistributionGraphDisplayedValuesChanged.emit(displayedValues);
	}

}
