import {
	Component,
	SimpleChanges,
	Input,
	OnChanges,
	Output,
	EventEmitter
} from '@angular/core';
import {
	TranslateService
} from '@ngstack/translate';
import {
	ChartColorsSetI
} from '../../interfaces/chart-colors-set';
import {
	UtilsService
} from '../../providers/utils.service';

@Component({
	selector: 'kl-legend',
	templateUrl: './legend.component.html',
	styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnChanges {

	@Input() inputDatas: any; // change according to the chart type
	@Input() type: string;
	@Input() tooltip: string;
	@Input() colorSet: ChartColorsSetI;
	@Input() position = 'top';
	@Output() legendItemClicked: EventEmitter < string > = new EventEmitter();

	legend: any[];
	selectedItem: string = undefined;

	constructor(private translate: TranslateService) {}

	ngOnChanges(changes: SimpleChanges) {
		this.inputDatas = changes.inputDatas.currentValue;
		this.updateLegend();
	}

	selectLegendItem(item: string) {
		if (this.legendItemClicked.observers.length > 0) {
			if (this.selectedItem === item) {
				this.selectedItem = '';
			} else {
				this.selectedItem = item;
			}
			this.legendItemClicked.emit(this.selectedItem);
		}
	}

	checkForDefaultGroupIndex(input) {
		if (input && input.extra) {
			const defaultIndex = input.extra.findIndex(e => e.defaultGroupIndex);
			if (defaultIndex !== -1) {
				this.legend.push({
					name: this.translate.get('GLOBAL.DEFAULT_GROUP_INDEX'),
					color: UtilsService.hexToRGBa(this.colorSet.domain[0], 0.3)
				});
			}
		}

	}

	updateLegend() {
		if (this.inputDatas) {
			this.legend = [];
			if (this.type === 'histogram') {
				if (this.inputDatas) {

				}
			} else if (this.type === 'chart-1d') {
				if (this.inputDatas && this.inputDatas.datasets && this.inputDatas.datasets[0]) {
					this.legend.push({
						name: this.translate.get(this.inputDatas.datasets[0].label),
						color: this.colorSet.domain[0]
					});
					this.checkForDefaultGroupIndex(this.inputDatas.datasets[0]);

				} else {
					this.legend.push({
						name: this.translate.get(this.inputDatas),
						color: this.colorSet.domain[0]
					});
				}
			} else if (this.type === 'chart-nd') {
				// compute legend items
				if (Array.isArray(this.inputDatas)) {
					const series = this.inputDatas[0].series;
					for (let i = 0; i < series.length; i++) {
						this.legend.push({
							name: series[i].name,
							color: this.colorSet.domain[i]
						});
					}

				} else if (this.inputDatas.datasets && this.inputDatas.datasets.length > 0) {
					// new graph
					for (let i = 0; i < this.inputDatas.datasets.length; i++) {
						this.legend.push({
							name: this.inputDatas.datasets[i].label,
							color: this.colorSet.domain[i]
						});
					}
				}
			} else if (this.type === 'chart-nd-dynamic') {
				// compute legend items
				for (let i = 0; i < this.inputDatas.length; i++) {
					if (this.inputDatas[i].show === true) {
						this.legend.push({
							name: this.inputDatas[i].name,
							color: this.colorSet.domain[i]
						});
					}
				}
			}

			// Ellipsis long legend text
			for (let i = 0; i < this.legend.length; i++) {
				this.legend[i].shortname = UtilsService.ellipsis(this.legend[i].name.toString(), 20);
			}
		}
	}

}
