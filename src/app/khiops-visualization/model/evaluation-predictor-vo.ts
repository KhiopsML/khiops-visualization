import { PREDICTOR_TYPES } from '@khiops-library/enum/predictorTypes';

export class EvaluationPredictorVO {
  _id: string;
  type: string;
  rank: string;
  family: string;
  evaluationType: string;
  currentEvaluationType: string;
  name: string;
  accuracy: string;
  compression: string;
  auc: number;
  robustness: number | string;
  gini: number | string;
  rmse: string;
  mae: string;
  nlpd: string;
  rankRmse: string;
  rankMae: string;
  rankNlpd: string;

  constructor(type, currentEvaluationType, obj) {
    // Common values
    this.type = type;
    this.evaluationType = obj.evaluationType;
    this.rank = obj.rank;
    this.family = obj.family;
    this.currentEvaluationType = currentEvaluationType.evaluationType;
    this.name = obj.name;

    // Normal values
    this.accuracy = obj.accuracy;
    this.compression = obj.compression;
    this.auc = obj.auc;
    this.robustness = '';
    this.gini = 2 * this.auc - 1 || ''; // empty if undefined

    // Regression values
    this.rmse = obj.rmse;
    this.mae = obj.mae;
    this.nlpd = obj.nlpd;
    this.rankRmse = obj.rankRmse;
    this.rankMae = obj.rankMae;
    this.rankNlpd = obj.rankNlpd;

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

  computeRobustness(train) {
    if (
      this.currentEvaluationType === PREDICTOR_TYPES.TEST &&
      train &&
      train.auc &&
      this.auc
    ) {
      // find into data train the corresponding AUC train
      this.robustness =
        Math.min(train.auc / this.auc, this.auc / train.auc) || ''; // empty if undefined
    }
  }
}
