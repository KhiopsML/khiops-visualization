/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LS } from '@khiops-library/enum/ls';
import { TrainedPredictor } from '@khiops-visualization/interfaces/modeling-report';
import { AppService } from '@khiops-visualization/providers/app.service';

@Component({
  selector: 'app-select-trained-predictor',
  templateUrl: './select-trained-predictor.component.html',
  styleUrls: ['./select-trained-predictor.component.scss'],
})
export class SelectTrainedPredictorComponent implements OnInit {
  @Input() inputDatas: TrainedPredictor[] | undefined;
  selectedPredictor?: string;

  @Output() private selectedPredictorChanged: EventEmitter<any> =
    new EventEmitter();

  constructor() {}

  ngOnInit() {
    // select by default Selective Naive Bayes
    let defaultSelection = this.inputDatas?.find(
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
        this.inputDatas?.find((e) => e.name === previousSelectedPredictor.name)
      ) {
        defaultSelection = previousSelectedPredictor;
      }
    }
    if (defaultSelection) {
      this.selectedPredictor = defaultSelection.name;
    } else {
      // else select first predictor
      this.selectedPredictor = this.inputDatas?.[0]?.name;
    }
    this.selectedPredictorChanged.emit(defaultSelection);
  }

  changeTrainedPredictorsType(opt: TrainedPredictor) {
    // this.trackerService.trackEvent('click', 'select_trained_predictor');
    AppService.Ls.set(LS.SELECTED_TRAIN_PREDICTOR, JSON.stringify(opt));
    this.selectedPredictor = opt.name;
    this.selectedPredictorChanged.emit(opt);
  }
}
