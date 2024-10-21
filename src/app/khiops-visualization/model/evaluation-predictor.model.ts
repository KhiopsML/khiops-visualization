import { PREDICTOR_TYPES } from '@khiops-library/enum/predictor-types';

export class EvaluationPredictorModel {
  _id: string;
  type: string;
  rank: string;
  family: string;
  evaluationType: string;
  currentEvaluationType: string;
  name: string;
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

  constructor(type, currentEvaluationType, object) {
    // Assign values from input
    Object.assign(this, object);

    // Common values
    this.type = type;
    this.currentEvaluationType = currentEvaluationType.evaluationType;
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
    if (!this.rmse) {
      delete this.rmse;
    }
    if (!this.mae) {
      delete this.mae;
    }
    if (!this.nlpd) {
      delete this.nlpd;
    }
    if (!this.rankRmse) {
      delete this.rankRmse;
    }
    if (!this.rankMae) {
      delete this.rankMae;
    }
    if (!this.rankNlpd) {
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
  computeRobustness(train) {
    if (
      this.currentEvaluationType === PREDICTOR_TYPES.TEST &&
      train?.auc &&
      this.auc
    ) {
      // find into data train the corresponding AUC train
      this.robustness =
        Math.min(train.auc / this.auc, this.auc / train.auc) || ''; // empty if undefined
    }
  }
}
