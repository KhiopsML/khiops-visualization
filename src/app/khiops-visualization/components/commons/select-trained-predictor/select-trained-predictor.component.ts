import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { LS } from '@khiops-library/enum/ls';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { AppService } from '@khiops-visualization/providers/app.service';

@Component({
  selector: 'app-select-trained-predictor',
  templateUrl: './select-trained-predictor.component.html',
  styleUrls: ['./select-trained-predictor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectTrainedPredictorComponent implements OnInit {
  @Input() inputDatas: any;
  selectedPredictor: string;

  @Output() selectedPredictorChanged: EventEmitter<any> = new EventEmitter();

  constructor(private khiopsLibraryService: KhiopsLibraryService) {}

  ngOnInit() {
    // select by default Selective Naive Bayes
    let defaultSelection = this.inputDatas.find(
      (e) => e.name === 'Selective Naive Bayes',
    );

    // Get previous selected target if compatible
    let previousSelectedPredictor;
    try {
      previousSelectedPredictor = AppService.Ls.get(
        LS.SELECTED_TRAIN_PREDICTOR,
      );
    } catch (e) {}
    if (previousSelectedPredictor) {
      if (
        this.inputDatas.find((e) => e.name === previousSelectedPredictor.name)
      ) {
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
    // this.trackerService.trackEvent('click', 'select_trained_predictor');
    AppService.Ls.set(LS.SELECTED_TRAIN_PREDICTOR, JSON.stringify(opt));
    this.selectedPredictor = opt.name;
    this.selectedPredictorChanged.emit(opt);
  }
}
