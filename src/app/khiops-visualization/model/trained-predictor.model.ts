import { ModelingVariableStatistic } from '@khiops-visualization/interfaces/modeling-report';

export class TrainedPredictorModel implements ModelingVariableStatistic {
  _id: string;
  name: string;

  level: number | undefined;
  weight: number | undefined;
  importance: number | undefined;
  map: boolean | undefined;

  constructor(object: ModelingVariableStatistic, availableKeys: string[]) {
    // Generate id for grid
    this._id = object.name;

    this.name = object.name;

    // Do not add into VO datas that are not defined into avaliable keys
    // We do that because VO is different when user change "select train predictor"
    if (availableKeys.includes('level')) {
      this.level = object.level || undefined;
    }
    if (availableKeys.includes('weight')) {
      this.weight = object.weight || undefined;
    }
    if (availableKeys.includes('map')) {
      this.map = object.map || undefined;
    }
    if (availableKeys.includes('importance')) {
      this.importance = object.importance || undefined;
    }
  }
}
