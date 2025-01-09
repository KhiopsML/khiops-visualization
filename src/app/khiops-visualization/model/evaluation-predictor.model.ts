/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { PREDICTOR_TYPES } from '@khiops-library/enum/predictor-types';
import { PredictorPerformance } from '@khiops-visualization/interfaces/evaluation-report';
import { TestPredictorPerformance } from '@khiops-visualization/interfaces/test-evaluation-report';
import { TrainPredictorPerformance } from '@khiops-visualization/interfaces/train-evaluation-report';

export class EvaluationPredictorModel {
  _id: string;
  type: string;
  rank!: string;
  family!: string;
  evaluationType!: PREDICTOR_TYPES | string;
  name!: string;
  accuracy?: string;
  compression?: string;
  auc?: number;
  robustness?: number | string;
  gini?: number | string;
  rmse?: string;
  mae?: string;
  nlpd?: string;
  rankRmse?: string;
  rankMae?: string;
  rankNlpd?: string;

  constructor(
    type: string,
    evaluationType: PREDICTOR_TYPES | string,
    predictor:
      | PredictorPerformance
      | TestPredictorPerformance
      | TrainPredictorPerformance,
  ) {
    // Assign values from input
    Object.assign(this, predictor);

    // Common values
    this.type = type;
    this.evaluationType = evaluationType;
    this.robustness = '';
    if (this.auc) {
      this.gini = 2 * this.auc - 1 || ''; // empty if undefined
    }

    this.removeUnexistingValues();

    // Define an id for grids
    this._id = this.type + this.name;
  }

  removeUnexistingValues() {
    // Remove non existings values if it's a normal type
    if (this.rmse === undefined) {
      delete this.rmse;
    }
    if (this.mae === undefined) {
      delete this.mae;
    }
    if (this.nlpd === undefined) {
      delete this.nlpd;
    }
    if (this.rankRmse === undefined) {
      delete this.rankRmse;
    }
    if (this.rankMae === undefined) {
      delete this.rankMae;
    }
    if (this.rankNlpd === undefined) {
      delete this.rankNlpd;
    }

    // Remove normal vaules if it's a reg
    if (this.rmse) {
      delete this.accuracy;
      delete this.compression;
      delete this.auc;
      delete this.robustness;
      delete this.gini;
    }
  }

  /**
   * Computes the robustness of the predictor based on the training data.
   * If the current evaluation type is 'TEST' and both training and current AUC values are available,
   * it calculates the robustness as the minimum ratio between training AUC and current AUC.
   * If the robustness cannot be computed, it is set to an empty string.
   *
   * @param train - The training data object containing the AUC value.
   */
  computeRobustness(train: EvaluationPredictorModel) {
    if (
      this.evaluationType === PREDICTOR_TYPES.TEST &&
      train?.auc &&
      this.auc
    ) {
      // find into data train the corresponding AUC train
      this.robustness =
        Math.min(train.auc / this.auc, this.auc / train.auc) || ''; // empty if undefined
    }
  }
}
