/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, effect, input, output, signal } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngstack/translate';
import { LS } from '@khiops-library/enum/ls';
import { TrainedPredictor } from '@khiops-visualization/interfaces/modeling-report.interface';
import { AppService } from '@khiops-visualization/providers/app.service';

@Component({
  selector: 'app-select-trained-predictor',
  templateUrl: './select-trained-predictor.component.html',
  styleUrls: ['./select-trained-predictor.component.scss'],
  imports: [
    FlexLayoutModule,
    TranslateModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
  ],
})
export class SelectTrainedPredictorComponent {
  readonly inputDatas = input<TrainedPredictor[] | undefined>(undefined);
  readonly selectedPredictor = signal<string | undefined>(undefined);

  readonly selectedPredictorChanged = output<TrainedPredictor | undefined>();

  constructor() {
    effect(() => {
      const predictors = this.inputDatas();

      // Select by default Selective Naive Bayes
      let defaultSelection = predictors?.find(
        (predictor) => predictor.name === 'Selective Naive Bayes',
      );

      // Get previous selected predictor if compatible
      let previousSelectedPredictor;
      try {
        previousSelectedPredictor = AppService.Ls.get(
          LS.SELECTED_TRAIN_PREDICTOR,
        );
      } catch (e) {}

      if (
        previousSelectedPredictor &&
        predictors?.find(
          (predictor) => predictor.name === previousSelectedPredictor.name,
        )
      ) {
        defaultSelection = previousSelectedPredictor;
      }

      const selectedPredictor = defaultSelection ?? predictors?.[0];
      this.selectedPredictor.set(selectedPredictor?.name);
      this.selectedPredictorChanged.emit(selectedPredictor);
    });
  }

  changeTrainedPredictorsType(opt: TrainedPredictor) {
    // this.trackerService.trackEvent('click', 'select_trained_predictor');
    AppService.Ls.set(LS.SELECTED_TRAIN_PREDICTOR, opt);
    this.selectedPredictor.set(opt.name);
    this.selectedPredictorChanged.emit(opt);
  }
}
