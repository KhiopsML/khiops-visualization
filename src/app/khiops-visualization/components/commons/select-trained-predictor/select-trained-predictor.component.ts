import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy
} from '@angular/core';
import _ from 'lodash';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	AppConfig
} from 'src/environments/environment';

@Component({
	selector: 'app-select-trained-predictor',
	templateUrl: './select-trained-predictor.component.html',
	styleUrls: ['./select-trained-predictor.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectTrainedPredictorComponent implements OnInit {

	@Input() inputDatas: any;
	selectedPredictor: any;

	@Output() selectedPredictorChanged: EventEmitter<any> = new EventEmitter();

	constructor(
		private khiopsLibraryService: KhiopsLibraryService
	) { }

	ngOnInit() {
		// select by default Selective Naive Bayes
		let defaultSelection = this.inputDatas.find(e => e.name === 'Selective Naive Bayes');

		// Get previous selected target if compatible
		let previousSelectedPredictor;
		try {
			previousSelectedPredictor = JSON.parse(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SELECTED_TRAIN_PREDICTOR'));
		} catch (e) { }
		if (previousSelectedPredictor) {
			if (this.inputDatas.find(e => e.name === previousSelectedPredictor.name)) {
				defaultSelection = previousSelectedPredictor;
			}
		}
		if (defaultSelection) {
			this.selectedPredictor = defaultSelection.name;
		} else {
			// else select first predictor
			this.selectedPredictor = this.inputDatas[0].name;
		}
		this.selectedPredictorChanged.emit(defaultSelection);
	}

	changeTrainedPredictorsType(opt) {
		// this.khiopsLibraryService.trackEvent('click', 'select_trained_predictor');
		localStorage.setItem(this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID + 'SELECTED_TRAIN_PREDICTOR', JSON.stringify(opt));
		this.selectedPredictor = opt.name;
		this.selectedPredictorChanged.emit(opt);
	}

}
