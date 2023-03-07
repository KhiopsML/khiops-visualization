import {
	Component,
	OnInit,
	SimpleChanges,
	OnChanges,
	Input,
	NgZone,
	ChangeDetectionStrategy
} from '@angular/core';

import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	SelectableComponent
} from '@khiops-library/components/selectable/selectable.component';
import {
	SelectableService
} from '@khiops-library/components/selectable/selectable.service';
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

@Component({
	selector: 'app-target-variable-stats-canvas',
	templateUrl: './target-variable-stats-canvas.component.html',
	styleUrls: ['./target-variable-stats-canvas.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [ToPrecisionPipe]
})
export class TargetVariableStatsCanvasComponent extends SelectableComponent implements OnInit, OnChanges {

	datas: Array < any > ;
	@Input() inputDatas: any;
	groupPadding: number;

	colorSet: ChartColorsSetI;
	componentType = 'ndBarChart'; // needed to copy datas
	@Input() title: string;
	chartOptions: ChartOptions;
	isFullscreen = false;

	constructor(public selectableService: SelectableService,
		private toPrecision: ToPrecisionPipe,
		private translate: TranslateService,
		private khiopsLibraryService: KhiopsLibraryService,
		public ngzone: NgZone) {

		super(selectableService, ngzone);
		this.colorSet = this.khiopsLibraryService.getGraphColorSet()[1];
		this.groupPadding = 20; // default
		if (!this.title) {
			this.title = this.translate.get('GLOBAL.TARGET_VARIABLE_STATS');
		}
		// Override tooltip infos
		this.chartOptions = {
			plugins: {
				tooltip: {
					callbacks: {
						label: (items: any) => {
							if (items && items.dataset) {
								return items.dataset.label;
							}
						},
						beforeLabel: (items: any) => {
							if (items && items.dataset) {
								return this.toPrecision.transform(items.dataset.extra[0].extra.percent) + '%';
							}
						},
						afterLabel: (items: any) => {
							if (items && items.dataset) {
								return this.toPrecision.transform(items.dataset.extra[0].extra.value);
							}
						}
					}
				}
			},
			onClick: undefined, // Remove click listener
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						maxTicksLimit: 5
					}
				}
			}

		};
	}

	ngOnInit() {

	}

	onToggleFullscreen(isFullscreen: any) {
		this.isFullscreen = isFullscreen;
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.inputDatas && changes.inputDatas.currentValue) {
			// Keep labels into displayedvalues to copy datas into clipboard
			this.displayedValues = [];
			Object.keys(this.inputDatas.datasets).map((key, i) => {
				this.displayedValues.push({
					name: this.inputDatas.datasets[i].label
				});
			});
		}
	}

}
